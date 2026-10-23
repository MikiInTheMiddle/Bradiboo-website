'use client';
import {useConfig,useRowLabel} from '@payloadcms/ui';
import {useEffect,useState} from 'react';

type Row=Record<string,any>;
const text=(...values:unknown[])=>values.find((value):value is string=>typeof value==='string'&&Boolean(value.trim()))?.trim();
const collections=new Set(['pages','contents','characters','production-containers','media']);
function reference(row:Row):{collection:string;value:any}|undefined {
 if(row.sourceMode==='manual')return;
 if(row.source?.relationTo&&collections.has(row.source.relationTo))return {collection:row.source.relationTo,value:row.source.value};
 if(row.sourceContent)return {collection:'contents',value:row.sourceContent};
 if(row.content)return {collection:'contents',value:row.content};
 if(row.character)return {collection:'characters',value:row.character};
}
export function ArrayTitle(){
 const {data,rowNumber}=useRowLabel<Row>();
 const {config}=useConfig();
 const row=data||{};
 const local=text(row.cardTitle,row.overrides?.title,row.title,row.label,row.name,row.text,row.caption,row.key);
 const source=reference(row);
 const document=source?.value;
 const populated=document&&typeof document==='object'?text(document.title,document.name,document.alt,document.filename):undefined;
 const id=document&&typeof document==='object'?document.id:document;
 const collection=source?.collection;
 const api=config.routes.api;
 const [resolved,setResolved]=useState<{key:string;title:string}>();
 const key=collection&&id!=null?`${collection}/${id}`:undefined;
 useEffect(()=>{
  if(local||populated||!key)return;
  const controller=new AbortController();
  fetch(`${api}/${key}?depth=0`,{signal:controller.signal}).then(async response=>{
   if(!response.ok)return;
   const doc=await response.json();
   const title=text(doc.title,doc.name,doc.alt,doc.filename);
   if(title&&!controller.signal.aborted)setResolved({key,title});
  }).catch(()=>{/* Keep the fallback label when the source is unavailable. */});
  return ()=>controller.abort();
 },[api,key,local,populated]);
 const title=local||populated||(resolved?.key===key?resolved?.title:undefined);
 return <span>{String((rowNumber??0)+1).padStart(2,'0')} · {title?title.slice(0,90):'Elemento'}</span>;
}
