import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from '../../../../lib/session';
import { readFile, uploadImage } from '../../../../lib/github';

const FILENAME_RE = /^[a-zA-Z0-9_.-]+$/;

export async function POST(req: NextRequest) {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    if (!session.isAdmin) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let formData: FormData;
    try {
        formData = await req.formData();
    } catch {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    const file = formData.get('file') as File | null;
    const rawFilename = formData.get('filename') as string | null;

    if (!file || !rawFilename) {
        return NextResponse.json({ error: 'Missing file or filename' }, { status: 400 });
    }

    // Sanitize filename: strip path separators, only allow safe chars
    const filename = rawFilename.replace(/[/\\]/g, '').split('/').pop() ?? rawFilename;
    if (!FILENAME_RE.test(filename) || filename.includes('..')) {
        return NextResponse.json({ error: 'Invalid filename' }, { status: 400 });
    }

    const filePath = `public/images/${filename}`;
    const arrayBuffer = await file.arrayBuffer();
    const base64Content = Buffer.from(arrayBuffer).toString('base64');

    // Check if file exists to get sha for overwrite
    let existingSha: string | undefined;
    try {
        const existing = await readFile(filePath);
        existingSha = existing.sha;
    } catch {
        // File doesn't exist, that's fine
    }

    try {
        await uploadImage(filePath, base64Content, `Upload image: ${filename}`, existingSha);
    } catch (err) {
        console.error('Image upload error:', err);
        return NextResponse.json({ error: 'GitHub error' }, { status: 502 });
    }

    return NextResponse.json({ ok: true, path: `/images/${filename}` });
}
