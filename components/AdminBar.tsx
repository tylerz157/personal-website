'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = { slug: string };

export default function AdminBar({ slug }: Props) {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        fetch('/api/auth/session')
            .then((r) => r.json())
            .then((d) => setIsAdmin(d.isAdmin === true))
            .catch(() => {});
    }, []);

    if (!isAdmin) return null;

    async function handleLogout() {
        setLoggingOut(true);
        await fetch('/api/auth/logout', { method: 'POST' });
        setIsAdmin(false);
        setLoggingOut(false);
        router.refresh();
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            background: '#000',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '0 24px',
            height: 48,
            zIndex: 1000,
            fontFamily: 'inherit',
            fontSize: 13,
        }}>
            <span style={{ flex: 1, letterSpacing: 1 }}>ADMIN MODE</span>
            <button
                onClick={() => router.push(`/projects/${slug}/edit`)}
                style={{
                    background: '#fff',
                    color: '#000',
                    border: 'none',
                    padding: '6px 16px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 13,
                    letterSpacing: 1,
                }}
            >
                Edit this project
            </button>
            <button
                onClick={handleLogout}
                disabled={loggingOut}
                style={{
                    background: 'none',
                    color: '#fff',
                    border: '1px solid #555',
                    padding: '6px 16px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    fontSize: 13,
                }}
            >
                {loggingOut ? 'Logging out…' : 'Log out'}
            </button>
        </div>
    );
}
