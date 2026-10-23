import {getPayload} from 'payload';
import config from '../payload.config';
const payload=await getPayload({config});
try{
 const page=(await payload.find({collection:'pages',where:{path:{equals:'/'}},depth:0,limit:1})).docs[0];
 if(!page)throw new Error('Home not found');
 const blocks=page.blocks?.map(block=>block.blockType==='featured'?{...block,presentation:'wide' as const}:block);
 await payload.update({collection:'pages',id:page.id,depth:0,data:{blocks,_status:page._status}});
 console.log('Home: modalità Wide attivata sul solo blocco In primo piano. Contenuti, selezione e ordine conservati.');
}finally{await payload.destroy();}
