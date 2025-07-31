#!/bin/bash

# Quick Fix for 404 Error on LiteSpeed Server
echo "🔧 Quick Fix for 404 Error..."

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "Server IP: $SERVER_IP"

# Create environment file
echo "Creating .env.local..."
cat > .env.local << EOF
NEXT_PUBLIC_APP_NAME=FXCHUB
NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000
NODE_ENV=production
PORT=3000
EOF

# Install and build
echo "Installing dependencies..."
npm install

echo "Building application..."
npm run build

# Check if Next.js is running
if ! pgrep -f "next" > /dev/null; then
    echo "Starting Next.js server..."
    nohup npm start > logs/frontend.log 2>&1 &
    sleep 5
fi

# Check if port 3000 is listening
if netstat -tlnp | grep :3000 > /dev/null; then
    echo "✅ Next.js is running on port 3000"
else
    echo "❌ Next.js is not running on port 3000"
    echo "Check logs: tail -f logs/frontend.log"
    exit 1
fi

# Create simple LiteSpeed rewrite rule
echo "Creating LiteSpeed rewrite rule..."
sudo tee /usr/local/lsws/conf/vhosts/fxchubs-rewrite.conf > /dev/null << EOF
rewrite  {
  enable                  1
  rules                   <<<END_rules
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/\$1 [P,L]
END_rules
}
EOF

echo "✅ Quick fix applied!"
echo "Frontend should now be accessible at: http://$SERVER_IP"
echo "If still getting 404, restart LiteSpeed: sudo systemctl restart lsws" 