'use client';
import { useField } from '@payloadcms/ui';
import { useId, useState } from 'react';
import { gradientColors, palette, resolveColor } from '@/lib/background';

function ColorInput({ label, value, onChange, readOnly }: { label: string; value: string; onChange: (value: string) => void; readOnly?: boolean }) {
 const id = useId();
 const [draft, setDraft] = useState<string | null>(null);
 const hex = resolveColor(value) === 'transparent' ? '#ffffff' : resolveColor(value);
 return <div style={{display:'grid',gap:6}}><label htmlFor={id}>{label}</label><div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
  <input aria-label={`${label}: apri pannello colori`} type="color" value={hex} disabled={readOnly} onChange={event=>{setDraft(null);onChange(event.target.value);}} style={{width:40,height:34,padding:2,cursor:'pointer'}}/>
  <input id={id} type="text" value={draft ?? hex} readOnly={readOnly} maxLength={7} placeholder="#7235E8" aria-invalid={draft !== null && !/^#[0-9a-f]{6}$/i.test(draft)} onChange={event=>{const next=event.target.value;setDraft(next);if(/^#[0-9a-f]{6}$/i.test(next)){onChange(next);setDraft(null);}}} onBlur={()=>setDraft(null)} style={{width:120,padding:7,fontFamily:'monospace'}}/>
  <div role="group" aria-label={`${label}: colori rapidi`} style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>{Object.entries(palette).filter(([key])=>key!=='transparent').map(([key,color])=><button key={key} type="button" aria-label={`Usa ${color}`} title={color} disabled={readOnly} onClick={()=>{setDraft(null);onChange(color);}} style={{width:26,height:26,border:hex.toLowerCase()===color.toLowerCase()?'2px solid var(--theme-text)':'1px solid #888',borderRadius:4,background:color,cursor:readOnly?'default':'pointer'}}/>)}</div>
 </div></div>;
}
export function ColorField({path,label='Colore fondo',gradient=false,readOnly=false,transparentLabel='Trasparente',description,solidOnly=false}:{path:string;label?:string;gradient?:boolean;readOnly?:boolean;transparentLabel?:string;description?:string;solidOnly?:boolean}) {
 const {value,setValue,errorMessage,showError}=useField<string>({path});
 const colors=gradientColors(value);
 const mode=colors?'gradient':resolveColor(value)==='transparent'?'transparent':'solid';
 const start=colors?.[0] || (mode==='solid'?resolveColor(value):'#ffffff');
 const end=colors?.[1] || '#7235e8';
 const change=(first:string,last:string)=>setValue(`linear-gradient(to bottom, ${first} 0%, ${last} 100%)`);
 if(solidOnly)return <div className="bradi-color-field bradi-color-solid" style={{marginBottom:14}}><ColorInput label={label} value={start} onChange={setValue} readOnly={readOnly}/>{showError&&<p role="alert">{errorMessage}</p>}</div>;
 return <fieldset className="bradi-color-field" disabled={readOnly} style={{border:'1px solid var(--theme-elevation-150)',borderRadius:6,padding:10,margin:'0 0 14px',display:'grid',gap:10}}>
  <legend>{label}</legend>
  {description&&<p style={{margin:0,fontSize:12,lineHeight:1.4}}>{description}</p>}
  <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>{[['transparent',transparentLabel],['solid','Tinta unica'],...(gradient?[['gradient','Gradiente verticale']]:[])].map(([key,text])=><label key={key} style={{display:'flex',gap:6,alignItems:'center'}}><input type="radio" name={path} checked={mode===key} onChange={()=>key==='gradient'?change(start,end):setValue(key==='transparent'?'transparent':start)}/>{text}</label>)}</div>
  {mode!=='transparent'&&<><ColorInput label={colors?'Colore iniziale · alto pagina':'Colore'} value={start} onChange={next=>colors?change(next,end):setValue(next)} readOnly={readOnly}/>
   {colors&&<ColorInput label="Colore finale · basso pagina" value={end} onChange={next=>change(start,next)} readOnly={readOnly}/>}
   {colors&&<div aria-label="Anteprima gradiente" style={{height:48,borderRadius:4,border:'1px solid #888',background:value}}/>}
  </>}
  {gradient&&<p style={{margin:0,fontSize:13}}>Il fondo copre tutta la larghezza della pagina. Il gradiente parte dall’alto e termina in fondo al contenuto, sviluppandosi durante lo scorrimento.</p>}
  {showError&&<p role="alert">{errorMessage}</p>}
 </fieldset>;
}
