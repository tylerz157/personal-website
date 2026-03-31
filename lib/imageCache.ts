import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const PUBLIC_CACHE_DIR = path.join(PUBLIC_DIR, '_cache');

export function isRemoteUrl(src?: string): boolean {
  return !!src && (src.startsWith('http://') || src.startsWith('https://'));
}

// Resize and cache any image (remote URL or local /public path) to /_cache/<hash>.jpg.
// Returns the web path to the cached file, or the original src on failure.
export async function ensureOptimizedImage(src: string): Promise<string> {
  const hash = crypto.createHash('sha1').update(src).digest('hex').slice(0, 16);
  const fileName = `${hash}.jpg`;
  const outPath = path.join(PUBLIC_CACHE_DIR, fileName);
  const webPath = `/_cache/${fileName}`;

  try {
    await fs.access(outPath);
    return webPath;
  } catch {}

  await fs.mkdir(PUBLIC_CACHE_DIR, { recursive: true });

  let buf: Buffer;
  if (isRemoteUrl(src)) {
    const res = await fetch(src, { cache: 'no-store' });
    if (!res.ok || !res.body) return src;
    buf = Buffer.from(await res.arrayBuffer());
  } else {
    const localPath = path.join(PUBLIC_DIR, src);
    try {
      buf = await fs.readFile(localPath);
    } catch {
      return src;
    }
  }

  await sharp(buf)
    .resize({ width: 960, withoutEnlargement: true })
    .jpeg({ quality: 82 })
    .toFile(outPath);

  return webPath;
}
