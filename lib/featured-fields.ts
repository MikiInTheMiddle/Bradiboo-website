import {cardAppearanceField} from './card-appearance';
import type {Field} from 'payload';
export const slideMediaFields=():Field[]=>[
 {name:'mobileImage',label:'Immagine alternativa mobile',type:'upload',relationTo:'media',admin:{description:'Facoltativa, preferibilmente verticale. In sua assenza viene ritagliata l’immagine principale.'}},
 {name:'focalX',label:'Punto focale orizzontale (%)',type:'number',min:0,max:100,admin:{description:'0 = sinistra, 50 = centro, 100 = destra.'}},
 {name:'focalY',label:'Punto focale verticale (%)',type:'number',min:0,max:100},
 {name:'hideBadge',label:'Nascondi etichetta per questa slide',type:'checkbox'},
];
export const featuredFields:Field[]=[
 {name:'presentation',label:'Presentazione',type:'select',admin:{components:{Field:'/components/admin/PresentationToggle#PresentationToggle'}},defaultValue:'cards',options:[{label:'Default',value:'cards'},{label:'Wide — immagine e testi sovrapposti',value:'wide'}]},
 {name:'wideOverlayOpacity',label:'Intensità velo sull’immagine (%)',type:'number',min:0,max:100,defaultValue:55,admin:{condition:(_,s)=>s.presentation==='wide'}},
 {name:'slideOverrides',label:'Override delle slide automatiche',type:'array',admin:{condition:(_,s)=>s.mode==='automatic',description:'Scegli il contenuto. I campi vuoti ereditano i dati originali; gli override valgono solo in questo modulo.'},fields:[
  {name:'content',label:'Contenuto',type:'relationship',relationTo:'contents',required:true},
  cardAppearanceField('appearance','Override della card'),
  {type:'tabs',tabs:[
   {label:'Contenuto',fields:[{name:'label',label:'Titolo alternativo',type:'text'},{name:'description',label:'Sottotesto alternativo',type:'textarea'},{name:'ctaLabel',label:'Testo CTA alternativo',type:'text'},{name:'href',label:'Destinazione alternativa',type:'text'},{name:'badge',label:'Etichetta alternativa',type:'text'}]},
   {label:'Immagini',fields:[{name:'image',label:'Immagine principale alternativa',type:'upload',relationTo:'media'},...slideMediaFields()]},
  ]},
 ]},
];
