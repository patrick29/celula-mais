import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Experimental features for performance if needed
  experimental: {
    // optimizePackageImports: ["lucide-react"], // Already handled well by Next.js 15+
  },
};

export default nextConfig;
