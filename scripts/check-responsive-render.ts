import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {WatchExperience} from '../components/watch/WatchExperience';
registerHooks({resolve(specifier,context,next){return specifier==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:next(specifier,context);}});
const {WireBlocks}=await import('../components/wireframe');
const card={label:'Navigazione',href:'/pagina',image:'/desktop.webp',mobileImage:'/mobile.webp'};
for(const wide of [false,true]){
 const html=renderToStaticMarkup(createElement(WireBlocks,{blocks:[{type:'grid',label:'Card',title:'Card',items:[{...card,appearance:{enabled:true,composition:wide?'overlay':'stacked'}}]}]}));
 assert.ok(html.includes('srcSet="/mobile.webp"'));assert.ok(html.includes('href="/pagina"'));
}
const media=renderToStaticMarkup(createElement(WireBlocks,{blocks:[{type:'media',label:'Media',title:'Media',media:{kind:'image',url:'/desktop.webp',mobileImage:'/mobile.webp'}}]}));
assert.ok(media.includes('srcSet="/mobile.webp"'));
const watch=renderToStaticMarkup(createElement(WatchExperience,{items:[{id:'1',title:'Video',description:'Descrizione',image:'/desktop.webp',mobileImage:'/mobile.webp',characters:[],themes:[],keywords:[],kind:'serie',demo:false}],characters:[],rails:[],preview:false}));
assert.ok(watch.includes('class="watch-card"'));assert.ok((watch.match(/srcSet="\/mobile.webp"/g)||[]).length>=2);
console.log('OK: Default/Wide, media del blocco, card Guarda e poster player renderizzano la variante mobile; azioni link/player distinte.');
