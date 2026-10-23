import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {getPayload} from 'payload';
import config from '../payload.config';
registerHooks({resolve(s,c,next){return s==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:next(s,c);}});
const {getCMSPage}=await import('../lib/cms');
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw new Error('Solo DB temporaneo');
const p=await getPayload({config});
try{
 const page=(await p.find({collection:'pages',where:{path:{equals:'/braditriboo'}},depth:0})).docs[0];
 for(const [relationTo,id] of [['characters',1],['production-containers',1],['contents',9],['contents',11]] as const){
  const source=await p.findByID({collection:relationTo,id,depth:0});
  const before=(source.moments||[]) as any[];
  const doc=await p.update({collection:relationTo,id,data:{moments:[...before,{image:50,mobileImage:48,title:'Titolo test',caption:'Didascalia test',alt:'Immagine di prova',focalX:0}]}});
  const moment=doc.moments!.at(-1)!;
  const block:any={blockType:'gallery',label:'Gallery test',title:'Galleria',gallerySourceMode:'linked',gallerySource:{relationTo,value:id},gallerySelectionMode:'selected',gallerySelected:[moment.id],galleryLayout:'moodboard',galleryShowCaption:false};
  await p.update({collection:'pages',id:page.id,data:{blocks:[...page.blocks!,block]}});
  let rendered=(await getCMSPage('/braditriboo'))!.blocks.find(b=>b.label==='Gallery test')!;
  assert.equal(rendered.items?.length,1);assert.equal(rendered.items[0].label,'Titolo test');assert.equal(rendered.items[0].focalX,0);assert.ok(rendered.items[0].mobileImage);assert.equal(rendered.gallerySettings?.showCaption,false);
  block.gallerySelectionMode='all';
  await p.update({collection:'pages',id:page.id,data:{blocks:[...page.blocks!,block]}});
  await p.update({collection:relationTo,id,data:{moments:[...doc.moments!,{image:47,title:'Nuova immagine',alt:'Nuova'}]}});
  rendered=(await getCMSPage('/braditriboo'))!.blocks.find(b=>b.label==='Gallery test')!;
  assert.equal(rendered.items?.length,before.length+2,'Le nuove immagini si propagano senza copiare il blocco');
 }
 const manual:any={blockType:'gallery',label:'Manuale test',title:'Manuale',gallerySourceMode:'manual',galleryLayout:'reel',images:[{image:50,title:'Locale',alt:'Locale'}]};
 await p.update({collection:'pages',id:page.id,data:{blocks:[...page.blocks!,manual]}});
 const rendered=(await getCMSPage('/braditriboo'))!.blocks.find(b=>b.label==='Manuale test')!;
 assert.equal(rendered.items?.[0].label,'Locale');assert.equal(rendered.gallerySettings?.layout,'reel');
 console.log('OK: archivi sulle quattro sorgenti, checkbox per ID, immagini aggiunte automaticamente, modalità locale/mobile/focus e controlli conservati.');
}finally{await p.destroy();}
