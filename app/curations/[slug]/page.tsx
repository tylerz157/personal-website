import { notFound } from 'next/navigation';
import { getCurationBySlug, getCurationSlugs } from '../../../lib/curations';
import MDXContent from '../../../components/MDXContent';

export async function generateStaticParams() {
  const slugs = await getCurationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function CurationDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  try {
    const { meta, content } = await getCurationBySlug(slug);
    return (
      <article>
        <header style={{ margin: '28px 0 16px' }}>
          <h1>{meta.title}</h1>
          {meta.description ? (
            <p style={{ color: 'var(--muted)', margin: 0 }}>{meta.description}</p>
          ) : null}
          {meta.coverImage ? (
            <div style={{ marginTop: 16, overflow: 'hidden', border: '1px solid #000', borderRadius: 0, boxShadow: '10px 10px 0 #000', lineHeight: 0 }}>
              <img src={meta.coverImage} alt={meta.coverAlt ?? `${meta.title} image`} style={{ display: 'block', width: '100%', height: 'auto' }} />
            </div>
          ) : null}
          {(meta.url || (meta.links && meta.links.length) || (meta.files && meta.files.length)) ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              {meta.url ? (
                <a href={meta.url} target="_blank" rel="noreferrer" className="tag-chip">Visit</a>
              ) : null}
              {meta.links?.map((l, i) => (
                <a key={`link-${i}`} href={l.href} target="_blank" rel="noreferrer" className="tag-chip">{l.label}</a>
              ))}
              {meta.files?.map((f, i) => (
                <a key={`file-${i}`} href={f.href} target="_blank" rel="noreferrer" className="tag-chip">{f.label ?? 'Download'}</a>
              ))}
            </div>
          ) : null}
        </header>
        <MDXContent source={content} />
      </article>
    );
  } catch {
    notFound();
  }
}
