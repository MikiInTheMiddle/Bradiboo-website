import {unstable_cache} from 'next/cache';
import {PUBLIC_CONTENT_TAG} from './public-cache-tags';
export {PUBLIC_CONTENT_TAG} from './public-cache-tags';

type Policy={tags?:string[];revalidate?:number|false};
/** Anonymous published DTOs only. Cache until a CMS event, not every minute.
 * Failed refreshes retain the last snapshot; cold failures are never cached.
 * Admin, media authorization and preview must never use a shared snapshot.
 */
export function publicRead<Args extends unknown[],Result>(key:string,load:(...args:Args)=>Promise<Result>,revalidate:number|false=false,policy?:(...args:Args)=>Policy){
 const pending=new Map<string,Promise<Result>>();
 const singleFlight=(...args:Args)=>{
  const id=JSON.stringify(args);const existing=pending.get(id);if(existing)return existing;
  const value=load(...args).finally(()=>{if(pending.get(id)===value)pending.delete(id);});
  pending.set(id,value);return value;
 };
 return (...args:Args)=>{
  if(process.env.NODE_ENV==='production'&&process.env.WIREFRAME_PREVIEW==='true')throw new Error('Draft preview must not be built or cached as a public site.');
  if(process.env.WIREFRAME_PREVIEW==='true'||process.env.NODE_ENV!=='production')return load(...args);
  const options=policy?.(...args);
  return unstable_cache(singleFlight,['bradiboo-public-v2',process.env.VERCEL_ENV||'local',key],{
   revalidate:options?.revalidate??revalidate,tags:[PUBLIC_CONTENT_TAG,...options?.tags||[]],
  })(...args);
 };
}
