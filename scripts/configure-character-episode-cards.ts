import {getPayload} from 'payload';import config from '../payload.config';import {writeFile} from 'node:fs/promises';
const p=await getPayload({config});try{
 const pages=(await p.find({collection:'pages',limit:200,depth:0})).docs.filter(p=>p.character);
 await writeFile(`work/backups/episode-card-functions-${Date.now()}.json`,JSON.stringify(pages,null,2));
 for(const page of pages){let changed=false;const blocks=page.blocks!.map(b=>{if(b.blockType!=='collection'||!b.contentSelection?.enabled||b.contentSelection.kind!=='episode')return b;changed=true;return {...b,cardAppearance:{...b.cardAppearance,cardFunction:b.cardAppearance?.cardFunction||'video',composition:b.cardAppearance?.composition&&b.cardAppearance.composition!=='inherit'?b.cardAppearance.composition:'half'}};});if(changed){await p.update({collection:'pages',id:page.id,data:{blocks:blocks as any}});console.log(page.path,'→ episodi: funzione Video, presentazione Half (override esistenti mantenuti)');}}
}finally{await p.destroy();}
