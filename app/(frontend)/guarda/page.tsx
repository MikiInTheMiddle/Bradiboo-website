import {WatchCMSPage} from '@/components/watch/WatchCMSPage';
import './watch.css';
export const dynamic='error';
export const revalidate=false;
export default function WatchPage(){return <WatchCMSPage path="/guarda"/>;}
