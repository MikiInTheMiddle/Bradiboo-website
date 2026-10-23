'use client';
import {useEffect,useState} from 'react';
import {useFormFields} from '@payloadcms/ui';
export function HeroEdgePreview({path,imageField}:{path:string;imageField:string}){
 const prefix=path.slice(0,path.lastIndexOf('.')+1);
 const image=useFormFields(([fields])=>fields[prefix+imageField]?.value);
 const id=typeof image==='object'&&image?('id' in image?image.id:undefined):image;
 const [color,setColor]=useState<string>();
 useEffect(()=>{setColor(undefined);if(!id)return;const controller=new AbortController();fetch(`/api/media/${encodeURIComponent(String(id))}?depth=0`,{signal:controller.signal}).then(r=>r.ok?r.json():undefined).then(data=>setColor(data?.bottomEdgeColor||undefined)).catch(()=>{});return ()=>controller.abort();},[id]);
 return <p style={{display:'flex',alignItems:'center',gap:8,fontSize:13,margin:'8px 0 12px'}}>{color&&<span aria-hidden="true" style={{width:22,height:22,border:'1px solid #bbb',borderRadius:4,background:color}}/>}Colore rilevato al bordo inferiore: {color||'non disponibile — verrà usato il fondo manuale della pagina.'}</p>;
}
