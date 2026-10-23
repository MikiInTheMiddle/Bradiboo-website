import {branchRead,exploreVisibilityField,invalidateBranchPublication} from './branch-publication';
import {containerPageURL,ensureHierarchyPage} from './production-pages';
import {audioUpload} from './card-audio';
import {galleryPhotosField,momentsField} from './gallery-fields';
import type {CollectionConfig,CollectionBeforeValidateHook,CollectionAfterChangeHook,Field} from 'payload';
import {termField} from './watch-terms';
const idOf=(v:any)=>v&&typeof v==='object'?v.id:v;
export const productionHierarchy:CollectionBeforeValidateHook=async({data,originalDoc,req,context})=>{
 if(!data||context.hierarchyMigration)return data;
 const role=data.recordType||originalDoc?.recordType||(data.kind==='episodio'||originalDoc?.kind==='episodio'||data.parent?'episode':'production');
 data.recordType=role;
 const parent=idOf(data.parent===undefined?originalDoc?.parent:data.parent);
 if(role==='production'){
  if(parent&&parent!==originalDoc?.id)throw new Error('Una produzione appartiene a un contenitore, non a un’altra produzione.');
  data.parent=null;
 }else if(parent){
  if(parent===originalDoc?.id)throw new Error('Un episodio non può appartenere a sé stesso.');
  const production=await req.payload.findByID({collection:'contents',id:parent,depth:0,req});
  if(production.recordType!=='production')throw new Error('Seleziona una produzione come sottocontenitore.');
  data.container=idOf(production.container)||null;
 }
 const group=idOf(data.container===undefined?originalDoc?.container:data.container);
 if(role==='episode')data.kind='episodio';
 else if(group){
  const container=await req.payload.findByID({collection:'production-containers',id:group,depth:0,req});
  data.kind=['serie','miniserie','format'].includes(container.slug)?container.slug:'format';
 }
 if(role==='production'&&!group)data.kind=data.kind||originalDoc?.kind||'format';
 return data;
};
export const syncProductionContainer:CollectionAfterChangeHook=async({doc,previousDoc,req,context})=>{
 if(context.hierarchyMigration||context.syncProductionContainer||doc.recordType!=='production'||idOf(doc.container)===idOf(previousDoc?.container))return doc;
 const episodes=await req.payload.find({collection:'contents',where:{parent:{equals:doc.id}},limit:10000,depth:0,req});
 for(const episode of episodes.docs)await req.payload.update({collection:'contents',id:episode.id,data:{container:idOf(doc.container)||null},req,context:{...context,syncProductionContainer:true}});
 return doc;
};
export const hierarchyFields:Field[]=[
 {...exploreVisibilityField,admin:{...exploreVisibilityField.admin,condition:(_,s)=>s.recordType==='production'}},
 {name:'recordType',label:'Tipo di scheda',type:'radio',options:[{label:'Produzione / sottocontenitore',value:'production'},{label:'Episodio / video',value:'episode'}],admin:{layout:'horizontal',description:'Una produzione raccoglie gli episodi. Il contenitore superiore è gestibile nella sezione Contenitori.'}},
 {name:'container',label:'Contenitore',type:'relationship',relationTo:'production-containers',validate:(value:any,{siblingData:s}:any)=>s.recordType!=='production'||Boolean(value)||'Seleziona il contenitore della produzione.',admin:{condition:(_,s)=>s.recordType!=='episode'||!s.parent,description:'Serie, Miniserie, Format o un nuovo contenitore. Con un sottocontenitore selezionato viene ricavato automaticamente.'}},
 {name:'episodes',label:'Episodi di questa produzione',type:'join',collection:'contents',on:'parent',maxDepth:0,admin:{defaultColumns:['title','_status'],allowCreate:true,condition:(_,s)=>s.recordType==='production',description:'Apri o crea gli episodi qui. Le loro schede mantengono i controlli comuni; l’appartenenza viene conservata nel collegamento.'}},
];
const authenticated=({req}:any)=>Boolean(req.user);
export const productionContainers:CollectionConfig={
 slug:'production-containers',labels:{singular:'Contenitore',plural:'Contenitori'},admin:{useAsTitle:'title',defaultColumns:['title','slug','_status'],description:'Livello principale: Serie, Miniserie, Format e nuovi contenitori. Le produzioni si gestiscono nella tab Produzioni della singola scheda.'},
 access:{read:branchRead('production-containers'),create:authenticated,update:authenticated,delete:authenticated},versions:{drafts:true},
 hooks:{afterDelete:[invalidateBranchPublication],beforeValidate:[containerPageURL],afterChange:[invalidateBranchPublication,ensureHierarchyPage('production-containers')],beforeDelete:[async({req,id})=>{const children=await req.payload.count({collection:'contents',where:{container:{equals:id}},req});if(children.totalDocs)throw new Error('Sposta prima le produzioni e gli episodi associati a questo contenitore.');}]},
 fields:[{name:'title',label:'Titolo',type:'text',required:true},{name:'slug',label:'Identificatore',type:'text',required:true,unique:true},
 {type:'tabs',tabs:[{label:'Scheda',fields:[{name:'description',label:'Descrizione',type:'textarea'}]},
 {label:'Immagini e momenti',fields:[galleryPhotosField(),momentsField()]},
 {label:'Copertine',fields:[audioUpload(),{name:'cover',label:'Copertina landscape',type:'upload',relationTo:'media'},{name:'coverMobile',label:'Copertina portrait / mobile',type:'upload',relationTo:'media'}]},
 {label:'Tematiche',fields:[termField('themeTerms','Tematiche','topic'),termField('keywordTerms','Keyword','keyword')]},
 {label:'Produzioni',description:'Sottocontenitori di questo contenitore: apri una scheda o creane una nuova. Episodi e override restano nelle rispettive schede.',fields:[{name:'productions',label:'Produzioni',type:'join',collection:'contents',on:'container',where:{recordType:{equals:'production'}},maxDepth:0,admin:{allowCreate:true,defaultColumns:['title','recordType','_status']}}]},
 {label:'Collegamenti',fields:[exploreVisibilityField,{name:'url',label:'Pagina del contenitore',type:'text'}]}]},
 ]
};
