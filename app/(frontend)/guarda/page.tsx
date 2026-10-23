import {WatchCMSPage} from '@/components/watch/WatchCMSPage';
import './watch.css';
export const dynamic='force-dynamic';
export default async function WatchPage({searchParams}:{searchParams:Promise<{contenuto?:string}>}){const params=await searchParams;return <WatchCMSPage path="/guarda" selectedSlug={typeof params.contenuto==='string'?params.contenuto:undefined}/>;}
