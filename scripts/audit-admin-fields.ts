import fs from 'node:fs';
import assert from 'node:assert/strict';
import type {Field} from 'payload';
import config from '../payload.config';
const schema=await config;
const snapshot:Record<string,unknown>={};
const duplicates:string[]=[];
function walk(fields:Field[],scope:string){
 for(const f of fields){
  if(f.type==='ui')continue;
  if(f.type==='tabs'){
   for(const tab of f.tabs)walk(tab.fields,'name' in tab&&tab.name?`${scope}.${tab.name}`:scope);
   continue;
  }
  if(!('name' in f)||!f.name){if('fields' in f)walk(f.fields,scope);continue;}
  const path=`${scope}.${f.name}`;
  if(Object.hasOwn(snapshot,path))duplicates.push(path);
  const storage:Record<string,unknown>={};
  for(const key of ['type','required','unique','relationTo','hasMany','localized','defaultValue','min','max','dbName','enumName'])if(key in f)storage[key]=(f as any)[key];
  if(f.type==='select'||f.type==='radio')storage.options=f.options.map(o=>typeof o==='string'?o:o.value);
  snapshot[path]=storage;
  if('fields' in f)walk(f.fields,path);
  if(f.type==='blocks')for(const block of f.blocks||[])if(typeof block!=='string')walk(block.fields,`${path}[${block.slug}]`);
 }
}
for(const c of schema.collections||[])walk(c.fields,`collection:${c.slug}`);
for(const g of schema.globals||[])walk(g.fields,`global:${g.slug}`);
assert.deepEqual(duplicates,[],`Duplicate field paths: ${duplicates.join(', ')}`);
const result=Object.fromEntries(Object.entries(snapshot).sort(([a],[b])=>a.localeCompare(b)));
if(process.argv[2]==='--save')fs.writeFileSync(process.argv[3],JSON.stringify(result,null,2));
if(process.argv[2]==='--compare'){
 const normalized=JSON.parse(JSON.stringify(result));
 const before=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
 const changed=[...new Set([...Object.keys(normalized),...Object.keys(before)])].filter(key=>JSON.stringify(normalized[key])!==JSON.stringify(before[key]));
 assert.deepEqual(changed,[],'Stored field definitions changed');
}
console.log(`OK: ${Object.keys(snapshot).length} field paths audited, no duplicate definitions${process.argv[2]==='--compare'?'; stored schema unchanged':''}.`);
