'use client';
import {useField} from '@payloadcms/ui';
export function PresentationToggle({path,readOnly=false}:{path:string;readOnly?:boolean}) {
 const {value,setValue,errorMessage,showError}=useField<string>({path});
 const wide=value==='wide';
 return <div style={{marginBottom:14}}>
  <div style={{marginBottom:10}}>Presentazione</div>
  <div style={{display:'flex',alignItems:'center',gap:12}}>
   <span style={{fontWeight:wide?400:700}}>Default</span>
   <button type="button" role="switch" aria-label="Modalità Wide" aria-checked={wide} disabled={readOnly} onClick={()=>setValue(wide?'cards':'wide')} style={{width:48,height:28,padding:3,border:'1px solid var(--theme-elevation-400)',borderRadius:20,background:wide?'var(--theme-success-500)':'var(--theme-elevation-200)',cursor:readOnly?'default':'pointer'}}>
    <span style={{display:'block',width:20,height:20,borderRadius:'50%',background:'var(--theme-elevation-1000)',transform:wide?'translateX(20px)':'translateX(0)',transition:'transform .15s'}}/>
   </button>
   <span style={{fontWeight:wide?700:400}}>Wide</span>
  </div>
  {showError&&<p role="alert">{errorMessage}</p>}
 </div>;
}
