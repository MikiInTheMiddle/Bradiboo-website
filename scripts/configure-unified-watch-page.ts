import {getPayload} from 'payload';import config from '../payload.config';import {mkdir,writeFile} from 'node:fs/promises';import {isDeepStrictEqual} from 'node:util';
const p=await getPayload({config});try{
 const page=(await p.find({collection:'pages',where:{path:{equals:'/guarda'}},depth:0,limit:1})).docs[0];if(!page?.blocks)throw Error('Guarda missing');
 const watch=await p.findGlobal({slug:'watch',depth:0});
 await mkdir('work/backups',{recursive:true});await writeFile(`work/backups/before-unified-watch-${Date.now()}.json`,JSON.stringify({page,watch},null,2));
 let kept=false;const blocks=page.blocks.map((original:any)=>{const b=structuredClone(original);if(b.blockType==='watchExperience'&&!kept){kept=true;b.draft=false;b.title='Cerca una storia';return b;}return {...b,draft:true};});if(!kept)throw Error('Watch module missing');
 const saved=await p.update({collection:'pages',id:page.id,data:{blocks},depth:0});
 for(const original of page.blocks){const b=saved.blocks?.find((x:any)=>x.id===original.id);if(!b)throw Error('Block lost');}
 for(const key of ['heroBackground','customHeroBackground','heroBackgroundColor','heroBackgroundMode','customHeroBackgroundEnd','heroBackgroundEndColor','pageBackgroundColor','pageBackgroundImage','footerOverride'] as const)if(!isDeepStrictEqual(saved[key],page[key]))throw Error(`Appearance changed ${key}`);
 console.log('Guarda: unified module enabled; previous blocks retained as drafts; page appearance preserved.');
}finally{await p.destroy()}
