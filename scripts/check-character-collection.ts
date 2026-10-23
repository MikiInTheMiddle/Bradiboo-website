import assert from 'node:assert/strict';import {selectCharacterCards} from '../lib/content-selection';import {getPayload} from 'payload';import config from '../payload.config';import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return s==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:n(s,c);}});const {getCMSPage}=await import('../lib/cms');
const rows=[{id:1,name:'Bradford',createdAt:'1',friends:[3,2]},{id:2,name:'Placido',createdAt:'2'},{id:3,name:'Joe',createdAt:'3'}];
assert.deepEqual(selectCharacterCards(rows,{charactersMode:'all',sort:'oldest'}).map(c=>c.id),[1,2,3]);
assert.deepEqual(selectCharacterCards(rows,{charactersMode:'friends',excludeCurrent:true},1).map(c=>c.id),[3,2]);
assert.equal(selectCharacterCards(rows,{charactersMode:'friends'},undefined).length,0);
assert.deepEqual(selectCharacterCards(rows,{charactersMode:'friends',excludeCurrent:true,sort:'oldest'},2).map(c=>c.id),[1,3]);
const p=await getPayload({config});try{
 const home=await getCMSPage('/');const block=home!.blocks.find(b=>b.title==='La Braditriboo')!;assert.equal(block.items!.length,6);assert.deepEqual(block.items!.map(i=>i.label),['Bradford','Placido','Joe','Petronilla','Nancy','Mimì']);
 assert.equal(block.items![0].appearance?.textColor,'#ffffff');assert.equal(block.items![0].appearance?.descriptionVisibility,'hide');
 const pages=(await p.find({collection:'pages',limit:200,depth:0})).docs.filter(p=>p.character);
 for(const page of pages){assert.ok(!page.blocks?.some(b=>b.blockType==='characterFriends'));const raw=page.blocks!.find(b=>b.blockType==='collection'&&b.contentSelection?.by==='characters')!;assert.ok(raw);const resolved=await getCMSPage(page.path);const friends=resolved!.blocks.find(b=>b.title===raw.title)!;assert.equal(friends.items!.length,5);assert.ok(!friends.items!.some(i=>i.href===page.path));assert.ok(friends.items!.every(i=>i.appearance?.backgroundMode==='transparent'));}
 console.log('OK: tutti/amici/esclusione/ordine e mancanza contesto; home 6 con ordine/stili originali, altre 6 pagine 5 card senza sé stessi.');
}finally{await p.destroy();}
