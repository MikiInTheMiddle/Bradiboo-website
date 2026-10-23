import assert from 'node:assert/strict';
import {mergeCardAppearance} from '../lib/card-appearance';import {mergeWideAppearance} from '../lib/wide-appearance';import {visibilityAttributes,ctaVariables} from '../lib/card-controls';
for(const merge of [mergeCardAppearance,mergeWideAppearance]){
 const a=merge({titleVisibility:'hide',descriptionVisibility:'hide',mediaVisibility:'hide',ctaBackgroundColor:'#123456',ctaTextColor:'#ffffff'});
 assert.equal(a?.titleVisibility,'hide');assert.equal(a?.mediaVisibility,'hide');assert.equal(visibilityAttributes(a)['data-hide-title'],true);assert.equal(ctaVariables(a)['--cta-bg'],'#123456');
 const b=merge(a,{titleVisibility:'show',ctaBackgroundColor:'#abcdef'});assert.equal(b?.titleVisibility,'show');assert.equal(b?.descriptionVisibility,'hide');assert.equal(b?.ctaBackgroundColor,'#abcdef');
 const c=merge(a,{titleVisibility:'inherit'});assert.equal(c?.titleVisibility,'hide');
}
assert.equal(visibilityAttributes(undefined)['data-hide-title'],undefined);
assert.equal(ctaVariables(undefined)['--cta-bg'],undefined);
console.log('OK: visibilità indipendente dagli override colore, eredità/ripristino, Default/Wide e colori CTA; impostazioni assenti non nascondono contenuti.');
