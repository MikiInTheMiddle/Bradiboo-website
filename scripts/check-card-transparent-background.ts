import assert from 'node:assert/strict';
import {mergeCardAppearance} from '../lib/card-appearance';
import {cardSurfaceStyle,cardHoverAttributes} from '../lib/card-style';
import {characterIdentityAppearance} from '../lib/character-card-identity';
const identity=characterIdentityAppearance({enabled:true,backgroundColor:'#F0C2F0'});
const legacy=cardSurfaceStyle(mergeCardAppearance(identity,{enabled:true,backgroundColor:'transparent'}));
for(const composition of ['stacked','overlay'] as const){
 const card=mergeCardAppearance(identity,{enabled:true,backgroundColor:'#ffffff'}, {backgroundMode:'transparent',composition});
 const style=cardSurfaceStyle(card);
 assert.equal(style?.background,legacy?.background,'Explicit transparency matches legacy Home value, overriding inherited white');
 assert.equal(style?.['--card-hover-background' as keyof typeof style],legacy?.['--card-hover-background' as keyof typeof legacy],'Character hover remains inherited');
 assert.equal(cardHoverAttributes(card)['data-card-hover'],'custom');
 const local=cardSurfaceStyle(mergeCardAppearance(card,{hoverMode:'custom',hoverBackgroundColor:'#123456'}));
 assert.match(String(local?.['--card-hover-background' as keyof typeof local]),/#123456/);
}
assert.equal(cardSurfaceStyle({enabled:true,backgroundColor:'#ffffff'})?.background,'color-mix(in srgb, #ffffff 100%, transparent)');
assert.equal(cardSurfaceStyle({enabled:true})?.background,undefined);
assert.equal(cardSurfaceStyle({enabled:false,backgroundMode:'transparent'}),undefined);
console.log('OK: transparent Default/Wide matches legacy Home; inherited and local hover preserved; default backgrounds unchanged.');
