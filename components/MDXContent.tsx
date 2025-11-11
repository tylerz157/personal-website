import { MDXRemote } from 'next-mdx-remote/rsc';
import React from 'react';
import { ensureLocalImage, isRemoteUrl } from '../lib/imageCache';

const components = {
    img: async (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
        const { src = '', alt = '', ...rest } = props;
        const frameStyle: React.CSSProperties = {
            marginTop: 16,
            overflow: 'hidden',
            border: '1px solid #000',
            borderRadius: 0,
            boxShadow: '10px 10px 0 #000',
            lineHeight: 0,
        };
        let resolvedSrc = src as string;
        if (typeof src === 'string' && isRemoteUrl(src)) {
            try {
                resolvedSrc = await ensureLocalImage(src);
            } catch {}
        }
        return (
            <span style={{ ...frameStyle, display: 'block' }}>
                <img {...rest} src={resolvedSrc} alt={alt} style={{ display: 'block', width: '100%', height: 'auto', margin: 0 }} />
            </span>
        );
    },
} as const;

export default function MDXContent({ source }: { source: string }) {
    return (
        <div className="prose">
            <MDXRemote source={source} components={components} />
        </div>
    );
}
