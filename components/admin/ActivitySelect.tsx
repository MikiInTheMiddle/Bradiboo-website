'use client';
import { useField } from '@payloadcms/ui';
import { useEffect, useState } from 'react';
export function ActivitySelect({ path, label }: { path: string; label?: string }) {
 const { value, setValue } = useField<string>({ path });
 const [items,setItems] = useState<{id:string;label:string}[]>([]);
 const [error,setError] = useState('');
 useEffect(()=>{const controller=new AbortController(); fetch('/api/braditime-options',{signal:controller.signal}).then(r=>{if(!r.ok)throw new Error();return r.json();}).then(d=>setItems(d.items)).catch(()=>{if(!controller.signal.aborted)setError('Catalogo non disponibile. La selezione salvata resta invariata.');});return()=>controller.abort();},[]);
 return <div style={{marginBottom:20}}><label>{label || 'Attività WordPress'}<select style={{display:'block',width:'100%',padding:12,marginTop:8}} value={value || ''} onChange={e=>setValue(e.target.value)}><option value="">Scegli un’attività</option>{value&&!items.some(i=>i.id===value)&&<option value={value}>Attività salvata #{value}</option>}{items.map(i=><option key={i.id} value={i.id}>{i.label}</option>)}</select></label>{error&&<p role="status">{error}</p>}</div>;
}
