import matter from 'gray-matter';
import type { ProjectFrontmatter } from './projects';

export type TextModule = { type: 'text'; content: string };
export type ImageModule = { type: 'image'; src: string; alt: string };
export type VideoModule = { type: 'video'; url: string };
export type Module = TextModule | ImageModule | VideoModule;

function parseAttrs(attrStr: string): Record<string, string> {
    const attrs: Record<string, string> = {};
    const re = /(\w+)="([^"]*)"/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(attrStr)) !== null) {
        attrs[m[1]] = m[2];
    }
    return attrs;
}

export function parseModules(body: string): Module[] {
    const lines = body.split('\n');
    const modules: Module[] = [];
    let textLines: string[] = [];
    let inTextModule = false;

    function flushText() {
        const content = textLines.join('\n').trim();
        if (content) modules.push({ type: 'text', content });
        textLines = [];
        inTextModule = false;
    }

    for (const line of lines) {
        const m = line.match(/^<!-- MODULE:(text|image|video)(.*?)-->$/);
        if (m) {
            flushText();
            const kind = m[1] as 'text' | 'image' | 'video';
            if (kind === 'text') {
                inTextModule = true;
                continue;
            }
            const attrs = parseAttrs(m[2]);
            if (kind === 'image') {
                modules.push({ type: 'image', src: attrs.src ?? '', alt: attrs.alt ?? '' });
            } else if (kind === 'video') {
                modules.push({ type: 'video', url: attrs.url ?? '' });
            }
            continue;
        }
        // Lines outside a text module (e.g. renderable ![]() after image sentinel) are skipped
        if (inTextModule) {
            textLines.push(line);
        }
    }
    flushText();

    // Legacy: existing MDX files with no sentinels → one text module
    if (modules.length === 0) {
        return [{ type: 'text', content: body.trim() }];
    }
    return modules;
}

export function assembleModules(modules: Module[]): string {
    return modules
        .map((m) => {
            if (m.type === 'text') return `<!-- MODULE:text -->\n${m.content}`;
            if (m.type === 'image') return `<!-- MODULE:image src="${m.src}" alt="${m.alt}" -->\n![${m.alt}](${m.src})`;
            if (m.type === 'video') return `<!-- MODULE:video url="${m.url}" -->\n<VideoEmbed url="${m.url}" />`;
            return '';
        })
        .join('\n\n');
}

export function assembleMDX(frontmatter: ProjectFrontmatter, modules: Module[]): string {
    const body = assembleModules(modules);
    return matter.stringify(body, frontmatter as Record<string, unknown>);
}
