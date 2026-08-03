import type { NextConfig } from "next";

const rawBackendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://hotel-management-backend-s0s0.onrender.com/api/v1';
const backendUrl = rawBackendUrl.replace(/\/+$/, '');

if (process.env.NODE_ENV === 'production' && (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1'))) {
  throw new Error(`BACKEND_API_URL cannot point to localhost in production! It is currently set to: ${backendUrl}`);
}

const nextConfig: NextConfig = {
  async rewrites() {
    // In production on Netlify, let native edge [[redirects]] from netlify.toml handle /api/v1/* reverse proxying.
    // Next.js serverless functions (rewrites) fail to preserve Set-Cookie headers on 302 HTTP redirects (such as Google OAuth endpoints).
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/v1/:path*',
          destination: `${backendUrl}/:path*`,
        },
      ];
    }
    return [];
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
