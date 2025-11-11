/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    mdxRs: false
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' }
    ]
  }
};

module.exports = nextConfig;


