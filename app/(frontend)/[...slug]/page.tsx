import { notFound, redirect } from 'next/navigation';
import { WirePageView } from '@/components/wireframe';
import { getCMSPage, getStaticPagePaths } from '@/lib/cms';
export const dynamic = 'error';
export const revalidate = false;

export const dynamicParams = true;
export async function generateStaticParams(){return (await getStaticPagePaths()).map(path=>({slug:path.slice(1).split('/')}));}

export default async function WireframePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = await getCMSPage(`/${slug.join('/')}`);
  if (!page) notFound();
  if(page.redirectTo)redirect(page.redirectTo);
  return <WirePageView page={page} />;
}
