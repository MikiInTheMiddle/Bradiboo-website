'use client';
import {sourceGalleryRows} from '@/lib/gallery-model';
import {useEffect,useState} from 'react';
import {useConfig,useField,useFormFields} from '@payloadcms/ui';
export function GallerySelection({path,readOnly=false}:{path:string;readOnly?:boolean}){
 const {config}=useConfig();const {value,setValue}=useField<string[]>({path});
 const prefix=path.slice(0,path.lastIndexOf('.')+1);
 const source=useFormFields(([f])=>{
  if(f[`${prefix}gallerySourceMode`]?.value==='linked')return f[`${prefix}gallerySource`]?.value;
  return f.galleryContext?.value||(f.character?.value?{relationTo:'characters',value:f.character.value}:null);
 }) as any;
 const relation=source?.relationTo;const id=source?.value&&typeof source.value==='object'?source.value.id:source?.value;
 const [rows,setRows]=useState<any[]>([]);const [status,setStatus]=useState('');
 useEffect(()=>{const controller=new AbortController();setRows([]);
  if(!relation||!id){setStatus('Associa una sorgente alla pagina oppure scegli “Da una sorgente scelta”.');return;}
  setStatus('Caricamento immagini…');
  fetch(`${config.serverURL||''}${config.routes.api}/${encodeURIComponent(relation)}/${encodeURIComponent(id)}?depth=2`,{signal:controller.signal,credentials:'same-origin'}).then(async response=>{if(!response.ok)throw new Error();return response.json();}).then(doc=>{const images=sourceGalleryRows(doc);setRows(images);setStatus(images.length?'':'Nessuna immagine nella sorgente: aggiungila nella sua tab “Immagini e momenti”.');}).catch(()=>{if(!controller.signal.aborted)setStatus('Impossibile leggere le immagini della sorgente.');});
  return()=>controller.abort();
 },[relation,id,config.serverURL,config.routes.api]);
 const selected=Array.isArray(value)?value:[];
 return <fieldset style={{border:'1px solid var(--theme-elevation-150)',borderRadius:10,padding:14}} disabled={readOnly}><legend>Immagini della sorgente</legend>{status&&<p>{status}</p>}<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:12}}>{rows.map((row,index)=>{const id=String(row.id??index);return <label key={id} style={{display:'grid',gap:6}}><img src={row.image?.thumbnailURL||row.image?.url} alt="" style={{width:'100%',height:85,objectFit:'cover',borderRadius:8}}/><span><input type="checkbox" checked={selected.includes(id)} onChange={e=>setValue(e.target.checked?[...selected,id]:selected.filter(v=>v!==id))}/> {row.title||row.caption||`Immagine ${index+1}`}</span></label>;})}</div></fieldset>;
}
