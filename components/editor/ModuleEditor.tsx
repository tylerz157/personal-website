'use client';

import type { Module } from '../../lib/mdxModules';
import ModuleBlock from './ModuleBlock';

type Props = {
    modules: Module[];
    onChange: (modules: Module[]) => void;
};

const addBtnStyle: React.CSSProperties = {
    background: 'none',
    border: '1px solid #ccc',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 12,
    padding: '4px 10px',
    marginRight: 6,
    color: 'var(--muted)',
};

function AddModuleRow({ onAdd }: { onAdd: (type: Module['type']) => void }) {
    return (
        <div style={{ margin: '4px 0 8px', display: 'flex', alignItems: 'center', gap: 0 }}>
            <span style={{ fontSize: 11, color: 'var(--muted)', marginRight: 8 }}>+ Add:</span>
            <button style={addBtnStyle} onClick={() => onAdd('text')}>Text</button>
            <button style={addBtnStyle} onClick={() => onAdd('image')}>Image</button>
            <button style={addBtnStyle} onClick={() => onAdd('video')}>Video</button>
        </div>
    );
}

function emptyModule(type: Module['type']): Module {
    if (type === 'text') return { type: 'text', content: '' };
    if (type === 'image') return { type: 'image', src: '', alt: '' };
    return { type: 'video', url: '' };
}

export default function ModuleEditor({ modules, onChange }: Props) {
    function updateModule(index: number, m: Module) {
        const next = [...modules];
        next[index] = m;
        onChange(next);
    }

    function removeModule(index: number) {
        onChange(modules.filter((_, i) => i !== index));
    }

    function moveUp(index: number) {
        if (index === 0) return;
        const next = [...modules];
        [next[index - 1], next[index]] = [next[index], next[index - 1]];
        onChange(next);
    }

    function moveDown(index: number) {
        if (index === modules.length - 1) return;
        const next = [...modules];
        [next[index], next[index + 1]] = [next[index + 1], next[index]];
        onChange(next);
    }

    function insertAfter(index: number, type: Module['type']) {
        const next = [...modules];
        next.splice(index + 1, 0, emptyModule(type));
        onChange(next);
    }

    function addAtEnd(type: Module['type']) {
        onChange([...modules, emptyModule(type)]);
    }

    if (modules.length === 0) {
        return <AddModuleRow onAdd={addAtEnd} />;
    }

    return (
        <div>
            {modules.map((m, i) => (
                <div key={i}>
                    <ModuleBlock
                        module={m}
                        index={i}
                        total={modules.length}
                        onChange={(updated) => updateModule(i, updated)}
                        onRemove={() => removeModule(i)}
                        onMoveUp={() => moveUp(i)}
                        onMoveDown={() => moveDown(i)}
                    />
                    <AddModuleRow onAdd={(type) => insertAfter(i, type)} />
                </div>
            ))}
        </div>
    );
}
