import { notFound } from 'next/navigation';
import { WirePageView } from '@/components/wireframe';
import { pageByPath } from '@/lib/wireframe';

export default async function WireframePage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const page = pageByPath.get(`/${slug.join('/')}`);
  if (!page) notFound();
  return <WirePageView page={page} />;
}
