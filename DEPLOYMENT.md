# Frontend Deployment Guide

## Quick Fix for 404 Errors on Server

### 1. Environment Variables
Create a `.env.local` file in the frontend directory:
```bash
NEXT_PUBLIC_APP_NAME=FXCHUB
NEXT_PUBLIC_API_URL=http://your-server-ip:8000
NODE_ENV=production
```

### 2. Build and Deploy
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Start the server
npm start
```

### 3. Server Configuration
Make sure your server is configured to:
- Run on port 3000 (or set PORT environment variable)
- Allow connections from all interfaces (0.0.0.0)
- Have proper firewall rules

### 4. Nginx Configuration (if using)
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 5. PM2 Configuration (recommended)
Create `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'fxchubs-frontend',
    script: 'npm',
    args: 'start',
    cwd: '/path/to/frontend',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### 6. Common Issues and Solutions

#### 404 Error on API calls
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure backend is running on the correct port
- Verify network connectivity between frontend and backend

#### Static files not loading
- Check if `public/` directory is accessible
- Verify file permissions
- Ensure proper base path configuration

#### Build errors
- Clear `.next` directory: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run lint`

### 7. Development vs Production
- Development: Uses `localhost:8000` for API
- Production: Uses `NEXT_PUBLIC_API_URL` environment variable
- Always set `NODE_ENV=production` on server

### 8. Monitoring
- Check logs: `pm2 logs fxchubs-frontend`
- Monitor process: `pm2 monit`
- Restart if needed: `pm2 restart fxchubs-frontend` 