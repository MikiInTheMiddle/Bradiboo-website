import assert from 'node:assert/strict';
import {getPayload} from 'payload';
import config from '../payload.config';
import {syncWatchTerms,fetchHeadlessTerms,decodeTermName} from '../lib/sync-watch-terms';
import {filterWatch,remoteMatches} from '../lib/watch-model';
const payload=await getPayload({config});
const originalFetch=globalThis.fetch;
try{
 assert.equal(decodeTermName('art&amp;craft &#39;test&#39;'),'art&craft \'test\'');
 const total=await payload.count({collection:'watch-terms'});
 assert.equal((await payload.count({collection:'watch-terms',where:{source:{equals:'wordpress'}}})).totalDocs,74);
 const local=await payload.create({collection:'watch-terms',data:{name:'Tema di verifica',slug:'',taxonomy:'topic'}});
 assert.equal(local.source,'local');assert.equal(local.slug,'tema-di-verifica');
 await payload.update({collection:'watch-terms',id:local.id,data:{name:'Tema aggiornato'}});
 await assert.rejects(()=>payload.create({collection:'watch-terms',data:{name:'Duplicato',slug:local.slug,taxonomy:'topic'}}));
 const imported=(await payload.find({collection:'watch-terms',where:{source:{equals:'wordpress'}},limit:1})).docs[0];
 await assert.rejects(()=>payload.update({collection:'watch-terms',id:imported.id,data:{name:'Cambio vietato'}}));
 const video=(await payload.find({collection:'contents',where:{slug:{equals:'video-kxc0c3dmwvs'}},limit:1,depth:0})).docs[0];
 assert.ok(video.keywordTerms?.length,'Associazioni keyword migrate');
 await payload.update({collection:'contents',id:video.id,data:{themeTerms:[local.id]}});
 const reread=await payload.findByID({collection:'contents',id:video.id,depth:1});
 const associated=reread.themeTerms?.[0];assert.equal(typeof associated==='object'&&associated?.slug,local.slug);
 const item={id:'test',title:'Test',description:'',characters:[],themes:[local.slug],keywords:['movimento'],kind:'format',demo:false,video:{kind:'youtube' as const,url:'https://youtube.com/embed/test'}};
 assert.equal(filterWatch([item],{characters:[],themes:[local.slug],keywords:[]}).length,1);assert.equal(remoteMatches([item],['movimento']).length,1);
 // Simulate paginated headless responses, including an updated term with the same ID.
 let calls=0;globalThis.fetch=async input=>{calls++;const u=new URL(String(input));const taxonomy=u.pathname.includes('/topic')?'topic':'keyword';const page=Number(u.searchParams.get('page'));const data=taxonomy==='keyword'?[{id:99991,name:'Keyword prova',slug:'keyword-prova',taxonomy}]:Array.from({length:page===1?100:1},(_,i)=>({id:10000+(page-1)*100+i,name:`Tema ${page}-${i}`,slug:`tema-${page}-${i}`,taxonomy}));return Response.json(data,{headers:{'X-WP-TotalPages':taxonomy==='topic'?'2':'1'}});};
 assert.equal((await fetchHeadlessTerms('https://example.test/')).length,102);assert.equal(calls,3);
 const first=await syncWatchTerms(payload);assert.equal(first.created,102);
 const second=await syncWatchTerms(payload);assert.equal(second.created,0);assert.equal(second.updated,102);
 assert.equal((await payload.findByID({collection:'watch-terms',id:local.id})).name,'Tema aggiornato','Locali conservati');
 assert.equal((await payload.count({collection:'watch-terms'})).totalDocs,total.totalDocs+103);
 console.log('OK: import, paginazione, aggiornamento idempotente, aggiunta locale, duplicati, protezione WordPress, associazioni e filtri.');
}finally{globalThis.fetch=originalFetch;await payload.destroy();}
