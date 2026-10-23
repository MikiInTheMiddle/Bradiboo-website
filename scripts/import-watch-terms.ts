import {getPayload} from 'payload';
import config from '../payload.config';
import {syncWatchTerms} from '../lib/sync-watch-terms';
import {watchThemes,watchKeywords} from '../lib/watch-model';
const payload=await getPayload({config});
console.log(await syncWatchTerms(payload));
// Keep prototype-only vocabulary as explicit local terms; don't alter WordPress.
for(const [taxonomy,list] of [['topic',watchThemes],['keyword',watchKeywords]] as const){
 for(const term of list){const existing=await payload.find({collection:'watch-terms',where:{key:{equals:`${taxonomy}:${term.value}`}},limit:1});if(!existing.docs.length)await payload.create({collection:'watch-terms',data:{name:term.label,slug:term.value,taxonomy,source:'local'}});}
}
const settings=await payload.findGlobal({slug:'watch',depth:0});
if((settings.metadataVersion||0)<1){
 const terms=(await payload.find({collection:'watch-terms',limit:1000,depth:0})).docs;
 const ids=(taxonomy:string,slugs?:string[]|null)=>(slugs||[]).map(slug=>{const term=terms.find(t=>t.taxonomy===taxonomy&&t.slug===slug);if(!term)throw new Error(`Termine mancante ${taxonomy}:${slug}`);return term.id;});
 const contents=await payload.find({collection:'contents',limit:1000,depth:0});
 for(const content of contents.docs)await payload.update({collection:'contents',id:content.id,data:{themeTerms:ids('topic',content.watchThemes),keywordTerms:ids('keyword',content.watchKeywords)},draft:content._status==='draft'});
 await payload.updateGlobal({slug:'watch',data:{metadataVersion:1,rails:(settings.rails||[]).map(r=>({...r,themeTerms:ids('topic',r.themes),keywordTerms:ids('keyword',r.keywords)})),remoteButtons:(settings.remoteButtons||[]).map(b=>({...b,keywordTerms:ids('keyword',b.keywords)}))}});
 console.log('Associazioni esistenti migrate una sola volta.');
}
console.log('Catalogo condiviso pronto. Nessuna scrittura su WordPress.');
await payload.destroy();
