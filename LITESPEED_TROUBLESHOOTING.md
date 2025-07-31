# LiteSpeed Server 404 Error Troubleshooting Guide

## 🚨 Immediate Fix for 404 Error

### Step 1: Quick Fix Script
```bash
cd frontend
chmod +x quick-fix-404.sh
./quick-fix-404.sh
```

### Step 2: Manual Fix (if script doesn't work)

#### 1. Check if Next.js is running
```bash
# Check if process is running
ps aux | grep next

# Check if port 3000 is listening
netstat -tlnp | grep :3000

# Check if service is running
sudo systemctl status fxchubs-frontend.service
```

#### 2. Start Next.js if not running
```bash
cd frontend
npm install
npm run build
nohup npm start > logs/frontend.log 2>&1 &
```

#### 3. Create LiteSpeed Rewrite Rule
Add this to your LiteSpeed virtual host configuration:

```apache
rewrite  {
  enable                  1
  rules                   <<<END_rules
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
END_rules
}
```

#### 4. Restart LiteSpeed
```bash
sudo systemctl restart lsws
```

## 🔍 Detailed Troubleshooting

### Check 1: Next.js Application
```bash
# Check if Node.js is installed
node --version
npm --version

# Check if dependencies are installed
ls -la node_modules/

# Check if build exists
ls -la .next/

# Check environment variables
cat .env.local
```

### Check 2: Network and Ports
```bash
# Check if port 3000 is open
sudo netstat -tlnp | grep :3000

# Check firewall
sudo ufw status
sudo iptables -L

# Test local access
curl http://localhost:3000
```

### Check 3: LiteSpeed Configuration
```bash
# Check LiteSpeed status
sudo systemctl status lsws

# Check LiteSpeed configuration
sudo /usr/local/lsws/bin/lswsctrl status

# Check virtual host configuration
sudo cat /usr/local/lsws/conf/vhosts/*.conf

# Check LiteSpeed logs
sudo tail -f /usr/local/lsws/logs/error.log
sudo tail -f /usr/local/lsws/logs/access.log
```

### Check 4: File Permissions
```bash
# Check ownership
ls -la frontend/

# Fix permissions if needed
sudo chown -R $USER:$USER frontend/
chmod -R 755 frontend/
```

## 🛠️ Common Solutions

### Solution 1: Proxy Configuration
If the rewrite rule doesn't work, try this proxy configuration in LiteSpeed:

```apache
context / {
  type                    proxy
  handler                 http://localhost:3000
  addDefaultCharset       off
}

context /api {
  type                    proxy
  handler                 http://YOUR_SERVER_IP:8000/api
  addDefaultCharset       off
}
```

### Solution 2: Systemd Service
Create a systemd service for auto-start:

```bash
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
Environment=NEXT_PUBLIC_API_URL=http://$(hostname -I | awk '{print $1}'):8000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable fxchubs-frontend.service
sudo systemctl start fxchubs-frontend.service
```

### Solution 3: PM2 Process Manager
```bash
# Install PM2
npm install -g pm2

# Start with PM2
cd frontend
pm2 start npm --name "fxchubs-frontend" -- start

# Save PM2 configuration
pm2 save
pm2 startup
```

## 📋 Debugging Checklist

- [ ] Node.js and npm are installed
- [ ] Dependencies are installed (`npm install`)
- [ ] Application is built (`npm run build`)
- [ ] Next.js is running on port 3000
- [ ] Environment variables are set correctly
- [ ] LiteSpeed rewrite rules are configured
- [ ] LiteSpeed is restarted after configuration changes
- [ ] Firewall allows port 3000
- [ ] File permissions are correct
- [ ] No conflicting services on port 3000

## 🚨 Emergency Fix
If nothing else works, try this emergency fix:

```bash
# Stop everything
sudo systemctl stop lsws
pkill -f "next"

# Clear everything
cd frontend
rm -rf .next
rm -rf node_modules
rm -f .env.local

# Reinstall and rebuild
npm install
npm run build

# Create environment
echo "NEXT_PUBLIC_API_URL=http://$(hostname -I | awk '{print $1}'):8000" > .env.local
echo "NODE_ENV=production" >> .env.local
echo "PORT=3000" >> .env.local

# Start Next.js
nohup npm start > logs/frontend.log 2>&1 &

# Start LiteSpeed
sudo systemctl start lsws
```

## 📞 Support Commands
```bash
# Check all services
sudo systemctl status lsws
sudo systemctl status fxchubs-frontend.service

# View logs
tail -f frontend/logs/frontend.log
sudo tail -f /usr/local/lsws/logs/error.log

# Test connectivity
curl -I http://localhost:3000
curl -I http://YOUR_SERVER_IP
``` 