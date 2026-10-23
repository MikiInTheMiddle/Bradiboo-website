import assert from 'node:assert/strict';
import type {Field} from 'payload';
import config from '../payload.config';
import {contextualControls} from '../lib/admin-context';
function flat(fields:Field[]):Field[]{return fields.flatMap(f=>[f,...(f.type==='tabs'?f.tabs.flatMap(t=>flat(t.fields)):'fields' in f?flat(f.fields):[])]);}
const schema=await config;
const page=schema.collections!.find(c=>c.slug==='pages')!;
const blocks=flat(page.fields).find(f=>f.type==='blocks');assert.ok(blocks?.type==='blocks');
const hero=blocks.blocks.find(b=>typeof b!=='string'&&b.slug==='hero');assert.ok(hero&&typeof hero!=='string');
const fields=flat(hero.fields);
const find=(name:string)=>fields.find(f=>'name' in f&&f.name===name)!;
const visible=(f:Field,s:Record<string,unknown>)=>!f.admin?.condition||f.admin.condition({},s,{blockData:s} as never);
for(const name of ['title','note','textColor','titleColor','titleSize','noteColor','noteSize']){
 assert.equal(visible(find(name),{showText:false}),false,name);
 assert.equal(visible(find(name),{showText:true}),true,name);
}
for(const name of ['media','youtubeURL','mediaSource'])assert.equal(visible(find(name),{showMedia:false}),false,name);
for(const mode of ['page','own','image']){
 const sibling={backgroundMode:mode};
 assert.equal(visible(find('backgroundColor'),sibling),mode==='own');
 assert.equal(visible(find('backgroundImage'),sibling),mode==='image');
 assert.equal(visible(find('backgroundOpacity'),sibling),mode!=='page');
 assert.equal(visible(find('backgroundBlur'),sibling),true);
}
const tab=hero.fields.find(f=>f.type==='tabs');assert.ok(tab?.type==='tabs');
const fondo=tab.tabs.find(t=>t.label==='Fondo')!;
assert.ok(!fondo.fields.some(f=>f.type==='group'&&f.label==='Fondo'));
const firstControl=flat(fondo.fields)[1];
assert.equal('name' in firstControl&&firstControl.name,'backgroundMode');
const raw:Field[]=[{name:'backgroundColor',type:'text',defaultValue:'transparent'},{name:'backgroundMode',type:'select',options:['page','own','image']},{name:'title',type:'text',required:true}];
const storage=(fs:Field[])=>fs.map(({admin,label,...f}:any)=>f).sort((a,b)=>a.name.localeCompare(b.name));
assert.deepEqual(storage(contextualControls(raw)),storage(raw));
console.log('OK: text/media toggles hide dependent controls, backgrounds are mutually exclusive and ordered first, no repeated Fondo heading, storage definitions unchanged.');
