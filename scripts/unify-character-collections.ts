import {getPayload} from 'payload';import config from '../payload.config';import {mkdir,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const p=await getPayload({config});try{
 const pages=(await p.find({collection:'pages',limit:200,depth:0})).docs;
 const characters=(await p.find({collection:'characters',limit:100,depth:0})).docs;
 await mkdir('work/backups',{recursive:true});await writeFile(`work/backups/unify-character-collections-${Date.now()}.json`,JSON.stringify(pages,null,2));
 for(const page of pages){let changed=false;
 const blocks=page.blocks!.map((original:any)=>{
  const b=structuredClone(original);const friends=b.blockType==='characterFriends';
  const home=page.path==='/'&&b.blockType==='collection'&&b.mode==='characters';
  const group=['grid','rail'].includes(b.blockType)&&b.items?.length===characters.length&&b.items.every((i:any)=>characters.some(c=>i.href===`/braditriboo/${c.slug}`));
  if(!friends&&!home&&!group)return b;changed=true;
  b.blockType='collection';b.mode='manual';
  b.contentSelection={enabled:true,by:'characters',charactersMode:friends?'friends':'all',excludeCurrent:friends,limit:100,sort:friends?'newest':'oldest'};
  b.cardAppearance={...b.cardAppearance,cardFunction:b.cardAppearance?.cardFunction||'content',descriptionVisibility:b.cardAppearance?.descriptionVisibility||'hide'};
  const localRows=home?b.cast:group?b.items:[];
  const overrides=[...(b.cardOverrides||[])];
  for(const row of localRows||[]){const key=home?(typeof row.character==='object'?row.character.id:row.character):characters.find(c=>row.href===`/braditriboo/${c.slug}`)?.id;if(!key)continue;
   if(overrides.some((o:any)=>String(typeof o.character==='object'?o.character.id:o.character)===String(key)))continue;
   const {source,sourceMode,sourceCategory,content,character,href,label,description,image,...settings}=row;
   overrides.push({...settings,character:key,...(row.overrideContent?{cardTitle:row.cardTitle||label,cardDescription:row.cardDescription??description}:{}),...(row.overrideImage?{cardImage:row.cardImage||image}:{})});
  }
  b.cardOverrides=overrides;delete b.items;delete b.cast;
  return b;
 });
 if(changed){const saved=await p.update({collection:'pages',id:page.id,data:{blocks:blocks as any},depth:0});assert.deepEqual(saved.blocks!.map(b=>b.id),page.blocks!.map(b=>b.id));console.log(page.path,'→ raccolta comune personaggi');}
 }
}finally{await p.destroy();}
