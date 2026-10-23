import {getPayload} from 'payload';
import config from '../payload.config';
const payload=await getPayload({config});
try{
 const page=(await payload.find({collection:'pages',where:{path:{equals:'/'}},depth:0,limit:1})).docs[0];
 if(!page)throw new Error('Home missing');
 const blocks=structuredClone(page.blocks) as any[];
 const hero=blocks.find(b=>b.blockType==='hero');
 if(!hero?.backgroundImage)throw new Error('Hero image missing');
 hero.presentation='wide';hero.backgroundMode='image';
 if(hero.backgroundOpacity===0)hero.backgroundOpacity=100;
 const saved=await payload.update({collection:'pages',id:page.id,depth:0,data:{blocks}});
 const result=(saved.blocks as any[]).find(b=>b.blockType==='hero');
 if(result.presentation!=='wide'||result.backgroundOpacity!==100||!result.backgroundImage)throw new Error('Hero repair verification failed');
 console.log('Home Hero: Wide, existing image retained, opacity 100%. Other blocks retained.');
}finally{await payload.destroy();}
