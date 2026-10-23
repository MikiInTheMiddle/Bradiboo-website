import {getPayload} from 'payload';import config from '../payload.config';import {writeFile} from 'node:fs/promises';
const p=await getPayload({config});try{
 const watch=await p.findGlobal({slug:'watch',depth:0});await writeFile(`work/backups/watch-rails-before-unified-${Date.now()}.json`,JSON.stringify(watch,null,2));
 const terms=(await p.find({collection:'watch-terms',where:{taxonomy:{equals:'keyword'}},limit:1000,depth:0})).docs;
 const rails:any[]=[...(watch.rails||[])];
 for(const [slug,title] of [['musica','Un po’ di musica'],['movimento','In movimento'],['arte','Spazio all’arte']]){
  const term=terms.find(t=>t.slug===slug);if(!term)continue;
  if(!rails.some(r=>r.title===title))rails.push({title,mode:'automatic',keywordTerms:[term.id],keywordMatch:'any',limit:12,cardAppearance:{cardFunction:'video',composition:'half'}});
 }
 const filters:any[]=[...(watch.filters||[])];if(!filters.some(f=>f.key==='keywords'))filters.push({key:'keywords',label:'Argomenti',placement:'secondary'});
 await p.updateGlobal({slug:'watch',data:{rails,filters},depth:0});console.log('Added initial keyword rails, existing rules and overrides retained; shared keyword filter available.');
}finally{await p.destroy()}
