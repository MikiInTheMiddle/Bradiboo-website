import {getPayload} from 'payload';
import config from '../payload.config';
const payload=await getPayload({config});
try{
 const page=(await payload.find({collection:'pages',where:{path:{equals:'/'}},depth:0,limit:1})).docs[0];
 if(!page)throw new Error('Home not found');
 let changed=false;
 const blocks=page.blocks?.map(block=>{
  if(block.blockType!=='hero'||!block.backgroundImage||block.backgroundMode!=='own')return block;
  changed=true;return {...block,backgroundMode:'image' as const};
 });
 if(changed)await payload.update({collection:'pages',id:page.id,depth:0,data:{blocks,_status:page._status}});
 console.log(changed?'Home Hero: immagine già scelta usata come fondo pieno. Configurazione precedente conservata.':'Hero non modificata: nessuna conversione necessaria.');
}finally{await payload.destroy();}
