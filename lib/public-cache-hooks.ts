import {revalidateTag} from 'next/cache';
import {after} from 'next/server';
import type {CollectionConfig,GlobalConfig} from 'payload';
const tag='bradiboo-public-content-v1';
/** Hard-expire on every editorial mutation, including unpublish/delete. Never
 * serve the old published version after a successful invalidation. */
export function invalidatePublicContent({doc}:any){
 // CLI migrations do not have a Next request/cache context.
 if(process.env.NEXT_RUNTIME){
  revalidateTag(tag,{expire:0});
  // Payload afterChange runs before its transaction commits. Expire again after
  // the response so a concurrent read cannot retain the pre-commit version.
  after(()=>revalidateTag(tag,{expire:0}));
 }
 return doc;
}
const publicCollections=new Set(['pages','contents','characters','production-containers','media','watch-terms']);
export function withPublicCollectionCache(configs:CollectionConfig[]):CollectionConfig[]{return configs.map(c=>!publicCollections.has(c.slug)?c:{...c,hooks:{...c.hooks,afterChange:[...(c.hooks?.afterChange||[]),invalidatePublicContent],afterDelete:[...(c.hooks?.afterDelete||[]),invalidatePublicContent]}});}
export function withPublicGlobalCache(configs:GlobalConfig[]):GlobalConfig[]{return configs.map(g=>({...g,hooks:{...g.hooks,afterChange:[...(g.hooks?.afterChange||[]),invalidatePublicContent]}}));}
