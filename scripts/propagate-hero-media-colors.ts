import {getPayload} from 'payload';
import config from '../payload.config';
const p=await getPayload({config});
try{
 const pages=await p.find({collection:'pages',limit:500,depth:0});
 const cache=new Map<number,any>();
 const media=async(id:number)=>{if(!cache.has(id))cache.set(id,await p.findByID({collection:'media',id,depth:0}));return cache.get(id);};
 const plans=new Map<number,Set<string>>();
 for(const page of pages.docs)for(const block of page.blocks||[]){
  if(block.blockType!=='hero')continue;
  for(const row of [block,...(block.heroImages||[])]){
   const desktop='backgroundImage' in row?row.backgroundImage:'image' in row?row.image:undefined;
   const mobile=row.mobileImage;
   if(typeof desktop!=='number'||typeof mobile!=='number')continue;
   const [a,b]=await Promise.all([media(desktop),media(mobile)]);
   if(a.hasHeroGradientEndColor||!b.hasHeroGradientEndColor||!/^#[0-9a-f]{6}$/i.test(b.heroGradientEndColor||''))continue;
   if(!plans.has(desktop))plans.set(desktop,new Set());plans.get(desktop)!.add(b.heroGradientEndColor);
  }
 }
 for(const [id,colors] of plans){if(colors.size!==1){console.log('Nessuna modifica per Media con abbinamenti discordanti:',id);continue;}
  const color=[...colors][0];await p.update({collection:'media',id,data:{hasHeroGradientEndColor:true,heroGradientEndColor:color}});console.log('Colore già definito sul mobile conservato anche nel Media principale:',id,color);
 }
}finally{await p.destroy();}
