import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from '../../../../lib/session';
import { readFile, writeFile } from '../../../../lib/github';
import { assembleMDX, type Module } from '../../../../lib/mdxModules';
import type { ProjectFrontmatter } from '../../../../lib/projects';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function POST(req: NextRequest) {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    if (!session.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let slug: string, frontmatter: ProjectFrontmatter, modules: Module[];
    try {
        ({ slug, frontmatter, modules } = await req.json());
    } catch {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    if (!slug || !SLUG_RE.test(slug) || slug.length > 80) {
        return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    const filePath = `content/projects/${slug}.mdx`;
    const mdxContent = assembleMDX(frontmatter, modules);

    try {
        // Get current SHA (needed for updates)
        const { sha } = await readFile(filePath);
        await writeFile(filePath, mdxContent, `Update project: ${slug}`, sha);
    } catch (err: unknown) {
        // If file doesn't exist (new project), create without SHA
        if (isNotFoundError(err)) {
            await writeFile(filePath, mdxContent, `Create project: ${slug}`);
        } else if (isConflictError(err)) {
            return NextResponse.json({ error: 'conflict' }, { status: 409 });
        } else {
            console.error('GitHub write error:', err);
            return NextResponse.json({ error: 'GitHub error' }, { status: 502 });
        }
    }

    return NextResponse.json({ ok: true });
}

function isNotFoundError(err: unknown): boolean {
    return (err as { status?: number })?.status === 404;
}

function isConflictError(err: unknown): boolean {
    return (err as { status?: number })?.status === 409;
}
