import assert from 'node:assert/strict';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import config from '../payload.config';
import {collectionBlockTypes} from '../lib/presentation-fields';
import {FeaturedWide} from '../components/featured-wide';
import {WatchModuleFrame} from '../components/watch/WatchModuleFrame';
import {WatchExperience} from '../components/watch/WatchExperience';
import {styleWatchModule} from '../lib/watch-module';
import type {WireBlock} from '../lib/wireframe';
import type {WatchItem} from '../lib/watch-model';
const schema=await config;
function fields(values:any[]):any[]{return values.flatMap(f=>[f,...(f.type==='tabs'?f.tabs.flatMap((t:any)=>fields(t.fields)):f.fields?fields(f.fields):[])]);}
const pages=schema.collections.find(c=>c.slug==='pages')!;
const modules=fields(pages.fields).find(f=>f.type==='blocks'&&f.name==='blocks');
for(const block of modules.blocks){if(!collectionBlockTypes.has(block.slug))continue;const names=new Set(fields(block.fields).map(f=>f.name));for(const name of ['presentation','backgroundMode','backgroundImage','backgroundOpacity','backgroundBlur','showText','showBadge','cardAppearance','wideOverlayOpacity'])assert.ok(names.has(name),`${block.slug}: ${name}`);}
const item:WatchItem={id:'1',title:'Sorgente',description:'Descrizione sorgente',image:'/cover.webp',kind:'serie',characters:[],themes:[],keywords:[],demo:false,appearance:{enabled:true,backgroundColor:'#112233'}};
const block:WireBlock={type:'watchExperience',label:'Catalogo',title:'Titolo modulo',note:'Testo modulo',presentation:'wide',backgroundMode:'image',backgroundImage:'/bg.webp',opacity:0,wideOverlayOpacity:0,cardAppearance:{enabled:true,composition:'overlay'},catalogOverrides:[{id:'1',description:'',appearance:{enabled:true,hoverMode:'custom',hoverBackgroundColor:'#abcdef'}}]};
const styled=styleWatchModule({items:[item],rails:[{id:'rail',title:'Fascione',items:[item]}]},block);
assert.equal(styled.items[0].description,'');assert.equal(styled.items[0].appearance?.composition,'overlay');assert.equal(styled.rails[0].items[0].appearance?.hoverBackgroundColor,'#abcdef');assert.equal(item.description,'Descrizione sorgente');
for(const remote of [false,true]){
 const player=createElement(WatchExperience,{...styled,characters:[],preview:false,remote,remoteButtons:[],catalogTitle:'Titolo modulo',showHeading:false});
 const html=renderToStaticMarkup(createElement(WatchModuleFrame,{block,children:player}));
 assert.ok(html.includes('/bg.webp'));assert.ok(html.includes('opacity:0'));assert.ok(html.includes('watch-player'));assert.ok(!html.includes('Titolo modulo</h2>'));
 assert.ok(html.includes(remote?'ZAP! — telecomando Bradiboo':'Filtra il catalogo'));
}
console.log('OK: controlli condivisi in ogni blocco analogo; Wide interattivo conserva player/filtri/ZAP; override card e valori zero rispettati.');

const profile=renderToStaticMarkup(createElement(FeaturedWide,{block:{type:'split',title:'Personaggio',label:'Scheda',presentation:'wide',facts:[{label:'Passioni',value:'Musica'}],audio:'/voice.mp3',audioCaption:'Voce del personaggio',media:{kind:'image',url:'/portrait.svg'}}}));
assert.ok(profile.includes('Musica'));assert.ok(profile.includes('/voice.mp3'));assert.ok(profile.includes('/portrait.svg'));
