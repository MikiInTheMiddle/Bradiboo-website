import assert from 'node:assert/strict';
import {getPayload} from 'payload';
import config from '../payload.config';
import {registerHooks} from 'node:module';
registerHooks({resolve(specifier,context,next){return specifier==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:next(specifier,context);}});
const {getCMSPage}=await import('../lib/cms');
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw new Error('Usare solo una copia temporanea');
const payload=await getPayload({config});
try{
 const page=(await payload.find({collection:'pages',where:{path:{equals:'/'}},depth:0,limit:1})).docs[0];
 assert.ok(page.blocks);
 const blocks=structuredClone(page.blocks) as any[];const hero=blocks[0];
 assert.equal(hero.blockType,'hero');const selected=hero.backgroundImage||hero.heroImages?.[0]?.image;const id=typeof selected==='object'?selected?.id:selected;assert.equal(typeof id,'number');hero.backgroundImage=id;
 await payload.update({collection:'media',id,data:{hasHeroGradientEndColor:true,heroGradientEndColor:'#aabbcc'}});
 const media=await payload.findByID({collection:'media',id});assert.ok(media.bottomEdgeColor);
 hero.randomHero=false;hero.customEdgeColor=false;
 await payload.update({collection:'pages',id:page.id,data:{blocks,heroBackground:true,heroBackgroundMode:'gradient',customHeroBackground:false,customHeroBackgroundEnd:false,heroBackgroundEndColor:'#112233'}});
 assert.equal((await getCMSPage('/'))?.backgroundColor,`linear-gradient(to bottom, ${media.bottomEdgeColor} 0%, #aabbcc 100%)`);
 await payload.update({collection:'pages',id:page.id,data:{heroBackgroundMode:'solid'}});
 assert.equal((await getCMSPage('/'))?.backgroundColor,media.bottomEdgeColor);
 await payload.update({collection:'pages',id:page.id,data:{heroBackgroundMode:'gradient',customHeroBackgroundEnd:true}});
 assert.equal((await getCMSPage('/'))?.backgroundColor,`linear-gradient(to bottom, ${media.bottomEdgeColor} 0%, #112233 100%)`);
 await payload.update({collection:'media',id,data:{hasHeroGradientEndColor:false}});
 await payload.update({collection:'pages',id:page.id,data:{customHeroBackgroundEnd:false}});
 assert.equal((await getCMSPage('/'))?.backgroundColor,`linear-gradient(to bottom, ${media.bottomEdgeColor} 0%, #112233 100%)`);
 assert.equal((await payload.findByID({collection:'media',id})).heroGradientEndColor,'#aabbcc');
 console.log('OK: Media porta finale alla Hero; pagina uniforme usa colore iniziale; override/fallback e disattivazione conservano valori.');
}finally{await payload.destroy();}
