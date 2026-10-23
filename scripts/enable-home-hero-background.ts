import {getPayload} from 'payload';
import config from '../payload.config';
const payload=await getPayload({config});
try{
 const page=(await payload.find({collection:'pages',where:{path:{equals:'/'}},depth:0,limit:1})).docs[0];
 if(!page)throw new Error('Home non trovata');
 const hero:any=page.blocks?.[0];
 if(hero?.blockType!=='hero')throw new Error('Prima Hero non trovata');
 const ids=new Set<number>();
 for(const row of [hero,...(hero.heroImages||[])])for(const id of [row.backgroundImage,row.image,row.mobileImage])if(typeof id==='number')ids.add(id);
 for(const id of ids){const media=await payload.update({collection:'media',id,data:{}});console.log('Media',id,'colore inferiore:',media.bottomEdgeColor||'non disponibile');}
 await payload.update({collection:'pages',id:page.id,data:{heroBackground:true}});
 console.log('Home collegata alla Hero; fondi manuali e moduli conservati.');
}finally{await payload.destroy();}
