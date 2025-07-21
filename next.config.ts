import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require("dotenv");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { join } = require("path");

// Load environment variables from the backend (admin) .env so we have a single source of truth
dotenv.config({ path: join(__dirname, "..", "admin", ".env") });

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_APP_NAME: process.env.APP_NAME || "Laravel",
  },
};

export default nextConfig;
