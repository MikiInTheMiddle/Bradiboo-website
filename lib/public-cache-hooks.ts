import {revalidateTag} from 'next/cache';
import {after} from 'next/server';
import type {CollectionConfig,GlobalConfig} from 'payload';
import {withdrawsPublicContent} from './public-cache-policy';
const tag='bradiboo-public-content-v1';
function expire(hard:boolean){
 // CLI migrations do not have a Next request/cache context.
 if(!process.env.NEXT_RUNTIME)return;
 const refresh=()=>revalidateTag(tag,hard?{expire:0}:'max');
 refresh();
 // Payload hooks run before transaction commit. Repeat after the response so
 // a concurrent pre-commit read cannot make the cache fresh with old content.
 after(refresh);
}
export function invalidatePublicContent({doc,previousDoc}:any){expire(withdrawsPublicContent(doc,previousDoc));return doc;}
export function removePublicContent({doc}:any){expire(true);return doc;}
const publicCollections=new Set(['pages','contents','characters','production-containers','media','watch-terms']);
export function withPublicCollectionCache(configs:CollectionConfig[]):CollectionConfig[]{return configs.map(c=>!publicCollections.has(c.slug)?c:{...c,hooks:{...c.hooks,afterChange:[...(c.hooks?.afterChange||[]),invalidatePublicContent],afterDelete:[...(c.hooks?.afterDelete||[]),removePublicContent]}});}
export function withPublicGlobalCache(configs:GlobalConfig[]):GlobalConfig[]{return configs.map(g=>({...g,hooks:{...g.hooks,afterChange:[...(g.hooks?.afterChange||[]),invalidatePublicContent]}}));}
