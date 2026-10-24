import type {Field,TextField} from 'payload';
import type {CardAppearance} from './card-appearance';
import {colorField} from './color-field';
export type CharacterCardIdentity={enabled?:boolean|null;backgroundColor?:string|null;textColor?:string|null;badgeBackgroundColor?:string|null;badgeTextColor?:string|null};
const identityColor=(name:string,label:string):TextField=>{
 const base=colorField(name,label);
 return {...base,defaultValue:undefined,admin:{...base.admin,condition:(_,s)=>Boolean(s.enabled),components:{Field:{path:'/components/admin/ColorField#ColorField',clientProps:{label,transparentLabel:'Eredita dal contesto'}}}}};
};
export const characterCardIdentityField:Field={name:'cardIdentity',label:false,type:'group',admin:{description:'Le card ereditano lo stesso aspetto della Home: fondo trasparente, nome e immagine del personaggio. Qui scegli i colori hover; lo stile comune del blocco e le singole card possono sovrascrivere le impostazioni.'},fields:[
 {name:'hoverImage',label:'Immagine alternativa al passaggio del mouse / tocco',type:'upload',relationTo:'media',admin:{description:'Facoltativa. Le card del personaggio la ereditano; vuoto mantiene l’immagine normale.'}},
 {name:'enabled',label:'Usa l’identità del personaggio nelle card',type:'checkbox',defaultValue:false},
 identityColor('backgroundColor','Fondo al passaggio del mouse'),identityColor('textColor','Testi al passaggio del mouse'),identityColor('badgeBackgroundColor','Fondo etichetta al passaggio del mouse'),identityColor('badgeTextColor','Testo etichetta al passaggio del mouse'),
]};
export const characterCardDefaults:CardAppearance={characterCard:true,enabled:true,composition:'stacked',backgroundMode:'transparent',backgroundColor:'transparent',textColor:'#ffffff',titleColor:'#ffffff',noteColor:'#ffffff',descriptionVisibility:'hide',eyebrowMode:'hidden',hoverMode:'none'};
export function characterIdentityAppearance(identity?:CharacterCardIdentity|null):CardAppearance{
 if(!identity?.enabled)return {...characterCardDefaults};
 const fields={hoverBackgroundColor:identity.backgroundColor,hoverTextColor:identity.textColor,hoverBadgeBackgroundColor:identity.badgeBackgroundColor,hoverBadgeTextColor:identity.badgeTextColor};
 const colors=Object.fromEntries(Object.entries(fields).filter(([,v])=>Boolean(v)&&v!=='transparent'));
 if(!Object.keys(colors).length)return {...characterCardDefaults};
 return {...characterCardDefaults,hoverMode:'custom',...colors};
}
