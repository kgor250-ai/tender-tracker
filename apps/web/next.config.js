/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@tender-tracker/shared-types', '@tender-tracker/config'],
};

module.exports = nextConfig;

