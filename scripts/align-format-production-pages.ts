import {getPayload} from 'payload';
import config from '../payload.config';
import {mkdir,writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
const p=await getPayload({config});
const normalize=(v:any)=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
try{
 const pages=(await p.find({collection:'pages',limit:1000,depth:0})).docs as any[];
 const productions=(await p.find({collection:'contents',where:{recordType:{equals:'production'}},limit:1000,depth:0})).docs as any[];
 const characters=(await p.find({collection:'characters',limit:100,depth:0})).docs;
 const model=pages.find(x=>x.path==='/guarda/miniserie/che-giornata');
 const bites=pages.find(x=>x.path==='/guarda/format');
 if(!model||!bites)throw Error('Reference page missing');
 const formats=productions.filter(c=>c.url?.startsWith('/guarda/format/'));
 const targets=formats.map(c=>({production:c,page:pages.find(x=>x.path===c.url)}));
 if(targets.some(t=>!t.page))throw Error('A production page is missing');
 await mkdir('work/backups',{recursive:true});
 await writeFile(`work/backups/format-pages-before-alignment-${Date.now()}.json`,JSON.stringify({model,targets},null,2));
 const newID=()=>randomBytes(12).toString('hex');
 function fresh(value:any):any{if(Array.isArray(value))return value.map(fresh);if(!value||typeof value!=='object')return value;return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,k==='id'?newID():fresh(v)]));}
 const introRef=model.blocks.find((b:any)=>b.blockType==='split');
 const synopsisRef=model.blocks.filter((b:any)=>b.blockType==='split')[1];
 const episodeRef=model.blocks.find((b:any)=>b.blockType==='episodes');
 const castRef=model.blocks.find((b:any)=>b.blockType==='collection');
 const galleryRef=bites.blocks.find((b:any)=>b.blockType==='gallery');
 const relatedRef=model.blocks.find((b:any)=>b.title==='Vuoi guardare altro?');
 const typography=['headingLevel','titleSize','titleCustomSize','titleAlign','titleWeight','noteSize','noteCustomSize','noteAlign','noteWeight','ctaAlign','cardLayout'];
 function align(block:any,reference:any){const next=structuredClone(block);for(const k of typography)if(next[k]==null||['auto','inherit'].includes(next[k]))next[k]=reference[k];return next;}
 function newBlock(reference:any){const b=fresh(reference);b.textColor='transparent';b.titleColor='transparent';b.noteColor='transparent';b.backgroundMode=null;b.backgroundColor='transparent';return b;}
 const report=[];
 for(const {production,page} of targets){
  const original=page.blocks;const hero=original.find((b:any)=>b.blockType==='hero');if(!hero)throw Error(`Hero missing: ${page.path}`);
  const used=new Set<string>([hero.id]);const result=[structuredClone(hero)];
  const take=(predicate:(b:any)=>boolean)=>{const b=original.find((x:any)=>!used.has(x.id)&&predicate(x));if(b)used.add(b.id);return b;};
  const oldIntro=take(b=>b.blockType==='intro'||b.blockType==='split'&&!b.showMedia);
  const intro=oldIntro?align(oldIntro,introRef):newBlock(introRef);
  intro.blockType='split';if(!oldIntro){intro.title='';intro.note=production.description||hero.note||'';intro.label='Introduzione al format';intro.media=null;intro.showMedia=false;}
  result.push(intro);
  const oldSynopsis=take(b=>b.blockType==='split');
  const synopsis=oldSynopsis?align(oldSynopsis,synopsisRef):newBlock(synopsisRef);
  if(!oldSynopsis){synopsis.title='Di cosa parla?';synopsis.note=production.description||hero.note||'';synopsis.label='Descrizione e media del format';synopsis.media=production.cover||hero.media||hero.backgroundImage||null;synopsis.mediaMobileImage=production.coverMobile||null;synopsis.showMedia=Boolean(synopsis.media);synopsis.contentLayout='text-first';synopsis.items=[];}
  result.push(synopsis);
  const oldEpisodes=take(b=>b.blockType==='episodes');const episodes=oldEpisodes?align(oldEpisodes,episodeRef):newBlock(episodeRef);
  episodes.production=production.id;episodes.contentSelection={...episodes.contentSelection,enabled:true,by:'production',production:production.id,kind:'episode',limit:episodes.contentSelection?.limit||100,sort:episodes.contentSelection?.sort||'oldest'};
  if(!oldEpisodes){episodes.title='Episodi';episodes.cardOverrides=[];}result.push(episodes);
  const oldCast=take(b=>b.blockType==='collection'||b.blockType==='rail'&&/conduce|personagg/i.test(b.title));
  const cast=oldCast?align(oldCast,castRef):newBlock(castRef);
  if(oldCast?.blockType==='rail'){cast.blockType='collection';cast.mode='manual';cast.cards=structuredClone(oldCast.items||[]);delete cast.items;cast.contentSelection={enabled:false};}
  if(!oldCast){cast.mode='characters';cast.title='Personaggi';cast.cast=(production.characters||[]).map((character:any)=>({id:newID(),character}));cast.contentSelection={enabled:false};cast.cardOverrides=[];}
  if(cast.cards?.length===production.characters?.length&&cast.cards.every((row:any)=>row.sourceMode==='linked'&&row.source?.relationTo==='characters'&&!row.overrideContent)){
   cast.cards=cast.cards.map((row:any,index:number)=>{const character=characters.find(c=>c.id===production.characters[index]);return character?{...row,label:character.name,href:`/braditriboo/${character.slug}`,source:{relationTo:'characters',value:character.id}}:row;});
  }
  cast.cardAppearance={...castRef.cardAppearance,...Object.fromEntries(Object.entries(cast.cardAppearance||{}).filter(([,v])=>v!==null&&v!==undefined))};
  result.push(cast);
  const oldGallery=take(b=>b.blockType==='gallery'||b.blockType==='characterMoments');const gallery=oldGallery?structuredClone(oldGallery):newBlock(galleryRef);
  if(!oldGallery){gallery.draft=false;gallery.gallerySourceMode='linked';gallery.gallerySource={relationTo:'contents',value:production.id};gallery.gallerySelectionMode='all';gallery.images=[];gallery.momentPhotos=[];gallery.title='Momenti';}result.push(gallery);
  const oldRelated=take(b=>b.blockType==='rail'&&b.title==='Vuoi guardare altro?');
  const related=oldRelated?structuredClone(oldRelated):newBlock(relatedRef);
  if(!oldRelated){related.items=formats.filter(c=>c.id!==production.id).map(c=>({id:newID(),sourceMode:'linked',source:{relationTo:'contents',value:c.id},cardFunction:'content',appearance:{composition:'overlay'}}));related.cardOverrides=[];}
  // Retain every additional original block, including draft integrations and custom CTAs.
  result.push(...original.filter((b:any)=>!used.has(b.id)).map((b:any)=>structuredClone(b)),related);
  const data:any={blocks:result};if(!page.galleryContext)data.galleryContext={relationTo:'contents',value:production.id};
  const saved=await p.update({collection:'pages',id:page.id,data,depth:0}) as any;
  if(!isDeepStrictEqual(normalize(saved.blocks.find((b:any)=>b.id===hero.id)),normalize(hero)))throw Error(`Hero changed: ${page.path}`);
  for(const b of original)if(!saved.blocks.some((n:any)=>n.id===b.id))throw Error(`Existing block lost: ${b.id}`);
  for(const k of Object.keys(page))if(!['blocks','galleryContext','updatedAt'].includes(k)&&!isDeepStrictEqual(normalize(saved[k]),normalize(page[k])))throw Error(`Page setting changed: ${page.path} ${k}`);
  report.push({path:saved.path,heroPreserved:true,originalBlocksRetained:original.length,blocks:saved.blocks.length,production:production.id});
 }
 console.log(JSON.stringify(report,null,2));
}finally{await p.destroy()}
