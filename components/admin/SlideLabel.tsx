'use client';
import {useField} from '@payloadcms/ui';
export function SlideLabel({path,readOnly=false}:{path:string;readOnly?:boolean}) {
 const row=path.replace(/\.wideAppearance\.labelControl$/,'');
 const hidden=useField<boolean>({path:`${row}.hideBadge`});
 const text=useField<string>({path:`${row}.slideBadge`});
 return <div className="bradi-slide-label"><label><input type="checkbox" checked={!hidden.value} disabled={readOnly} onChange={e=>hidden.setValue(!e.target.checked)}/> Mostra etichetta</label>
 {!hidden.value&&<label style={{display:'grid',gap:6,marginTop:10}}>Testo<input type="text" value={text.value||''} placeholder="Eredita dal contenuto; altrimenti Highlights" readOnly={readOnly} onChange={e=>text.setValue(e.target.value)} style={{padding:8,width:'100%'}}/></label>}</div>;
}
