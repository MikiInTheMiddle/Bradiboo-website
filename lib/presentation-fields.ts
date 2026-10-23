import type {Field} from 'payload';
export const collectionBlockTypes=new Set(['gallery','watchExperience','zapExperience','hero','intro','contact','characterProfile','grid','rail','split','media','list','cta','dynamic','featured','collection','companySplit','episodes','braditime','characterMoments','characterFriends','headlessProduct']);
export const presentationFields=():Field[]=>[
 {name:'presentation',label:'Presentazione',type:'select',defaultValue:'cards',options:[{label:'Default',value:'cards'},{label:'Wide',value:'wide'}],admin:{components:{Field:'/components/admin/PresentationToggle#PresentationToggle'},description:'Il numero degli elementi viene rilevato automaticamente: con una sola slide non compaiono frecce e pallini.'}},
 {name:'cardLayout',label:'Disposizione card',type:'radio',defaultValue:'auto',options:[{label:'Predefinita del blocco',value:'auto'},{label:'Griglia',value:'grid'},{label:'Carosello',value:'carousel'},{label:'Fila compatta',value:'compact'}],admin:{description:'Fila compatta: card piccole e centrate, disposte su più righe quando lo spazio si riduce. Per lo scorrimento orizzontale scegli Carosello.',condition:(_,s)=>s.presentation!=='wide',layout:'horizontal'}},
 {name:'wideOverlayOpacity',label:'Intensità velo sull’immagine (%)',type:'number',min:0,max:100,defaultValue:55,admin:{condition:(_,s)=>s.presentation==='wide'}},
];

export function hasWideSlides(block?:{presentation?:unknown;blockType?:unknown}){return block?.presentation==='wide'&&!['watchExperience','zapExperience'].includes(String(block.blockType));}
