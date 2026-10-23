'use client';
import {useField,useRowLabel} from '@payloadcms/ui';
import {useEffect,useId,useState} from 'react';
export function WatchRailSelect({path,readOnly=false}:{path:string;readOnly?:boolean}){
 const {value,setValue,showError,errorMessage}=useField<string>({path});const id=useId();const [rails,setRails]=useState<{id:string;title:string}[]>([]);const [failed,setFailed]=useState(false);
 useEffect(()=>{const controller=new AbortController();fetch('/api/globals/watch?depth=0',{signal:controller.signal}).then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>setRails(data.rails||[])).catch(e=>{if(e.name!=='AbortError')setFailed(true)});return()=>controller.abort();},[]);
 return <div className="bradi-format-select"><label htmlFor={id}>Fascione centralizzato</label><select id={id} value={value||''} disabled={readOnly} aria-invalid={showError||undefined} onChange={e=>setValue(e.target.value)}><option value="">Scegli un fascione</option>{value&&!rails.some(r=>r.id===value)&&<option value={value}>{failed?'Sorgente non disponibile':value}</option>}{rails.map(r=><option key={r.id} value={r.id}>{r.title}</option>)}</select>{showError&&<p role="alert">{errorMessage}</p>}{failed&&<p role="status">Impossibile caricare i fascioni. Il collegamento salvato è conservato.</p>}</div>;
}

export function WatchRailRowLabel(){const {data,rowNumber}=useRowLabel<{railID?:string;title?:string}>();const [title,setTitle]=useState('');useEffect(()=>{const controller=new AbortController();fetch('/api/globals/watch?depth=0',{signal:controller.signal}).then(r=>r.json()).then(d=>setTitle((d.rails||[]).find((r:{id:string})=>r.id===data?.railID)?.title||'')).catch(()=>{});return()=>controller.abort();},[data?.railID]);return <span>{String((rowNumber??0)+1).padStart(2,'0')} · {data?.title||title||'Fascione'}</span>;}
