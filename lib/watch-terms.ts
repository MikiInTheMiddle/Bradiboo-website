import type { CollectionConfig, Field } from 'payload';
const authenticated=({req}:{req:{user?:unknown}})=>Boolean(req.user);
export const watchTerms:CollectionConfig={
 slug:'watch-terms',labels:{singular:'Tema / keyword',plural:'Temi e keyword'},
 admin:{useAsTitle:'name',defaultColumns:['name','taxonomy','source','wordpressID'],description:'Dizionari condivisi da Contenuti, filtri, fascioni e ZAP!. Importa da WordPress oppure crea una voce locale.',components:{beforeListTable:['/components/admin/SyncWatchTerms#SyncWatchTerms']}},
 access:{read:()=>true,create:authenticated,update:authenticated,delete:({req})=>req.user?{source:{equals:'local'}}:false},
 hooks:{beforeValidate:[({data,originalDoc,context})=>{if(data){data.taxonomy=data.taxonomy||originalDoc?.taxonomy;data.slug=context.taxonomySync&&data.slug?data.slug:String(data.slug||originalDoc?.slug||data.name||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');data.key=`${data.taxonomy}:${data.slug}`;}return data;}],beforeChange:[({data,originalDoc,context})=>{if(originalDoc?.source==='wordpress'&&!context.taxonomySync){for(const field of ['name','slug','taxonomy'])if(data[field]!==undefined&&data[field]!==originalDoc[field])throw new Error('I termini WordPress si modificano sull’headless. Puoi aggiungere una voce locale.');}return data;}]},
 fields:[
  {name:'name',label:'Nome',type:'text',required:true},
  {name:'taxonomy',label:'Categoria',type:'select',required:true,defaultValue:'topic',options:[{label:'Temi / emozioni',value:'topic'},{label:'Keyword / argomenti',value:'keyword'}]},
  {name:'slug',label:'Identificatore (automatico dal nome se vuoto)',type:'text',required:true},
  {name:'key',type:'text',unique:true,admin:{hidden:true}},
  {name:'source',label:'Provenienza',type:'select',defaultValue:'local',options:[{label:'Locale · Payload',value:'local'},{label:'Headless · WordPress',value:'wordpress'}],admin:{readOnly:true},access:{create:()=>false,update:()=>false}},
  {name:'wordpressID',label:'ID WordPress',type:'number',unique:true,admin:{readOnly:true},access:{create:()=>false,update:()=>false}},
  {name:'syncedAt',label:'Ultima sincronizzazione',type:'date',admin:{readOnly:true},access:{create:()=>false,update:()=>false}},
 ],
};
export function termField(name:string,label:string,taxonomy:'topic'|'keyword'):Field{return {name,label,type:'relationship',relationTo:'watch-terms',hasMany:true,filterOptions:{taxonomy:{equals:taxonomy}},admin:{allowCreate:true,description:'Cerca digitando, seleziona più voci o aggiungine una locale con +. Le voci WordPress restano gestite sull’headless.'}};}
