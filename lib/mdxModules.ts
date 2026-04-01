import matter from 'gray-matter';
import type { ProjectFrontmatter } from './projects';

export type TextModule = { type: 'text'; content: string };
export type ImageModule = { type: 'image'; src: string; alt: string };
export type VideoModule = { type: 'video'; url: string };
export type Module = TextModule | ImageModule | VideoModule;

// Detect standalone image/video lines by content — no sentinel markers needed.
const IMAGE_LINE = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const VIDEO_LINE = /^<VideoEmbed url="([^"]+)"\s*\/>$/;

export function parseModules(body: string): Module[] {
    if (!body.trim()) return [{ type: 'text', content: '' }];

    const lines = body.split('\n');
    const modules: Module[] = [];
    let textLines: string[] = [];

    function flushText() {
        const content = textLines.join('\n').trim();
        if (content) modules.push({ type: 'text', content });
        textLines = [];
    }

    for (const line of lines) {
        const trimmed = line.trim();
        const imgMatch = trimmed.match(IMAGE_LINE);
        const videoMatch = trimmed.match(VIDEO_LINE);

        if (imgMatch) {
            flushText();
            modules.push({ type: 'image', alt: imgMatch[1], src: imgMatch[2] });
        } else if (videoMatch) {
            flushText();
            modules.push({ type: 'video', url: videoMatch[1] });
        } else {
            textLines.push(line);
        }
    }
    flushText();

    return modules.length > 0 ? modules : [{ type: 'text', content: '' }];
}

export function assembleModules(modules: Module[]): string {
    return modules
        .map((m) => {
            if (m.type === 'text') return m.content;
            if (m.type === 'image') return `![${m.alt}](${m.src})`;
            if (m.type === 'video') return `<VideoEmbed url="${m.url}" />`;
            return '';
        })
        .filter(Boolean)
        .join('\n\n');
}

export function assembleMDX(frontmatter: ProjectFrontmatter, modules: Module[]): string {
    // Strip slug if it leaked in from ProjectMeta
    const { slug: _slug, ...clean } = frontmatter as ProjectFrontmatter & { slug?: string };
    const body = assembleModules(modules);
    return matter.stringify(body, clean as Record<string, unknown>);
}
