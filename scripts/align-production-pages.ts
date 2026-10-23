import {getPayload} from 'payload';import config from '../payload.config';import {mkdir,writeFile} from 'node:fs/promises';
const p=await getPayload({config});try{
 const pages=(await p.find({collection:'pages',limit:200,depth:0})).docs;
 const containers=(await p.find({collection:'production-containers',limit:100,depth:0})).docs;
 const productions=(await p.find({collection:'contents',where:{recordType:{equals:'production'}},limit:100,depth:0})).docs;
 await mkdir('work/backups',{recursive:true});await writeFile(`work/backups/production-page-hierarchy-${Date.now()}.json`,JSON.stringify({pages,containers,productions},null,2));
 const report:any[]=[];
 for(const container of containers){
  const title=container.slug==='format'?'BradiBITES':container.title;
  const url=container.url||`/guarda/${container.slug}`;
  if(title!==container.title||!container.url)await p.update({collection:'production-containers',id:container.id,data:{title,url},context:{skipHierarchyPage:true}});
  const page=pages.find(x=>x.path===url);if(!page)throw Error(`Pagina contenitore assente: ${url}`);
  let found=false;
  const blocks=page.blocks!.map((original:any)=>{
   const b=structuredClone(original);
   if(b.blockType==='grid'&&(['Tutte le serie','Tutte le miniserie','Tutti i format','Le produzioni di BradiBITES'].includes(b.title)||b.contentSelection?.by==='container'&&Number(b.contentSelection.container)===container.id)){
    found=true;b.contentSelection={enabled:true,by:'container',container:container.id,kind:'production',limit:100,sort:'oldest'};
    b.cardAppearance={...b.cardAppearance,cardFunction:'content',composition:b.cardAppearance?.composition||'stacked'};
    if(container.slug==='format')b.title='Le produzioni di BradiBITES';
   }
   if(container.slug==='format'&&b.blockType==='hero'&&b.title==='Format')b.title=title;
   return b;
  });if(!found)throw Error(`Griglia contenitore non riconosciuta: ${url}`);
  await p.update({collection:'pages',id:page.id,data:{title,blocks:blocks as any}});report.push({page:url,source:container.id,level:'productions'});
 }
 const updatedPages=(await p.find({collection:'pages',limit:200,depth:0})).docs;
 for(const page of updatedPages){
  let changed=false;
  const blocks=page.blocks!.map((original:any)=>{
   const b=structuredClone(original);
   if(page.path==='/guarda'&&b.blockType==='rail'){
    const container=containers.find(c=>b.title===c.title||c.slug==='format'&&b.title==='Format');if(container){changed=true;b.contentSelection={enabled:true,by:'container',container:container.id,kind:'production',limit:100,sort:'oldest'};b.cardAppearance={...b.cardAppearance,cardFunction:'content',composition:b.cardAppearance?.composition||'stacked'};if(container.slug==='format')b.title='BradiBITES';}
   }
   if(b.blockType==='episodes'){
    const production=productions.find(c=>c.url===page.path);if(production){changed=true;b.production=production.id;b.contentSelection={enabled:true,by:'production',production:production.id,kind:'episode',limit:100,sort:'oldest'};b.cardAppearance={...b.cardAppearance,cardFunction:'video',composition:b.cardAppearance?.composition||'half'};}
   }
   for(const array of ['items','cards','panels'])if(Array.isArray(b[array]))b[array]=b[array].map((row:any)=>{
    const container=containers.find(c=>row.href===(c.url||`/guarda/${c.slug}`));
    if(!container)return row;changed=true;
    return {...row,sourceMode:'linked',source:{relationTo:'production-containers',value:container.id},overrideContent:row.overrideContent??false,...(container.slug==='format'?{label:'BradiBITES'}:{})};
   });
   return b;
  });if(changed){await p.update({collection:'pages',id:page.id,data:{blocks:blocks as any}});report.push({page:page.path,level:'linked cards / automatic episodes'});}
 }
 console.log(JSON.stringify(report,null,2));
}finally{await p.destroy();}
