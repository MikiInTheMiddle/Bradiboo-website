import assert from 'node:assert/strict';import {getPayload} from 'payload';import config from '../payload.config';import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return s==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:n(s,c);}});
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw Error('Solo copia DB');
const {getCMSPage}=await import('../lib/cms');const p=await getPayload({config});try{
 const page=(await p.find({collection:'pages',where:{path:{equals:'/braditriboo/bradford'}},depth:0})).docs[0];
 const original=page.blocks!.find(b=>b.blockType==='collection') as any;
 let resolved=(await getCMSPage(page.path))!.blocks.find(b=>b.title===original.title)!;
 assert.ok(resolved.items?.length);assert.ok(resolved.items!.every(i=>i.cardFunction==='video'&&i.appearance?.composition==='half'));
 const content=(await p.find({collection:'contents',where:{and:[{recordType:{equals:'episode'}},{characters:{contains:page.character as number}}]},sort:'-createdAt',limit:1})).docs[0];assert.ok(content);
 const override={content:content.id,cardFunction:'content',appearance:{composition:'overlay',titleVisibility:'hide'},cardTitle:'Eccezione locale'};
 const blocks=page.blocks!.map(b=>b.id===original.id?{...b,cardOverrides:[override]}:b);
 await p.update({collection:'pages',id:page.id,data:{blocks:blocks as any}});
 resolved=(await getCMSPage(page.path))!.blocks.find(b=>b.title===original.title)!;
 const item=resolved.items!.find(i=>i.label==='Eccezione locale')!;assert.ok(item);assert.equal(item.cardFunction,'content');assert.equal(item.appearance?.composition,'overlay');assert.equal(item.appearance?.titleVisibility,'hide');assert.equal(item.youtube,undefined);
 const saved=await p.findByID({collection:'pages',id:page.id,depth:0});assert.deepEqual(saved.blocks!.filter(b=>b.id!==original.id),page.blocks!.filter(b=>b.id!==original.id));
 console.log('OK: raccolta automatica reale eredita Video + Half; eccezione Contenuto + Wide e visibilità locale prevalgono; altri blocchi immutati.');
}finally{await p.destroy();}
