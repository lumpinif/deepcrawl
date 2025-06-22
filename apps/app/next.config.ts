import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: false,
  allowedDevOrigins: ['192.168.50.198', '192.168.50.74'],
  // experimental: {
  //   useCache: true,
  // },
  experimental: {
    viewTransition: true,
  },
};

export default nextConfig;
