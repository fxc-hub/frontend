#!/bin/bash

# Upload Frontend to Server Script
echo "📤 Uploading Frontend to Server"

# Configuration
SERVER_IP="YOUR_SERVER_IP_HERE"
SERVER_USER="root"
SERVER_PATH="/root/frontend"

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

# Check if server IP is set
if [ "$SERVER_IP" = "YOUR_SERVER_IP_HERE" ]; then
    print_error "Please update SERVER_IP in this script with your actual server IP"
    exit 1
fi

print_status "Uploading to server: $SERVER_IP"

# Create a temporary directory for upload
TEMP_DIR="frontend-upload"
mkdir -p $TEMP_DIR

# Copy essential files
print_status "Preparing files for upload..."
cp -r src/ $TEMP_DIR/
cp -r public/ $TEMP_DIR/
cp package.json $TEMP_DIR/
cp next.config.ts $TEMP_DIR/
cp tsconfig.json $TEMP_DIR/
cp tailwind.config.js $TEMP_DIR/
cp postcss.config.js $TEMP_DIR/
cp server-deploy.sh $TEMP_DIR/

# Create a simple deployment script for the server
cat > $TEMP_DIR/deploy-on-server.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying FXCHUBS Frontend on Server"

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "Server IP: $SERVER_IP"

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

# Create environment file
echo "Creating environment configuration..."
cat > .env.local << EOF
NEXT_PUBLIC_APP_NAME=FXCHUB
NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000
NODE_ENV=production
PORT=3000
EOF

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building the application..."
npm run build

# Create systemd service
echo "Creating systemd service..."
cat > /etc/systemd/system/fxchubs-frontend.service << EOF
[Unit]
Description=FXCHUBS Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/root/frontend
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Enable and start service
systemctl daemon-reload
systemctl enable fxchubs-frontend.service
systemctl start fxchubs-frontend.service

# Create LiteSpeed configuration
echo "Creating LiteSpeed configuration..."
cat > /usr/local/lsws/conf/vhosts/fxchubs-frontend.conf << EOF
docRoot                   \$VH_ROOT/public_html
enableGzip               1
enableBr                 1

rewrite  {
  enable                  1
  rules                   <<<END_rules
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/\$1 [P,L]
END_rules
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

# Restart LiteSpeed
systemctl restart lsws

echo "✅ Deployment completed!"
echo "Frontend should be accessible at: http://$SERVER_IP"
EOF

chmod +x $TEMP_DIR/deploy-on-server.sh

# Upload to server
print_status "Uploading files to server..."
if command -v rsync &> /dev/null; then
    rsync -avz --progress $TEMP_DIR/ $SERVER_USER@$SERVER_IP:$SERVER_PATH/
else
    scp -r $TEMP_DIR/* $SERVER_USER@$SERVER_IP:$SERVER_PATH/
fi

if [ $? -eq 0 ]; then
    print_status "Upload completed successfully!"
    
    # Execute deployment on server
    print_status "Executing deployment on server..."
    ssh $SERVER_USER@$SERVER_IP "cd $SERVER_PATH && chmod +x deploy-on-server.sh && ./deploy-on-server.sh"
    
    if [ $? -eq 0 ]; then
        print_status "✅ Deployment completed successfully!"
        print_status "Frontend should be accessible at: http://$SERVER_IP"
    else
        print_error "❌ Deployment failed on server"
    fi
else
    print_error "❌ Upload failed"
fi

# Cleanup
rm -rf $TEMP_DIR

print_status "Upload and deployment process completed!" 