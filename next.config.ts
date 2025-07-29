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
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
