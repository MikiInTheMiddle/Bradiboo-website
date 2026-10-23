import {getPayload} from 'payload';
import config from '../payload.config';
import {writeFile} from 'node:fs/promises';
const p=await getPayload({config});
try{
 const pages=(await p.find({collection:'pages',limit:1000,depth:0})).docs;
 const contents=(await p.find({collection:'contents',limit:1000,depth:0})).docs;
 const containers=(await p.find({collection:'production-containers',limit:1000,depth:0})).docs;
 await writeFile(`work/backups/gallery-context-${Date.now()}.json`,JSON.stringify({pages,contents,containers},null,2));
 for(const page of pages){if(page.galleryContext||page.character)continue;
  const content=contents.find(c=>c.url===page.path);const container=containers.find(c=>c.url===page.path);
  const source=content?{relationTo:'contents' as const,value:content.id}:container?{relationTo:'production-containers' as const,value:container.id}:undefined;
  if(!source)continue;
  await p.update({collection:'pages',id:page.id,data:{galleryContext:source}});
  console.log(page.path,'→',source.relationTo,source.value);
 }
 console.log('Sorgenti pagina associate; archivi immagini e configurazioni dei moduli non riscritti.');
}finally{await p.destroy();}
