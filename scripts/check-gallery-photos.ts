import assert from 'node:assert/strict';import {getPayload} from 'payload';import config from '../payload.config';import {registerHooks} from 'node:module';import {sourceGalleryRows,type GalleryItem} from '../lib/gallery-model';
registerHooks({resolve(s,c,n){return s==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:n(s,c);}});const {getCMSPage}=await import('../lib/cms');
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw Error('Solo copia DB');const p=await getPayload({config});try{
 const photos=(await p.find({collection:'media',where:{mimeType:{contains:'image/'}},limit:2,depth:0})).docs;assert.equal(photos.length,2);
 const page=(await p.find({collection:'pages',where:{path:{equals:'/braditriboo'}},depth:0})).docs[0];
 const local:any={blockType:'gallery',label:'Foto test',title:'Foto test',gallerySourceMode:'manual',galleryPhotos:photos.map(m=>m.id),galleryLayout:'moodboard'};
 await p.update({collection:'pages',id:page.id,data:{blocks:[local]}});let items=(await getCMSPage(page.path))!.blocks[0].items!;assert.equal(items.length,2);assert.equal(items[0].alt,photos[0].alt);assert.equal(items[0].label,'');assert.equal((items[0] as GalleryItem).momentID,`photo-${photos[0].id}`);
 for(const [relationTo,id] of [['characters',1],['production-containers',1],['contents',9],['contents',11]] as const){
  const doc=await p.update({collection:relationTo,id,data:{momentPhotos:photos.map(m=>m.id),moments:[{image:photos[0].id,title:'Con dettagli'}]},depth:2});
  const rows=sourceGalleryRows(doc);assert.equal(rows.length,3);assert.equal(rows[0].alt,photos[0].alt);assert.equal(doc.moments?.[0].alt,'');
  await p.update({collection:'pages',id:page.id,data:{blocks:[{...local,gallerySourceMode:'linked',gallerySource:{relationTo,value:id},gallerySelectionMode:'selected',gallerySelected:[`photo-${photos[1].id}`]}]}});
  items=(await getCMSPage(page.path))!.blocks[0].items!;assert.equal(items.length,1);assert.equal(items[0].image,photos[1].url);assert.equal(items[0].alt,photos[1].alt);
 }
 console.log('OK: selezione multipla locale, ordine, alt Media senza duplicazione, foto semplici + dettagli conservati, selezione per ID e tutte le quattro sorgenti.');
}finally{await p.destroy();}
