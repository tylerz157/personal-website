import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions, type SessionData } from '../../../../lib/session';

export async function GET() {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    return NextResponse.json({ isAdmin: session.isAdmin === true });
}
