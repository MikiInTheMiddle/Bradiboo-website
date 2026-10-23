import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {resolveCTAAlignment} from '../lib/cta-alignment';
import {mergeCardAppearance} from '../lib/card-appearance';
import {mergeWideAppearance} from '../lib/wide-appearance';
registerHooks({resolve(s,c,next){return s==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:next(s,c);}});
const {WireBlocks}=await import('../components/wireframe');
assert.equal(resolveCTAAlignment(undefined),'left');assert.equal(resolveCTAAlignment('center','inherit'),'center');assert.equal(resolveCTAAlignment('center','left'),'left');
assert.equal(mergeCardAppearance({ctaAlign:'center'},{enabled:false,ctaAlign:'left'})?.ctaAlign,'left');
assert.equal(mergeWideAppearance({enabled:false,ctaAlign:'center'})?.ctaAlign,'center');
for(const type of ['grid','split'] as const){
 const html=renderToStaticMarkup(createElement(WireBlocks,{blocks:[{type,label:'Blocco',title:'Titolo',presentation:'cards',ctaAlign:'center',items:[{label:'Elemento principale',href:'/elemento',image:'/image.webp'}],media:{kind:'image',url:'/media.webp'},cta:{label:'CTA finale',href:'/destinazione'}}]}));
 assert.ok(html.indexOf('CTA finale')>html.indexOf('Elemento principale'));assert.ok(html.indexOf('CTA finale')>html.indexOf('/media.webp'));assert.ok(html.includes('class="wf-cta-row" data-cta-align="center"'));
}
console.log('OK: CTA dopo card/media, allineamento sinistra/centro, eredità e override indipendenti dai colori.');
