import { notFound, redirect } from 'next/navigation';
import { WirePageView } from '@/components/wireframe';
import { getCMSPage } from '@/lib/cms';
export const dynamic = 'force-dynamic';

export default async function WireframePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = await getCMSPage(`/${slug.join('/')}`);
  if (!page) notFound();
  if(page.redirectTo)redirect(page.redirectTo);
  return <WirePageView page={page} />;
}
