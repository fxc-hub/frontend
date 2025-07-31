// Deployment configuration for Next.js frontend
module.exports = {
  // Environment variables for different deployment stages
  development: {
    NEXT_PUBLIC_API_URL: 'http://localhost:8000',
    NODE_ENV: 'development'
  },
  production: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    NODE_ENV: 'production'
  },
  
  // Build settings
  build: {
    output: 'standalone',
    optimizeFonts: true,
    compress: true
  },
  
  // Server settings
  server: {
    port: process.env.PORT || 3000,
    hostname: '0.0.0.0'
  }
}; 