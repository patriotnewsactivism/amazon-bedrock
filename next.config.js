/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { webpackMemoryOptimizations: true },
  // Enable standalone output for Docker deployment
  output: 'standalone'
};

module.exports = nextConfig;
