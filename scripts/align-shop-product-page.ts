import {getPayload} from 'payload';
import config from '../payload.config';
import {mkdir,writeFile} from 'node:fs/promises';
const payload=await getPayload({config});
try {
 const pages=await payload.find({collection:'pages',where:{path:{in:['/shop','/shop/bradibox/dove-sei']}},depth:0,limit:10});
 await mkdir('work/backups',{recursive:true});
 await writeFile(`work/backups/shop-pages-before-alignment-${Date.now()}.json`,JSON.stringify(pages.docs,null,2));
 for(const page of pages.docs) {
  if(page.path!=='/shop/bradibox/dove-sei')continue;
  const blocks:any[]=(page.blocks||[]).map(b=>({...b}));
  const contact=blocks.find(b=>b.blockType==='cta'&&b.label==='Richiesta disponibilità');
  const action=contact?.items?.[0];
  for(const block of blocks)if(block.blockType==='headlessProduct') {
   if(['overview','back','specs'].includes(block.section)&&(!block.backgroundColor||block.backgroundColor==='transparent')){block.backgroundColor='white';block.backgroundMode='own';block.backgroundOpacity=100;}
   if(['overview','back','specs'].includes(block.section)&&block.backgroundMode==='own'&&block.backgroundColor==='white'&&block.backgroundOpacity===0)block.backgroundOpacity=100;
   if(block.section==='overview') {
    block.headingLevel='h1';
    block.showMedia=false;
    if(!block.ctaURL&&action?.href){block.ctaURL=action.href;block.ctaLabel=action.ctaLabel||action.label;}
   }
   if(block.section==='videos'){block.showMedia=true;block.showText=false;}
   if(block.section==='psico'){block.showMedia=true;block.contentLayout='media-first';}
   if(['book','game'].includes(block.section))block.showMedia=false;
   if(block.section==='specs'){block.showMedia=true;block.contentLayout='media-first';}
   if(block.section==='back')block.showText=false;
   if(['highlights','skills','specs'].includes(block.section))block.cardLayout='compact';
   if(['bookGallery','gameGallery'].includes(block.section))block.showText=false;
  }
  const overview=blocks.findIndex(b=>b.section==='overview'),highlights=blocks.findIndex(b=>b.section==='highlights');
  if(overview===0&&highlights===2){const [facts]=blocks.splice(highlights,1);blocks.splice(1,0,facts);}
  await payload.update({collection:'pages',id:page.id,data:{blocks,_status:page._status}});
  console.log('Allineata',page.path,'blocchi conservati:',blocks.length);
 }
}finally{await payload.destroy();}
