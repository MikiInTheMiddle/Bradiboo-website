import assert from 'node:assert/strict';
import {getPayload} from 'payload';
import config from '../payload.config';
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw new Error('Usare solo una copia temporanea del database');
const payload=await getPayload({config});
try{
 const page=(await payload.find({collection:'pages',where:{path:{equals:'/'}},depth:0,limit:1})).docs[0];
 assert.ok(page.blocks);
 const blocks=structuredClone(page.blocks) as any[];
 const hero=blocks[0];
 hero.customEdgeColor=true;hero.edgeColor='#123456';
 if(hero.heroImages?.[0]){hero.heroImages[0].customEdgeColor=true;hero.heroImages[0].edgeColor='#654321';}
 await payload.update({collection:'pages',id:page.id,data:{blocks,heroBackground:true,customHeroBackground:true,heroBackgroundColor:'#abcdef'}});
 await payload.update({collection:'pages',id:page.id,data:{heroBackground:false,customHeroBackground:false}});
 const saved=await payload.findByID({collection:'pages',id:page.id,depth:0});
 assert.ok(saved.blocks);
 assert.equal(saved.heroBackground,false);assert.equal(saved.heroBackgroundColor,'#abcdef');
 assert.equal(saved.pageBackgroundColor,page.pageBackgroundColor);assert.equal(saved.pageBackgroundImage,page.pageBackgroundImage);
 assert.equal((saved.blocks[0] as any).edgeColor,'#123456');
 assert.deepEqual(saved.blocks.slice(1),page.blocks.slice(1));
 if(hero.heroImages?.[0])assert.equal((saved.blocks[0] as any).heroImages[0].edgeColor,'#654321');
 console.log('OK: salvataggio override e disattivazione collegamento conservano colori manuali, immagini, set e altri moduli.');
}finally{await payload.destroy();}
