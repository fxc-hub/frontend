#!/bin/bash

# LiteSpeed Server Deployment Script for FXCHUBS Frontend
echo "🚀 Starting LiteSpeed Server Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Get server IP for API configuration
SERVER_IP=$(hostname -I | awk '{print $1}')
print_status "Detected server IP: $SERVER_IP"

# Create environment file
print_status "Creating environment configuration..."
cat > .env.local << EOF
NEXT_PUBLIC_APP_NAME=FXCHUB
NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000
NODE_ENV=production
PORT=3000
EOF

print_status "Environment file created with API URL: http://$SERVER_IP:8000"

# Install dependencies
print_status "Installing dependencies..."
npm install

# Clear previous build
print_status "Clearing previous build..."
rm -rf .next
rm -rf out

# Build the application
print_status "Building the application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    print_status "Build completed successfully!"
else
    print_error "Build failed. Please check the errors above."
    exit 1
fi

# Create logs directory
mkdir -p logs

# Create systemd service file for auto-start
print_status "Creating systemd service for auto-start..."
sudo tee /etc/systemd/system/fxchubs-frontend.service > /dev/null << EOF
[Unit]
Description=FXCHUBS Frontend
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable service
print_status "Enabling systemd service..."
sudo systemctl daemon-reload
sudo systemctl enable fxchubs-frontend.service

# Create LiteSpeed configuration
print_status "Creating LiteSpeed configuration..."
sudo tee /usr/local/lsws/conf/vhosts/fxchubs-frontend.conf > /dev/null << EOF
docRoot                   \$VH_ROOT/public_html
enableGzip               1
enableBr                 1

index  {
  useServer               0
  indexFiles              index.html, index.php
}

scripthandler  {
  add                     lsapi:lsphp74 php
}

extprocessor lsphp74 {
  type                    lsapi
  address                 uds://tmp/lshttpd/lsphp.sock
  maxConns                35
  env                     PHP_LSAPI_MAX_REQUESTS=500
  env                     PHP_LSAPI_CHILDREN=35
  initTimeout             60
  retryTimeout            0
  pcKeepAliveTimeout      5
  respBuffer              0
  autoStart               1
  path                    lsphp74/bin/lsphp
  backlog                 100
  instances               1
  extUser                 \$VH_USER
  extGroup                \$VH_GROUP
  runOnStartUp            1
  priority                0
  memSoftLimit            2047M
  memHardLimit            2047M
  procSoftLimit           400
  procHardLimit           600
}

rewrite  {
  enable                  1
  rules                   <<<END_rules
# Proxy to Next.js frontend
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/\$1 [P,L]
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
  handler                 http://localhost:3000
  addDefaultCharset       off
}

context /api {
  type                    proxy
  handler                 http://$SERVER_IP:8000/api
  addDefaultCharset       off
}
EOF

print_status "LiteSpeed configuration created"

# Start the frontend service
print_status "Starting frontend service..."
sudo systemctl start fxchubs-frontend.service

# Check if service is running
if sudo systemctl is-active --quiet fxchubs-frontend.service; then
    print_status "Frontend service is running!"
else
    print_error "Failed to start frontend service"
    sudo systemctl status fxchubs-frontend.service
    exit 1
fi

# Restart LiteSpeed
print_status "Restarting LiteSpeed server..."
sudo systemctl restart lsws

print_status "Deployment completed successfully!"
print_status "Frontend should be accessible at: http://$SERVER_IP"
print_status "API should be accessible at: http://$SERVER_IP:8000"

echo ""
print_status "Useful commands:"
echo "  Check frontend status: sudo systemctl status fxchubs-frontend.service"
echo "  View frontend logs: sudo journalctl -u fxchubs-frontend.service -f"
echo "  Restart frontend: sudo systemctl restart fxchubs-frontend.service"
echo "  Check LiteSpeed status: sudo systemctl status lsws" 