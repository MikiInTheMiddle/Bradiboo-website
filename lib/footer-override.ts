import type {Field} from 'payload';
import {colorField} from './color-field';
import type {FooterDecorationSettings} from '../components/footer-decoration';
export type FooterOverride={enabled?:boolean|null;customColor?:boolean|null;color?:string|null;customImage?:boolean|null;image?:any;mobileImage?:any}|null;
export const footerOverrideField:Field={name:'footerOverride',label:'Footer della pagina',type:'group',fields:[
 {name:'enabled',label:'Personalizza il footer solo in questa pagina',type:'checkbox',admin:{description:'Disattivato: usa sempre il footer globale. Le impostazioni locali restano conservate.'}},
 {name:'customColor',label:'Personalizza colore del footer',type:'checkbox',admin:{condition:(_,s)=>Boolean(s.enabled)}},
 {...colorField('color','Colore del footer'),defaultValue:undefined,admin:{...colorField('color','Colore del footer').admin,condition:(_,s)=>Boolean(s.enabled&&s.customColor)}},
 {name:'customImage',label:'Sostituisci immagine sopra al footer',type:'checkbox',admin:{condition:(_,s)=>Boolean(s.enabled)}},
 {name:'image',label:'Immagine superiore',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'image/'}},admin:{condition:(_,s)=>Boolean(s.enabled&&s.customImage),description:'Vuoto: eredita quella globale. Posizione e disposizione restano quelle globali.'}},
 {name:'mobileImage',label:'Alternativa mobile (facoltativa)',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'image/'}},admin:{condition:(_,s)=>Boolean(s.enabled&&s.customImage&&s.image),description:'Vuoto: usa la nuova immagine principale anche su mobile.'}},
]};
export function resolveFooterOverride(global:FooterDecorationSettings|undefined,local?:FooterOverride){
 const hasImage=local?.enabled&&local.customImage&&local.image&&typeof local.image==='object'&&local.image.url;
 return {color:local?.enabled&&local.customColor&&local.color?local.color:undefined,decoration:hasImage?{...global,enabled:true,image:local.image,mobileImage:local.mobileImage||null}:global};
}
