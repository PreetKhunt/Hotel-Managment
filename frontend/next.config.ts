import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_API_URL ? process.env.BACKEND_API_URL.replace(/\/+$/, '') : undefined;

if (process.env.NODE_ENV === 'production' && backendUrl && (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1'))) {
  throw new Error(`BACKEND_API_URL cannot point to localhost in production! It is currently set to: ${backendUrl}`);
}

if (!backendUrl) {
  console.warn("⚠️ [Config Notice] BACKEND_API_URL is not defined during this phase. Ensure it is configured in Netlify Environment Variables for runtime API proxying.");
}

const nextConfig: NextConfig = {
  async rewrites() {
    if (!backendUrl) {
      console.warn("⚠️ [Rewrites] BACKEND_API_URL is undefined; /api/v1/* requests will not be proxied.");
      return [];
    }
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
