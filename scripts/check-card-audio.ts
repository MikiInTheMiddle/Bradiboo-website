import assert from 'node:assert/strict';
import {getPayload} from 'payload';import {registerHooks} from 'node:module';import config from '../payload.config';
import {sourceAudio,resolveCardAudio} from '../lib/card-audio';import {profileCard} from '../lib/profile-model';
registerHooks({resolve(s,c,n){return s==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:n(s,c);}});
const {getCMSPage}=await import('../lib/cms');
assert.equal(resolveCardAudio({url:'/base.wav'},{mode:'none'}),undefined);
assert.equal(resolveCardAudio({url:'/base.wav'},{mode:'upload'}),undefined);
assert.equal(resolveCardAudio({url:'/base.wav'},{mode:'upload',file:{mimeType:'image/png',url:'/no.png'}}),undefined);
assert.deepEqual(resolveCardAudio({url:'/base.wav'},{mode:'inherit',autoplay:false,loop:true,ctaMode:'audio'}),{url:'/base.wav',autoplay:false,loop:true,ctaMode:'audio',label:undefined});
assert.equal(sourceAudio({cardAudio:{url:'/music.wav',mimeType:'audio/wav'}})?.url,'/music.wav');
assert.equal(profileCard({music:'Lo-fi',musicAudio:{url:'/music.wav',mimeType:'audio/wav'}},'music')?.cardAudio?.url,'/music.wav');
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw Error('Solo copia DB');
const p=await getPayload({config});try{
 const audio=(await p.find({collection:'media',where:{mimeType:{contains:'audio/'}},depth:0})).docs[0];assert.ok(audio);
 const page=(await p.find({collection:'pages',where:{path:{equals:'/braditriboo/bradford'}},depth:0})).docs[0];
 const characterID=typeof page.character==='object'?page.character!.id:page.character!;
 await p.update({collection:'characters',id:characterID,data:{musicAudio:audio.id,cardAudio:audio.id}});
 for(const presentation of ['cards','wide']){
  const b:any={blockType:'characterProfile',title:'Audio test',label:'Audio test',presentation,cards:[{label:'Musica',sourceMode:'profile',profileField:'music',audioSettings:{mode:'inherit',ctaMode:'audio',autoplay:true,loop:true}}]};
  await p.update({collection:'pages',id:page.id,data:{blocks:[b]}});
  let rendered=(await getCMSPage(page.path))!.blocks[0];assert.equal(rendered.items?.[0].cardAudio?.url,audio.url);assert.equal(rendered.items?.[0].cardAudio?.ctaMode,'audio');assert.equal(rendered.items?.[0].cardAudio?.autoplay,true);
  b.cards[0].audioSettings.mode='none';await p.update({collection:'pages',id:page.id,data:{blocks:[b]}});rendered=(await getCMSPage(page.path))!.blocks[0];assert.equal(rendered.items?.[0].cardAudio,undefined);
 }
 const b:any={blockType:'collection',title:'Locale',label:'Locale',mode:'manual',cards:[{label:'Solo Play',sourceMode:'manual',href:'/shop',audioSettings:{mode:'upload',file:audio.id,ctaMode:'audio',loop:true}}]};
 await p.update({collection:'pages',id:page.id,data:{blocks:[b]}});const item=(await getCMSPage(page.path))!.blocks[0].items![0];assert.equal(item.cardAudio?.url,audio.url);assert.equal(item.cardAudio?.loop,true);assert.equal(item.href,'/shop');
 console.log('OK: audio ereditato/locale/nessuno, override vuoto, MIME, musica distinta dalla voce, Default/Wide e CTA solo audio conservando la destinazione.');
}finally{await p.destroy();}
