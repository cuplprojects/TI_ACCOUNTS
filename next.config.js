/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  output: "standalone",
  turbopack:{
    root: process.cwd(),
  },
  images: {
    domains: [
      "totallyassets.s3.ap-south-1.amazonaws.com",
      "picsum.photos",
      "cdn.shopify.com",
      "drive.google.com",
      "cdn.totallyindian.com",
      "totallyindian.com",
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.totallyindian.com',
      },
      {
        protocol: 'https',
        hostname: '**.totallyindian.com',
      },
      {
        protocol: 'https',
        hostname: '**.s3.**.amazonaws.com',
      },
    ],
  },
};

module.exports = nextConfig;
