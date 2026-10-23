import assert from 'node:assert/strict';
import {getPayload} from 'payload';
import config from '../payload.config';
const payload=await getPayload({config});
try {
 const page=(await payload.find({collection:'pages',where:{path:{equals:'/'}},depth:0,limit:1})).docs[0];
 const blocks=structuredClone(page.blocks) as any[];
 const hero=blocks.find(b=>b.blockType==='hero');assert.ok(hero);
 hero.focalX=0;hero.focalY=100;hero.wideOverlayOpacity=0;hero.presentation='wide';hero.backgroundMode='page';hero.backgroundOpacity=0;hero.backgroundBlur=9;hero.showText=true;hero.showBadge=true;hero.badge='Etichetta autonoma';hero.badgeBackgroundColor='#f9b400';
 const featured=blocks.find(b=>b.blockType==='featured');assert.ok(featured?.cards?.length);
 featured.presentation='wide';const slide=featured.cards[0];
 slide.slideBadge='Etichetta della slide';slide.hideBadge=false;
 slide.wideAppearance={...slide.wideAppearance,enabled:false,badgeBackgroundColor:'#7235e8',badgeTextColor:'#ffffff'};
 slide.appearance={...slide.appearance,composition:'overlay',overlayOpacity:0,backgroundMode:'color',enabled:true,backgroundColor:'#123456',backgroundOpacity:35,backgroundBlur:4,badgeMode:'custom',badgeText:'Etichetta card',badgeBackgroundColor:'#f9b400'};
 const saved=await payload.update({collection:'pages',id:page.id,depth:0,data:{blocks}});
 const first=(saved.blocks as any[]).find(b=>b.blockType==='featured');
 assert.equal(first.cards[0].slideBadge,'Etichetta della slide');assert.equal(first.cards[0].wideAppearance.badgeBackgroundColor,'#7235e8');
 first.presentation='cards';
 const toggled=await payload.update({collection:'pages',id:page.id,depth:0,data:{blocks:saved.blocks}});
 const read=(toggled.blocks as any[]).find(b=>b.blockType==='featured');
 assert.equal(read.cards[0].appearance.backgroundMode,'color');assert.equal(read.cards[0].appearance.backgroundOpacity,35);
 assert.equal(read.cards[0].wideAppearance.badgeBackgroundColor,'#7235e8');
 const readHero=(toggled.blocks as any[]).find(b=>b.blockType==='hero');
 assert.equal(readHero.focalX,0);assert.equal(readHero.focalY,100);assert.equal(readHero.wideOverlayOpacity,0);assert.equal(read.cards[0].appearance.overlayOpacity,0);
 assert.equal(readHero.backgroundOpacity,0);assert.equal(readHero.backgroundBlur,9);assert.equal(readHero.badge,'Etichetta autonoma');
 console.log('OK: standalone Wide, independent slide label, Default/Wide toggle preserves both style sets, zero opacity and blur persist. Temporary DB only.');
}finally{await payload.destroy();}
