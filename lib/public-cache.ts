import {unstable_cache} from 'next/cache';

export const PUBLIC_CONTENT_TAG='bradiboo-public-content-v1';
/** Only anonymous, published DTOs belong here. Never wrap media authorization,
 * admin reads, cookies or authenticated requests. Failed refreshes retain the
 * last successful snapshot; failed cold reads are never cached as empty data.
 */
export function publicRead<Args extends unknown[],Result>(key:string,load:(...args:Args)=>Promise<Result>,revalidate=60){
 const pending=new Map<string,Promise<Result>>();
 const singleFlight=(...args:Args)=>{
  const id=JSON.stringify(args);const existing=pending.get(id);if(existing)return existing;
  const value=load(...args).finally(()=>{if(pending.get(id)===value)pending.delete(id);});
  pending.set(id,value);return value;
 };
 const read=unstable_cache(singleFlight,['bradiboo-public-v1',process.env.VERCEL_ENV||'local',key],{revalidate,tags:[PUBLIC_CONTENT_TAG]});
 return (...args:Args)=>process.env.WIREFRAME_PREVIEW==='true'||process.env.NODE_ENV!=='production'?load(...args):read(...args);
}
