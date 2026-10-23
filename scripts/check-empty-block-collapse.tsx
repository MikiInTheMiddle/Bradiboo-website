import assert from 'node:assert/strict';import React from 'react';import {renderToStaticMarkup} from 'react-dom/server';import {registerHooks} from 'node:module';import {getPayload} from 'payload';import config from '../payload.config';import {hasBlockContent} from '../lib/block-content-visibility';import type {WireBlock} from '../lib/wireframe';
registerHooks({resolve(s,c,n){return s==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:n(s,c);}});
const {getCMSPage}=await import('../lib/cms');const {WireBlocks}=await import('../components/wireframe');
assert.ok(process.env.DATABASE_URL?.includes('/tmp/'),'Disposable DB required');
const base:WireBlock={type:'rail',label:'Empty collection',title:'Heading alone',items:[]};
assert.equal(hasBlockContent(base),false);assert.equal(renderToStaticMarkup(<WireBlocks blocks={[base,{...base,presentation:'wide'}]}/>),'');
assert.equal(hasBlockContent({...base,type:'split',requiresItems:false,note:'Actual description'}),true);
assert.equal(hasBlockContent({...base,type:'split',requiresItems:false,title:'',showText:false}),false);
assert.equal(hasBlockContent({...base,type:'hero',title:'',showText:false,backgroundMode:'image',backgroundImage:'/hero.webp'}),true);
assert.equal(hasBlockContent({...base,type:'split',title:'',showText:false,requiresItems:false,cta:{label:'Play',href:'/audio'}}),true);
assert.equal(hasBlockContent({...base,media:{url:'/image.webp',kind:'image'}}),true);
const p=await getPayload({config});try{
 const source=(await p.find({collection:'pages',where:{path:{equals:'/guarda/format/natura'}},depth:0,limit:1})).docs[0];assert.ok(source);
 const before=JSON.stringify(source.blocks);
 let view=await getCMSPage(source.path);assert.ok(view);
 const episodes=(source.blocks as any[]).find(b=>b.blockType==='episodes');const gallery=(source.blocks as any[]).find(b=>b.blockType==='gallery');assert.ok(episodes&&gallery);
 assert.ok(!view.blocks.some(b=>b.label===episodes.label));assert.ok(!view.blocks.some(b=>b.label===gallery.label));
 const productionID=typeof episodes.production==='object'?episodes.production.id:episodes.production;
 const episode=await p.create({collection:'contents',data:{title:'Collapse QA episode',slug:`collapse-qa-${Date.now()}`,recordType:'episode',kind:'episodio',parent:productionID,_status:'published'},context:{skipHierarchyPage:true}});
 const production=await p.findByID({collection:'contents',id:productionID,depth:0});assert.ok(production.cover);
 await p.update({collection:'contents',id:production.id,data:{momentPhotos:[typeof production.cover==='object'?production.cover.id:production.cover]},context:{skipHierarchyPage:true}});
 view=await getCMSPage(source.path);assert.ok(view?.blocks.some(b=>b.label===episodes.label&&b.items?.length));assert.ok(view?.blocks.some(b=>b.gallery&&b.items?.length));
 await p.update({collection:'contents',id:episode.id,data:{_status:'draft'},context:{skipHierarchyPage:true}});
 await p.update({collection:'contents',id:production.id,data:{momentPhotos:[]},context:{skipHierarchyPage:true}});
 view=await getCMSPage(source.path);assert.ok(!view?.blocks.some(b=>b.label===episodes.label));assert.ok(!view?.blocks.some(b=>b.gallery));
 assert.equal(JSON.stringify((await p.findByID({collection:'pages',id:source.id,depth:0})).blocks),before,'Backoffice block configuration must remain untouched');
 const lofi=await getCMSPage('/guarda/format/focus');assert.ok(lofi?.blocks.some(b=>b.requiresItems&&b.items?.some(i=>i.cardFunction==='video')));
 console.log('OK: empty collections collapse before markup including Wide; text/media/image Hero/CTA-only remain; episodes and gallery automatically return with content and collapse again; Payload configuration unchanged.');
}finally{await p.destroy()}
