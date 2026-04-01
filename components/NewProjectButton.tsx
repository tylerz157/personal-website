'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function deriveSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .slice(0, 80);
}

export default function NewProjectButton() {
    const router = useRouter();
    const [isAdmin, setIsAdmin] = useState(false);
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState('');
    const [slug, setSlug] = useState('');
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/auth/session')
            .then((r) => r.json())
            .then((d) => setIsAdmin(d.isAdmin === true))
            .catch(() => {});
    }, []);

    function handleTitleChange(t: string) {
        setTitle(t);
        setSlug(deriveSlug(t));
    }

    async function handleCreate() {
        setError(null);
        if (!title.trim() || !slug) {
            setError('Title and slug are required.');
            return;
        }
        setCreating(true);
        try {
            const res = await fetch('/api/projects/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: title.trim(), slug }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Failed to create project.');
            } else {
                router.push(`/projects/${slug}/edit`);
            }
        } catch {
            setError('Network error.');
        } finally {
            setCreating(false);
        }
    }

    if (!isAdmin) return null;

    return (
        <div style={{ marginTop: 16 }}>
            {!open ? (
                <button
                    onClick={() => setOpen(true)}
                    className="tag-chip"
                    style={{ cursor: 'pointer' }}
                >
                    + New Project
                </button>
            ) : (
                <div style={{
                    border: '1px solid #000',
                    padding: 16,
                    background: 'var(--panel, #f7f2e6)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    maxWidth: 400,
                }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
                            Title
                        </label>
                        <input
                            autoFocus
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                            style={{
                                width: '100%',
                                border: '1px solid #000',
                                background: '#fff',
                                padding: '6px 8px',
                                fontFamily: 'inherit',
                                fontSize: 14,
                                boxSizing: 'border-box',
                            }}
                            placeholder="My New Project"
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
                            Slug
                        </label>
                        <input
                            value={slug}
                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 80))}
                            style={{
                                width: '100%',
                                border: '1px solid #000',
                                background: '#fff',
                                padding: '6px 8px',
                                fontFamily: 'inherit',
                                fontSize: 14,
                                boxSizing: 'border-box',
                            }}
                            placeholder="my-new-project"
                        />
                    </div>
                    {error && <span style={{ color: '#c00', fontSize: 13 }}>{error}</span>}
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            style={{
                                background: '#000',
                                color: '#fff',
                                border: '1px solid #000',
                                padding: '6px 16px',
                                cursor: creating ? 'wait' : 'pointer',
                                fontFamily: 'inherit',
                                fontSize: 13,
                            }}
                        >
                            {creating ? 'Creating…' : 'Create'}
                        </button>
                        <button
                            onClick={() => { setOpen(false); setTitle(''); setSlug(''); setError(null); }}
                            className="tag-chip"
                            style={{ cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
