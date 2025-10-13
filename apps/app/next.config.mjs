import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  /* config options here */
  devIndicators: false,
  reactStrictMode: true,
  transpilePackages: ['shiki', '@deepcrawl/contracts', '@deepcrawl/types'], // include contracts and types packages in the build for docs generation
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default withMDX(config);
