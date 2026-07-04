import type { NextConfig } from "next";

if (!process.env.BACKEND_API_URL) {
  throw new Error("BACKEND_API_URL environment variable is required to build Next.js. Fail fast.");
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        // In production on Netlify, define BACKEND_API_URL (e.g., https://your-railway-app.up.railway.app/api/v1)
        // This proxies requests from frontend domain to backend, keeping cookies first-party
        destination: `${process.env.BACKEND_API_URL}/:path*`,
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
