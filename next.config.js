/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const repositoryName = 'personal-website'; // Replace with your repository name if different

const nextConfig = {
  // Enable static exports
  output: 'export',
  
  // Set base path for GitHub Pages
  basePath: isGithubActions ? `/${repositoryName}` : '',
  assetPrefix: isGithubActions ? `/${repositoryName}/` : '',
  
  // Configure images for static export
  images: {
    unoptimized: true, // Required for static export
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' }
    ]
  },
  
  // Enable MDX
  experimental: {
    mdxRs: false
  },
  
  // Optional: Add environment variables
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubActions ? `/${repositoryName}` : '',
  },
};

module.exports = nextConfig;
