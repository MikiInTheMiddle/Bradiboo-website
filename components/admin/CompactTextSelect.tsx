'use client';
import {useField} from '@payloadcms/ui';
import {useId} from 'react';
export function CompactTextSelect({path,label,accessibleLabel,options,readOnly=false}:{path:string;label:string;accessibleLabel:string;options:{label:string;value:string}[];readOnly?:boolean}) {
 const id=useId();
 const {value,setValue,showError,errorMessage}=useField<string>({path});
 return <div className="bradi-format-select">
  <label htmlFor={id}>{label}</label>
  <select id={id} aria-label={accessibleLabel} disabled={readOnly} value={value||'auto'} aria-invalid={showError||undefined} onChange={e=>setValue(e.target.value)}>{options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select>
  {showError&&<p role="alert">{errorMessage}</p>}
 </div>;
}
