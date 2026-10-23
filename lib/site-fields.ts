import type {Field} from 'payload';
const navLinks=(name:string,label:string):Extract<Field,{type:'array'}>=>({name,label,type:'array',fields:[{name:'label',label:'Testo',type:'text',required:true},{name:'href',label:'Destinazione',type:'text',required:true,validate:(v:string|null|undefined)=>!v||/^(\/(?!\/)|https?:\/\/|mailto:)/.test(v)?true:'Usa /pagina, https://… oppure mailto:…'}]});
export const siteNavigationFields:Field[]=[
 {name:'coherenceVersion',type:'number',defaultValue:0,admin:{hidden:true}},
 {name:'brand',label:'Nome del sito',type:'text',defaultValue:'BRADIBOO'},
 navLinks('items','Menu principale'),
 {name:'studioLabel',label:'Ingresso Studio nel menu principale',type:'text',defaultValue:'Studio'},
 {name:'studioHref',label:'Destinazione ingresso Studio',type:'text',defaultValue:'/studio'},
 {name:'studioNavTitle',label:'Titolo menu contestuale Studio',type:'text',defaultValue:'Bradiboo Studio'},
 navLinks('studioItems','Menu contestuale Studio (solo nell’area Studio)'),
 {name:'footerDecoration',label:'Immagine sul bordo superiore',type:'group',fields:[
  {name:'enabled',label:'Mostra decorazione',type:'checkbox',defaultValue:false},
  {name:'image',label:'Immagine principale',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'image/'}},admin:{condition:(_,s)=>Boolean(s.enabled),description:'Decorativa, preferibilmente con fondo trasparente. Mantiene le proporzioni originali.'}},
  {name:'mobileImage',label:'Alternativa mobile',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'image/'}},admin:{condition:(_,s)=>Boolean(s.enabled)}},
  {name:'layout',label:'Disposizione',type:'radio',defaultValue:'band',options:[{label:'Fascia a tutta larghezza',value:'band'},{label:'Illustrazione centrale',value:'center'}],admin:{layout:'horizontal',condition:(_,s)=>Boolean(s.enabled)}},
  {type:'row',admin:{condition:(_,s)=>Boolean(s.enabled)&&s.layout==='center'},fields:[{name:'height',label:'Altezza desktop (px)',type:'number',defaultValue:160,min:24,max:600,admin:{width:'50%',condition:(_,s)=>Boolean(s.enabled)}},{name:'mobileHeight',label:'Altezza mobile (px)',type:'number',defaultValue:90,min:24,max:400,admin:{width:'50%',condition:(_,s)=>Boolean(s.enabled)}}]},
  {name:'maxWidth',label:'Larghezza massima illustrazione (px)',type:'number',defaultValue:960,min:100,max:2400,admin:{condition:(_,s)=>Boolean(s.enabled)&&s.layout==='center'}},
  {name:'position',label:'Posizione sul bordo',type:'radio',defaultValue:'inside',options:[{label:'Dentro il footer',value:'inside'},{label:'Sopra il bordo del footer',value:'overlap'}],admin:{layout:'horizontal',condition:(_,s)=>Boolean(s.enabled),description:'La fascia mantiene tutta la larghezza e la propria altezza naturale. Sopra il bordo appoggia sul footer, con la trasparenza sul fondo della pagina.'}},
 ]},
 {name:'footerTitle',label:'Titolo footer',type:'text',defaultValue:'BRADIBOO'},
 {...navLinks('footerItems','Link footer precedenti'),admin:{hidden:true}},
 {name:'footerNote',label:'Testo footer',type:'textarea'},
];
