'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const btnBase: React.CSSProperties = {
    border: 'none',
    padding: '6px 16px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 13,
    letterSpacing: 1,
    whiteSpace: 'nowrap',
};

function deriveSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim()
        .replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80);
}

export default function AdminBar() {
    const router = useRouter();
    const pathname = usePathname();
    const [isAdmin, setIsAdmin] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    // New project form state
    const [newOpen, setNewOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/auth/session')
            .then((r) => r.json())
            .then((d) => setIsAdmin(d.isAdmin === true))
            .catch(() => {});
    }, []);

    if (!isAdmin) return null;

    // Detect if we're on a project view page (not the edit page)
    const projectMatch = pathname.match(/^\/projects\/([^/]+)$/);
    const currentSlug = projectMatch?.[1] ?? null;

    async function handleLogout() {
        setLoggingOut(true);
        await fetch('/api/auth/logout', { method: 'POST' });
        setIsAdmin(false);
        setLoggingOut(false);
        router.refresh();
    }

    function handleTitleChange(t: string) {
        setTitle(t);
        setSlug(deriveSlug(t));
    }

    async function handleCreate() {
        setCreateError(null);
        if (!title.trim() || !slug) { setCreateError('Title required.'); return; }
        setCreating(true);
        try {
            const res = await fetch('/api/projects/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title.trim(), slug }),
            });
            const data = await res.json();
            if (!res.ok) { setCreateError(data.error ?? 'Failed'); }
            else { router.push(`/projects/${slug}/edit`); }
        } catch { setCreateError('Network error.'); }
        finally { setCreating(false); }
    }

    return (
        <>
            {/* New project form — floats above the bar */}
            {newOpen && (
                <div style={{
                    position: 'fixed',
                    bottom: 56,
                    right: 24,
                    background: '#111',
                    border: '1px solid #444',
                    padding: 16,
                    zIndex: 1001,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    minWidth: 260,
                }}>
                    <input
                        autoFocus
                        value={title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                        placeholder="Project title"
                        style={{ background: '#222', border: '1px solid #555', color: '#fff', padding: '6px 8px', fontFamily: 'inherit', fontSize: 13, outline: 'none' }}
                    />
                    <input
                        value={slug}
                        onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 80))}
                        placeholder="slug"
                        style={{ background: '#222', border: '1px solid #555', color: '#aaa', padding: '6px 8px', fontFamily: 'inherit', fontSize: 12, outline: 'none' }}
                    />
                    {createError && <span style={{ color: '#f66', fontSize: 12 }}>{createError}</span>}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={handleCreate} disabled={creating} style={{ ...btnBase, background: '#fff', color: '#000', border: 'none' }}>
                            {creating ? 'Creating…' : 'Create'}
                        </button>
                        <button onClick={() => { setNewOpen(false); setTitle(''); setSlug(''); setCreateError(null); }} style={{ ...btnBase, background: 'none', color: '#aaa', border: '1px solid #555' }}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Bar */}
            <div style={{
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                background: '#000',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '0 24px',
                height: 48,
                zIndex: 1000,
                fontFamily: 'inherit',
                fontSize: 13,
            }}>
                <span style={{ flex: 1, letterSpacing: 1, opacity: 0.5 }}>ADMIN</span>

                <button
                    onClick={() => { setNewOpen((o) => !o); setTitle(''); setSlug(''); setCreateError(null); }}
                    style={{ ...btnBase, background: 'none', color: '#fff', border: '1px solid #555' }}
                >
                    + New project
                </button>

                {currentSlug && (
                    <button
                        onClick={() => router.push(`/projects/${currentSlug}/edit`)}
                        style={{ ...btnBase, background: '#fff', color: '#000' }}
                    >
                        Edit this project
                    </button>
                )}

                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    style={{ ...btnBase, background: 'none', color: '#fff', border: '1px solid #555' }}
                >
                    {loggingOut ? '…' : 'Log out'}
                </button>
            </div>
        </>
    );
}
