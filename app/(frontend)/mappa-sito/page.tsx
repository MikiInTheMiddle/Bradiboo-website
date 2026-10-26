import Link from '@/components/site-link';
import { WireShell } from '@/components/wireframe';
import { getCMSPages } from '@/lib/cms';
export const dynamic = 'force-dynamic';

export default async function SitemapPage() {
  const pages = (await getCMSPages()).filter(page=>page.status!=='draft');
  const grouped = pages.reduce<Record<string, typeof pages>>((result, page) => {
    (result[page.group] ??= []).push(page); return result;
  }, {});
  return <WireShell currentPath="/mappa-sito"><main className="wf-main">
    <h1>Mappa del sito</h1>
    <section className="wf-sitemap">{Object.entries(grouped).map(([group, groupPages]) => <div className="wf-sitemap-group" key={group}><h2>{group}</h2>{groupPages.map(page => <Link href={page.path} key={page.path}><strong>{page.title}</strong><code>{page.path}</code></Link>)}</div>)}</section>
  </main></WireShell>;
}
