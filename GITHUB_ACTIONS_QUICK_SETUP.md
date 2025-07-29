# 🚀 GitHub Actions Quick Setup Guide (Contabo VPS + CyberPanel - Staging)

## ✅ What's Already Done

Both repositories now have GitHub Actions workflows configured for Contabo VPS with CyberPanel staging environment:

- **Frontend**: `.github/workflows/deploy.yml` (Next.js) → `stage.fxc-hub.com`
- **Backend**: `.github/workflows/deploy.yml` (Laravel) → `api.fxc-hub.com`

## 🔐 Required GitHub Secrets

### For Both Repositories (VPS Deployment):

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

```bash
VPS_HOST=your-contabo-vps-ip
VPS_USERNAME=admin
VPS_SSH_KEY=your-private-ssh-key
VPS_PORT=22  # Optional
```

## 🛠️ VPS Setup Requirements

### Frontend Directory:
```bash
sudo mkdir -p /home/admin/fxchubs/frontend
sudo chown -R admin:admin /home/admin/fxchubs/frontend
cd /home/admin/fxchubs/frontend
git clone https://github.com/fxc-hub/frontend.git .
npm install -g pm2
```

### Backend Directory:
```bash
sudo mkdir -p /home/admin/fxchubs/backend
sudo chown -R admin:admin /home/admin/fxchubs/backend
cd /home/admin/fxchubs/backend
git clone https://github.com/fxc-hub/backend.git .
composer install
```

## 🌐 CyberPanel Website Setup

### Create Websites:
1. **Frontend (Staging)**: `stage.fxc-hub.com`
2. **Backend (API)**: `api.fxc-hub.com`

### Environment Configuration:

#### Frontend (.env.local):
```env
NEXT_PUBLIC_API_URL=https://api.fxc-hub.com
NEXT_PUBLIC_SITE_URL=https://stage.fxc-hub.com
NEXT_PUBLIC_APP_ENV=staging
```

#### Backend (.env):
```env
APP_ENV=staging
APP_URL=https://api.fxc-hub.com
DB_DATABASE=fxchubs_staging
CORS_ALLOWED_ORIGINS=https://stage.fxc-hub.com,https://fxc-hub.com
```

## 🔄 How It Works

### Automatic Triggers:
- **Push to main**: Runs full pipeline (test → build → deploy)
- **Pull Request**: Runs tests only (no deployment)

### Manual Trigger:
1. Go to **Actions** tab
2. Select workflow
3. Click **Run workflow**

## 📊 Monitoring

- Check **Actions** tab for workflow status
- Green ✅ = Success
- Red ❌ = Failed (check logs for details)

## 🚨 Troubleshooting

### Common Issues:

1. **SSH Connection Failed**
   - Verify SSH key is added to VPS
   - Test: `ssh -i ~/.ssh/your-key admin@your-vps-ip`

2. **Build Failed**
   - Check Node.js/PHP version compatibility
   - Verify all dependencies are installed

3. **Deployment Failed**
   - Check VPS directory permissions
   - Verify services are running (nginx, php-fpm, pm2)

4. **CyberPanel Issues**
   - Check CyberPanel logs: `/usr/local/lsws/logs/`
   - Verify website configurations in CyberPanel

5. **CORS Issues**
   - Check CORS configuration in backend
   - Verify domain names in CORS_ALLOWED_ORIGINS

## 📞 Next Steps

1. **Set up GitHub Secrets** (see above)
2. **Configure VPS directories** (see above)
3. **Set up CyberPanel websites** (see CONTRABO_VPS_SETUP.md)
4. **Test the workflow** by pushing a small change
5. **Monitor the Actions tab** for success/failure

## 🔗 Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [CyberPanel Documentation](https://cyberpanel.net/docs/)
- [Contabo Support](https://contabo.com/support/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

## 📋 Complete Setup Guide

For detailed setup instructions including CyberPanel configuration, SSL certificates, and Nginx setup, see:
- **`CONTRABO_VPS_SETUP.md`** - Complete deployment guide

## 🌐 Staging Environment URLs

After setup, your staging environment will be available at:
- **Frontend**: https://stage.fxc-hub.com
- **Backend API**: https://api.fxc-hub.com

## 🔄 Future Production Migration

When ready to go live, you can migrate to:
- **Frontend**: https://fxc-hub.com
- **Backend**: https://api.fxc-hub.com (same API endpoint)

---

**🎉 You're all set! Push to main branch to trigger your first automated deployment to staging!**