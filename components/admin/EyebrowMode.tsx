'use client';
import {useField} from '@payloadcms/ui';
export function EyebrowMode({path,readOnly=false}:{path:string;readOnly?:boolean}){
 const {value,setValue,disabled}=useField<string>({path});
 return <fieldset style={{border:0,padding:0,margin:'0 0 16px'}} disabled={readOnly||disabled}><legend>Occhiello sopra al titolo</legend><div style={{display:'flex',flexWrap:'wrap',gap:16,marginTop:8}}>{[['auto','Automatico'],['custom','Personalizzato'],['hidden','Nascosto']].map(([key,label])=><label key={key}><input type="radio" name={path} checked={(value||'auto')===key} onChange={()=>setValue(key)}/> {label}</label>)}</div><small>Segue la sorgente e le impostazioni comuni; personalizza solo se serve.</small></fieldset>;
}
