'use client';
import {CheckboxField,NumberField,RadioGroupField,RelationshipField,SelectField,TextField,TextareaField,UploadField,FieldPathContext,useFormFields,useOperation} from '@payloadcms/ui';
import {getFieldPermissions} from 'payload/shared';
import type {ComponentType} from 'react';
const native:Record<string,ComponentType<any>>={checkbox:CheckboxField,number:NumberField,radio:RadioGroupField,relationship:RelationshipField,select:SelectField,text:TextField,textarea:TextareaField,upload:UploadField};
function BoundField({field,path,schemas,readOnly,permissions}:{field:any;path:string;schemas:Map<string,string>;readOnly:boolean;permissions:any}) {
 const state=useFormFields(([fields])=>fields[path]);
 const operation=useOperation()||'update';
 const access=getFieldPermissions({field,operation,parentName:'',permissions});
 if(!access.read||!state||state.passesCondition===false)return null;
 if(state?.customComponents?.Field!==undefined)return <FieldPathContext value={path}>{state.customComponents.Field}</FieldPathContext>;
 const Native=native[field.type];
 if(!Native)return null;
 return <FieldPathContext value={path}><Native field={field} path={path} schemaPath={schemas.get(path)} permissions={access.permissions} readOnly={readOnly||!access.operation}/></FieldPathContext>;
}
export function CardEditorFields({fields,path,schemas,permissions,readOnly=false}:{fields:any[];path:string;schemas:Map<string,string>;permissions:any;readOnly?:boolean}) {
 const operation=useOperation()||'update';
 return <>{fields.map((field,index)=>{
  if(field.fields){
   const groupPath=field.name?`${path}.${field.name}`:path;
   const access=getFieldPermissions({field,operation,parentName:'',permissions});
   if(field.name&&!access.read)return null;
   const childPermissions=field.name?(access.permissions===true?true:access.permissions?.fields):permissions;
   return <div key={`${groupPath}-${index}`} className={field.type==='row'?'bradi-editor-row':'bradi-editor-section'}>{typeof field.label==='string'&&<h4>{field.label}</h4>}<CardEditorFields fields={field.fields} path={groupPath} schemas={schemas} permissions={childPermissions} readOnly={readOnly||Boolean(field.name&&!access.operation)}/></div>;
  }
  return <BoundField key={field.name||index} field={field} path={`${path}.${field.name}`} schemas={schemas} permissions={permissions} readOnly={readOnly}/>;
 })}</>;
}
