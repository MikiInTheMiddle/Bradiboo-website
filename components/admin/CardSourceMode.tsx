'use client';
import {useField,useFormFields} from '@payloadcms/ui';
import {useEffect,useState} from 'react';
export function CardSourceMode({path,readOnly=false,allowProfile=false}:{path:string;readOnly?:boolean;allowProfile?:boolean}){
 const {value,setValue}=useField<string>({path});const prefix=path.slice(0,path.lastIndexOf('.')+1);
 const source=useFormFields(([f])=>Boolean(f[`${prefix}source`]?.value||f[`${prefix}sourceContent`]?.value));
 const character=useFormFields(([f])=>f.character?.value) as any;const [name,setName]=useState('');
 useEffect(()=>{if(!allowProfile||!character){setName('');return;}const id=typeof character==='object'?character.id:character;const abort=new AbortController();fetch(`/api/characters/${id}?depth=0`,{signal:abort.signal}).then(r=>r.ok?r.json():undefined).then(d=>setName(d?.name||'')).catch(()=>{});return()=>abort.abort();},[character,allowProfile]);
 const selected=value||(source?'linked':'manual');
 return <fieldset style={{border:0,padding:0,margin:'0 0 16px'}}><legend>Sorgente dei contenuti</legend><div style={{display:'flex',gap:16,marginTop:8,flexWrap:'wrap'}}>{[['manual','Inserisci qui'],['linked','Collega una scheda']].map(([key,label])=><label key={key}><input type="radio" name={path} checked={key==='linked'?selected!=='manual':selected==='manual'} disabled={readOnly} onChange={()=>setValue(key)}/> {label}</label>)}</div>{allowProfile&&selected!=='manual'&&<div style={{marginTop:12}}><label><input type="checkbox" checked={selected==='profile'} disabled={readOnly} onChange={e=>setValue(e.target.checked?'profile':'linked')}/> Usa il personaggio associato alla pagina</label>{selected==='profile'&&<p>Sorgente: <strong>{name||'associa un Personaggio in Generale della pagina'}</strong>. Qui sotto scegli il campo della sua scheda da mostrare.</p>}</div>}</fieldset>;
}
