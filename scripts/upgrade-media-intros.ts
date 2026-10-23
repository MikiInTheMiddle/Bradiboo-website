import fs from 'node:fs';
import path from 'node:path';
import { getPayload } from 'payload';
import config from '../payload.config';
import source from '../lib/media-deck.json';
import type { Page } from '../payload-types';
const payload=await getPayload({config});
const covers=new Map<string,number>();
for(const slug of ['serie','miniserie','format','arte','fitness','focus','natura','scienza','cultura']){
 const filename=`deck-2026-${slug}.png`;
 const found=await payload.find({collection:'media',where:{filename:{equals:filename}},limit:1});
 if(found.docs[0]){covers.set(slug,found.docs[0].id);continue;}
 const input=path.resolve(`work/deck-media/${slug}.png`);const output=path.resolve(`work/deck-media/${filename}`);
 fs.copyFileSync(input,output);
 const media=await payload.create({collection:'media',data:{alt:`${slug} — illustration extraite du deck Bradiboo 2026`.replace('illustration extraite du','illustrazione estratta dal')},filePath:output});covers.set(slug,media.id);
}
const cast=await payload.find({collection:'characters',limit:100,depth:0});
for(const product of source.products){
 const existing=await payload.find({collection:'contents',where:{slug:{equals:product.slug}},limit:1,depth:0});
 const host='host' in product?cast.docs.find(c=>c.slug===product.host):undefined;
 const data={title:product.title,slug:product.slug,kind:product.kind as 'serie'|'miniserie'|'format',url:product.url,description:product.description,cover:covers.get(product.image),...(host?{characters:[host.id]}:{})};
 if(existing.docs[0])await payload.update({collection:'contents',id:existing.docs[0].id,data});
 else await payload.create({collection:'contents',data:{...data,_status:'published'}});
}
const enrich=(item:{href?:string|null;label?:string|null;[key:string]:unknown})=>{
 const product=source.products.find(p=>p.url===item.href);
 const cluster=source.clusters.find(c=>`/guarda/${c.slug}`===item.href);
 const entry=product||cluster;if(!entry)return item;
 return {...item,label:entry.title,description:entry.description,image:item.image||covers.get(product?product.image:cluster!.slug),...('badge' in entry?{badge:entry.badge}:{})};
};
const pages=await payload.find({collection:'pages',limit:100,depth:0});
for(const page of pages.docs){
 const cluster=source.clusters.find(c=>`/guarda/${c.slug}`===page.path);
 const product=source.products.find(p=>p.url===page.path);
 const hub=page.path==='/guarda';
 let changed=false;
 const blocks=(page.blocks||[]).map(block=>{
  let b={...block};
  if('items' in b&&b.items?.length){const next=b.items.map(i=>enrich(i));if(JSON.stringify(next)!==JSON.stringify(b.items)){b={...b,items:next} as typeof b;changed=true;}}
  if('cards' in b&&b.cards?.length){const next=b.cards.map(i=>enrich(i));if(JSON.stringify(next)!==JSON.stringify(b.cards)){b={...b,cards:next} as typeof b;changed=true;}}
  const group=hub?source.clusters.find(c=>({serie:'Series rail',miniserie:'Miniseries rail',format:'Formats rail'})[c.slug]===b.label):undefined;
  if(group){b={...b,note:group.description,showMedia:true,mediaSource:'upload',media:covers.get(group.slug)} as typeof b;changed=true;}
  if(cluster&&b.blockType==='hero'){b={...b,note:cluster.description,showMedia:true,mediaSource:'upload',media:covers.get(cluster.slug)};changed=true;}
  if(product&&b.blockType==='hero'){b={...b,title:product.title,note:product.description,showMedia:true,mediaSource:'upload',media:covers.get(product.image)};changed=true;}
  if(product&&(b.label==='Property overview'||b.label==='Format overview')){b={...b,title:'synopsis' in product?'La storia':product.title,note:'synopsis' in product?product.synopsis:product.description};changed=true;}
  return b;
 }) as Page['blocks'];
 if(changed)await payload.update({collection:'pages',id:page.id,data:{blocks,...(product?{title:product.title}:{})},draft:page._status==='draft'});
}
console.log('Introduzioni cluster e prodotti aggiornate; immagini deck importate in Media. URL preservati.');
await payload.destroy();
