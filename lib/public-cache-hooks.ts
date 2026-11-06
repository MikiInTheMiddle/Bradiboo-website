import {invalidateBranchPublication} from './branch-publication';
import {revalidateTag,revalidatePath} from 'next/cache';
import {after} from 'next/server';
import type {CollectionConfig,GlobalConfig} from 'payload';
import {withdrawsPublicContent,skipsPublicInvalidation,changesPublicHierarchy,changesPublicNavigation} from './public-cache-policy';
import {PUBLIC_CONTENT_TAG,PUBLIC_HIERARCHY_TAG,PUBLIC_NAVIGATION_GROUPS_TAG,collectionTag,globalTag,pageTag} from './public-cache-tags';

function expire(tags:string[],hard:boolean,paths:string[]=[],req?:any){
 // CLI migrations do not have a Next request/cache context.
 if(!process.env.NEXT_RUNTIME)return;
 const refresh=()=>{
  if(req?.payload)invalidateBranchPublication({req});
  for(const tag of new Set(tags))revalidateTag(tag,hard?{expire:0}:'max');
  if(hard)for(const path of new Set(paths))revalidatePath(path);
 };
 refresh();
 // Payload hooks precede the transaction commit. Repeat after the response,
 // preventing a concurrent pre-commit read from keeping an old copy fresh.
 after(refresh);
}
export function invalidatePublicContent(args:any){
 const {doc,previousDoc,deleted=false}=args;
 if(skipsPublicInvalidation(args))return doc;
 const slug=args.collection?.slug||args.collectionSlug;
 const global=args.global?.slug||args.globalSlug;
 if(slug==='media'&&args.operation==='create')return doc; // A new, unreferenced upload changes no public page.
 const tags=slug?[collectionTag(slug)]:global?[globalTag(global)]:[PUBLIC_CONTENT_TAG];
 const paths:string[]=slug==='pages'?[doc?.path,previousDoc?.path].filter((path):path is string=>typeof path==='string'&&path.startsWith('/')&&!path.startsWith('//')):[];
 tags.push(...paths.map(pageTag));
 if(changesPublicHierarchy(slug,doc,previousDoc)||(deleted||doc?._status==='draft')&&['contents','production-containers'].includes(slug))tags.push(PUBLIC_HIERARCHY_TAG);
 if(changesPublicNavigation(slug,doc,previousDoc)||deleted&&['characters','contents','production-containers'].includes(slug))tags.push(PUBLIC_NAVIGATION_GROUPS_TAG);
 const hard=deleted||doc?._status==='draft'||withdrawsPublicContent(doc,previousDoc);
 // Withdrawals also revoke legacy deployment snapshots and indirect references.
 // Ordinary content edits remain targeted and retain the last good version.
 if(hard)tags.push(PUBLIC_CONTENT_TAG);
 expire(tags,hard,paths,args.req);
 return doc;
}
export function removePublicContent(args:any){return invalidatePublicContent({...args,deleted:true});}
const publicCollections=new Set(['pages','contents','characters','production-containers','media','watch-terms']);
export function withPublicCollectionCache(configs:CollectionConfig[]):CollectionConfig[]{return configs.map(c=>!publicCollections.has(c.slug)?c:{...c,hooks:{...c.hooks,afterChange:[...(c.hooks?.afterChange||[]),(args)=>invalidatePublicContent({...args,collectionSlug:c.slug})],afterDelete:[...(c.hooks?.afterDelete||[]),(args)=>removePublicContent({...args,collectionSlug:c.slug})]}});}
export function withPublicGlobalCache(configs:GlobalConfig[]):GlobalConfig[]{return configs.map(g=>({...g,hooks:{...g.hooks,afterChange:[...(g.hooks?.afterChange||[]),(args)=>invalidatePublicContent({...args,globalSlug:g.slug})]}}));}
