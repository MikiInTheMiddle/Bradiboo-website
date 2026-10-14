import { WirePageView } from '@/components/wireframe';
import { pageByPath } from '@/lib/wireframe';

export default function HomePage() {
  return <WirePageView page={pageByPath.get('/')!} />;
}
