import type { NextConfig } from "next";

const rawBackendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://hotel-management-backend-s0s0.onrender.com/api/v1';
const backendUrl = rawBackendUrl.replace(/\/+$/, '');

if (process.env.NODE_ENV === 'production' && (backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1'))) {
  throw new Error(`BACKEND_API_URL cannot point to localhost in production! It is currently set to: ${backendUrl}`);
}

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
      {
        protocol: "https",
        hostname: "vuqsfbhhgjpztoqmpmle.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
