# 🚀 GitHub Actions Quick Setup Guide (Contabo VPS + CyberPanel)

## ✅ What's Already Done

Both repositories now have GitHub Actions workflows configured for Contabo VPS with CyberPanel:

- **Frontend**: `.github/workflows/deploy.yml` (Next.js)
- **Backend**: `.github/workflows/deploy.yml` (Laravel)

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

---

**🎉 You're all set! Push to main branch to trigger your first automated deployment!**