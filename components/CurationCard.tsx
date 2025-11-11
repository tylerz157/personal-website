import Image from 'next/image';
import Link from 'next/link';
import type { CurationMeta } from '../lib/curations';

export default function CurationCard({ item, index }: { item: CurationMeta; index: number }) {
  const cover = item.coverImage ?? 'https://via.placeholder.com/900x600?text=Item';
  const alt = item.coverAlt ?? `${item.title} image`;

  return (
    <Link href={`/curations/${item.slug}`} className="project-link" aria-label={item.title}>
      <article className="curation-card">
        <div className="curation-inner">
          <div className="curation-cover">
            <Image
              src={cover}
              alt={alt}
              fill
              sizes="(max-width: 800px) 100vw, 480px"
              style={{ objectFit: 'contain' }}
              priority={index < 6}
            />
          </div>
          <div className="curation-content">
            <div className="curation-title-row">
              <h2 style={{ margin: 0 }}>{item.title}</h2>
              {item.badge ? (
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{item.badge}</span>
              ) : null}
            </div>
            {item.description ? <p>{item.description}</p> : null}
            <div className="project-meta">
              {item.price ? <span style={{ marginRight: 8 }}>{item.price}</span> : null}
              {item.tags && item.tags.length ? item.tags.join(', ') : null}
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
