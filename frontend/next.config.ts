// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  // Proxy API requests to backend during development to avoid CORS issues.
  // Calls from the frontend to /api/* will be forwarded to http://localhost:4000/api/*
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:4000/api/:path*", // ganti sesuai backend-mu
      },
    ];
  },
};

export default nextConfig;
