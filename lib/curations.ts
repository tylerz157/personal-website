import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { ensureLocalImage, isRemoteUrl } from './imageCache';

export type CurationLink = { label: string; href: string };
export type CurationFile = { label?: string; href: string };

export type CurationFrontmatter = {
  title: string;
  description?: string;
  price?: string;
  url?: string;
  tags?: string[];
  coverImage?: string;
  coverAlt?: string;
  badge?: string; // e.g., Staff Pick
  links?: CurationLink[];
  files?: CurationFile[];
};

export type CurationMeta = {
  slug: string;
} & CurationFrontmatter;

const CONTENT_DIR = path.join(process.cwd(), 'content', 'curations');

export async function getCurationSlugs(): Promise<string[]> {
  const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && (e.name.endsWith('.mdx') || e.name.endsWith('.md')))
    .map((e) => e.name.replace(/\.mdx?$/, ''));
}

export async function getCurationBySlug(slug: string): Promise<{ meta: CurationMeta; content: string }> {
  const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
  const raw = await fs.readFile(filePath, 'utf8');
  const { content, data } = matter(raw);
  const meta: CurationMeta = {
    slug,
    title: data.title ?? slug,
    description: data.description ?? '',
    price: data.price ?? undefined,
    url: data.url ?? undefined,
    tags: data.tags ?? undefined,
    coverImage: data.coverImage ?? undefined,
    coverAlt: data.coverAlt ?? undefined,
    badge: data.badge ?? undefined,
    links: data.links ?? undefined,
    files: data.files ?? undefined,
  };
  if (meta.coverImage && isRemoteUrl(meta.coverImage)) {
    try {
      meta.coverImage = await ensureLocalImage(meta.coverImage);
    } catch {}
  }
  return { meta, content };
}

export async function getAllCurations(): Promise<CurationMeta[]> {
  const slugs = await getCurationSlugs();
  const items = await Promise.all(slugs.map((slug) => getCurationBySlug(slug)));
  // Sort by title for consistency
  return items.map((i) => i.meta).sort((a, b) => a.title.localeCompare(b.title));
}
