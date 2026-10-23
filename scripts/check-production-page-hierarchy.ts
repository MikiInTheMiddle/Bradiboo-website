import assert from 'node:assert/strict';import {getPayload} from 'payload';import config from '../payload.config';import {contentSelectionQuery} from '../lib/content-selection';import {registerHooks} from 'node:module';
registerHooks({resolve(s,c,n){return s==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:n(s,c);}});
const {getCMSPage}=await import('../lib/cms');
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw Error('Solo copia DB');
const p=await getPayload({config});try{
 const container=await p.create({collection:'production-containers',data:{title:'Nuovo contenitore test',slug:'hierarchy-test'}});
 assert.equal(container.url,'/guarda/hierarchy-test');
 const containerPage=(await p.find({collection:'pages',where:{path:{equals:container.url!}},depth:0})).docs[0];assert.ok(containerPage);
 const production=await p.create({collection:'contents',data:{title:'Nuova miniserie test',slug:'nuova-produzione',recordType:'production',container:container.id,_status:'draft'} as any});
 assert.equal(production.url,'/guarda/hierarchy-test/nuova-produzione');assert.equal((await p.find({collection:'pages',where:{path:{equals:production.url!}}})).totalDocs,0);
 await p.update({collection:'contents',id:production.id,data:{_status:'published'} as any});
 const page=(await p.find({collection:'pages',where:{path:{equals:production.url!}},depth:0})).docs[0];assert.ok(page);assert.equal(page.blocks?.[1].blockType,'collection');
 const selection:any=containerPage.blocks?.[1];const list=await p.find({collection:'contents',...contentSelectionQuery(selection.contentSelection)});assert.ok(list.docs.some(c=>c.id===production.id));
 const episode=await p.create({collection:'contents',data:{title:'Episodio test',slug:'episodio-hierarchy-test',recordType:'episode',parent:production.id,_status:'published'} as any});
 assert.equal(typeof episode.container==='object'?episode.container?.id:episode.container,container.id);assert.equal((await p.find({collection:'pages',where:{path:{equals:'/guarda/hierarchy-test/nuova-produzione/episodio-hierarchy-test'}}})).totalDocs,0);
 const episodeBlock:any=page.blocks?.[1];assert.equal(episodeBlock.cardAppearance.cardFunction,'video');assert.equal(episodeBlock.cardAppearance.composition,'half');const episodes=await p.find({collection:'contents',...contentSelectionQuery(episodeBlock.contentSelection)});assert.ok(episodes.docs.some(e=>e.id===episode.id));
 await p.update({collection:'contents',id:production.id,data:{description:'Aggiornamento'}});assert.equal((await p.find({collection:'pages',where:{path:{equals:production.url!}}})).totalDocs,1);
 const resolvedContainer=await getCMSPage(container.url!);assert.ok(resolvedContainer?.blocks.some(b=>b.items?.some(i=>i.href===production.url)));
 const resolvedProduction=await getCMSPage(production.url!);assert.ok(resolvedProduction?.blocks.some(b=>b.items?.some(i=>i.cardFunction==='video'&&i.label===episode.title)));
 console.log('OK: nuovi contenitori e produzioni hanno pagina unica modificabile; pubblicazione aggiunge la produzione alla raccolta; episodi associati senza pagine duplicate, Video + Half.');
}finally{await p.destroy();}
