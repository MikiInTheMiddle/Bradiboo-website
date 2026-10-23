import {getPayload} from 'payload';
import config from '../payload.config';
import type {Page} from '../payload-types';
const payload=await getPayload({config});
const contents=await payload.find({collection:'contents',limit:1000,depth:0});
const pairs=[['video-ss2xsp6ykxo','che-giornata'],['video-kxc0c3dmwvs','fitness'],['video-bez8muyzilq','arte'],['video-rbtsexoozku','focus'],['episodio-pil','bradiboo']];
for(const [slug,parentSlug] of pairs){
 const item=contents.docs.find(c=>c.slug===slug),parent=contents.docs.find(c=>c.slug===parentSlug);
 if(!item||!parent)throw new Error(`Contenuto mancante: ${slug}/${parentSlug}`);
 if(!item.parent)await payload.update({collection:'contents',id:item.id,data:{parent:parent.id}});
 else if(item.parent!==parent.id)console.log(`Associazione esistente conservata: ${slug}`);
}
for(const production of contents.docs.filter(c=>['serie','miniserie','format'].includes(c.kind))){
 const page=(await payload.find({collection:'pages',where:{path:{equals:production.url}},depth:0,limit:1})).docs[0];if(!page)continue;
 if(page.blocks?.some(b=>b.blockType==='episodes'))continue;
 let replaced=false;
 const blocks=(page.blocks||[]).map(b=>{
  if(b.label!=='Episodes rail'&&b.label!=='Episodes grid'&&b.label!=='Format episodes')return b;
  replaced=true;const {items,...common}=b as typeof b&{items?:unknown};
  return {...common,blockType:'episodes',production:production.id,limit:24};
 });
 if(!replaced)blocks.splice(Math.min(2,blocks.length),0,{blockType:'episodes',label:'Episodes rail',title:'Episodi',production:production.id,limit:24} as never);
 await payload.update({collection:'pages',id:page.id,data:{blocks:blocks as Page['blocks']},draft:page._status==='draft'});
 console.log(`Elenco episodi automatico: ${production.title}`);
}
await payload.destroy();
