// Custom image loader for Next.js
// Ensures images work with GitHub Pages base path
export default function customLoader({ src }) {
  if (src.startsWith('http')) return src;
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${basePath}${src}`;
}
