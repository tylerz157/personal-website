/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const repositoryName = 'personal-website'; // Your repository name

const nextConfig = {
  // Enable static exports
  output: 'export',
  
  // Set base path for GitHub Pages
  basePath: isGithubActions ? `/${repositoryName}` : '',
  assetPrefix: isGithubActions ? `/${repositoryName}/` : '',
  
  // Configure images for static export
  images: {
    unoptimized: true, // Required for static export
    domains: ['tylerz157.github.io'],
    path: isGithubActions ? `/${repositoryName}/_next/image` : '/_next/image',
    loader: 'custom',
    loaderFile: './image-loader.js',
  },
  
  // Enable MDX
  experimental: {
    mdxRs: false
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubActions ? `/${repositoryName}` : '',
  },
  
  // Ensure trailing slashes for GitHub Pages
  trailingSlash: true,
};

module.exports = nextConfig;
