import { MDXRemote } from 'next-mdx-remote/rsc';
import React from 'react';
import VideoEmbed from './editor/VideoEmbed';
const components = {
    VideoEmbed,
    img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
        const { src = '', alt = '', ...rest } = props;
        const frameStyle: React.CSSProperties = {
            marginTop: 16,
            overflow: 'hidden',
            border: '1px solid #000',
            borderRadius: 0,
            lineHeight: 0,
        };
        return (
            <span className="shadow-3d" style={{ ...frameStyle, display: 'block' }}>
                <img {...rest} src={src} alt={alt} style={{ display: 'block', width: '100%', height: 'auto', margin: 0 }} />
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
