'use client';
import {useField} from '@payloadcms/ui';
export function CardSourceCategory({path,readOnly=false}:{path:string;readOnly?:boolean}){
 const {value,setValue}=useField<string>({path});
 const prefix=path.slice(0,path.lastIndexOf('.')+1);
 const {setValue:setSource}=useField({path:`${prefix}source`});
 const options=[['container','Contenitore'],['production','Produzione / sottocontenitore'],['episode','Episodio / video'],['character','Personaggio'],['media','Media (immagine)']];
 return <label style={{display:'block',marginBottom:16}}>Tipo di sorgente<select aria-label="Tipo di sorgente" value={value||''} disabled={readOnly} style={{display:'block',maxWidth:'100%',width:320,marginTop:8,padding:8}} onChange={e=>{setValue(e.target.value||null);setSource(null);}}><option value="">Scegli una categoria…</option>{value==='legacy-page'&&<option value="legacy-page">Pagina precedente — da aggiornare</option>}{options.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select><small>Scegli la categoria, poi cerca solo tra le relative schede.</small></label>;
}
