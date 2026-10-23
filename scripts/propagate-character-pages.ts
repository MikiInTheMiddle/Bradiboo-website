import {getPayload} from 'payload';
import config from '../payload.config';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const p=await getPayload({config});
try{
 const pages=(await p.find({collection:'pages',limit:200,depth:0})).docs;
 const chars=(await p.find({collection:'characters',limit:100,depth:0})).docs;
 const reference=pages.find(x=>x.path==='/braditriboo/bradford')!;
 const profile=reference.blocks!.find(b=>b.blockType==='characterProfile') as any;
 const music=profile.cards.find((c:any)=>c.profileField==='music');
 const friends=reference.blocks!.find(b=>b.blockType==='characterFriends') as any;
 await mkdir('work/backups',{recursive:true});
 const stamp=Date.now();
 await writeFile(`work/backups/character-propagation-${stamp}.json`,JSON.stringify(pages,null,2));
 const report:any[]=[];
 for(const page of pages){
  if(!page.character||page.id===reference.id)continue;
  const c=chars.find(c=>c.id===page.character);if(!c)throw Error('Personaggio assente');
  const changes:string[]=[];
  const blocks=page.blocks!.map((original:any)=>{
   const b=structuredClone(original);
   if(b.blockType==='hero'){
    Object.assign(b,{presentation:'wide',titleSize:'h1',titleWeight:'700',showBadge:false,wideOverlayOpacity:0});
    if(!b.backgroundImage&&c.portrait){b.backgroundMode='image';b.backgroundImage=c.portrait;b.backgroundOpacity=100;}
    changes.push('hero Wide con ritratto proprio');
   }
   if(b.blockType==='characterProfile'){
    b.cardLayout='compact';b.showMedia=true;
    if(!b.cardAppearance?.enabled)b.cardAppearance={...profile.cardAppearance,textColor:'ink',titleColor:'ink'};
    // Existing local media/content overrides remain intact.
    if(!b.overrideMedia)b.overrideMedia=false;
    if(b.title===`Conosci ${c.name}`&&c.tagline)b.title=`“${c.tagline}”`;
    b.titleAlign='center';
    b.cards=b.cards.map((row:any)=>{
     if(row.profileField!=='music'||row.overrideContent||row.cardFunction)return row;
     const sound=structuredClone(music);sound.id=row.id;sound.source={relationTo:'characters',value:c.id};
     // Keep the existing page palette; the reference's white CTA is specific to its dark background.
     sound.appearance.ctaTextColor=row.appearance?.ctaTextColor||'ink';
     return sound;
    });changes.push('scheda compatta, media e sound ereditati');
   }
   if(b.blockType==='dynamic'&&b.label==='Watch character'&&!b.contentSelection?.enabled){
    b.contentSelection={enabled:true,by:'character',character:c.id,kind:'episode'};
    b.title=`Gli episodi con ${c.name}`;changes.push('episodi filtrati sul personaggio');
   }
   if(b.blockType==='rail'&&b.label==='Character formats'&&!b.contentSelection?.enabled){
    b.contentSelection={enabled:true,by:'character',character:c.id,kind:'production'};
    changes.push('produzioni collegate al personaggio');
   }
   if(b.blockType==='characterMoments'){
    if(!b.galleryPhotos?.length&&!b.images?.length){b.gallerySourceMode='page';b.gallerySelectionMode='all';}
    b.galleryLayout='moodboard';b.titleAlign='center';b.draft=false;
    changes.push('galleria moodboard dalla scheda centrale');
   }
   if(b.blockType==='characterFriends'){
    b.eyebrowMode='hidden';
    b.cardAppearance={...friends.cardAppearance,...Object.fromEntries(Object.entries(b.cardAppearance||{}).filter(([,v])=>v!==null&&v!==undefined&&v!==false))};
    changes.push('altre card trasparenti e identità centrale');
   }
   return b;
  });
  const saved=await p.update({collection:'pages',id:page.id,data:{blocks:blocks as any},depth:0});
  assert.equal(saved.character,page.character);assert.equal(saved.blocks!.length,page.blocks!.length);
  assert.deepEqual(saved.blocks!.map(b=>b.id),page.blocks!.map(b=>b.id));
  report.push({page:page.path,changes,missingMusic:!c.musicAudio});
 }
 await writeFile(`work/backups/character-propagation-${stamp}-report.json`,JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
}finally{await p.destroy();}
