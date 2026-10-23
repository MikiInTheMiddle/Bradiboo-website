import assert from 'node:assert/strict';import {getPayload} from 'payload';import config from '../payload.config';import {registerHooks} from 'node:module';
import {applyCardFunction} from '../lib/card-function';import {inheritCard,sourceCard} from '../lib/card-source';
registerHooks({resolve(s,c,n){return s==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:n(s,c);}});const {getCMSPage}=await import('../lib/cms');
const original={label:'Old',href:'/shop',cardAudio:{url:'/old.wav',ctaMode:'both' as const}};assert.equal(applyCardFunction(original,{}),original);assert.equal(applyCardFunction(original,{cardFunction:'content'}).cardAudio,undefined);
const base=sourceCard('characters',{name:'Bradford',slug:'bradford',musicAudio:{mimeType:'audio/wav',url:'/music.wav'},voiceClip:{mimeType:'audio/wav',url:'/voice.wav'}})!;
for(const [track,url] of [['music','/music.wav'],['voice','/voice.wav']])assert.equal(inheritCard(base,{label:'Nome libero',href:''},{sourceMode:'linked',audioSettings:{mode:'inherit',track}}).cardAudio?.url,url);
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw Error('Solo copia DB');const p=await getPayload({config});try{
 const page=(await p.find({collection:'pages',where:{path:{equals:'/braditriboo/bradford'}},depth:0})).docs[0];const characterID=typeof page.character==='object'?page.character!.id:page.character!;
 const media=(await p.find({collection:'media',where:{mimeType:{contains:'audio/'}},depth:0})).docs[0];await p.update({collection:'characters',id:characterID,data:{musicAudio:media.id}});
 const card:any={sourceMode:'linked',source:{relationTo:'characters',value:characterID},cardFunction:'audio',label:'Nome libero',audioSettings:{mode:'inherit',track:'music'}};
 const block:any={blockType:'collection',title:'Test',label:'Test',mode:'manual',cards:[card]};
 const save=async()=>p.update({collection:'pages',id:page.id,data:{blocks:[block]}});const read=async()=>(await getCMSPage(page.path))!.blocks[0].items![0];await save();let item=await read();assert.equal(item.cardAudio?.url,media.url);assert.equal(item.cardAudio?.ctaMode,'audio');assert.equal(item.cardFunction,'audio');
 card.cardFunction='content';await save();assert.equal((await read()).cardAudio,undefined);
 card.cardFunction='video';card.videoSettings={mode:'youtube',url:'https://www.youtube.com/watch?v=dQw4w9WgXcQ'};await save();item=await read();assert.equal(item.cardFunction,'video');assert.ok(item.youtube?.includes('youtube-nocookie.com/embed/'));assert.equal(item.cardAudio,undefined);
 block.presentation='wide';await save();assert.equal((await read()).cardFunction,'video');
 console.log('OK: comportamento precedente conservato, funzione separata, audio musica/voce dal personaggio per nome libero, contenuto senza player, video locale/YouTube ereditabile e Wide.');
}finally{await p.destroy();}
