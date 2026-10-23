import {getPayload} from 'payload';import config from '../payload.config';import assert from 'node:assert/strict';import {readdir,readFile} from 'node:fs/promises';import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return s==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:n(s,c);}});
const {getCMSPage}=await import('../lib/cms');
const p=await getPayload({config});try{
 const file=(await readdir('work/backups')).filter(x=>x.startsWith('format-pages-before-alignment-')).sort()[0];const snapshot=JSON.parse(await readFile(`work/backups/${file}`,'utf8'));
 for(const {page:before,production} of snapshot.targets){const after=await p.findByID({collection:'pages',id:before.id,depth:0}) as any;
  assert.deepEqual(after.blocks.find((b:any)=>b.blockType==='hero'),before.blocks.find((b:any)=>b.blockType==='hero'));
  for(const old of before.blocks){const block=after.blocks.find((b:any)=>b.id===old.id);assert.ok(block);assert.equal(block.title,old.title);assert.equal(block.note,old.note);if(old.items?.length){const rows=block.cards||block.items;assert.equal(rows.length,old.items.length);for(let i=0;i<rows.length;i++){const expected={...old.items[i]};if(block.cards&&expected.source?.relationTo==='characters'&&!expected.overrideContent){expected.source=rows[i].source;expected.label=rows[i].label;expected.href=rows[i].href;assert.equal(rows[i].source.value,production.characters[i]);}assert.deepEqual(rows[i],expected);}}assert.deepEqual(block.cardOverrides,old.cardOverrides);}
  for(const key of Object.keys(before))if(!['blocks','galleryContext','updatedAt'].includes(key))assert.deepEqual(after[key],before[key],`${before.path}: ${key}`);
  const episodes=after.blocks.find((b:any)=>b.blockType==='episodes');assert.equal(episodes.production,production.id);assert.equal(episodes.contentSelection.production,production.id);
  const gallery=after.blocks.find((b:any)=>b.blockType==='gallery');assert.equal(gallery.gallerySource.value,production.id);
  assert.ok(after.blocks.filter((b:any)=>b.blockType==='split').length>=2);
  const related=after.blocks.find((b:any)=>b.title==='Vuoi guardare altro?');assert.equal(related.items.length,5);assert.ok(related.items.every((i:any)=>i.source.value!==production.id));
  const view=await getCMSPage(after.path);assert.ok(view);assert.ok(view.blocks.some(b=>b.gallery));assert.ok(view.blocks.flatMap(b=>b.items||[]).some(i=>i.href.startsWith('/braditriboo/')));
  console.log('OK',after.path,'hero/settings/texts/rows preserved; episodes/gallery/related correctly connected; frontend resolves.');
 }
}finally{await p.destroy()}
