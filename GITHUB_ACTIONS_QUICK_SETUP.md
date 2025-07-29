# 🚀 GitHub Actions Quick Setup Guide

## ✅ What's Already Done

Both repositories now have GitHub Actions workflows configured:

- **Frontend**: `.github/workflows/deploy.yml` (Next.js)
- **Backend**: `.github/workflows/deploy.yml` (Laravel)

## 🔐 Required GitHub Secrets

### For Both Repositories (VPS Deployment):

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:

```bash
VPS_HOST=your-vps-ip-or-domain
VPS_USERNAME=your-vps-username
VPS_SSH_KEY=your-private-ssh-key
VPS_PORT=22  # Optional
```

### For Frontend Only (Vercel Deployment):

```bash
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
```

### For Backend Only (Railway Deployment):

```bash
RAILWAY_TOKEN=your-railway-token
RAILWAY_SERVICE=your-railway-service-name
```

## 🛠️ VPS Setup Requirements

### Frontend Directory:
```bash
sudo mkdir -p /var/www/fxchubs/frontend
sudo chown -R $USER:$USER /var/www/fxchubs/frontend
cd /var/www/fxchubs/frontend
git clone https://github.com/fxc-hub/frontend.git .
npm install -g pm2
```

### Backend Directory:
```bash
sudo mkdir -p /var/www/fxchubs/backend
sudo chown -R $USER:$USER /var/www/fxchubs/backend
cd /var/www/fxchubs/backend
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
   - Test: `ssh -i ~/.ssh/your-key username@your-vps-ip`

2. **Build Failed**
   - Check Node.js/PHP version compatibility
   - Verify all dependencies are installed

3. **Deployment Failed**
   - Check VPS directory permissions
   - Verify services are running (nginx, php-fpm, pm2)

## 📞 Next Steps

1. **Set up GitHub Secrets** (see above)
2. **Configure VPS directories** (see above)
3. **Test the workflow** by pushing a small change
4. **Monitor the Actions tab** for success/failure

## 🔗 Useful Links

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)

---

**🎉 You're all set! Push to main branch to trigger your first automated deployment!**