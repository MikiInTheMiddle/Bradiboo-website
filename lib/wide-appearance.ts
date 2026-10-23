import {visibilityKeys,ctaColorKeys} from './card-controls';
import type {Field} from 'payload';
import {cardAppearanceField,mergeCardAppearance,type CardAppearance} from './card-appearance';
import {colorField} from './color-field';
export type WideAppearance=CardAppearance & {image?:unknown;backgroundImage?:string;backgroundMode?:'inherit'|'image'|'color'|'transparent'|null;overlayOpacity?:number|null;ctaBackgroundColor?:string|null;ctaTextColor?:string|null};
export function wideAppearanceField():Field {
 const base=cardAppearanceField('wideAppearance','Aspetto della slide Wide');
 if(base.type!=='group')throw new Error('Expected group');
 return {...base,fields:base.fields.map((field):Field=>{
  if(field.type!=='tabs')return field;
  return {...field,tabs:field.tabs.filter(tab=>tab.label!=='Hover').map(tab=>{
   if(tab.label!=='Fondo')return tab;
   const fields:Field[]=[
    {name:'backgroundMode',label:'Fondo della slide',type:'select',enumName:'wide_background_mode',options:[{label:'Immagine del contenuto / override',value:'image'},{label:'Colore',value:'color'},{label:'Trasparente',value:'transparent'}]},
    {name:'image',label:'Immagine principale della slide (override)',type:'upload',relationTo:'media',admin:{description:'Vuoto: eredita la copertina del contenuto o l’immagine dell’elemento.',condition:(_,s)=>!s.backgroundMode||s.backgroundMode==='image'}},
    ...tab.fields.map((f):Field=>f.type==='number'&&f.name==='backgroundBlur'?{...f,label:'Sfocatura del fondo (px)',admin:{description:'Sfoca solo immagine e fondo della slide; testi e CTA restano nitidi.'}}:f),
    {name:'overlayOpacity',label:'Velo di leggibilità (%)',type:'number',min:0,max:100},
   ];
   return {...tab,fields};
  })};
 })};
}

/** Slide labels are independent from the optional background/text style override. */
export function mergeWideAppearance(...values:(WideAppearance|null|undefined)[]):WideAppearance|undefined {
 const normal=mergeCardAppearance(...values.map(value=>value?.enabled?value:undefined)) as WideAppearance|undefined;
 const labels:Partial<WideAppearance>={};
 for(const value of values)if(value)for(const key of [...visibilityKeys,...ctaColorKeys])if(value[key]&&value[key]!=='inherit')(labels as any)[key]=value[key];
 for(const value of values)if(value?.ctaAlign&&value.ctaAlign!=='inherit')labels.ctaAlign=value.ctaAlign;
 for(const value of values)if(value?.eyebrowMode){labels.eyebrowMode=value.eyebrowMode;labels.eyebrowText=value.eyebrowText;}
 for(const value of values)for(const key of ['badgeBackgroundColor','badgeTextColor'] as const)if(value?.[key])labels[key]=value[key];
 return normal||Object.keys(labels).length?{...normal,...labels}:undefined;
}
