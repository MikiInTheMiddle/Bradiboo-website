import type {Field} from 'payload';
import {collectionTag} from './public-cache-tags';

/** Inspect the published schema, not arbitrary numeric IDs, to find dependencies.
 * Automatic selections also depend on collections that have no saved relation.
 * Collection tags cover related documents/empty selections/newly added items.
 */
export function pageCacheDependencies(fields:Field[],page:Record<string,any>){
 const collections=new Set<string>(['media']);let external=false;
 function walk(schema:Field[],data:any){
  if(!data||data.draft===true)return;
  for(const field of schema){
   if(field.type==='tabs'){for(const tab of field.tabs)walk(tab.fields,'name' in tab&&tab.name?data[tab.name]:data);continue;}
   const value='name' in field&&field.name?data[field.name]:data;
   if(value==null)continue;
   if(field.type==='upload'||field.type==='relationship'){
    for(const entry of Array.isArray(value)?value:[value]){
     if(Array.isArray(field.relationTo)){if(entry?.relationTo)collections.add(entry.relationTo);}
     else if(field.relationTo)collections.add(field.relationTo);
    }
   }else if(field.type==='blocks'){
    for(const block of value){
     if(block.draft)continue;
     if(['dynamic','episodes'].includes(block.blockType)||block.blockType==='featured'&&block.mode==='automatic'||block.blockType==='collection'&&block.mode==='catalog')collections.add('contents');
     if(block.blockType==='characterFriends'||block.blockType==='collection'&&block.mode==='characters')collections.add('characters');
     if(block.contentSelection?.enabled)collections.add(block.contentSelection.by==='characters'?'characters':'contents');
     if(['watchExperience','zapExperience'].includes(block.blockType))collections.add('contents');
     if(block.blockType==='braditime'||block.blockType==='headlessProduct')external=true;
     const definition=field.blocks.find(f=>typeof f!=='string'&&f.slug===block.blockType);
     if(definition&&typeof definition!=='string')walk(definition.fields,block);
    }
   }else if('fields' in field){for(const row of field.type==='array'?value:[value])walk(field.fields,row);}
  }
 }
 walk(fields,page);
 // Character identity is inherited for plain hrefs too (not just relationships).
 if(JSON.stringify(page).includes('/braditriboo/'))collections.add('characters');
 if(page.headlessProductSlug)external=true;
 if(collections.has('contents')||collections.has('pages')){
  for(const slug of ['contents','characters','production-containers','watch-terms'])collections.add(slug);
 }
 return {tags:[...collections].map(collectionTag),revalidate:external?3600:false as number|false};
}
