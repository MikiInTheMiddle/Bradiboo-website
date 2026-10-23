import {getPayload} from 'payload';import config from '../payload.config';import {mkdir,writeFile} from 'node:fs/promises';
const p=await getPayload({config});try{
 const pages=(await p.find({collection:'pages',limit:200,depth:0})).docs;const chars=(await p.find({collection:'characters',limit:100,depth:0})).docs;
 await mkdir('work/backups',{recursive:true});await writeFile(`work/backups/legacy-character-links-${Date.now()}.json`,JSON.stringify(pages,null,2));
 for(const page of pages){let count=0;const blocks=page.blocks!.map((original:any)=>{const b=structuredClone(original);for(const key of ['items','cards','panels'])if(Array.isArray(b[key]))b[key]=b[key].map((row:any)=>{if(row.source||row.sourceContent||row.sourceMode)return row;const c=chars.find(c=>row.href===`/braditriboo/${c.slug}`);if(!c)return row;count++;return {...row,sourceMode:'linked',source:{relationTo:'characters',value:c.id},overrideImage:Boolean(row.image),overrideContent:Boolean(row.description||row.label&&row.label!==c.name)};});return b;});
 if(count){await p.update({collection:'pages',id:page.id,data:{blocks:blocks as any}});console.log(page.path,count,'card collegate ai personaggi centrali');}
 }
}finally{await p.destroy();}
