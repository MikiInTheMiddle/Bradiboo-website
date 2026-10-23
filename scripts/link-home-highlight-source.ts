import {getPayload} from 'payload';
import config from '../payload.config';
import {writeFile} from 'node:fs/promises';
const p=await getPayload({config});
try {
 const home=(await p.find({collection:'pages',where:{path:{equals:'/'}},depth:0,limit:1})).docs[0];
 const blocks=structuredClone(home.blocks) as any[];
 const card=blocks.find(b=>b.blockType==='featured')?.cards?.find((c:any)=>c.id==='6ad77791e08d5f8533719dcd');
 const content=await p.findByID({collection:'contents',id:11,depth:1});
 if(!card||!content.coverMobile)throw new Error('Card o copertina mobile non trovata');
 await writeFile(`work/backups/highlight-source-${Date.now()}.json`,JSON.stringify(home,null,2));
 card.sourceMode='linked';card.source={relationTo:'contents',value:content.id};
 card.overrideContent=true;card.overrideImage=false;
 await p.update({collection:'pages',id:home.id,data:{blocks}});
 console.log('Highlights collegato a:',content.title,'; mobile:',typeof content.coverMobile==='object'?content.coverMobile.url:content.coverMobile);
}finally{await p.destroy();}
