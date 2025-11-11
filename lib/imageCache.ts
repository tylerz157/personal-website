import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const PUBLIC_CACHE_DIR = path.join(process.cwd(), 'public', '_cache');

function fileExtFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const ext = path.extname(u.pathname).toLowerCase();
    if (ext && ext.length <= 6) return ext; // .jpg, .jpeg, .png, .webp, .gif
  } catch {}
  return '.jpg';
}

export async function ensureLocalImage(remoteUrl: string): Promise<string> {
  // Returns web path like /_cache/<hash>.<ext>
  const hash = crypto.createHash('sha1').update(remoteUrl).digest('hex').slice(0, 16);
  const ext = fileExtFromUrl(remoteUrl);
  const fileName = `${hash}${ext}`;
  const outPath = path.join(PUBLIC_CACHE_DIR, fileName);
  const webPath = `/_cache/${fileName}`;

  try {
    await fs.access(outPath);
    return webPath;
  } catch {}

  await fs.mkdir(PUBLIC_CACHE_DIR, { recursive: true });

  const res = await fetch(remoteUrl, { cache: 'no-store' });
  if (!res.ok || !res.body) {
    // If fetch fails, return original URL to avoid breaking render
    return remoteUrl;
  }
  const arrayBuffer = await res.arrayBuffer();
  const buf = Buffer.from(arrayBuffer);
  await fs.writeFile(outPath, buf);
  return webPath;
}

export function isRemoteUrl(src?: string): boolean {
  return !!src && (src.startsWith('http://') || src.startsWith('https://'));
}
