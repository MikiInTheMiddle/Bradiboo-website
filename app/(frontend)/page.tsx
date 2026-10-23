import { WirePageView } from '@/components/wireframe';
import { getCMSPage } from '@/lib/cms';
export const dynamic = 'force-dynamic';
export default async function HomePage() { return <WirePageView page={(await getCMSPage('/'))!} />; }
