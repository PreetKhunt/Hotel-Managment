import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        // In production on Netlify, define BACKEND_API_URL (e.g., https://your-railway-app.up.railway.app/api/v1)
        // This proxies requests from frontend domain to backend, keeping cookies first-party
        destination: `${process.env.BACKEND_API_URL || 'https://hotel-managment-production-8824.up.railway.app/api/v1'}/:path*`,
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
