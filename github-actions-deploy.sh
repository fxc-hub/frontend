#!/bin/bash

# GitHub Actions Post-Deployment Fix Script
echo "🔧 GitHub Actions Post-Deployment Fix"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
print_status "Server IP: $SERVER_IP"

# Navigate to frontend directory
cd /home/fxc-hub.com/public_html

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the correct directory?"
    exit 1
fi

print_status "Found package.json in $(pwd)"

# Create environment file
print_status "Creating environment configuration..."
cat > .env.local << EOF
NEXT_PUBLIC_APP_NAME=FXCHUB
NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000
NODE_ENV=production
PORT=3001
EOF

print_status "Environment file created with API URL: http://$SERVER_IP:8000"

# Check if PM2 is running
if pm2 list | grep -q "frontend"; then
    print_status "Restarting PM2 frontend process..."
    pm2 restart frontend
else
    print_status "Starting PM2 frontend process..."
    PORT=3001 pm2 start npm --name "frontend" -- start
    pm2 save
fi

# Create LiteSpeed configuration
print_status "Creating LiteSpeed configuration..."
cat > /usr/local/lsws/conf/vhosts/fxchubs-frontend.conf << EOF
docRoot                   \$VH_ROOT/public_html
enableGzip               1
enableBr                 1

index  {
  useServer               0
  indexFiles              index.html, index.php
}

rewrite  {
  enable                  1
  rules                   <<<END_rules
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3001/\$1 [P,L]
END_rules
}

accesslog \$VH_ROOT/logs/access.log {
  useServer               0
  logFormat               "%h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\""
  logHeaders              5
  rollingSize             10M
  keepDays                30
  compressArchive         1
}

errorlog \$VH_ROOT/logs/error.log {
  useServer               0
  logLevel                ERROR
  rollingSize             10M
  keepDays                30
  compressArchive         1
}

context / {
  type                    proxy
  handler                 http://localhost:3001
  addDefaultCharset       off
}

context /api {
  type                    proxy
  handler                 http://$SERVER_IP:8000/api
  addDefaultCharset       off
}
EOF

print_status "LiteSpeed configuration created"

# Restart LiteSpeed
print_status "Restarting LiteSpeed server..."
systemctl restart lsws

# Test the deployment
print_status "Testing deployment..."
sleep 5

if curl -s http://localhost:3001 > /dev/null; then
    print_status "✅ Frontend is running on port 3001"
else
    print_error "❌ Frontend is not responding on port 3001"
    print_status "📋 PM2 Logs:"
    pm2 logs frontend --lines 10
fi

# Check LiteSpeed status
if systemctl is-active --quiet lsws; then
    print_status "✅ LiteSpeed is running"
else
    print_error "❌ LiteSpeed is not running"
    systemctl status lsws
fi

print_status "🎉 Post-deployment fix completed!"
print_status "🌐 Frontend should be accessible at: http://$SERVER_IP"
print_status "🔗 API should be accessible at: http://$SERVER_IP:8000"

echo ""
print_status "Useful commands:"
echo "  Check PM2 status: pm2 list"
echo "  View PM2 logs: pm2 logs frontend"
echo "  Restart frontend: pm2 restart frontend"
echo "  Check LiteSpeed: systemctl status lsws"
echo "  Test frontend: curl http://localhost:3001" 