import {getPayload} from 'payload';
import config from '../payload.config';
import {mkdir,writeFile} from 'node:fs/promises';
import {randomBytes} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
const p=await getPayload({config});
try{
 const pages=(await p.find({collection:'pages',limit:200,depth:0})).docs as any[];
 const target=pages.find(x=>x.path==='/guarda/serie/bradiboo');
 const model=pages.find(x=>x.path==='/guarda/miniserie/che-giornata');
 const bites=pages.find(x=>x.path==='/guarda/format');
 if(!target||!model||!bites)throw Error('Missing reference page');
 await mkdir('work/backups',{recursive:true});
 await writeFile(`work/backups/bradiboo-series-page-${Date.now()}.json`,JSON.stringify(target,null,2));
 const id=()=>randomBytes(12).toString('hex');
 const clone=(b:any)=>{const n=structuredClone(b);const renew=(v:any)=>{if(!v||typeof v!=='object')return;if(Array.isArray(v)){v.forEach(renew);return;}if('id'in v)v.id=id();Object.values(v).forEach(renew);};renew(n);return n;};
 const styleKeys=['presentation','textColor','titleColor','headingLevel','titleSize','titleCustomSize','titleAlign','titleWeight','noteColor','noteSize','noteCustomSize','noteAlign','noteWeight','backgroundMode','backgroundColor','backgroundOpacity','backgroundBlur','cardLayout','ctaAlign'];
 const styled=(b:any,ref:any)=>{const n=structuredClone(b);for(const k of styleKeys)n[k]=ref[k];return n;};
 const hero=target.blocks.find((b:any)=>b.blockType==='hero');
 const story=target.blocks.find((b:any)=>b.blockType==='split');
 const introRef=model.blocks.find((b:any)=>b.blockType==='split');
 const synopsisRef=model.blocks.filter((b:any)=>b.blockType==='split')[1];
 const intro=clone(introRef);intro.title='';intro.note=hero.note;intro.label='Introduzione alla serie';intro.showMedia=false;intro.media=null;
 const blocks:any[]=[];
 for(const original of target.blocks){
  let b=structuredClone(original);
  if(b.blockType==='hero'){blocks.push(b);if(!target.blocks.some((x:any)=>x.label==='Introduzione alla serie'))blocks.push(intro);continue;}
  if(b.id===story.id)b=styled(b,synopsisRef);
  if(b.blockType==='episodes')b=styled(b,model.blocks.find((x:any)=>x.blockType==='episodes'));
  if(b.blockType==='collection'){
   b=styled(b,model.blocks.find((x:any)=>x.blockType==='collection'));
   b.cardAppearance={...b.cardAppearance,backgroundMode:b.cardAppearance?.backgroundMode||'transparent'};
  }
  blocks.push(b);
  if(b.blockType==='collection'&&!target.blocks.some((x:any)=>x.blockType==='gallery')){
   const gallery=clone(bites.blocks.find((x:any)=>x.blockType==='gallery'));gallery.gallerySourceMode='page';gallery.gallerySelectionMode='all';gallery.draft=false;blocks.push(gallery);
  }
 }
 if(!blocks.some(b=>b.title==='Vuoi guardare altro?')){
  const related=clone(bites.blocks.find((x:any)=>x.title==='Vuoi guardare altro?'));
  related.items=related.items.filter((x:any)=>!(x.source?.relationTo==='contents'&&Number(x.source.value)===8));
  const bitesLink=clone(model.blocks.find((x:any)=>x.title==='Vuoi guardare altro?').items.find((x:any)=>x.source?.relationTo==='production-containers'&&Number(x.source.value)===3));
  related.items.push(bitesLink);blocks.push(related);
 }
 const saved=await p.update({collection:'pages',id:target.id,data:{blocks}}) as any;
 if(!isDeepStrictEqual(saved.blocks.find((b:any)=>b.blockType==='hero'),hero))throw Error('Hero verification failed');
 console.log(JSON.stringify({path:saved.path,heroPreserved:true,blocks:saved.blocks.map((b:any)=>({type:b.blockType,title:b.title,draft:b.draft}))},null,2));
}finally{await p.destroy()}
