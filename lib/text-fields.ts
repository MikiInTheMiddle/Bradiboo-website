import type { Field } from 'payload';
import {colorField} from './color-field';
const options=(values:string[])=>values.map(value=>({label:value==='auto'?'Automatico':value==='custom'?'Libera (px)':value.toUpperCase(),value}));
function textColor(name:string,label:string):Field {
 const field=colorField(name,label);
 return {...field,admin:{...field.admin,components:{Field:{path:'/components/admin/ColorField#ColorField',clientProps:{label,transparentLabel:'Automatico / eredita',...(name==='textColor'?{description:'Colore di base per titolo e descrizione. I rispettivi colori specifici prevalgono; CTA ed etichette restano indipendenti.'}:{})}}}}};
}
const align=(name:string,label:string):Field=>({name,label,type:'select',defaultValue:'auto',options:[{label:'Automatico',value:'auto'},{label:'Sinistra',value:'left'},{label:'Centro',value:'center'},{label:'Destra',value:'right'}]});
function compact(field:Field):Field {
 if(field.type!=='select')return field;
 const context=field.name.startsWith('title')?'Titolo':field.name.startsWith('note')?'Descrizione':'Struttura';
 const kind=field.name.endsWith('Size')?'Dimensione':field.name.endsWith('Align')?'Allineamento':field.name.endsWith('Weight')?'Peso':'Livello HTML';
 const sizeNames:Record<string,string>={h1:'XXL',h2:'XL',h3:'L',h4:'M',h5:'S',h6:'XS'};
 const weights:Record<string,string>={'400':'Normale','500':'Medio','600':'Semigrassetto','700':'Grassetto','800':'Extra grassetto'};
 const choices=field.options.map(option=>typeof option==='string'?{label:option,value:option}:{label:String(option.label),value:option.value}).map(option=>({...option,label:option.value==='auto'?'Eredita':field.name==='titleSize'?sizeNames[option.value]||option.label:field.name.endsWith('Weight')?weights[option.value]||option.label:option.label}));
 return {...field,admin:{...field.admin,components:{...field.admin?.components,Field:{path:'/components/admin/CompactTextSelect#CompactTextSelect',clientProps:{label:kind,accessibleLabel:`${context}: ${kind}`,options:choices}}}}};
}
export const textFields=():Field[]=>([
 textColor('textColor','Colore base dei testi'),
 textColor('titleColor','Colore titolo'),
 {name:'headingLevel',label:'Livello del titolo (struttura H1–H6)',type:'select',defaultValue:'auto',options:options(['auto','h1','h2','h3','h4','h5','h6']),admin:{description:'La gerarchia della pagina è indipendente dalla dimensione visiva.'}},
 {name:'titleSize',label:'Dimensione titolo',type:'select',defaultValue:'auto',options:options(['auto','h1','h2','h3','h4','h5','h6','custom'])},
 {name:'titleCustomSize',label:'Dimensione titolo in px (desktop)',type:'number',min:12,max:200,admin:{condition:(_,s)=>s.titleSize==='custom',description:'Si riduce su schermi piccoli per mantenere la leggibilità.'}},
 align('titleAlign','Allineamento titolo'),
 {name:'titleWeight',label:'Peso titolo',type:'select',defaultValue:'auto',options:options(['auto','400','500','600','700','800'])},
 textColor('noteColor','Colore descrizione'),
 {name:'noteSize',label:'Dimensione descrizione',type:'select',defaultValue:'auto',options:[{label:'Automatico',value:'auto'},{label:'Piccolo',value:'small'},{label:'Medio',value:'medium'},{label:'Grande',value:'large'},{label:'Libera (px)',value:'custom'}]},
 {name:'noteCustomSize',label:'Descrizione · dimensione in px',type:'number',min:12,max:80,admin:{condition:(_,s)=>s.noteSize==='custom'}},
 align('noteAlign','Allineamento descrizione'),
 {name:'noteWeight',label:'Peso descrizione',type:'select',defaultValue:'auto',options:options(['auto','400','500','600','700'])},
] satisfies Field[]).map(compact);
