import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.3"],
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
