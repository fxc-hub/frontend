#!/bin/bash

# Frontend Deployment Script
echo "🚀 Starting Frontend Deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the application with PM2 (if available)
if command -v pm2 &> /dev/null; then
    echo "🚀 Starting with PM2..."
    pm2 start ecosystem.config.js --env production
    echo "✅ Application started with PM2!"
    echo "📊 To monitor: pm2 monit"
    echo "📋 To view logs: pm2 logs fxchubs-frontend"
else
    echo "⚠️  PM2 not found. Starting with npm..."
    echo "🚀 Starting the application..."
    npm start
fi

echo "🎉 Deployment completed!"
echo "🌐 Application should be running on http://localhost:3000" 