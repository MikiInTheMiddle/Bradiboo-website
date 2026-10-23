import {getPayload} from 'payload';
import config from '../payload.config';
import {mkdir,writeFile} from 'node:fs/promises';
const payload=await getPayload({config});
try {
 const page=(await payload.find({collection:'pages',where:{path:{equals:'/shop'}},depth:0,limit:1})).docs[0];
 if(!page)throw new Error('Pagina Shop non trovata');
 await mkdir('work/backups',{recursive:true});
 await writeFile(`work/backups/shop-landing-before-alignment-${Date.now()}.json`,JSON.stringify(page,null,2));
 let banner=(await payload.find({collection:'media',where:{filename:{equals:'bradiboxes.png'}},depth:0,limit:1})).docs[0];
 if(!banner)banner=await payload.create({collection:'media',data:{alt:'Le Bradibox: un libro e un gioco in una scatola'},filePath:'work/legacy-frontend/src/assets/images/headers/bradiboxes.png'});
 const blocks:any[]=(page.blocks||[]).map(b=>({...b}));
 const hero=blocks.find(b=>b.blockType==='hero');
 if(hero)Object.assign(hero,{showBadge:false,showMedia:true,mediaSource:'upload',media:banner.id,contentLayout:'text-first',backgroundMode:'own',backgroundColor:'yellow',backgroundOpacity:100,titleColor:'ink',textColor:'ink',noteColor:'ink',headingLevel:'h1',titleSize:'h1',presentation:'cards'});
 const intro=blocks.find(b=>b.blockType==='intro');
 if(intro)Object.assign(intro,{backgroundMode:'own',backgroundColor:'white',backgroundOpacity:100,titleAlign:'center',noteAlign:'center',titleSize:'h3',noteSize:'medium'});
 const product=blocks.find(b=>b.blockType==='headlessProduct'&&b.section==='card');
 if(product)Object.assign(product,{cardLayout:'grid',titleAlign:'center',headingLevel:'h2',titleSize:'h3',cardAppearance:{...product.cardAppearance,composition:'stacked',cardFunction:'content',enabled:true,backgroundMode:'color',backgroundColor:'white',backgroundOpacity:100,textColor:'ink',titleVisibility:'show',descriptionVisibility:'show',mediaVisibility:'show',ctaVisibility:'show',badgeMode:'inherit'}});
 const cta=blocks.find(b=>b.blockType==='cta');
 if(cta) {
  Object.assign(cta,{backgroundMode:'own',backgroundColor:'white',backgroundOpacity:100,titleAlign:'center',noteAlign:'center',titleSize:'h3',ctaAlign:'center',cardLayout:'compact'});
  cta.items=(cta.items||[]).map((item:any)=>({...item,appearance:{...item.appearance,enabled:true,backgroundMode:'transparent',titleVisibility:'hide',descriptionVisibility:'hide',mediaVisibility:'hide',ctaVisibility:'show',ctaAlign:'center',ctaBackgroundColor:'purple',ctaTextColor:'white',ctaHoverBackgroundColor:'ink',ctaHoverTextColor:'white'}}));
 }
 await payload.update({collection:'pages',id:page.id,data:{blocks,pageBackgroundColor:(!page.pageBackgroundColor||page.pageBackgroundColor==='transparent')?'#f0e8ff':page.pageBackgroundColor,_status:page._status}});
 console.log('Shop allineato; blocchi conservati:',blocks.length,'banner recuperato:',banner.id);
}finally{await payload.destroy();}
