import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require("dotenv");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require("path");

// Load environment variables from the backend .env
dotenv.config({ path: join(__dirname, "..", "backend", ".env") });

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.APP_NAME || "FXCHUB",
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Ensure proper static export for production
  output: 'standalone',
  // Disable image optimization if not needed
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // Use environment variable for API URL, fallback to localhost for development
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
                   (process.env.NODE_ENV === 'production' 
                     ? 'http://localhost:8000' 
                     : 'http://localhost:8000');
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  // Add trailing slash for better server compatibility
  trailingSlash: false,
  // Ensure proper base path if needed
  basePath: '',
};

export default nextConfig;
