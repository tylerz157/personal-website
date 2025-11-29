// Custom image loader for Next.js
// This ensures images work with GitHub Pages base path
export default function customLoader({ src, width, quality }) {
  // If it's an external URL, return as is
  if (src.startsWith('http')) {
    return src;
  }
  
  // For local images, add the base path
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  
  // Handle different image formats
  if (src.endsWith('.svg')) {
    return `${basePath}${src}`;
  }
  
  // For other images, you can add image optimization parameters if needed
  return `${basePath}${src}?w=${width}&q=${quality || 75}`;
}
