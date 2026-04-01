'use client';

import { useRef, useState } from 'react';
import type { Module } from '../../lib/mdxModules';
import { toEmbedUrl } from './VideoEmbed';

type Props = {
    module: Module;
    index: number;
    total: number;
    onChange: (m: Module) => void;
    onRemove: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
};

const blockStyle: React.CSSProperties = {
    border: '1px solid #000',
    background: 'var(--panel, #f7f2e6)',
    marginBottom: 8,
};

const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 10px',
    borderBottom: '1px solid #ccc',
    background: 'rgba(0,0,0,0.04)',
};

const fieldStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #ccc',
    background: '#fff',
    padding: '6px 8px',
    fontFamily: 'inherit',
    fontSize: 14,
    color: 'var(--text, #222)',
    boxSizing: 'border-box',
};

const controlBtn: React.CSSProperties = {
    background: 'none',
    border: '1px solid #ccc',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 12,
    padding: '2px 7px',
    lineHeight: 1.5,
};

export default function ModuleBlock({ module, index, total, onChange, onRemove, onMoveUp, onMoveDown }: Props) {
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [localPreview, setLocalPreview] = useState<string | null>(null);

    const typeLabel = module.type === 'text' ? 'TEXT' : module.type === 'image' ? 'IMAGE' : 'VIDEO';

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        // Show local preview immediately
        setLocalPreview(URL.createObjectURL(file));
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('filename', file.name);
            const res = await fetch('/api/images/upload', { method: 'POST', body: formData });
            if (res.ok) {
                const { path } = await res.json();
                onChange({ ...module, src: path } as typeof module);
                setLocalPreview(null);
            } else {
                alert('Image upload failed.');
            }
        } finally {
            setUploading(false);
        }
    }

    return (
        <div style={blockStyle}>
            <div style={headerStyle}>
                <span style={{ fontSize: 11, letterSpacing: 1, color: 'var(--muted)', flex: 1 }}>{typeLabel}</span>
                <button style={controlBtn} disabled={index === 0} onClick={onMoveUp} title="Move up">↑</button>
                <button style={controlBtn} disabled={index === total - 1} onClick={onMoveDown} title="Move down">↓</button>
                <button style={{ ...controlBtn, color: '#c00', borderColor: '#c00' }} onClick={onRemove} title="Remove">×</button>
            </div>

            <div style={{ padding: 10 }}>
                {module.type === 'text' && (
                    <textarea
                        style={{ ...fieldStyle, minHeight: 120, resize: 'vertical' }}
                        value={module.content}
                        onChange={(e) => onChange({ type: 'text', content: e.target.value })}
                        placeholder="Write markdown here…"
                    />
                )}

                {module.type === 'image' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {(localPreview || module.src) && (
                            <img
                                src={localPreview ?? module.src}
                                alt={module.alt}
                                style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain', border: '1px solid #ccc' }}
                            />
                        )}
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                style={{ ...fieldStyle, flex: 1 }}
                                placeholder="/images/photo.png"
                                value={module.src}
                                onChange={(e) => onChange({ ...module, src: e.target.value })}
                            />
                            <button
                                onClick={() => fileRef.current?.click()}
                                disabled={uploading}
                                className="tag-chip"
                                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                            >
                                {uploading ? 'Uploading…' : 'Upload'}
                            </button>
                            <input
                                ref={fileRef}
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                onChange={handleImageUpload}
                            />
                        </div>
                        <input
                            style={fieldStyle}
                            placeholder="Alt text"
                            value={module.alt}
                            onChange={(e) => onChange({ ...module, alt: e.target.value })}
                        />
                    </div>
                )}

                {module.type === 'video' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <input
                            style={fieldStyle}
                            placeholder="https://www.youtube.com/watch?v=…"
                            value={module.url}
                            onChange={(e) => onChange({ type: 'video', url: e.target.value })}
                        />
                        {module.url && toEmbedUrl(module.url) && (
                            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                                Embed: {toEmbedUrl(module.url)}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
