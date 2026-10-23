import {getPayload} from 'payload';
import config from '../payload.config';
import {writeFile,mkdir,access} from 'node:fs/promises';
import {profileEntries} from '../lib/profile-model';
const marker=`work/backups/character-profile-${process.env.DATABASE_URL?.includes('/private/tmp/')?'test':'live'}.done`;
if(await access(marker).then(()=>true,()=>false))throw new Error('Migrazione già eseguita: non ripristinare card rimosse intenzionalmente.');
const p=await getPayload({config});
try{
 const pages=(await p.find({collection:'pages',limit:1000,depth:0})).docs;
 await mkdir('work/backups',{recursive:true});
 await writeFile(`work/backups/character-profile-${Date.now()}.json`,JSON.stringify(pages,null,2));
 for(const page of pages){let changed=false;
  const blocks=page.blocks?.map(b=>{
   if(b.blockType!=='characterProfile')return b;
   if(b.cards?.length)return b;
   changed=true;
   return {...b,cards:profileEntries.map(f=>({sourceMode:'profile' as const,profileField:f.key as any,label:f.label})),overrideMedia:b.overrideMedia??Boolean(b.media||b.youtubeURL)};
  });
  if(changed){await p.update({collection:'pages',id:page.id,data:{blocks}});console.log(page.path,'→ informazioni collegate');}
 }
 await writeFile(marker,new Date().toISOString());
}finally{await p.destroy();}
