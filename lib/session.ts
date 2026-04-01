import { type SessionOptions } from 'iron-session';

export type SessionData = {
    isAdmin?: boolean;
};

export const sessionOptions: SessionOptions = {
    cookieName: 'admin_session',
    password: process.env.SESSION_SECRET as string,
    cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
    },
};
