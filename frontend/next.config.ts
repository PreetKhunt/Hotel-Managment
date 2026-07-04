import type { NextConfig } from "next";

if (!process.env.BACKEND_API_URL) {
  throw new Error("BACKEND_API_URL environment variable is required to build Next.js. Fail fast.");
}

if (process.env.NODE_ENV === 'production' && (process.env.BACKEND_API_URL.includes('localhost') || process.env.BACKEND_API_URL.includes('127.0.0.1'))) {
  throw new Error(`BACKEND_API_URL cannot point to localhost in production! It is currently set to: ${process.env.BACKEND_API_URL}`);
}

const backendUrl = process.env.BACKEND_API_URL.replace(/\/+$/, '');

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
