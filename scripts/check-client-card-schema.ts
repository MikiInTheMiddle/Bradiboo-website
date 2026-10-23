import assert from 'node:assert/strict';
import {createClientConfig} from 'payload';
import {getFieldPaths} from 'payload/shared';
import config from '../payload.config';
import {findEditorFields,normalizeEditorSchemaPath,cardFieldSchemaPaths,cardEditorPanels} from '../lib/card-editor-model';
const schema=await config;
const client=createClientConfig({config:schema,i18n:{language:'it',fallbackLanguage:'en',t:(key:string)=>key} as any,importMap:{},user:{} as any});
const pages=client.collections.find(c=>c.slug==='pages')!;
function actualRowSchema(fields:any[],prefix:string,target:string,indexPath=''):string|undefined{
 for(let index=0;index<fields.length;index++){
  const field=fields[index];
  const p=getFieldPaths({field,index,parentPath:'',parentSchemaPath:prefix,parentIndexPath:indexPath});
  if(normalizeEditorSchemaPath(p.schemaPath)===target)return p.schemaPath;
  if(field.type==='blocks')for(const block of field.blocks||[]){const found=actualRowSchema(block.fields,`${p.schemaPath}.${block.slug}`,target);if(found)return found;}
  const nested=field.type==='tabs'?field.tabs.map((t:any)=>({...t,type:'tab'})):field.fields;
  if(nested){const found=actualRowSchema(nested,p.schemaPath,target,p.indexPath);if(found)return found;}
 }
}
for(const target of ['pages.blocks.featured.cards','pages.blocks.grid.items','pages.blocks.collection.cast','pages.blocks.characterProfile.cards']){
 const nativePath=actualRowSchema(pages.fields,'pages',target)!;
 assert.ok(nativePath.includes('_index-'),'Exercise actual unnamed tab/group paths');
 const rows=findEditorFields(pages.fields,'pages',nativePath);assert.ok(rows,`${target}: client fields must resolve`);
 const mappings=cardFieldSchemaPaths(rows,'blocks.0.cards.0',nativePath);
 assert.ok(mappings.get('blocks.0.cards.0.appearance.backgroundMode')?.includes('_index-'));
 const editor=cardEditorPanels(rows,false,true);
 assert.ok(editor.panels.some(p=>p.id==='content'));
 assert.ok(editor.panels.some(p=>p.id==='background'));
}
console.log('OK: actual Payload client config, native unnamed indexes, featured/grid/character cards resolve and preserve original upload/control schema paths.');

const watch=client.globals.find(g=>g.slug==='watch')!;
for(const target of ['watch.cardOverrides','watch.rails.entries']){
 const nativePath=actualRowSchema(watch.fields,'watch',target)!;
 assert.ok(nativePath,`${target}: real global path exists`);
 const rows=findEditorFields(watch.fields,'watch',nativePath);assert.ok(rows,`${target}: global editor resolves`);
 const panels=cardEditorPanels(rows,false,true);
 assert.ok(panels.panels.some(p=>p.id==='background'));assert.ok(panels.panels.some(p=>p.id==='content'));
}
console.log('OK: global Watch catalogue overrides and rail entries share the same editor and native schema paths.');
