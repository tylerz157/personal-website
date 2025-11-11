import { getAllCurations } from '../../lib/curations';
import CurationBrowser from '../../components/CurationBrowser';

export const dynamic = 'force-static';

export default async function CurationsPage() {
  const items = await getAllCurations();
  return (
    <>
      <section style={{ margin: '28px 0 22px' }}>
        <h1>Curations</h1>
        <p style={{ color: 'var(--muted)', margin: '6px 0 0 0' }}>
          Carefully selected products. Add new items by dropping an MDX file into <code>content/curations</code>.
        </p>
      </section>
      <CurationBrowser items={items} />
    </>
  );
}
