import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /@mui\/material\/Table\/index.js/,
      resolve: { fullySpecified: false },
    });
    return config;
  },
  swcMinify: false, // Helps avoid SWC-related transformation issues
};

export default nextConfig;
