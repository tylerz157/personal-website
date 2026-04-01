'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ProjectFrontmatter } from '../../../../lib/projects';
import type { Module } from '../../../../lib/mdxModules';
import FrontmatterEditor from '../../../../components/editor/FrontmatterEditor';
import ModuleEditor from '../../../../components/editor/ModuleEditor';

type Props = {
    slug: string;
    initialMeta: ProjectFrontmatter;
    initialModules: Module[];
};

export default function EditPageClient({ slug, initialMeta, initialModules }: Props) {
    const router = useRouter();
    const [meta, setMeta] = useState<ProjectFrontmatter>(initialMeta);
    const [modules, setModules] = useState<Module[]>(initialModules);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    async function handleSave() {
        setSaving(true);
        setError(null);
        setSaved(false);
        try {
            const res = await fetch('/api/projects/save', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug, frontmatter: meta, modules }),
            });
            if (!res.ok) {
                const data = await res.json();
                if (data.error === 'conflict') {
                    setError('The file was modified externally. Please reload and try again.');
                } else {
                    setError(data.error ?? 'Save failed');
                }
            } else {
                setSaved(true);
            }
        } catch {
            setError('Network error. Try again.');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div style={{ paddingBottom: 80 }}>
            {/* Header bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                margin: '28px 0 24px',
                flexWrap: 'wrap',
            }}>
                <button
                    onClick={() => router.push(`/projects/${slug}`)}
                    className="tag-chip"
                    style={{ cursor: 'pointer' }}
                >
                    ← Back
                </button>
                <span style={{ flex: 1, color: 'var(--muted)', fontSize: 14 }}>
                    Editing: <strong>{meta.title || slug}</strong>
                </span>
                {error && (
                    <span style={{ color: '#c00', fontSize: 13 }}>{error}</span>
                )}
                {saved && !error && (
                    <span style={{ color: '#080', fontSize: 13 }}>Saved — deploying…</span>
                )}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        background: '#000',
                        color: '#fff',
                        border: '1px solid #000',
                        padding: '0 20px',
                        height: 'var(--control-h)',
                        cursor: saving ? 'wait' : 'pointer',
                        fontSize: 14,
                        fontFamily: 'inherit',
                        letterSpacing: 1,
                    }}
                >
                    {saving ? 'Saving…' : 'SAVE'}
                </button>
            </div>

            {/* Cover / frontmatter editor */}
            <section style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Cover Info</h2>
                <FrontmatterEditor meta={meta} onChange={setMeta} slug={slug} />
            </section>

            {/* Module editor */}
            <section>
                <h2 style={{ fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>Content</h2>
                <ModuleEditor modules={modules} onChange={setModules} />
            </section>
        </div>
    );
}
