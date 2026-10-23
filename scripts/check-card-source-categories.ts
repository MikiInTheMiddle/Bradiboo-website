import assert from 'node:assert/strict';
import {getPayload} from 'payload';
import config from '../payload.config';
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw new Error('Solo DB temporaneo');
const p=await getPayload({config});
try{
 const home=(await p.find({collection:'pages',where:{path:{equals:'/'}},depth:0})).docs[0];
 const blocks=structuredClone(home.blocks) as any[];
 const card=blocks.find(b=>b.blockType==='featured').cards[0];
 card.sourceMode='linked';card.sourceCategory='media';card.source={relationTo:'media',value:47};
 await p.update({collection:'pages',id:home.id,data:{blocks}});
 const saved=await p.findByID({collection:'pages',id:home.id,depth:1});
 const row=(saved.blocks as any[]).find(b=>b.blockType==='featured').cards[0];
 assert.equal(row.sourceCategory,'media');assert.equal(row.source.relationTo,'media');assert.ok(row.source.value.url);
 card.sourceCategory='episode';card.source={relationTo:'contents',value:11};
 await p.update({collection:'pages',id:home.id,data:{blocks}});
 const episode=await p.findByID({collection:'pages',id:home.id,depth:0});
 assert.equal((episode.blocks as any[]).find(b=>b.blockType==='featured').cards[0].sourceCategory,'episode');
 card.sourceCategory='production';
 await p.update({collection:'pages',id:home.id,data:{blocks}});
 const actual=await p.findByID({collection:'pages',id:home.id,depth:0});
 assert.equal((actual.blocks as any[]).find(b=>b.blockType==='featured').cards[0].sourceCategory,'episode','La categoria di ricerca virtuale non può alterare la tipologia reale della sorgente');
 console.log('OK: Media ed episodio salvati e riletti con categoria ricavata; categoria ricavata dalla scheda senza duplicare o alterare la sua tipologia.');
}finally{await p.destroy();}
