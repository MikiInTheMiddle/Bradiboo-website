import Link from 'next/link';
import { WireShell } from '@/components/wireframe';
import { getCMSPages } from '@/lib/cms';
export const dynamic = 'force-dynamic';

export default async function SitemapPage() {
  const pages = await getCMSPages();
  const grouped = pages.reduce<Record<string, typeof pages>>((result, page) => {
    (result[page.group] ??= []).push(page); return result;
  }, {});
  return <WireShell currentPath="/mappa-sito"><main className="wf-main">
    <div className="wf-page-meta"><div><span>STRUCTURE VIEW</span><h1>Mappa del sito</h1></div><div><span>SCOPE</span><p>Tutte le pagine incluse nel prototipo navigabile.</p></div></div>
    <section className="wf-sitemap">{Object.entries(grouped).map(([group, groupPages]) => <div className="wf-sitemap-group" key={group}><h2>{group}</h2>{groupPages.map(page => <Link href={page.path} key={page.path}><strong>{page.title}{page.status === 'draft' ? ' · DRAFT' : ''}</strong><code>{page.path}</code><small>{page.purpose}</small></Link>)}</div>)}</section>
  </main></WireShell>;
}
