import assert from 'node:assert/strict';
import config from '../payload.config';
const schema=await config;
function fieldsNamed(fields:any[],name:string):any[]{return fields.flatMap(f=>f.name===name?[f]:f.type==='tabs'?f.tabs.flatMap((t:any)=>fieldsNamed(t.fields,name)):f.fields&&!f.name?fieldsNamed(f.fields,name):[]);}
const pages=schema.collections.find(c=>c.slug==='pages')!;
const blocks=fieldsNamed(pages.fields,'blocks')[0].blocks;
for(const block of blocks){
 const title=fieldsNamed(block.fields,'title')[0];
 if(!title)continue;
 assert.equal(title.required,false,block.slug);
 const normalize=title.hooks.beforeValidate.at(-1);
 assert.equal(normalize({value:null}),'',block.slug);
 assert.equal(normalize({value:'Titolo esistente'}),'Titolo esistente',block.slug);
}
console.log(`Titoli facoltativi verificati su ${blocks.length} tipi di blocco.`);
