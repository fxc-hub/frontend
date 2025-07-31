#!/bin/bash

# Complete Server Deployment Script for FXCHUBS Frontend
echo "🚀 Complete Server Deployment for FXCHUBS Frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're on the server
if [ "$EUID" -eq 0 ]; then
    print_status "Running as root on server"
else
    print_error "This script should be run on the server as root"
    exit 1
fi

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')
print_status "Server IP: $SERVER_IP"

# Create frontend directory
print_status "Creating frontend directory..."
mkdir -p /root/frontend
cd /root/frontend

# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    print_status "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    apt-get install -y nodejs
fi

# Install npm if not installed
if ! command -v npm &> /dev/null; then
    print_status "Installing npm..."
    apt-get install -y npm
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Create package.json
print_status "Creating package.json..."
cat > package.json << 'EOF'
{
  "name": "fxchubs-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "@headlessui/react": "^2.2.4",
    "@heroicons/react": "^2.2.0",
    "axios": "^1.10.0",
    "dotenv": "^16.4.5",
    "lightweight-charts": "^5.0.8",
    "next": "15.3.5",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "15.3.5",
    "tailwindcss": "^4",
    "typescript": "^5"
  }
}
EOF

# Create next.config.ts
print_status "Creating next.config.ts..."
cat > next.config.ts << EOF
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "FXCHUB",
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  images: {
    unoptimized: true,
  },
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://$SERVER_IP:8000';
    
    return [
      {
        source: '/api/:path*',
        destination: \`\${apiUrl}/api/:path*\`,
      },
    ];
  },
  trailingSlash: false,
  basePath: '',
};

export default nextConfig;
EOF

# Create tsconfig.json
print_status "Creating tsconfig.json..."
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF

# Create environment file
print_status "Creating environment configuration..."
cat > .env.local << EOF
NEXT_PUBLIC_APP_NAME=FXCHUB
NEXT_PUBLIC_API_URL=http://$SERVER_IP:8000
NODE_ENV=production
PORT=3000
EOF

# Create basic app structure
print_status "Creating basic app structure..."
mkdir -p src/app
mkdir -p src/components
mkdir -p public

# Create basic layout
cat > src/app/layout.tsx << 'EOF'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FXCHUB - Trading Platform',
  description: 'Advanced trading platform with real-time signals',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
EOF

# Create basic page
cat > src/app/page.tsx << 'EOF'
export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          FXCHUB Trading Platform
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Advanced trading platform with real-time signals
        </p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <p className="text-green-600 font-semibold">
            ✅ Frontend is running successfully!
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Connected to API at: {process.env.NEXT_PUBLIC_API_URL}
          </p>
        </div>
      </div>
    </div>
  )
}
EOF

# Create basic CSS
cat > src/app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
EOF

# Create tailwind config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
EOF

# Create postcss config
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Install dependencies
print_status "Installing dependencies..."
npm install

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

# Create systemd service
print_status "Creating systemd service..."
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
print_status "Enabling and starting service..."
systemctl daemon-reload
systemctl enable fxchubs-frontend.service
systemctl start fxchubs-frontend.service

# Check if service is running
if systemctl is-active --quiet fxchubs-frontend.service; then
    print_status "Frontend service is running!"
else
    print_error "Failed to start frontend service"
    systemctl status fxchubs-frontend.service
    exit 1
fi

# Create LiteSpeed configuration
print_status "Creating LiteSpeed configuration..."
cat > /usr/local/lsws/conf/vhosts/fxchubs-frontend.conf << EOF
docRoot                   \$VH_ROOT/public_html
enableGzip               1
enableBr                 1

index  {
  useServer               0
  indexFiles              index.html, index.php
}

rewrite  {
  enable                  1
  rules                   <<<END_rules
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

# Restart LiteSpeed
print_status "Restarting LiteSpeed server..."
systemctl restart lsws

print_status "Deployment completed successfully!"
print_status "Frontend should be accessible at: http://$SERVER_IP"
print_status "API should be accessible at: http://$SERVER_IP:8000"

echo ""
print_status "Useful commands:"
echo "  Check frontend status: systemctl status fxchubs-frontend.service"
echo "  View frontend logs: journalctl -u fxchubs-frontend.service -f"
echo "  Restart frontend: systemctl restart fxchubs-frontend.service"
echo "  Check LiteSpeed status: systemctl status lsws" 