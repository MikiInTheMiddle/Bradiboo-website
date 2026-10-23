'use client';
import {useField,useFormFields,useDocumentInfo} from '@payloadcms/ui';
import {useEffect,useState} from 'react';
export function CardFunction({path,readOnly=false}:{path:string;readOnly?:boolean}){
 const {value,setValue}=useField<string>({path});const prefix=path.slice(0,path.lastIndexOf('.')+1);const {globalSlug}=useDocumentInfo();
 const audio=useFormFields(([f])=>f[`${prefix}audioSettings.mode`]?.value||f[`${prefix}audioSettings.file`]?.value);
 const source=useFormFields(([f])=>f[`${prefix}source`]?.value) as any;
 const content=useFormFields(([f])=>f[`${prefix}content`]?.value||f[`${prefix}sourceContent`]?.value) as any;
 const sourceMode=useFormFields(([f])=>f[`${prefix}sourceMode`]?.value);
 const pageCharacter=useFormFields(([f])=>f.character?.value) as any;
 const profileField=useFormFields(([f])=>f[`${prefix}profileField`]?.value);
 const [inferred,setInferred]=useState('content');
 useEffect(()=>{setInferred('content');if(sourceMode==='manual')return;const relation=sourceMode==='profile'?'characters':source?.relationTo||(content?'contents':undefined);const selected=sourceMode==='profile'?pageCharacter:source?.value||content;const id=typeof selected==='object'?selected?.id:selected;
 if(!id||!['contents','characters','production-containers','media'].includes(relation))return;
 const abort=new AbortController();fetch(`/api/${relation}/${id}?depth=1`,{signal:abort.signal}).then(r=>r.ok?r.json():undefined).then(doc=>{if(doc)setInferred(sourceMode==='profile'?(profileField==='music'&&doc.musicAudio?'audio':'content'):doc.playbackSource&&doc.recordType==='episode'?'video':doc.cardAudio?'audio':'content');}).catch(()=>{});return()=>abort.abort();},[source,content,sourceMode,pageCharacter,profileField]);
 const blockPath=path.match(/^(.*blocks\.\d+)\./)?.[1]||path.match(/^(.*rails\.\d+)\./)?.[1]||(globalSlug==='watch'?'':undefined);
 const common=useFormFields(([f])=>blockPath!==undefined?f[`${blockPath?blockPath+'.':''}cardAppearance.cardFunction`]?.value:undefined) as string|undefined;
 const selected=value||(common&&common!=='inherit'?common:undefined)||(audio&&audio!=='none'?'audio':globalSlug==='watch'?'video':inferred);
 return <fieldset style={{border:'1px solid var(--theme-elevation-150)',borderRadius:10,padding:16,marginBottom:16}}><legend>Funzione della card</legend><div style={{display:'flex',gap:20,flexWrap:'wrap'}}>{[['content','Contenuto / pagina'],['video','Video'],['audio','Audio']].map(([key,label])=><label key={key}><input type="radio" name={path} checked={Boolean(value)&&selected===key||blockPath===undefined&&selected===key} disabled={readOnly} onChange={()=>setValue(key)} onClick={()=>setValue(key)}/> {label}</label>)}</div>{blockPath!==undefined&&<label><input type="radio" name={path} checked={!value} disabled={readOnly} onChange={()=>setValue(null as any)}/> Eredita dal blocco{common&&common!=='inherit'?` (${common==='video'?'Video':common==='audio'?'Audio':'Contenuto / pagina'})`:''}</label>}{value&&<button type="button" disabled={readOnly} onClick={()=>setValue(null as any)}>Ripristina comportamento ereditato</button>}{!value&&<small>Comportamento attuale conservato. Scegli una funzione per modificarlo.</small>}</fieldset>;
}
