import {getPayload} from 'payload';
import config from '../payload.config';
import {writeFile} from 'node:fs/promises';
import {sourceCard,inheritCard} from '../lib/card-source';
const p=await getPayload({config});
const image=(v:any)=>v&&typeof v==='object'?v.url:undefined;
try{
 const pages=(await p.find({collection:'pages',limit:1000,depth:0})).docs;
 const contents=(await p.find({collection:'contents',limit:1000,depth:1})).docs;
 const containers=(await p.find({collection:'production-containers',limit:1000,depth:1})).docs;
 const media=(await p.find({collection:'media',limit:1000,depth:0})).docs;
 const mediaID=(url?:string)=>media.find(m=>m.url===url)?.id;
 await writeFile(`work/backups/card-page-sources-${Date.now()}.json`,JSON.stringify(pages,null,2));
 for(const page of pages){let changed=false;
  const blocks=structuredClone(page.blocks) as any[];
  async function visit(value:any):Promise<void>{
   if(!value||typeof value!=='object')return;
   if(value.source?.relationTo==='pages'){
    const id=typeof value.source.value==='object'?value.source.value.id:value.source.value;
    const old=await p.findByID({collection:'pages',id,depth:2});
    const target=containers.find(c=>c.url===old.path)||contents.find(c=>c.url===old.path);
    if(!target)throw new Error(`Sorgente editoriale non trovata: ${old.path}`);
    const relation=containers.some(c=>c===target)?'production-containers':'contents';
    const oldSource=sourceCard('pages',old)!;const newSource=sourceCard(relation,target)!;
    const local={label:value.label,description:value.description||undefined,href:value.href||'',ctaLabel:value.ctaLabel||undefined,image:media.find(m=>m.id===value.image)?.url||undefined,mobileImage:media.find(m=>m.id===value.mobileImage)?.url||undefined};
    const rendered=inheritCard(oldSource,local,value);
    value.source={relationTo:relation,value:target.id};value.sourceCategory=relation==='production-containers'?'container':(target as any).recordType==='episode'?'episode':'production';
    if(['label','description','href','ctaLabel'].some(k=>(rendered as any)[k]!== (newSource as any)[k])){
     value.overrideContent=true;value.label=rendered.label;value.description=rendered.description||null;value.href=rendered.href;value.ctaLabel=rendered.ctaLabel||null;
    }
    if(rendered.image&&rendered.image!==newSource.image){const id=mediaID(rendered.image);if(!id)throw new Error('Media locale mancante');value.image=id;value.overrideImage=true;}
    if(rendered.mobileImage&&rendered.mobileImage!==newSource.mobileImage){const id=mediaID(rendered.mobileImage);if(!id)throw new Error('Media mobile mancante');value.mobileImage=id;}
    if(value.focalX==null&&oldSource.focalX!=null)value.focalX=oldSource.focalX;
    if(value.focalY==null&&oldSource.focalY!=null)value.focalY=oldSource.focalY;
    changed=true;console.log(page.path,old.path,'→',relation,target.id,'; contenuti/stili locali conservati');
   }
   for(const [key,child] of Object.entries(value))if(key!=='source'&&child&&typeof child==='object'){
    if(Array.isArray(child))for(const row of child)await visit(row);else await visit(child);
   }
  }
  await visit(blocks);
  if(changed)await p.update({collection:'pages',id:page.id,data:{blocks}});
 }
}finally{await p.destroy();}
