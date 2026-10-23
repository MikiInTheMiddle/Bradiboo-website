import assert from 'node:assert/strict';
import {getPayload} from 'payload';
import config from '../payload.config';
import {CookieLabel} from '../components/cookie-label';
import React from 'react';
import {sourceCard,inheritCard} from '../lib/card-source';
import {renderToStaticMarkup} from 'react-dom/server';
assert.ok(process.env.DATABASE_URL?.includes('/tmp/'),'Use disposable DB.');
const payload=await getPayload({config});
try {
 const page=await payload.create({collection:'pages',data:{title:'Cookie QA',path:`/cookie-qa-${Date.now()}`,blocks:[
  {blockType:'hero',label:'Hero',title:'Hero',showBadge:true,badge:'Novità',badgeBackgroundColor:'#243162',badgeTextColor:'#f8c023'},
  {blockType:'grid',label:'Grid',title:'Grid',items:[{label:'Card',href:'/guarda',badge:'Scopri',badgeBackgroundColor:'#f8c023'}]},
  {blockType:'watchExperience',label:'Watch',title:'Guarda',showBadge:true,badge:'Guarda',badgeBackgroundColor:'#b4dfce',badgeTextColor:'#243162'},
  {blockType:'zapExperience',label:'Zap',title:'ZAP',showBadge:true,badge:'ZAP!',badgeBackgroundColor:'#f37c72',badgeTextColor:'#243162'},
 ]}});
 const saved=await payload.findByID({collection:'pages',id:page.id,depth:0});
 assert.equal(saved.blocks?.length,4);
 assert.equal(saved.blocks![0].badgeBackgroundColor,'#243162');assert.equal(saved.blocks![0].badgeTextColor,'#f8c023');assert.equal(saved.blocks![2].badgeTextColor,'#243162');assert.equal(saved.blocks![3].badgeTextColor,'#243162');
 const grid=saved.blocks![1];assert.ok(grid.blockType==='grid');assert.equal(grid.items?.[0].badgeBackgroundColor,'#f8c023');
 assert.equal(saved.blocks![2].badge,'Guarda');assert.equal(saved.blocks![3].badge,'ZAP!');
 const version=await payload.findVersions({collection:'pages',where:{parent:{equals:page.id}},limit:1});assert.equal(version.docs[0].version.blocks?.[0].badgeBackgroundColor,'#243162');
 const content=(await payload.find({collection:'contents',limit:1})).docs[0];assert.ok(content);
 await payload.update({collection:'contents',id:content.id,data:{highlightBadge:'Novità',highlightBadgeBackgroundColor:'#f8c023',highlightBadgeTextColor:'#243162'}});
 assert.equal((await payload.findByID({collection:'contents',id:content.id})).highlightBadgeBackgroundColor,'#f8c023');
 assert.equal((await payload.findByID({collection:'contents',id:content.id})).highlightBadgeTextColor,'#243162');
 const badgeSource=sourceCard('contents',{...content,_status:'published',highlightBadge:'Novità',highlightBadgeTextColor:'#243162'});assert.equal(badgeSource?.badgeTextColor,'#243162');
 const linked=inheritCard(badgeSource,{label:'',href:'',appearance:{badgeMode:'custom',badgeTextColor:'#f8c023'}},{sourceMode:'linked'});assert.equal(linked.badgeTextColor,'#243162');assert.equal(linked.appearance?.badgeTextColor,'#f8c023');
 const versionText=await payload.findVersions({collection:'pages',where:{parent:{equals:page.id}},limit:1});assert.equal(versionText.docs[0].version.blocks?.[0].badgeTextColor,'#f8c023');
 const explicit=renderToStaticMarkup(<CookieLabel backgroundColor="#243162" textColor="#f8c023">Novità</CookieLabel>);assert.match(explicit,/--cookie-color:#f8c023/);
 const markup=renderToStaticMarkup(<CookieLabel backgroundColor="#243162">Novità</CookieLabel>);
 assert.match(markup,/--cookie-background:#243162/);assert.match(markup,/--cookie-color:#ffffff/);assert.match(markup,/bradi-cookie-face/);
 console.log('OK: module/card/watch/ZAP label controls and versions saved; catalog highlight color and shared label rendering verified.');
} finally {await payload.destroy();}
