'use client';
import {useField,useFormFields} from '@payloadcms/ui';
import {backgroundChoice} from '@/lib/admin-context';
export function BackgroundMode({path,kind='block',readOnly=false}:{path:string;kind?:'block'|'card'|'slide';readOnly?:boolean}) {
 const mode=useField<string>({path});
 const prefix=path.slice(0,path.lastIndexOf('.')+1);
 const colorField=useField<string>({path:`${prefix}backgroundColor`});
 const color=colorField.value;
 const image=useFormFields(([fields])=>fields[`${prefix}backgroundImage`]?.value);
 const composition=useFormFields(([fields])=>fields[`${prefix}composition`]?.value);
 const enabled=useFormFields(([fields])=>fields[`${prefix}enabled`]?.value);
 const opacityField=useField<number|null>({path:`${prefix}backgroundOpacity`});
 const backgroundOpacity=opacityField.value;
 const selected=backgroundChoice({enabled,backgroundOpacity,backgroundMode:mode.value,backgroundColor:color,backgroundImage:image,composition},kind);
 const inherited=selected==='inherit';
 const change=(choice:string)=>{if(['color','image'].includes(choice)&&(selected==='transparent'||inherited)&&backgroundOpacity===0)opacityField.setValue(100);if(choice==='color'&&(!color||color==='transparent'))colorField.setValue('#ffffff');mode.setValue(kind==='block'?({transparent:'page',color:'own',image:'image'}[choice]||choice):choice);};
 return <div style={{marginBottom:14}}>
 <div role="radiogroup" aria-label="Tipo di fondo" style={{display:'flex',gap:16,flexWrap:'wrap'}}>{[...(kind==='card'?[['inherit','Eredita']]:[]),['transparent','Trasparente'],['color','Colore'],...(kind==='card'&&composition==='stacked'?[]:[['image','Immagine']])].map(([value,label])=><label key={value} style={{display:'flex',gap:6,alignItems:'center'}}><input type="radio" name={path} checked={selected===value} disabled={readOnly} onChange={()=>change(value)}/>{label}</label>)}</div>
 </div>;
}
