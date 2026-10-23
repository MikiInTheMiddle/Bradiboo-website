'use client';
import {BulkUploadProvider,UploadInput,useConfig,useField,useForm,useFormFields} from '@payloadcms/ui';
import {useEffect,useRef,useState} from 'react';
function useSourceImage(row:string){
 const mode=useFormFields(([f])=>f[`${row}.sourceMode`]?.value);
 const source=useFormFields(([f])=>f[`${row}.source`]?.value);
 const override=useFormFields(([f])=>Boolean(f[`${row}.overrideImage`]?.value));
 const {dispatchFields,setModified}=useForm();
 const linked=mode==='profile'||mode==='linked'||Boolean(source)&&mode!=='manual';
 return {linked,override,setOverride:(value:boolean)=>{if(linked){dispatchFields({type:'UPDATE',path:`${row}.overrideImage`,value});setModified(true);}}};
}
export function ReplacementImageInput({path,readOnly=false}:{path:string;readOnly?:boolean}) {
 const {config}=useConfig();
 const source=useSourceImage(path.replace(/\.image$/,''));
 const {value,setValue,filterOptions,showError,disabled}=useField<number|null>({path});
 return <BulkUploadProvider drawerSlugPrefix={path}><UploadInput path={path} label="Immagine principale della card" relationTo="media" value={value??undefined} onChange={value=>{setValue(value);source.setOverride(true);}} allowCreate displayPreview api={config.routes.api} serverURL={config.serverURL} filterOptions={filterOptions} showError={showError} readOnly={readOnly||disabled}/></BulkUploadProvider>;
}
export function CardBackgroundImage({path,schemaPath,target='image',readOnly=false}:{path:string;schemaPath:string;target?:string;readOnly?:boolean}) {
 const rowPath=path.replace(/\.appearance\.backgroundImageControl$/,'');
 const imagePath=`${rowPath}.${target}`;
 const {value,setValue}=useField<number|null>({path:imagePath});
 const source=useSourceImage(rowPath);
 const [replace,setReplace]=useState(false);
 const active=source.linked?source.override&&(replace||value!=null):replace||value!=null;
 return <fieldset className="bradi-background-picker" disabled={readOnly}>
  <legend>Immagine di fondo</legend>
  <p>Usa la copertina ereditata oppure sostituiscila solo in questo elemento.</p>
  <div style={{display:'flex',gap:16,marginBottom:12}}>
   <label><input type="radio" name={`${path}-source`} checked={!active} onChange={()=>{setReplace(false);if(source.linked)source.setOverride(false);else setValue(null);}}/> Eredita</label>
   <label><input type="radio" name={`${path}-source`} checked={active} onChange={()=>{source.setOverride(true);setReplace(true);}}/> Sostituisci</label>
  </div>
  {active&&<ReplacementImageInput path={imagePath} readOnly={readOnly}/>}
 </fieldset>;
}

export function ActivityCardBackgroundImage(props:{path:string;schemaPath:string;target?:string;readOnly?:boolean}) {
 const row=props.path.replace(/\.appearance\.backgroundImageControl$/,'');
 const image=useField<number|null>({path:`${row}.overrides.image`});
 const customize=useField<boolean>({path:`${row}.customize`});
 const previous=useRef(image.value);
 useEffect(()=>{if(previous.current!==image.value){previous.current=image.value;if(image.value!=null)customize.setValue(true);}},[image.value,customize.setValue]);
 return <CardBackgroundImage {...props} target="overrides.image"/>;
}
