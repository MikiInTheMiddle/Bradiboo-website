import {getPayload} from 'payload';
import config from '../payload.config';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const p=await getPayload({config});
try{
 const pages=(await p.find({collection:'pages',limit:200,depth:0})).docs;
 const reference=pages.find(p=>p.path==='/braditriboo/bradford')!;
 await mkdir('work/backups',{recursive:true});
 await writeFile(`work/backups/character-block-alignment-${Date.now()}.json`,JSON.stringify(pages.filter(p=>p.character),null,2));
 for(const page of pages){
  if(!page.character||page.id===reference.id)continue;
  const old=page.blocks as any[];
  const name=page.title;
  const find=(type:string,label?:string)=>old.find(b=>b.blockType===type&&(!label||b.label===label));
  const hero=find('hero');const profile=find('characterProfile');const moments=find('characterMoments')||find('gallery');
  const episodes=find('collection')||find('dynamic','Watch character');
  const activities=find('braditime');const products=find('rail','Character products');const friends=find('characterFriends');
  assert.ok(hero&&profile&&moments&&episodes&&activities&&products&&friends,`Blocchi mancanti: ${page.path}`);
  // Preserve existing rows/settings, replacing only the legacy module type and its source selector.
  const gallery={...moments,blockType:'gallery',label:`Momenti con ${name}`,title:`Momenti con ${name}`,gallerySourceMode:'page',galleryLayout:'moodboard',gallerySelectionMode:'all',draft:false};
  const collection={...episodes,blockType:'collection',label:`Episodi ${name}`,title:`Gli episodi con ${name}`,mode:'manual',contentSelection:{...episodes.contentSelection,enabled:true,by:'character',character:page.character,kind:'episode'}};
  // The generic placeholder rows are retained in the backup, not rendered as fake episodes.
  delete collection.items;
  const blocks=[hero,profile,gallery,collection,activities,{...products,draft:true},friends];
  const saved=await p.update({collection:'pages',id:page.id,data:{blocks:blocks as any},depth:0});
  assert.deepEqual(saved.blocks!.map(b=>b.blockType),reference.blocks!.map(b=>b.blockType));
  assert.equal(saved.character,page.character);
  console.log(page.path,'→',saved.blocks!.map(b=>b.blockType).join(' / '));
 }
}finally{await p.destroy();}
