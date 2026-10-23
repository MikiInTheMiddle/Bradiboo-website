import { getPayload } from 'payload';
import config from '../payload.config';
import profiles from '../lib/character-bible.json';
const payload=await getPayload({config});
for(const profile of profiles){
 const result=await payload.find({collection:'characters',where:{slug:{equals:profile.slug}},limit:1,depth:0});
 const character=result.docs[0];if(!character)continue;
 // Import once; later editorial changes are preserved.
 if(!character.sourceReference)await payload.update({collection:'characters',id:character.id,data:profile});
 const pages=await payload.find({collection:'pages',where:{character:{equals:character.id}},limit:100,depth:0});
 for(const page of pages.docs){
  let blocks=(page.blocks||[]).map(block=>{
   if(block.label==='Meet character')return {blockType:'characterProfile' as const,label:'Scheda personaggio',title:`Conosci ${character.name}`};
   if(block.label==='Other characters')return {blockType:'characterFriends' as const,label:'Altri personaggi',title:'Incontra gli altri'};
   if(block.label==='Character hero'&&block.title?.includes('identità + character media'))return {...block,title:character.name,note:profile.tagline,showBadge:true,badge:profile.identity};
   return block;
  });
  if(!blocks.some(b=>b.blockType==='characterMoments')){
   const index=blocks.findIndex(b=>b.label==='Character formats');
   blocks.splice(index>=0?index+1:Math.min(3,blocks.length),0,{blockType:'characterMoments',label:'Momenti del personaggio',title:`Momenti con ${character.name}`,draft:true});
  }
  await payload.update({collection:'pages',id:page.id,data:{blocks},draft:page._status==='draft'});
 }
}
console.log('Sei schede allineate alla bible; gallery vuote in bozza, nessun audio inventato.');
await payload.destroy();
