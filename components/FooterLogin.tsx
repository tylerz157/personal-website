'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FooterLogin() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetch('/api/auth/session')
            .then((r) => r.json())
            .then((d) => setIsAdmin(d.isAdmin === true))
            .catch(() => {});
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(false);
        setLoading(true);
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });
            if (res.ok) {
                setIsAdmin(true);
                setPassword('');
                router.refresh();
            } else {
                setError(true);
                setPassword('');
            }
        } finally {
            setLoading(false);
        }
    }

    if (isAdmin) {
        return (
            <span style={{ fontSize: 11, color: 'var(--muted)', opacity: 0.5 }}>admin</span>
        );
    }

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="•••"
                style={{
                    width: 54,
                    border: `1px solid ${error ? '#c00' : '#ccc'}`,
                    background: 'transparent',
                    color: 'var(--muted)',
                    fontFamily: 'inherit',
                    fontSize: 12,
                    padding: '2px 5px',
                    outline: 'none',
                }}
            />
            <button
                type="submit"
                disabled={loading || !password}
                style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--muted)',
                    fontFamily: 'inherit',
                    fontSize: 11,
                    padding: 0,
                    opacity: loading ? 0.4 : 1,
                }}
            >
                →
            </button>
        </form>
    );
}
