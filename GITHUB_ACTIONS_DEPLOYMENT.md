# GitHub Actions Deployment Guide

## ✅ **Yes, GitHub Actions Will Push These Scripts**

Your GitHub Actions workflow copies **ALL files** from your repository to the server, including the new deployment scripts we created.

## 📁 **Scripts That Will Be Deployed**

1. **`server-deploy.sh`** - Complete server deployment script
2. **`quick-fix-404.sh`** - Quick fix for 404 errors
3. **`litespeed-deploy.sh`** - LiteSpeed-specific deployment
4. **`github-actions-deploy.sh`** - Post-deployment fix script
5. **`upload-to-server.sh`** - Upload script for manual deployment

## 🔄 **Updated GitHub Actions Workflow**

I've updated your `.github/workflows/deploy.yml` to include:

### **New Features Added:**
- ✅ **Automatic API URL detection** using server IP
- ✅ **Environment file creation** with correct API URL
- ✅ **LiteSpeed configuration** with proxy settings
- ✅ **Automatic LiteSpeed restart** after deployment
- ✅ **Better error handling** and logging

### **Key Changes:**
```yaml
# Creates environment file with correct API URL
cat > .env.local << EOF
NEXT_PUBLIC_APP_NAME=FXCHUB
NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000
NODE_ENV=production
PORT=3001
EOF

# Creates LiteSpeed proxy configuration
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
```

## 🚀 **How It Works**

1. **Push to main branch** → Triggers GitHub Actions
2. **Build process** → Creates optimized Next.js build
3. **Deploy to server** → Copies all files including scripts
4. **Server setup** → Creates environment and LiteSpeed config
5. **Start services** → PM2 starts frontend, LiteSpeed restarts

## 🛠️ **Manual Fix After Deployment**

If you still get 404 errors after GitHub Actions deployment, run this on your server:

```bash
cd /home/fxc-hub.com/public_html
chmod +x github-actions-deploy.sh
./github-actions-deploy.sh
```

## 📋 **Deployment Checklist**

### **Before Push:**
- [ ] All scripts are committed to repository
- [ ] GitHub Actions secrets are configured
- [ ] Backend is running on port 8000

### **After Deployment:**
- [ ] Check GitHub Actions logs for success
- [ ] Verify frontend is running: `pm2 list`
- [ ] Test site: `curl http://localhost:3001`
- [ ] Check LiteSpeed: `systemctl status lsws`

## 🔍 **Troubleshooting**

### **If GitHub Actions Fails:**
```bash
# Check GitHub Actions logs in your repository
# Look for specific error messages
# Verify secrets are correct
```

### **If Site Still Shows 404:**
```bash
# Run manual fix script
cd /home/fxc-hub.com/public_html
./github-actions-deploy.sh

# Check PM2 status
pm2 list
pm2 logs frontend

# Check LiteSpeed status
systemctl status lsws
```

### **If API Calls Fail:**
```bash
# Check environment file
cat .env.local

# Verify backend is running
curl http://localhost:8000/api/health

# Check network connectivity
ping localhost
```

## 📞 **Useful Commands**

```bash
# Check deployment status
pm2 list
systemctl status lsws

# View logs
pm2 logs frontend
journalctl -u lsws -f

# Restart services
pm2 restart frontend
systemctl restart lsws

# Test connectivity
curl http://localhost:3001
curl http://localhost:8000/api/health
```

## 🎯 **Expected Result**

After the next GitHub Actions deployment:
- ✅ **No more 404 errors**
- ✅ **Frontend loads correctly**
- ✅ **API calls work properly**
- ✅ **LiteSpeed serves Next.js app**
- ✅ **Automatic restarts on server reboot**

## 📝 **Next Steps**

1. **Commit and push** your changes to trigger deployment
2. **Monitor GitHub Actions** logs for success
3. **Test your site** after deployment completes
4. **Run manual fix** if needed: `./github-actions-deploy.sh`

The updated workflow will automatically fix the 404 error by properly configuring the environment variables and LiteSpeed proxy settings. 