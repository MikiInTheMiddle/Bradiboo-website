import { getPayload } from 'payload';
import config from '../payload.config';
const payload=await getPayload({config});
const result=await payload.find({collection:'pages',where:{path:{equals:'/'}},limit:1,depth:0});
const home=result.docs[0];if(!home)throw new Error('Home non trovata');
const characters=await payload.find({collection:'characters',limit:100,depth:0});
const pages=await payload.find({collection:'pages',limit:100,depth:0});
for(const page of pages.docs.filter(p=>p.group==='Format')){
 const slug=page.path.split('/').pop()!;
 const exists=await payload.find({collection:'contents',where:{slug:{equals:slug}},limit:1});
 if(!exists.totalDocs)await payload.create({collection:'contents',data:{title:page.title,slug,kind:'format',url:page.path,_status:'published',description:'Pagina format importata dal wireframe; contenuto editoriale da completare.'}});
}
const updated=home.blocks?.map(block=>{
 if(block.blockType==='hero')return block.backgroundMode ? block : {...block,backgroundMode:'page' as const,backgroundOpacity:0,backgroundBlur:0};
 if(block.blockType==='media'&&block.label==='Contenuto in primo piano')return {blockType:'featured' as const,label:block.label,title:block.title,note:block.note,draft:block.draft,mode:'manual' as const,cards:block.items?.map(i=>({...i,href:i.href||undefined}))};
 if(block.blockType==='grid'&&block.label==='Character grid')return {blockType:'collection' as const,label:block.label,title:block.title,note:block.note,draft:block.draft,mode:'characters' as const,cast:characters.docs.map(c=>({character:c.id}))};
 if(block.blockType==='rail'&&block.label==='Media ecosystem')return {...block,blockType:'grid' as const};
 if(block.blockType==='rail'&&block.label==='Featured formats')return {blockType:'collection' as const,label:block.label,title:block.title,note:block.note,draft:block.draft,mode:'manual' as const,cards:block.items};
 return block;
})||[];
const studio=updated.find(b=>b.label==='Adult / professional layer');
const partnership=updated.find(b=>b.label==='Partnership teaser');
const blocks=updated.filter(b=>!['Adult / professional layer','Partnership teaser'].includes(b.label));
if(studio&&partnership)blocks.push({blockType:'companySplit',label:'Studio e Partnership',title:'Dietro il mondo Bradiboo',panels:[{label:studio.title,description:studio.note,href:'items' in studio?studio.items?.[0]?.href:undefined,ctaLabel:'Entra in Bradiboo Studio'},{label:partnership.title,description:partnership.note,href:'items' in partnership?partnership.items?.[0]?.href:undefined,ctaLabel:'Scopri le partnership'}]} as (typeof blocks)[number]);
await payload.update({collection:'pages',id:home.id,data:{blocks},draft:home._status==='draft'});
console.log('Home aggiornata, altri contenuti e account preservati.');
await payload.destroy();
