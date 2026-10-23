import 'server-only';
import {normalizeActivities} from './braditime-model';
export {normalizeActivities} from './braditime-model';
export type {BraditimeCard} from './braditime-model';
export async function getBraditime(options: { locale: string; limit: number; character?: string; characters?: string[]; selectedIDs?: string[]; themes?:string[]; keywords?:string[] }) {
 try {
  const base = process.env.BRADITIME_API_BASE;
  const destination = process.env.BRADITIME_ACTIVITY_BASE;
  if (!base || !destination) return { items: [], message: 'Integrazione Braditime non configurata.' };
  const response = await fetch(new URL('wp-json/bradicore/v1/activity/all', base.endsWith('/') ? base : base + '/'), { next: { revalidate: 300, tags: ['braditime'] }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error('API non disponibile');
  const items = normalizeActivities(await response.json(), { ...options, destination });
  return { items, message: items.length ? undefined : 'Nessuna attività associata disponibile.' };
 } catch { return { items: [], message: 'Braditime temporaneamente non disponibile.' }; }
}
