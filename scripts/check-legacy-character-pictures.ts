import assert from 'node:assert/strict';import {getPayload} from 'payload';import config from '../payload.config';import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return s==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:n(s,c);}});const {getCMSPage}=await import('../lib/cms');
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw Error('Solo copia DB');
const p=await getPayload({config});try{
 const characters=(await p.find({collection:'characters',limit:100,depth:1})).docs;
 for(const path of ['/guarda/miniserie/che-giornata','/guarda/serie/bradiboo','/guarda/format/focus','/guarda/format/fitness','/il-mondo']){
  const page=await getCMSPage(path);assert.ok(page);const cards=page.blocks.flatMap(b=>b.items||[]).filter(i=>i.href.startsWith('/braditriboo/'));assert.ok(cards.length);
  for(const card of cards){const source=characters.find(c=>card.href===`/braditriboo/${c.slug}`)!;assert.ok(card.image,`${path}: ${card.label} senza foto`);assert.equal(card.image,(source.portrait as any).url);assert.equal(card.appearance?.characterCard,true);assert.equal(card.appearance?.hoverBackgroundColor,source.cardIdentity?.backgroundColor);}
 }
 const page=(await p.find({collection:'pages',where:{path:{equals:'/guarda/miniserie/che-giornata'}},depth:0})).docs[0];
 await p.update({collection:'pages',id:page.id,data:{blocks:[{blockType:'grid',label:'Legacy',title:'Legacy',items:[{label:'Bradford',href:'/braditriboo/bradford'}]}]}});
 const fallback=(await getCMSPage(page.path))!.blocks[0].items![0];assert.equal(fallback.image,(characters.find(c=>c.slug==='bradford')!.portrait as any).url);assert.equal(fallback.appearance?.backgroundMode,'transparent');
 console.log('OK: immagini reali ereditate in Che giornata!, Serie, Format e Mondo; hover centrale presente; anche card legacy con solo link recupera la foto.');
}finally{await p.destroy();}
