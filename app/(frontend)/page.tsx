import { WirePageView } from '@/components/wireframe';
import { getCMSPage } from '@/lib/cms';
export const dynamic = 'error';
export const revalidate = false;
export default async function HomePage() { return <WirePageView page={(await getCMSPage('/'))!} />; }
