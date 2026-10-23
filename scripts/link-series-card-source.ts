import assert from 'node:assert/strict';
import {getPayload} from 'payload';
import config from '../payload.config';
import {inheritCard,sourceCard} from '../lib/card-source';
const p=await getPayload({config});
try{
 const home=(await p.find({collection:'pages',where:{path:{equals:'/'}},depth:0,limit:1})).docs[0];
 const source=(await p.find({collection:'pages',where:{path:{equals:'/guarda/serie'}},depth:0,limit:1,overrideAccess:false})).docs[0];assert.ok(source);
 const blocks=structuredClone(home.blocks) as any[];
 const grid=blocks.find(b=>b.blockType==='grid'&&b.items?.some((i:any)=>i.href==='/guarda/serie'));
 const item=grid.items.find((i:any)=>i.href==='/guarda/serie');
 item.sourceMode='linked';item.source={relationTo:'pages',value:source.id};item.overrideContent=false;item.overrideImage=false;
 const saved=await p.update({collection:'pages',id:home.id,data:{blocks},depth:0});
 const read=(saved.blocks as any[]).find(b=>b.id===grid.id).items.find((i:any)=>i.id===item.id);assert.equal(read.source.value,source.id);
 const doc=await p.findByID({collection:'pages',id:source.id,depth:2,overrideAccess:false});
 const card=inheritCard(sourceCard('pages',doc),{label:read.label,href:read.href,appearance:read.appearance},read);assert.ok(card.image?.includes('deck-2026-serie'));
 assert.deepEqual(read.appearance,item.appearance);
 console.log('OK: Serie card linked to its page; image inherited from source media, local styles and stored manual values retained.');
}finally{await p.destroy();}
