import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import matter from 'gray-matter';
import { sessionOptions, type SessionData } from '../../../../lib/session';
import { getProjectBySlug } from '../../../../lib/projects';
import { parseModules } from '../../../../lib/mdxModules';
import { readFile } from '../../../../lib/github';
import EditPageClient from './EditPageClient';
import type { ProjectFrontmatter } from '../../../../lib/projects';

export const dynamic = 'force-dynamic';

type Params = { slug: string };

export default async function EditPage({ params }: { params: Params }) {
    const { slug } = params;

    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    if (!session.isAdmin) {
        redirect(`/projects/${slug}`);
    }

    let meta: ProjectFrontmatter, content: string;

    try {
        const result = await getProjectBySlug(slug);
        meta = result.meta;
        content = result.content;
    } catch {
        // File not on disk yet (just created, Vercel hasn't redeployed) — fall back to GitHub
        try {
            const { content: rawContent } = await readFile(`content/projects/${slug}.mdx`);
            const { content: mdxContent, data } = matter(rawContent);
            content = mdxContent;
            meta = {
                slug,
                title: data.title ?? slug,
                description: data.description ?? '',
                date: data.date ?? undefined,
                endDate: data.endDate ?? undefined,
                tags: data.tags ?? undefined,
                coverImage: data.coverImage ?? undefined,
                coverAlt: data.coverAlt ?? undefined,
                url: data.url ?? undefined,
                links: data.links ?? undefined,
                files: data.files ?? undefined,
            } as ProjectFrontmatter;
        } catch {
            redirect('/');
        }
    }

    const modules = parseModules(content!);

    return (
        <EditPageClient
            slug={slug}
            initialMeta={meta!}
            initialModules={modules}
        />
    );
}
