import {visibilityFields,visibilityKeys,ctaColorKeys} from './card-controls';
import {ctaAlignmentField,type CTAAlignment} from './cta-alignment';
import {eyebrowFields,type EyebrowSettings} from './card-eyebrow';
import type {Field,TextField,Condition} from 'payload';
import {colorField} from './color-field';
import {textFields} from './text-fields';
export type CardAppearance=EyebrowSettings & {characterCard?:boolean;cardFunction?:'inherit'|'content'|'video'|'audio'|null;titleVisibility?:string|null;descriptionVisibility?:string|null;mediaVisibility?:string|null;ctaVisibility?:string|null;ctaBackgroundColor?:string|null;ctaTextColor?:string|null;ctaHoverBackgroundColor?:string|null;ctaHoverTextColor?:string|null;ctaAlign?:CTAAlignment;overlayOpacity?:number|null;backgroundMode?:'inherit'|'image'|'color'|'transparent'|null;composition?:'inherit'|'stacked'|'half'|'overlay'|null;badgeMode?:'inherit'|'custom'|'hidden'|null;badgeText?:string|null;hoverMode?:'inherit'|'default'|'custom'|'none'|null;hoverBackgroundColor?:string|null;hoverTextColor?:string|null;hoverTitleColor?:string|null;hoverNoteColor?:string|null;hoverBadgeBackgroundColor?:string|null;hoverBadgeTextColor?:string|null;hoverOpacity?:number|null;hoverShadow?:'none'|'soft'|'medium'|'strong'|null;enabled?:boolean|null;backgroundColor?:string|null;backgroundOpacity?:number|null;backgroundBlur?:number|null;textColor?:string|null;titleColor?:string|null;noteColor?:string|null;badgeBackgroundColor?:string|null;badgeTextColor?:string|null;borderColor?:string|null;borderRadius?:number|null;titleSize?:string|null;titleCustomSize?:number|null;titleAlign?:string|null;titleWeight?:string|null;noteSize?:string|null;noteCustomSize?:number|null;noteAlign?:string|null;noteWeight?:string|null};
export function cardAppearanceField(name='appearance',label='Aspetto card'):Field {
 const typography=textFields().filter(f=>!('name' in f)||f.name!=='headingLevel').map(f=>({...f,defaultValue:undefined,...(f.type==='select'?{enumName:`card_${f.name}`}:{})})) as Field[];
 const color=(name:string,label:string):TextField=>({...colorField(name,label),defaultValue:undefined});
 const textHoverColor=(name:string,label:string):TextField=>{
  const field=color(name,label);
  return {...field,admin:{...field.admin,components:{Field:{path:'/components/admin/ColorField#ColorField',clientProps:{label,transparentLabel:'Eredita',...(name==='hoverTextColor'?{description:'Base comune in Hover. Titolo e descrizione la usano finché non imposti un colore specifico.'}:{})}}}}};
 };
 const background:Field[]=[color('backgroundColor','Colore fondo'),{name:'backgroundOpacity',label:'Opacità del solo fondo (%)',type:'number',min:0,max:100},{name:'backgroundBlur',label:'Sfocatura dietro la card (px)',type:'number',min:0,max:30}];
 const borders:Field[]=[color('borderColor','Colore bordo'),{name:'borderRadius',label:'Raggio angoli (px)',type:'number',min:0,max:200}];
 const badgeColors:Field[]=[color('badgeBackgroundColor','Fondo etichetta'),color('badgeTextColor','Testo etichetta')];
 const cta:Field[]=[color('ctaBackgroundColor','Fondo CTA'),color('ctaTextColor','Testo CTA'),color('ctaHoverBackgroundColor','Fondo CTA hover'),color('ctaHoverTextColor','Testo CTA hover')];
 const enabled:Field={name:'enabled',label:'Personalizza colori e stile',type:'checkbox',defaultValue:false};
 if(name==='wideAppearance')return {name,label:false,type:'group',admin:{description:'Le impostazioni valgono solo per questa slide. Fondo e testi ereditano dal blocco: puoi personalizzarli qui. L’etichetta si gestisce sempre nella propria scheda.'},fields:[...visibilityFields(),{...enabled,label:'Personalizza fondo e testi della slide'}, {type:'tabs',tabs:[{label:'Fondo',fields:background},{label:'Titolo e testo',fields:[...eyebrowFields(),ctaAlignmentField(),...typography]},{label:'Etichetta',fields:[{name:'labelControl',type:'ui',admin:{components:{Field:'/components/admin/SlideLabel#SlideLabel'}}},...badgeColors]},{label:'CTA',fields:cta},{label:'Bordi',fields:borders}]}]};
 const normal=(fields:Field[])=>fields.map(f=>{const previous=f.admin?.condition;const condition:Condition=(data,s,context)=>Boolean(s.enabled)&&(!previous||previous(data,s,context));return {...f,admin:{...f.admin,condition}} as Field;});
 const hover=(f:Field):Field=>({...f,admin:{...f.admin,condition:(_,s)=>s.hoverMode==='custom'}} as Field);
 return {name,label,type:'group',fields:[
 ...(name==='cardAppearance'?[{name:'cardFunction',label:'Funzione comune delle card',type:'radio',enumName:'common_card_fn',options:[{label:'Eredita il comportamento attuale',value:'inherit'},{label:'Contenuto / pagina',value:'content'},{label:'Video',value:'video'},{label:'Audio',value:'audio'}],admin:{layout:'horizontal',description:'Decide cosa succede al clic. Ogni card può ereditare oppure scegliere una funzione diversa.'}} as Field]:[]),
 {name:'composition',label:'Presentazione della card',type:'radio',enumName:'card_composition',options:[{label:'Eredita',value:'inherit'},{label:'Default — immagine e testo con cornice',value:'stacked'},{label:'Half — immagine a filo e testo sotto',value:'half'},{label:'Wide — immagine piena e testi sopra',value:'overlay'}],admin:{layout:'horizontal',description:name==='cardAppearance'?'Presentazione comune delle card di questo blocco. Gli override dei singoli elementi prevalgono.':'Riguarda solo questa card; il blocco resta Default.'}},
 ...visibilityFields(),
 enabled,
 {type:'tabs',tabs:[
  {label:'Fondo',fields:[{name:'backgroundMode',label:'Tipo di fondo',type:'select',enumName:'card_surface_mode',options:[{label:'Eredita',value:'inherit'},{label:'Immagine',value:'image'},{label:'Colore',value:'color'},{label:'Trasparente',value:'transparent'}]},...normal(background),{name:'overlayOpacity',label:'Velo di leggibilità (%)',type:'number',min:0,max:100,admin:{description:'0% mantiene i colori originali; vuoto eredita il valore comune.',condition:(_,s)=>s.composition!=='stacked'&&(!s.backgroundMode||['inherit','image'].includes(s.backgroundMode))}}]},
  {label:'Testi',fields:[...eyebrowFields(),ctaAlignmentField(),...normal(typography)]},
  {label:'CTA',fields:cta},{label:'Bordi',fields:normal(borders)},
  {label:'Hover',fields:[
   {name:'hoverMode',label:'Comportamento al passaggio del mouse',type:'select',enumName:'card_hover_mode',options:[{label:'Eredita',value:'inherit'},{label:'UI originale',value:'default'},{label:'Personalizza',value:'custom'},{label:'Mantieni i colori normali',value:'none'}],admin:{description:'Eredita usa l’identità del personaggio e le impostazioni del blocco. Personalizza prevale solo in questa card; i colori vuoti ereditano. Rotazione e ombra restano effetti della UI.'}},
   ...[color('hoverBackgroundColor','Fondo hover'),textHoverColor('hoverTextColor','Colore base dei testi Hover'),textHoverColor('hoverTitleColor','Colore titolo Hover'),textHoverColor('hoverNoteColor','Colore descrizione Hover'),color('hoverBadgeBackgroundColor','Fondo etichetta hover'),textHoverColor('hoverBadgeTextColor','Colore testo etichetta Hover')].map(hover),
   hover({name:'hoverOpacity',label:'Opacità fondo hover (%)',type:'number',min:0,max:100}),
   ({name:'hoverShadow',label:'Ombra hover precedente',type:'select',admin:{hidden:true},enumName:'card_hover_shadow',options:[{label:'Nessuna',value:'none'},{label:'Leggera',value:'soft'},{label:'Media',value:'medium'},{label:'Marcata',value:'strong'}]} as Field),
  ]},
  {label:'Etichetta',fields:[
   {name:'badgeMode',label:'Etichetta dell’elemento',type:'select',enumName:'card_badge_mode',options:[{label:'Eredita',value:'inherit'},{label:'Personalizza',value:'custom'},{label:'Nascondi',value:'hidden'}]},
   ...[{name:'badgeText',label:'Testo etichetta (vuoto = ereditato)',type:'text'} as Field,...badgeColors].map(f=>({...f,admin:{...f.admin,condition:(_,s)=>s.badgeMode==='custom'||Boolean(s.enabled)&&!s.badgeMode}} as Field)),
  ]},
 ]}]};
}
const clean=(value:unknown)=>value!==null&&value!==undefined&&value!==''&&value!=='auto'&&value!=='inherit';
export function mergeCardAppearance(...values:(CardAppearance|null|undefined)[]):CardAppearance|undefined {
 const merged:Record<string,unknown>={};
 for(const value of values){
  if(!value)continue;
  for(const key of [...visibilityKeys,...ctaColorKeys])if(clean(value[key]))merged[key]=value[key];
  if(value.ctaAlign&&value.ctaAlign!=='inherit')merged.ctaAlign=value.ctaAlign;
  if(value.eyebrowMode){merged.eyebrowMode=value.eyebrowMode;merged.eyebrowText=value.eyebrowText;}
  if(value.enabled)for(const [key,item] of Object.entries(value))if(!key.startsWith('hover')&&key!=='badgeMode'&&key!=='badgeText'&&!(key.startsWith('badge')&&value.badgeMode)&&!(value.backgroundMode==='inherit'&&['backgroundColor','backgroundOpacity','backgroundBlur'].includes(key))&&clean(item))merged[key]=item;
  if(value.enabled&&!value.backgroundMode&&clean(value.backgroundColor))merged.backgroundMode=value.backgroundColor==='transparent'?'transparent':'color';
  if(value.overlayOpacity!=null)merged.overlayOpacity=value.overlayOpacity;
  if(value.cardFunction&&(value.cardFunction as string)!=='inherit')merged.cardFunction=value.cardFunction;
  if(value.composition&&value.composition!=='inherit')merged.composition=value.composition;
  if(value.backgroundMode&&value.backgroundMode!=='inherit')merged.backgroundMode=value.backgroundMode;
  if(value.hoverMode&&value.hoverMode!=='inherit'){
   merged.hoverMode=value.hoverMode;
   if(value.hoverMode==='custom')for(const [key,item] of Object.entries(value))if(key.startsWith('hover')&&clean(item))merged[key]=item;
  }
  if(value.badgeMode&&value.badgeMode!=='inherit'){
   merged.badgeMode=value.badgeMode;
   if(value.badgeMode==='custom')for(const key of ['badgeText','badgeBackgroundColor','badgeTextColor'] as const)if(clean(value[key]))merged[key]=value[key];
  }
 }
 return Object.keys(merged).length?{...merged,enabled:true}:undefined;
}
