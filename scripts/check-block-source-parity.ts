import {contentSelectionBlocks} from '../lib/content-selection';
import assert from 'node:assert/strict';
import config from '../payload.config';
import {collectionBlockTypes} from '../lib/presentation-fields';
import {filterCardSources} from '../lib/card-source-category';
import {sourceCard} from '../lib/card-source';
const flat=(fields:any[]):any[]=>fields.flatMap(f=>[f,...(f.fields?flat(f.fields):[]),...(f.type==='tabs'?f.tabs.flatMap((t:any)=>flat(t.fields)):[])]);
const schema=await config;
const pages=schema.collections.find(c=>c.slug==='pages')!;
const blocks=flat(pages.fields).find(f=>f.name==='blocks').blocks;
for(const block of blocks){
 const fields=flat(block.fields);
 if(contentSelectionBlocks.has(block.slug)){const selection=fields.find(f=>f.name==='contentSelection');assert.ok(selection,`${block.slug}: shared automatic source`);for(const key of ['enabled','by','character','container','production','kind','limit','sort'])assert.ok(flat(selection.fields).some(f=>f.name===key),`${block.slug}: source ${key}`);}
 if(collectionBlockTypes.has(block.slug))for(const key of ['presentation','backgroundMode','backgroundImage','cardAppearance','cardOverrides','showText','eyebrowMode','eyebrowText'])assert.ok(fields.some(f=>f.name===key),`${block.slug}: ${key}`);
 for(const row of fields.filter(f=>f.type==='array'&&['cards','items','panels'].includes(f.name))){
  const children=flat(row.fields);
  if(children.some(f=>f.name==='sourceMode'))for(const key of ['sourceCategory','source','overrideContent','overrideImage','appearance','mobileImage'])assert.ok(children.some(f=>f.name===key),`${block.slug}.${row.name}: ${key}`);
 }
}
assert.ok(blocks.some((b:any)=>b.slug==='gallery'));
for(const slug of ['gallery','characterMoments']){const fields=flat(blocks.find((b:any)=>b.slug===slug).fields);for(const key of ['gallerySourceMode','gallerySource','gallerySelected','galleryLayout','images','galleryShowTitle','galleryShowCaption'])assert.ok(fields.some((f:any)=>f.name===key),`${slug}: ${key}`);}
const filter=(category:string,relationTo:string)=>filterCardSources({relationTo,siblingData:{sourceCategory:category}} as any);
assert.equal(await filter('container','pages'),false);
assert.equal(await filter('production','characters'),false);
assert.deepEqual(await filter('episode','contents'),{and:[{_status:{equals:'published'}},{recordType:{equals:'episode'}}]});
assert.deepEqual(await filter('media','media'),{mimeType:{contains:'image/'}});
assert.equal(sourceCard('media',{filename:'immagine.webp',alt:'Illustrazione',url:'/image.webp',mimeType:'image/webp'})?.image,'/image.webp');
console.log(`OK: ${blocks.length} definizioni di blocco condivise da istanze e nuovi moduli; controlli comuni e sorgenti coerenti, categorie filtrate e Media.`);
