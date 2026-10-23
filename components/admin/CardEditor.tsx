'use client';
import {hasWideSlides} from '@/lib/presentation-fields';
import {useConfig,useDocumentInfo,useField,useFormFields} from '@payloadcms/ui';
import {CardEditorFields} from './CardEditorFields';
import {useState,useEffect} from 'react';
import {cardEditorPanels,findEditorFields,normalizeEditorSchemaPath,cardFieldSchemaPaths} from '@/lib/card-editor-model';
export function CardEditor({path,schemaPath,readOnly=false,permissions={},automatic=false}:{path:string;schemaPath:string;readOnly?:boolean;permissions?:any;automatic?:boolean}) {
 const {config}=useConfig();
 const {docPermissions,collectionSlug,globalSlug}=useDocumentInfo();
 const rowPath=path.replace(/\.editorControl$/,'');
 const rowSchema=schemaPath.replace(/\.editorControl$/,'');
 const normalized=normalizeEditorSchemaPath(rowSchema);
 const owner=normalized.split('.')[0];
 const known=config.collections.some(c=>c.slug===owner)||config.globals.some(g=>g.slug===owner);
 const lookup=known?normalized:`${collectionSlug||globalSlug}.${normalized}`;
 const [collection,...segments]=lookup.split('.');
 let rowPermissions:any=docPermissions?.fields;
 for(let i=0;i<segments.length&&rowPermissions!==true;i++){const current=rowPermissions?.[segments[i]];if(current===true){rowPermissions=true;break;}if(current?.blocks){rowPermissions=current.blocks[segments[++i]]?.fields;}else rowPermissions=current?.fields;}
 rowPermissions=rowPermissions??permissions;
 const entity=config.collections.find(c=>c.slug===collection)||config.globals.find(g=>g.slug===collection);
 const originals=entity?findEditorFields(entity.fields,collection,lookup):undefined;
 const blockPrefix=rowPath.match(/^(.*blocks\.\d+)\./)?.[1]||rowPath.match(/^(.*)\.entries\.\d+$/)?.[1]||'';
 const commonPath=(name:string)=>blockPrefix?`${blockPrefix}.${name}`:name;
 const parentWide=useFormFields(([fields])=>hasWideSlides({presentation:fields[commonPath('presentation')]?.value,blockType:fields[commonPath('blockType')]?.value}));
 const common=useFormFields(([fields])=>fields[commonPath('cardAppearance.composition')]?.value);
 const composition=useField<string>({path:`${rowPath}.appearance.composition`});
 const local=composition.value;
 const inherited=!local||local==='inherit';
 const effectiveComposition=inherited?common:local;
 const wide=parentWide||(inherited?common==='overlay':local==='overlay');
 const localBackground=useFormFields(([fields])=>fields[`${rowPath}.${parentWide?'wideAppearance':'appearance'}.backgroundMode`]?.value);
 const commonBackground=useFormFields(([fields])=>fields[commonPath('cardAppearance.backgroundMode')]?.value);
 const blockBackground=useFormFields(([fields])=>fields[commonPath('backgroundMode')]?.value);
 const styleEnabled=useFormFields(([fields])=>fields[`${rowPath}.wideAppearance.enabled`]?.value);
 const background=parentWide?(styleEnabled?localBackground:blockBackground):!localBackground||localBackground==='inherit'?commonBackground:localBackground;
 const imageBackground=!background||['image','inherit'].includes(String(background));
 const fn=useFormFields(([f])=>f[`${rowPath}.cardFunction`]?.value||f[commonPath('cardAppearance.cardFunction')]?.value);
 const [tab,setTab]=useState('content');
 useEffect(()=>{if(fn)setTab(fn==='audio'?'audio':fn==='video'?'video':'content');},[fn]);
 if(!originals)return <p>Impossibile caricare i controlli dell’elemento.</p>;
 const editor=cardEditorPanels(originals,parentWide,wide,imageBackground);
 editor.panels=editor.panels.filter(p=>p.id!=='video'||fn==='video').filter(p=>p.id!=='audio'||!fn||fn==='audio');
 const active=editor.panels.find(p=>p.id===tab)||editor.panels[0];
 const schemas=cardFieldSchemaPaths(originals,rowPath,rowSchema);
 const render=(fields:any[])=><CardEditorFields fields={fields} path={rowPath} schemas={schemas} permissions={rowPermissions} readOnly={readOnly}/>;
 return <div className="bradi-card-editor">
  {render(editor.controls.filter(f=>f.name==='cardFunction'))}
  {!automatic&&editor.sources.length>0&&<div className="bradi-card-source">{render(editor.sources)}</div>}
  {!parentWide?<div className="bradi-card-presentation"><span>Presentazione</span><div role="radiogroup" aria-label="Presentazione della card">
   <label><input type="radio" name={`${path}-presentation`} checked={!wide&&effectiveComposition!=='half'} disabled={readOnly} onChange={()=>composition.setValue('stacked')}/> Default</label>
   <label><input type="radio" name={`${path}-presentation`} checked={!wide&&effectiveComposition==='half'} disabled={readOnly} onChange={()=>composition.setValue('half')}/> Half</label>
   <label><input type="radio" name={`${path}-presentation`} checked={wide} disabled={readOnly} onChange={()=>composition.setValue('overlay')}/> Wide</label>
  </div><label className="bradi-card-inherit"><input type="checkbox" checked={inherited} disabled={readOnly} onChange={e=>composition.setValue(e.target.checked?'inherit':wide?'overlay':effectiveComposition==='half'?'half':'stacked')}/> Eredita la presentazione comune</label></div>:<p>Presentazione Wide del blocco</p>}
  {render(editor.controls.filter(f=>f.name!=='cardFunction'))}
  <div role="tablist" aria-label="Controlli dell’elemento" className="bradi-card-tabs">{editor.panels.map(p=><button key={p.id} id={`${path}-${p.id}-tab`} type="button" role="tab" aria-selected={p.id===active.id} aria-controls={`${path}-panel`} onClick={()=>setTab(p.id)}>{p.label}</button>)}</div>
  <div role="tabpanel" id={`${path}-panel`} aria-labelledby={`${path}-${active.id}-tab`}>{render(active.fields)}</div>
 </div>;
}
