import fs from 'node:fs/promises';
import path from 'node:path';
import matter from 'gray-matter';
import { ensureLocalImage, isRemoteUrl } from './imageCache';

export type ProjectLink = { label: string; href: string };
export type ProjectFile = { label?: string; href: string };

export type ProjectFrontmatter = {
	title: string;
	description: string;
	date?: string;
	endDate?: string;
	tags?: string[];
	coverImage?: string; // URL or /public path
	coverAlt?: string;
	url?: string; // primary external link
	links?: ProjectLink[]; // additional external links
	files?: ProjectFile[]; // downloadable files/links
};

export type ProjectMeta = {
	slug: string;
} & ProjectFrontmatter;

const CONTENT_DIR = path.join(process.cwd(), 'content', 'projects');

export async function getProjectSlugs(): Promise<string[]> {
	const entries = await fs.readdir(CONTENT_DIR, { withFileTypes: true });
	return entries
		.filter((e) => e.isFile() && (e.name.endsWith('.mdx') || e.name.endsWith('.md')))
		.map((e) => e.name.replace(/\.mdx?$/, ''));
}

export async function getProjectBySlug(slug: string): Promise<{
	meta: ProjectMeta;
	content: string;
}> {
	const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
	const raw = await fs.readFile(filePath, 'utf8');
	const { content, data } = matter(raw);
	const meta: ProjectMeta = {
		slug,
		title: data.title ?? slug,
		description: data.description ?? '',
		date: data.date ?? undefined,
		endDate: data.endDate ?? data.end ?? undefined,
		tags: data.tags ?? undefined,
		coverImage: data.coverImage ?? undefined,
		coverAlt: data.coverAlt ?? undefined,
		url: data.url ?? undefined,
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

export async function getAllProjects(): Promise<ProjectMeta[]> {
	const slugs = await getProjectSlugs();
	const projects = await Promise.all(slugs.map((slug) => getProjectBySlug(slug)));
	// Sort by date desc if provided, else by title
	const sorted = projects
		.map((p) => p.meta)
		.sort((a, b) => {
			if (a.date && b.date) {
				return new Date(b.date).getTime() - new Date(a.date).getTime();
			}
			return a.title.localeCompare(b.title);
		});
	return sorted;
}


