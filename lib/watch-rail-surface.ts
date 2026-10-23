import type {Field} from 'payload';
import {colorField} from './color-field';
import {slideMediaFields} from './featured-fields';
export type WatchRailSurface={backgroundMode?:string|null;backgroundColor?:string|null;backgroundImage?:string;mobileImage?:string;focalX?:number|null;focalY?:number|null;backgroundOpacity?:number|null;backgroundBlur?:number|null;overlayOpacity?:number|null;textColor?:string|null};
export function watchRailSurfaceField():Field{return {name:'surface',label:'Fondo del fascione Wide',type:'group',fields:[
 {name:'backgroundMode',label:'Fondo',type:'radio',defaultValue:'inherit',options:[{label:'Eredita',value:'inherit'},{label:'Trasparente',value:'transparent'},{label:'Colore',value:'color'},{label:'Immagine',value:'image'}],admin:{layout:'horizontal'}},
 {...colorField('backgroundColor','Colore fondo'),admin:{...colorField('backgroundColor','Colore fondo').admin,condition:(_,s)=>s.backgroundMode==='color'}},
 {name:'backgroundImage',label:'Immagine di fondo',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'image/'}},admin:{condition:(_,s)=>s.backgroundMode==='image'}},
 ...slideMediaFields().filter(f=>'name' in f&&f.name!=='hideBadge').map(f=>({...f,admin:{...f.admin,condition:(_:unknown,s:Record<string,unknown>)=>s.backgroundMode==='image'}} as Field)),
 {name:'backgroundOpacity',label:'Opacità del solo fondo (%)',type:'number',min:0,max:100,admin:{condition:(_,s)=>['color','image'].includes(s.backgroundMode)}},
 {name:'backgroundBlur',label:'Sfocatura dietro il fascione (px)',type:'number',min:0,max:30,admin:{description:'Sfoca solo il fondo; testo e card restano nitidi. Vuoto eredita, 0 disattiva la sfocatura.'}},
 {name:'overlayOpacity',label:'Velo di leggibilità (%)',type:'number',min:0,max:100,admin:{condition:(_,s)=>s.backgroundMode==='image'}},
 {...colorField('textColor','Colore titolo e introduzione'),admin:{...colorField('textColor','Colore titolo e introduzione').admin,description:'Le card conservano i propri colori e override.'}},
]};}
