import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {readFile,readdir} from 'node:fs/promises';
import {getPayload} from 'payload';
import config from '../payload.config';
import {characterIdentityAppearance} from '../lib/character-card-identity';
import {mergeCardAppearance} from '../lib/card-appearance';
import {cardSurfaceStyle,cardHoverAttributes} from '../lib/card-style';
import {blockTextStyle} from '../lib/text-style';
import type {WireLink} from '../lib/wireframe';
registerHooks({resolve(s,c,next){return s==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:next(s,c);}});
const {getCMSPage}=await import('../lib/cms');
assert.equal(characterIdentityAppearance({enabled:false,backgroundColor:'#ff0000'}).hoverBackgroundColor,undefined);
assert.equal(characterIdentityAppearance({enabled:false}).backgroundMode,'transparent');
const identity=characterIdentityAppearance({enabled:true,backgroundColor:'#ff0000',textColor:'#ffffff'})!;
assert.equal(identity.textColor,'#ffffff');assert.equal(identity.backgroundColor,'transparent');
assert.equal(mergeCardAppearance(identity,{hoverMode:'custom',hoverBackgroundColor:'#123456'})?.hoverBackgroundColor,'#123456');
assert.equal(mergeCardAppearance(identity,{hoverMode:'none'})?.hoverMode,'none');
assert.equal(mergeCardAppearance(identity,{hoverMode:'inherit'})?.hoverBackgroundColor,'#ff0000');
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw new Error('Usare solo DB temporaneo migrato');
const p=await getPayload({config});
try{
 const file=(await readdir('work/backups')).filter(n=>/^character-card-identity-\d+\.json$/.test(n)).sort().at(-1)!;
 const before=JSON.parse(await readFile(`work/backups/${file}`,'utf8'));
 const home=await getCMSPage('/');assert.ok(home);
 const characters=(await p.find({collection:'characters',depth:0,limit:100})).docs;
 const block=before.home.blocks.find((b:any)=>b.blockType==='collection'&&b.mode==='characters');
 for(const row of block.cast){
  const character=characters.find(c=>c.id===(typeof row.character==='object'?row.character.id:row.character))!;
  const item:WireLink=home.blocks.flatMap(b=>b.items||[]).find(i=>i.href===`/braditriboo/${character.slug}`)!;assert.ok(item);
  const previous=mergeCardAppearance(block.cardAppearance,row.appearance);
  assert.deepEqual(cardSurfaceStyle(item.appearance),cardSurfaceStyle(previous),`${character.name}: Home CSS unchanged`);
  assert.equal(cardHoverAttributes(item.appearance)['data-card-kind'],'character');
  assert.equal(item.appearance?.hoverBackgroundColor,character.cardIdentity?.backgroundColor);
  assert.deepEqual(blockTextStyle(item.appearance||{},'title'),blockTextStyle(previous||{},'title'));
 }
 for(const path of ['/braditriboo',...characters.map(c=>`/braditriboo/${c.slug}`)]){
  const page=await getCMSPage(path);assert.ok(page);
  for(const item of page.blocks.flatMap(b=>b.items||[])){
   const c=characters.find(c=>item.href===`/braditriboo/${c.slug}`);
   if(!c)continue;assert.equal(item.appearance?.hoverBackgroundColor,c.cardIdentity?.backgroundColor,`${path}: ${c.name}`);
   assert.equal(item.appearance?.textColor,'#ffffff','Normal text inherits the shared Home preset unless locally overridden');
  }
 }
 console.log('OK: preset normale condiviso, priorità blocco/card, Home conservata; indice e 6 pagine personaggio ereditano normale e hover.');
}finally{await p.destroy();}
