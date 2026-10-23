import fs from 'node:fs';
import {getPayload} from 'payload';
import config from '../payload.config';
const payload=await getPayload({config});
const product=JSON.parse(fs.readFileSync('work/shop-products.json','utf8')).find((p:{slug:string})=>p.slug==='dove-sei');
const page=(await payload.find({collection:'pages',where:{path:{equals:'/shop/bradibox/dove-sei'}},limit:1,depth:0})).docs[0];
if(!page.blocks?.some(b=>b.label==='Video della Bradibox')){
 const videos=[{label:'Presentazione della Bradibox',href:product.visual.main_video.remote_medias.landscape},{label:'Approfondimento psicopedagogico',href:product.psico_details.video.remote_medias.portrait}].filter(v=>v.href);
 const blocks=[...(page.blocks||[])];blocks.splice(1,0,{blockType:'cta',label:'Video della Bradibox',title:'Guarda la Bradibox',items:videos,draft:false});
 await payload.update({collection:'pages',id:page.id,data:{blocks}});
}
await payload.destroy();
