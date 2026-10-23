import {visibilityKeys,ctaColorKeys} from './card-controls';
import type {ClientField} from 'payload';
import {getFieldPaths} from 'payload/shared';
import {compactFields} from './admin-compact';
export function flatEditorFields(fields:any[]):any[]{return fields.flatMap(f=>f.type==='tabs'?f.tabs.flatMap((t:any)=>t.name?[{...t,type:'group'}]:flatEditorFields(t.fields)):['row','collapsible'].includes(f.type)||f.type==='group'&&!f.name?flatEditorFields(f.fields):[f]);}
export const normalizeEditorSchemaPath=(path:string)=>path.split('.').filter(p=>!p.startsWith('_index-')).join('.');
/** Resolve the original array schema; editor panels reuse its exact storage paths. */
export function findEditorFields(fields:any[],prefix:string,target:string):ClientField[]|undefined {
 target=normalizeEditorSchemaPath(target);
 for(const f of fields){
  if(f.type==='tabs'){for(const t of f.tabs){const found=findEditorFields(t.fields,t.name?`${prefix}.${t.name}`:prefix,target);if(found)return found;}continue;}
  const path=f.name?`${prefix}.${f.name}`:prefix;
  if(path===target&&f.fields)return f.fields;
  if(f.type==='blocks')for(const b of f.blocks||[]){if(typeof b==='string')continue;const found=findEditorFields(b.fields,`${path}.${b.slug}`,target);if(found)return found;}
  if(f.fields){const found=findEditorFields(f.fields,path,target);if(found)return found;}
 }
}
export const cardBackgroundKeys=new Set(['backgroundMode','backgroundColor','backgroundOpacity','backgroundBlur','overlayOpacity','image','backgroundImageControl','borderColor','borderRadius']);
export const cardTextKeys=new Set(['ctaAlign','eyebrowMode','eyebrowText','textColor','titleColor','titleSize','titleCustomSize','titleAlign','titleWeight','noteColor','noteSize','noteCustomSize','noteAlign','noteWeight']);
export function cardEditorPanels(fields:any[],wholeWide:boolean,cardWide:boolean,imageBackground=true){
 const all=flatEditorFields(fields).filter(f=>f.name!=='editorControl');
 const appearance=all.find(f=>f.name===(wholeWide?'wideAppearance':'appearance'));
 const members=appearance?flatEditorFields(appearance.fields):[];
 const restore=(f:any)=>({...f,admin:{...f.admin,hidden:false}});
 const group=(values:any[])=>appearance&&values.length?[{...restore(appearance),label:false,admin:{...appearance.admin,hidden:false,description:undefined,hideGutter:true,className:undefined},fields:compactFields(values)}]:[];
 const sourceKeys=new Set(['sourceMode','sourceCategory','source','sourceContent','profileField','content','character']);
 const sources=all.filter(f=>sourceKeys.has(f.name)).map(restore);
 const content=all.filter(f=>!sourceKeys.has(f.name)&&!['cardFunction','videoSettings','audioSettings','appearance','wideAppearance','mobileImage','focalX','focalY','hideBadge','slideBadge','badge','badgeBackgroundColor','image','cardImage','overrideImage'].includes(f.name)).map(restore);
 const overrides=all.find(f=>f.name==='overrides'&&f.fields);
 for(let i=0;i<content.length;i++)if(content[i].name==='overrides')content[i]={...content[i],fields:flatEditorFields(content[i].fields).filter(f=>f.name!=='image')};
 const image=all.filter(f=>['overrideImage','image','cardImage'].includes(f.name)).map(restore);
 if(overrides){const photo=flatEditorFields(overrides.fields).filter(f=>f.name==='image');if(photo.length)image.push({...restore(overrides),fields:photo});}
 const audio=all.filter(f=>f.name==='audioSettings').map(f=>({...restore(f),label:false}));
 const responsive=all.filter(f=>['mobileImage','focalX','focalY'].includes(f.name)).map(f=>f.name==='mobileImage'?{...restore(f),label:'Immagine mobile locale (facoltativa)',admin:{...restore(f).admin,description:'Vuoto: eredita la variante mobile della sorgente; se manca usa l’immagine principale. La sostituzione vale solo per questa card.'}}:restore(f));
 const background=members.filter(f=>cardBackgroundKeys.has(f.name));
 const visibility=group(members.filter(f=>visibilityKeys.includes(f.name))).map(f=>({...f,label:'Visibilità dei contenuti'}));
 const text=members.filter(f=>cardTextKeys.has(f.name));
 const badge=members.filter(f=>f.name==='labelControl'||f.name?.startsWith('badge'));
 const hover=members.filter(f=>f.name?.startsWith('hover'));
 return {
  sources,
  controls:[...all.filter(f=>f.name==='cardFunction').map(restore),...group(members.filter(f=>f.name==='enabled'))],
  panels:[
   {id:'content',label:'Contenuto',fields:[...visibility,...content,...group(text)]},
   ...(!wholeWide&&!cardWide?[{id:'media',label:'Media',fields:[...image,...compactFields(responsive)]}]:[]),
   {id:'cta',label:'CTA · colori',fields:group(members.filter(f=>ctaColorKeys.includes(f.name)))},
   {id:'audio',label:'Audio',fields:audio},
   {id:'video',label:'Video',fields:all.filter(f=>f.name==='videoSettings').map(restore)},
   {id:'background',label:'Fondo',fields:[...group(background),...((wholeWide||cardWide)&&imageBackground?compactFields(responsive):[])]},
   {id:'label',label:'Etichetta',fields:group(badge)},
   ...(!wholeWide?[{id:'hover',label:'Hover',fields:group(hover)}]:[]),
  ].filter(p=>p.fields.length),
 };
}

/** Preserve Payload's actual schema paths, including unnamed tab/group indexes. */
export function cardFieldSchemaPaths(fields:any[],parentPath:string,parentSchemaPath:string,parentIndexPath=''):Map<string,string>{
 const result=new Map<string,string>();
 fields.forEach((field,index)=>{
  const paths=getFieldPaths({field,index,parentPath,parentSchemaPath,parentIndexPath});
  if(field.name)result.set(paths.path,paths.schemaPath);
  const nested=field.type==='tabs'?field.tabs.map((t:any)=>({...t,type:'tab'})):field.fields;
  if(nested)for(const [path,schema] of cardFieldSchemaPaths(nested,paths.path,paths.schemaPath,paths.indexPath))result.set(path,schema);
 });
 return result;
}
