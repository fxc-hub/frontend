module.exports = {
  apps: [{
    name: 'fxchubs-frontend',
    script: 'npm',
    args: 'start',
    cwd: __dirname,
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      NEXT_PUBLIC_API_URL: 'http://localhost:8000'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_API_URL: 'http://localhost:8000' // Change this to your server IP
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
}; 