'use client';
import {useState} from 'react';
export function SyncWatchTerms(){
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');
 async function sync(){setBusy(true);setMessage('');try{const r=await fetch('/api/watch-terms/sync',{method:'POST'});const d=await r.json();if(!r.ok)throw new Error(d.error||'Sincronizzazione non riuscita');setMessage(`Importazione completata: ${d.created} nuovi, ${d.updated} aggiornati. Ricarica l’elenco per vedere le novità.`);}catch(e){setMessage(e instanceof Error?e.message:'Sincronizzazione non riuscita.');}finally{setBusy(false);}}
 return <div style={{marginBottom:24,padding:16,border:'1px solid var(--theme-elevation-150)',borderRadius:8}}><p>Le tematiche e le keyword WordPress sono condivise con l’headless. Usa «Crea nuovo» per aggiungere voci locali. Questa sincronizzazione legge WordPress e conserva le voci locali.</p><button type="button" disabled={busy} onClick={sync} style={{padding:'10px 16px',cursor:'pointer'}}>{busy?'Importazione…':'Aggiorna da WordPress'}</button>{message&&<p role="status">{message}</p>}</div>;
}
