import {getPayload} from 'payload';
import config from '../payload.config';
import {mkdir,writeFile} from 'node:fs/promises';
const p=await getPayload({config});
try{
 const home=(await p.find({collection:'pages',where:{path:{equals:'/'}},depth:0,limit:1})).docs[0];if(!home?.blocks)throw new Error('Home non trovata');
 const beforeCharacters=(await p.find({collection:'characters',limit:100,depth:0})).docs;
 await mkdir('work/backups',{recursive:true});await writeFile(`work/backups/character-card-identity-${Date.now()}.json`,JSON.stringify({home,characters:beforeCharacters},null,2));
 const blocks=structuredClone(home.blocks) as any[];let changed=false;
 for(const block of blocks){if(block.blockType!=='collection'||block.mode!=='characters')continue;
  for(const entry of block.cast||[]){
   const id=typeof entry.character==='object'?entry.character?.id:entry.character;
   const character=beforeCharacters.find(c=>c.id===id);if(!character||character.cardIdentity?.enabled)continue;
   const a=entry.appearance;if(a?.hoverMode!=='custom')continue;
   const text=a.hoverTextColor||(a.hoverTitleColor&&a.hoverTitleColor===a.hoverNoteColor?a.hoverTitleColor:undefined);
   const identity={enabled:true,backgroundColor:a.hoverBackgroundColor||undefined,textColor:text,badgeBackgroundColor:a.hoverBadgeBackgroundColor||undefined,badgeTextColor:a.hoverBadgeTextColor||undefined};
   if(!Object.entries(identity).some(([key,value])=>key!=='enabled'&&value))continue;
   await p.update({collection:'characters',id:character.id,data:{cardIdentity:identity}});
   const next={...a};
   for(const [oldKey,newKey] of [['hoverBackgroundColor','backgroundColor'],['hoverTextColor','textColor'],['hoverBadgeBackgroundColor','badgeBackgroundColor'],['hoverBadgeTextColor','badgeTextColor']] as const)if(identity[newKey]&&next[oldKey]===identity[newKey])next[oldKey]=null;
   for(const key of ['hoverTitleColor','hoverNoteColor'])if(text&&next[key]===text)next[key]=null;
   const remaining=Object.entries(next).some(([key,value])=>key.startsWith('hover')&&key!=='hoverMode'&&value!==null&&value!==undefined&&value!=='');
   next.hoverMode=remaining?'custom':'inherit';entry.appearance=next;changed=true;
   console.log('Identità condivisa:',character.name,identity.backgroundColor,'; testi normali e layout Home conservati.');
  }
 }
 if(changed)await p.update({collection:'pages',id:home.id,data:{blocks}});
}finally{await p.destroy();}
