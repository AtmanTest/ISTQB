import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/ISTQB',
  assetPrefix: '/ISTQB/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
