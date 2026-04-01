import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from '../../../../lib/session';
import { readFile, writeFile } from '../../../../lib/github';

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function POST(req: NextRequest) {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    if (!session.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let title: string, slug: string;
    try {
        ({ title, slug } = await req.json());
    } catch {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    if (!slug || !SLUG_RE.test(slug) || slug.length > 80) {
        return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    const filePath = `content/projects/${slug}.mdx`;

    // Check if file already exists
    try {
        await readFile(filePath);
        return NextResponse.json({ error: 'Project already exists' }, { status: 409 });
    } catch (err: unknown) {
        if ((err as { status?: number })?.status !== 404) {
            return NextResponse.json({ error: 'GitHub error' }, { status: 502 });
        }
    }

    const blankMDX = `---
title: "${title}"
description: ""
date: ""
endDate: ""
tags: []
---

<!-- MODULE:text -->
`;

    try {
        await writeFile(filePath, blankMDX, `Create project: ${slug}`);
    } catch (err) {
        console.error('GitHub create error:', err);
        return NextResponse.json({ error: 'GitHub error' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, slug }, { status: 201 });
}
