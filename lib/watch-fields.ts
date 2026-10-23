import {watchRailSurfaceField} from './watch-rail-surface';
import {audioUpload} from './card-audio';
import {cardAppearanceField} from './card-appearance';
import type { Field, GlobalConfig } from 'payload';
import {termField} from './watch-terms';
import { watchThemes, watchKeywords, watchFilterOptions } from './watch-model';
const authenticated=({req}:{req:{user?:unknown}})=>Boolean(req.user);
export const watchContentFields:Field[]=[audioUpload(),
 {name:'emotionalCore',label:'Nucleo emotivo (testo editoriale)',type:'textarea'},
 termField('themeTerms','Temi / emozioni','topic'),
 termField('keywordTerms','Keywords / argomenti','keyword'),
 {name:'watchThemes',label:'Temi precedenti',admin:{hidden:true},type:'select',hasMany:true,options:watchThemes.map(({value,label})=>({value,label}))},
 {name:'watchKeywords',label:'Keyword precedenti',admin:{hidden:true},type:'select',hasMany:true,options:watchKeywords.map(({value,label})=>({value,label}))},
 {name:'watchKind',label:'Tipologia guardabile',type:'select',options:[{label:'Episodio serie',value:'serie'},{label:'Episodio breve',value:'breve'},{label:'Video di un format',value:'format'},{label:'Trailer / speciale',value:'trailer'}],admin:{description:'Vuoto: è una presentazione di produzione, esclusa dal catalogo guardabile.'}},
 {name:'playbackSource',label:'Sorgente player',type:'select',defaultValue:'none',options:[{label:'Video non ancora disponibile',value:'none'},{label:'YouTube',value:'youtube'},{label:'File video',value:'file'}]},
 {name:'playbackURL',label:'URL YouTube',type:'text',admin:{condition:(_,s)=>s.playbackSource==='youtube'}},
 {name:'playbackFile',label:'File video',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'video/'}},admin:{condition:(_,s)=>s.playbackSource==='file'}},
];
export const watchGlobal:GlobalConfig={slug:'watch',label:'Guarda — catalogo e fascioni',access:{read:()=>true,update:authenticated},fields:[
 cardAppearanceField('cardAppearance','Aspetto predefinito delle card del catalogo'),
 {name:'cardOverrides',label:'Aspetto di singoli contenuti in Guarda',type:'array',fields:[{name:'content',label:'Contenuto',type:'relationship',relationTo:'contents',required:true},cardAppearanceField()]},
 {name:'metadataVersion',type:'number',defaultValue:0,admin:{hidden:true}},
 {name:'showSamples',label:'Mostra schede demo nella preview locale',type:'checkbox',defaultValue:true,admin:{description:'Solo in WIREFRAME_PREVIEW. Le schede della bible sono esempi UX, senza video inventati.'}},
 {name:'filters',label:'Filtri di Guarda (ordine trascinabile)',type:'array',admin:{description:'Ordine dei filtri nel pannello Cerca. I gruppi sono sempre chiusi all’apertura della ricerca. Nascosto: escluso.'},fields:[
  {name:'key',label:'Filtro',type:'select',required:true,options:[...watchFilterOptions]},
  {name:'label',label:'Etichetta personalizzata',type:'text'},
  {name:'placement',label:'Posizione',type:'select',required:true,defaultValue:'secondary',options:[{label:'Primario',value:'primary'},{label:'Altri filtri',value:'secondary'},{label:'Nascosto',value:'hidden'}]},
 ]},
 {name:'fullZap',label:'Attiva il telecomando ZAP! completo',type:'checkbox',defaultValue:false,admin:{description:'Disattivato: ZAP sceglie un video casuale e Cerca rimane separato. I pulsanti tematici restano salvati.'}},
 {name:'zapLogo',label:'Logo ZAP!',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'image/'}},admin:{description:'Usato sul pulsante chiuso e come titolo del telecomando aperto.'}},
 {name:'searchIcon',label:'Icona del pulsante Cerca',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'image/'}},admin:{description:'Facoltativa. Senza immagine viene mostrata la lente.'}},
 {name:'remoteButtons',label:'ZAP! — pulsanti (ordine trascinabile)',type:'array',maxRows:10,admin:{condition:(_,s)=>Boolean(s.fullZap)},fields:[
  {name:'label',label:'Nome accessibile',type:'text',required:true},
  {name:'image',label:'Icona / illustrazione',type:'upload',relationTo:'media'},
  {name:'icon',label:'Icona provvisoria',type:'select',options:watchKeywords.map(t=>({label:t.label,value:t.icon})),defaultValue:'shapes'},
  termField('keywordTerms','Keyword associate','keyword'),
  {name:'keywords',label:'Keyword associate precedenti',type:'select',hasMany:true,options:watchKeywords.map(({value,label})=>({value,label})),admin:{hidden:true}},
 ]},
 {name:'rails',label:'Fascioni editoriali (ordine trascinabile)',type:'array',admin:{description:'Assegna un nome e scegli parole chiave condivise. Le card aprono il video nel player di Guarda; i fascioni vuoti non compaiono.'},fields:[
 cardAppearanceField('cardAppearance','Aspetto delle card di questo fascione'),
 watchRailSurfaceField(),
  {name:'title',label:'Titolo pubblico',type:'text',required:true},{name:'description',label:'Introduzione',type:'textarea'},
  {name:'mode',label:'Selezione',type:'select',defaultValue:'automatic',options:[{label:'Automatica per metadati',value:'automatic'},{label:'Manuale dal catalogo',value:'manual'}]},
  termField('themeTerms','Temi / emozioni','topic'),
  termField('keywordTerms','Keywords','keyword'),
  {name:'keywordMatch',label:'Corrispondenza parole chiave',type:'radio',defaultValue:'any',options:[{label:'Almeno una',value:'any'},{label:'Tutte',value:'all'}],admin:{layout:'horizontal',condition:(_,s)=>s.mode!=='manual'}},
  {name:'themes',label:'Temi precedenti',admin:{hidden:true},type:'select',hasMany:true,options:watchThemes.map(({value,label})=>({value,label}))},
  {name:'keywords',label:'Keyword precedenti',admin:{hidden:true},type:'select',hasMany:true,options:watchKeywords.map(({value,label})=>({value,label}))},
  {name:'characters',label:'Personaggi',type:'relationship',relationTo:'characters',hasMany:true},
  {name:'entries',label:'Contenuti manuali (ordine trascinabile)',type:'array',fields:[{name:'content',label:'Contenuto',type:'relationship',relationTo:'contents',required:true},cardAppearanceField()]},
  {name:'limit',label:'Numero massimo',type:'number',min:1,max:24,defaultValue:6},
 ]},
]};
