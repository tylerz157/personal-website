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

function parseDate(dateStr: string | undefined): Date | null {
    if (!dateStr) return null;
    // Handle YYYY-MM-DD and YYYY-M-D formats
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day);
    }
    return new Date(dateStr);
}

function calculateDurationDays(startDate: Date, endDate: Date): number {
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export async function getAllProjects(): Promise<ProjectMeta[]> {
    const slugs = await getProjectSlugs();
    const projects = await Promise.all(slugs.map((slug) => getProjectBySlug(slug)));
    
    const now = new Date();
    
    const sorted = projects
        .map((p) => p.meta)
        .sort((a, b) => {
            const aIsPresent = a.endDate?.toLowerCase() === 'present';
            const bIsPresent = b.endDate?.toLowerCase() === 'present';
            
            // If both are present, sort by duration (shortest first)
            if (aIsPresent && bIsPresent) {
                const aStart = parseDate(a.date) || new Date(0);
                const bStart = parseDate(b.date) || new Date(0);
                const aDuration = calculateDurationDays(aStart, now);
                const bDuration = calculateDurationDays(bStart, now);
                return aDuration - bDuration; // Sort by duration ascending
            }
            
            // If only one is present, put the present one first
            if (aIsPresent) return -1;
            if (bIsPresent) return 1;
            
            // For non-present projects, sort by end date (newest first)
            const aDate = parseDate(a.endDate) || parseDate(a.date) || new Date(0);
            const bDate = parseDate(b.endDate) || parseDate(b.date) || new Date(0);
            return bDate.getTime() - aDate.getTime();
        });
    
    return sorted;
}


