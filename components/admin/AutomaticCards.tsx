'use client';
import {useEffect,useState} from 'react';
import {useForm,useFormFields} from '@payloadcms/ui';
import {contentSelectionQuery,selectCharacterCards} from '@/lib/content-selection';
import {CardEditor} from './CardEditor';
type Option={id:number|string;title?:string;name?:string;cover?:any;portrait?:any};
const id=(v:any)=>v&&typeof v==='object'?v.id:v;
function query(value:any,prefix='',params=new URLSearchParams()):URLSearchParams{
 for(const [k,v] of Object.entries(value||{})){if(v===undefined||v===null)continue;const key=prefix?`${prefix}[${k}]`:k;if(typeof v==='object')query(v,key,params);else params.set(key,String(v));}return params;
}
export function AutomaticCards({path,schemaPath,blockSlug,readOnly=false}:{path:string;schemaPath:string;blockSlug:string;readOnly?:boolean}){
 const prefix=path.includes('.')?path.slice(0,path.lastIndexOf('.')):'';
 const at=(key:string)=>prefix?`${prefix}.${key}`:key;
 const form=useForm();const fields=useFormFields(([f])=>f);
 const data=()=>{const all=form.getData() as any;return prefix?prefix.split('.').reduce((v,k)=>v?.[k],all):all;};
 const block=data()||{};const page=form.getData() as any;
 const signature=JSON.stringify({selection:block.contentSelection,mode:block.mode,character:block.character,pageCharacter:page.character,production:block.production,characters:block.characters,themeTerms:block.themeTerms,keywordTerms:block.keywordTerms,limit:block.limit});
 const [options,setOptions]=useState<Option[]>([]);const [busy,setBusy]=useState(false);const [error,setError]=useState('');const [active,setActive]=useState<string>();
 const watch=['watch','watchRail','watchExperience','zapExperience'].includes(blockSlug);
 const automatic=watch&&block.mode!=='manual'||Boolean(block.contentSelection?.enabled)||['characterFriends','dynamic','episodes'].includes(blockSlug)||blockSlug==='featured'&&block.mode==='automatic';
 const relation=block.contentSelection?.enabled&&block.contentSelection.by==='characters'||blockSlug==='characterFriends'&&!block.contentSelection?.enabled?'characters':'contents';
 useEffect(()=>{setOptions([]);setError('');setActive(undefined);if(!automatic)return;
  const abort=new AbortController();setBusy(true);
  async function load(){
   let args:any;let orderedIDs:any[]|undefined;
   if(block.contentSelection?.enabled&&block.contentSelection.by==='characters'){const response=await fetch('/api/characters?limit=1000&depth=1',{signal:abort.signal});if(!response.ok)throw Error();const docs=(await response.json()).docs;return selectCharacterCards(docs,block.contentSelection,page.character);}
   if(block.contentSelection?.enabled)args=contentSelectionQuery(block.contentSelection,page.character);
   else if(watch){
    const and:any[]=[{_status:{equals:'published'}},{or:[{watchKind:{exists:true}},{kind:{equals:'episodio'}}]},{playbackSource:{in:'youtube,file'}}];
    for(const key of ['characters','themeTerms','keywordTerms'])if(block[key]?.length)and.push({[key]:{in:block[key].map(id).join(',')}});
    args={where:{and},sort:'-createdAt',limit:blockSlug==='watchRail'?block.limit||6:1000};
   }else if(blockSlug==='characterFriends'){
    const character=id(page.character);if(!character)return [];
    const response=await fetch(`/api/characters/${character}?depth=0`,{signal:abort.signal});if(!response.ok)throw Error();const doc=await response.json();orderedIDs=doc.friends?.length?doc.friends.map(id):undefined;
    args={where:doc.friends?.length?{id:{in:doc.friends.map(id).filter((v:any)=>String(v)!==String(character)).join(',')}}:{id:{not_equals:character}},limit:100};
   }else if(blockSlug==='featured')args={where:{and:[{_status:{equals:'published'}},{highlight:{equals:true}}]},sort:'highlightOrder,-createdAt',limit:block.limit||6};
   else if(blockSlug==='episodes')args={where:{and:[{_status:{equals:'published'}},{parent:{equals:id(block.production)||-1}},{recordType:{equals:'episode'}}]},sort:'createdAt',limit:block.limit||24};
   else args={where:{and:[{_status:{equals:'published'}},{characters:{contains:id(block.character)||id(page.character)||-1}}]},sort:'-createdAt',limit:block.limit||6};
   const response=await fetch(`/api/${relation}?${query({...args,depth:1})}`,{signal:abort.signal});if(!response.ok)throw Error();const docs=(await response.json()).docs as Option[];return orderedIDs?docs.sort((a,b)=>orderedIDs!.map(String).indexOf(String(a.id))-orderedIDs!.map(String).indexOf(String(b.id))):docs;
  }
  load().then(rows=>{if(!abort.signal.aborted)setOptions(rows);}).catch(()=>{if(!abort.signal.aborted)setError('Non riesco a recuperare le card. Riprova modificando la selezione o ricaricando la pagina.');}).finally(()=>{if(!abort.signal.aborted)setBusy(false);});return()=>abort.abort();
 },[signature,automatic,relation,blockSlug]);
 if(!automatic)return null;
 const arrayName=blockSlug==='watchRail'?'entries':'cardOverrides';
 const arrayPath=at(arrayName);const rows=data()?.[arrayName]||[];
 const arraySchema=`${schemaPath.slice(0,schemaPath.lastIndexOf('.'))}.${arrayName}`;
 const rowIndex=(option:Option,index:number)=>rows.findIndex((r:any)=>r[relation==='characters'?'character':'content']?String(id(r[relation==='characters'?'character':'content']))===String(option.id):r.position===index+1);
 const open=async(option:Option,index:number)=>{
  setError('');const existing=rowIndex(option,index);
  if(existing<0){
   try{await form.addFieldRow({path:arrayPath,schemaPath:arraySchema,subFieldState:{[relation==='characters'?'character':'content']:{value:option.id,initialValue:option.id,valid:true}}});}
   catch{setError('Non riesco ad aprire la card. Le personalizzazioni già salvate sono conservate.');return;}
  }
  setActive(String(option.id));
 };
 // Subscribe to native row fields: all changes are saved in the original override array.
 void fields;
 return <section className="bradi-automatic-cards"><h3>Card recuperate automaticamente</h3><p>Funzione e presentazione ereditano dallo Stile comune delle card. Apri una card solo per un’eccezione locale.</p>{busy&&<p>Caricamento card…</p>}{error&&<p role="alert">{error}</p>}{!busy&&!error&&!options.length&&<p>Nessun contenuto corrisponde alla selezione.</p>}
 {options.map((option,index)=>{const row=rowIndex(option,index);const expanded=active===String(option.id)&&row>=0;return <div key={option.id} style={{border:'1px solid var(--theme-elevation-150)',borderRadius:10,marginBlock:12,padding:16}}><button type="button" disabled={readOnly} aria-expanded={expanded} onClick={()=>expanded?setActive(undefined):void open(option,index)} style={{width:'100%',textAlign:'left'}}>{index+1}. {option.title||option.name} · {row>=0?'Personalizzata':'Eredita dal blocco'} {expanded?'−':'Apri'}</button>{expanded&&<div style={{paddingTop:20}}><CardEditor path={`${arrayPath}.${row}.editorControl`} schemaPath={`${arraySchema}.editorControl`} readOnly={readOnly} automatic/></div>}</div>;})}
 </section>;
}
