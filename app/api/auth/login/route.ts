import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from '../../../../lib/session';

export async function POST(req: NextRequest) {
    try {
        const { password } = await req.json();

        const adminPassword = process.env.ADMIN_PASSWORD;
        if (!adminPassword) {
            return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
        }

        // Constant-time comparison to prevent timing attacks
        const provided = Buffer.from(String(password ?? ''));
        const expected = Buffer.from(adminPassword);
        const match =
            provided.length === expected.length &&
            (() => {
                // Pad provided to match length before comparison
                const a = Buffer.alloc(expected.length);
                provided.copy(a);
                return (
                    require('crypto').timingSafeEqual(a, expected) &&
                    provided.length === expected.length
                );
            })();

        if (!match) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const session = await getIronSession<SessionData>(cookies(), sessionOptions);
        session.isAdmin = true;
        await session.save();

        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }
}
