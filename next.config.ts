import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Initialize Cloudflare context for local dev/preview; safe to not await
void initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  // Configure the base path and asset prefix to reflect the mount path of your environment
  // For example, if your app is mounted at /app, set basePath and assetPrefix to '/app'
  basePath: '/app',
  assetPrefix: '/app',
  // Additional Next.js configuration options can be added here
  // For example:
  // output: 'standalone',
  // reactStrictMode: true,
};

export default nextConfig;
