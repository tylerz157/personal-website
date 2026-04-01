'use client';

import { useState, useRef } from 'react';
import type { ProjectFrontmatter, ProjectLink, ProjectFile } from '../../lib/projects';

type Props = {
    meta: ProjectFrontmatter;
    onChange: (meta: ProjectFrontmatter) => void;
    slug: string;
};

const fieldStyle: React.CSSProperties = {
    width: '100%',
    border: '1px solid #000',
    background: 'var(--panel, #f7f2e6)',
    padding: '8px 10px',
    fontFamily: 'inherit',
    fontSize: 14,
    color: 'var(--text, #222)',
    boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: 'var(--muted)',
    marginBottom: 4,
};

const rowStyle: React.CSSProperties = {
    marginBottom: 16,
};

export default function FrontmatterEditor({ meta, onChange, slug }: Props) {
    const [tagInput, setTagInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function update(field: keyof ProjectFrontmatter, value: unknown) {
        onChange({ ...meta, [field]: value });
    }

    function addTag(raw: string) {
        const tag = raw.trim().toLowerCase();
        if (!tag) return;
        const existing = meta.tags ?? [];
        if (!existing.includes(tag)) {
            update('tags', [...existing, tag]);
        }
        setTagInput('');
    }

    function removeTag(tag: string) {
        update('tags', (meta.tags ?? []).filter((t) => t !== tag));
    }

    function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(tagInput);
        } else if (e.key === 'Backspace' && tagInput === '' && meta.tags?.length) {
            removeTag(meta.tags[meta.tags.length - 1]);
        }
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('filename', file.name);
            const res = await fetch('/api/images/upload', { method: 'POST', body: formData });
            if (res.ok) {
                const { path } = await res.json();
                update('coverImage', path);
            } else {
                alert('Image upload failed.');
            }
        } finally {
            setUploading(false);
        }
    }

    function updateLink(index: number, field: keyof ProjectLink, value: string) {
        const links = [...(meta.links ?? [])];
        links[index] = { ...links[index], [field]: value };
        update('links', links);
    }

    function addLink() {
        update('links', [...(meta.links ?? []), { label: '', href: '' }]);
    }

    function removeLink(index: number) {
        update('links', (meta.links ?? []).filter((_, i) => i !== index));
    }

    function updateFile(index: number, field: keyof ProjectFile, value: string) {
        const files = [...(meta.files ?? [])];
        files[index] = { ...files[index], [field]: value };
        update('files', files);
    }

    function addFile() {
        update('files', [...(meta.files ?? []), { label: '', href: '' }]);
    }

    function removeFile(index: number) {
        update('files', (meta.files ?? []).filter((_, i) => i !== index));
    }

    return (
        <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div style={rowStyle}>
                    <label style={labelStyle}>Title</label>
                    <input
                        style={fieldStyle}
                        value={meta.title ?? ''}
                        onChange={(e) => update('title', e.target.value)}
                    />
                </div>
                <div style={rowStyle}>
                    <label style={labelStyle}>Description</label>
                    <input
                        style={fieldStyle}
                        value={meta.description ?? ''}
                        onChange={(e) => update('description', e.target.value)}
                    />
                </div>
                <div style={rowStyle}>
                    <label style={labelStyle}>Start Date</label>
                    <input
                        style={fieldStyle}
                        placeholder="2024-09-15"
                        value={meta.date ?? ''}
                        onChange={(e) => update('date', e.target.value)}
                    />
                </div>
                <div style={rowStyle}>
                    <label style={labelStyle}>End Date</label>
                    <input
                        style={fieldStyle}
                        placeholder="2024-12-01 or present"
                        value={meta.endDate ?? ''}
                        onChange={(e) => update('endDate', e.target.value)}
                    />
                </div>
            </div>

            {/* Tags */}
            <div style={rowStyle}>
                <label style={labelStyle}>Tags</label>
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 6,
                    border: '1px solid #000',
                    padding: 6,
                    background: 'var(--panel, #f7f2e6)',
                    minHeight: 40,
                }}>
                    {(meta.tags ?? []).map((tag) => (
                        <span key={tag} className="tag-chip active" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {tag}
                            <button
                                onClick={() => removeTag(tag)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, lineHeight: 1, color: 'inherit' }}
                                title="Remove tag"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    <input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagKeyDown}
                        onBlur={() => addTag(tagInput)}
                        placeholder="Add tag…"
                        style={{
                            border: 'none',
                            background: 'transparent',
                            fontFamily: 'inherit',
                            fontSize: 13,
                            outline: 'none',
                            minWidth: 80,
                            flex: 1,
                        }}
                    />
                </div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>Press Enter or comma to add</span>
            </div>

            {/* Cover image */}
            <div style={rowStyle}>
                <label style={labelStyle}>Cover Image</label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input
                        style={{ ...fieldStyle, flex: 1 }}
                        placeholder="/images/myprojectCover.png"
                        value={meta.coverImage ?? ''}
                        onChange={(e) => update('coverImage', e.target.value)}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="tag-chip"
                        style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
                    >
                        {uploading ? 'Uploading…' : 'Upload file'}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                    />
                </div>
            </div>

            <div style={rowStyle}>
                <label style={labelStyle}>Cover Alt Text</label>
                <input
                    style={fieldStyle}
                    value={meta.coverAlt ?? ''}
                    onChange={(e) => update('coverAlt', e.target.value)}
                />
            </div>

            <div style={rowStyle}>
                <label style={labelStyle}>Primary URL (Visit button)</label>
                <input
                    style={fieldStyle}
                    placeholder="https://…"
                    value={meta.url ?? ''}
                    onChange={(e) => update('url', e.target.value)}
                />
            </div>

            {/* Links */}
            <div style={rowStyle}>
                <label style={labelStyle}>Additional Links</label>
                {(meta.links ?? []).map((link, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <input
                            style={{ ...fieldStyle, flex: 1 }}
                            placeholder="Label"
                            value={link.label}
                            onChange={(e) => updateLink(i, 'label', e.target.value)}
                        />
                        <input
                            style={{ ...fieldStyle, flex: 2 }}
                            placeholder="https://…"
                            value={link.href}
                            onChange={(e) => updateLink(i, 'href', e.target.value)}
                        />
                        <button
                            onClick={() => removeLink(i)}
                            className="tag-chip"
                            style={{ cursor: 'pointer' }}
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button onClick={addLink} className="tag-chip" style={{ cursor: 'pointer' }}>
                    + Add link
                </button>
            </div>

            {/* Files */}
            <div style={rowStyle}>
                <label style={labelStyle}>Downloadable Files</label>
                {(meta.files ?? []).map((file, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <input
                            style={{ ...fieldStyle, flex: 1 }}
                            placeholder="Label (optional)"
                            value={file.label ?? ''}
                            onChange={(e) => updateFile(i, 'label', e.target.value)}
                        />
                        <input
                            style={{ ...fieldStyle, flex: 2 }}
                            placeholder="https://…"
                            value={file.href}
                            onChange={(e) => updateFile(i, 'href', e.target.value)}
                        />
                        <button
                            onClick={() => removeFile(i)}
                            className="tag-chip"
                            style={{ cursor: 'pointer' }}
                        >
                            ×
                        </button>
                    </div>
                ))}
                <button onClick={addFile} className="tag-chip" style={{ cursor: 'pointer' }}>
                    + Add file
                </button>
            </div>
        </div>
    );
}
