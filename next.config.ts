import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: "http://127.0.0.1:5000/api/v1/:path*",
      },
      {
        source: "/health",
        destination: "http://127.0.0.1:5000/health",
      },
      {
        source: "/ready",
        destination: "http://127.0.0.1:5000/ready",
      },
    ];
  },
};

export default nextConfig;
