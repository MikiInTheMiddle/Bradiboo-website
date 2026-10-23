import assert from 'node:assert/strict';
import {registerHooks,createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
const reactPath=pathToFileURL(createRequire(import.meta.url).resolve('react')).href;
const testState={path:'blocks.0.cards.0.image',value:42,passesCondition:false,input:null as any};
(globalThis as any).__imageUploaderTest=testState;
// Isolate Payload form context. Model the source field's false visibility condition;
// UploadInput is its public, unconditional input primitive, UploadField is gated.
const stub=`import React from ${JSON.stringify(reactPath)};
export function useFormFields(fn){return fn([{}]);}
export function useForm(){return {dispatchFields(){},setModified(){}};}
export function useConfig(){return {config:{routes:{api:'/api'},serverURL:''}};}
export function useField({path}){const s=globalThis.__imageUploaderTest;return {value:s.value,passesCondition:s.passesCondition,setValue:value=>{s.path=path;s.value=value;},disabled:false};}
export function BulkUploadProvider({children}){return children;}
export function UploadInput(props){globalThis.__imageUploaderTest.input=props;return React.createElement('button',{'data-upload-path':props.path,disabled:props.readOnly},'Scegli immagine principale');}
export function UploadField(props){return globalThis.__imageUploaderTest.passesCondition===false?null:React.createElement(UploadInput,props);}`;
const moduleURL=`data:text/javascript,${encodeURIComponent(stub)}`;
const hooks=registerHooks({resolve(specifier,context,next){return specifier==='@payloadcms/ui'?{url:moduleURL,shortCircuit:true}:next(specifier,context);}});
try{
 const {CardBackgroundImage}=await import('../components/admin/CardBackgroundImage');
 const html=renderToStaticMarkup(createElement(CardBackgroundImage,{path:'blocks.0.cards.0.appearance.backgroundImageControl',schemaPath:'pages._index-0.blocks.featured._index-1.cards.appearance._index-2.backgroundImageControl'}));
 assert.ok(html.includes('Scegli immagine principale'),'Replacement uploader must render even when original Default media control is hidden');
 assert.equal(testState.input.path,'blocks.0.cards.0.image');
 assert.equal(testState.input.value,42);
 testState.input.onChange(84);
 assert.equal(testState.value,84);
 assert.equal(testState.path,'blocks.0.cards.0.image');
 assert.equal(testState.passesCondition,false,'Do not change original field visibility to make the replacement input work');
 console.log('OK: replacement uploader renders despite hidden Default source control; selection writes the existing main image, not the mobile image.');
}finally{hooks.deregister();delete (globalThis as any).__imageUploaderTest;}
