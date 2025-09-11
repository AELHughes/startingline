import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Local development backend
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5001',
        pathname: '/api/storage/images/**',
      },
      {
        protocol: 'https',
        hostname: 'kjeoqaoinkcrbukoqjfn.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'startingline.co.za',
        port: '',
        pathname: '/wp-content/uploads/**',
      }
    ],
  },
};

export default nextConfig;
