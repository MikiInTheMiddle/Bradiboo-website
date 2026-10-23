import type {Field,FilterOptionsProps,Where} from 'payload';
const idOf=(v:any)=>v&&typeof v==='object'?v.id:v;
export const sourceCategoryField:Field={
 name:'sourceCategory',label:'Tipo di sorgente',type:'select',virtual:true,
 options:[{label:'Contenitore',value:'container'},{label:'Produzione / sottocontenitore',value:'production'},{label:'Episodio / video',value:'episode'},{label:'Personaggio',value:'character'},{label:'Media (immagine)',value:'media'},{label:'Pagina precedente — da aggiornare',value:'legacy-page'}],
 hooks:{afterRead:[async({value,siblingData:s,req})=>{
  if(value)return value;
  const rel=s.source?.relationTo;const selected=s.source?.value;
  if(!selected)return undefined;
  if(rel==='contents'){
   const doc=selected&&typeof selected==='object'?selected:await req.payload.findByID({collection:'contents',id:selected,depth:0,req});
   return doc.recordType==='episode'||doc.kind==='episodio'?'episode':'production';
  }
  return ({'production-containers':'container',characters:'character',media:'media',pages:'legacy-page'} as Record<string,string>)[rel]||undefined;
 }]},
 admin:{condition:(_,s)=>s.sourceMode==='linked'||Boolean(s.source)&&s.sourceMode!=='manual'&&s.sourceMode!=='profile',description:'Scegli prima la categoria, poi cerca la scheda nel campo sotto.',components:{Field:'/components/admin/CardSourceCategory#CardSourceCategory'}},
};
export const filterCardSources=({relationTo,siblingData}:FilterOptionsProps<any>):boolean|Where=>{
 const s=siblingData as Record<string,any>;
 const category=s.sourceCategory;
 if(relationTo==='pages')return s.source?.relationTo==='pages'?{id:{equals:idOf(s.source.value)}}:false;
 const expected=({container:'production-containers',production:'contents',episode:'contents',character:'characters',media:'media'} as Record<string,string>)[category];
 if(!expected)return s.source?.relationTo===relationTo?{id:{equals:idOf(s.source.value)}}:false;
 if(expected!==relationTo)return false;
 if(relationTo==='contents')return {and:[{_status:{equals:'published'}},{recordType:{equals:category}}]};
 if(relationTo==='media')return {mimeType:{contains:'image/'}};
 return true;
};
