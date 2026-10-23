import type {Field} from 'payload';
export type EyebrowSettings={eyebrowMode?:'auto'|'custom'|'hidden'|null;eyebrowText?:string|null};
export const eyebrowFields=():Field[]=>[
 {name:'eyebrowMode',enumName:'card_eyebrow_mode',label:'Occhiello sopra al titolo',type:'radio',options:[{label:'Automatico',value:'auto'},{label:'Personalizzato',value:'custom'},{label:'Nascosto',value:'hidden'}],admin:{components:{Field:'/components/admin/EyebrowMode#EyebrowMode'},layout:'horizontal',description:'Automatico: contenitore e produzione, oppure sezione editoriale della sorgente. Non modifica l’etichetta.'}},
 {name:'eyebrowText',label:'Testo occhiello',type:'text',admin:{condition:(_,s)=>s.eyebrowMode==='custom'}},
];
export function resolveCardEyebrow(item:{container?:{title:string};production?:{title:string};section?:string},...settings:(EyebrowSettings|null|undefined)[]){
 let mode:EyebrowSettings['eyebrowMode']='auto';let text:string|null|undefined;
 for(const s of settings)if(s?.eyebrowMode){mode=s.eyebrowMode;text=s.eyebrowText;}
 if(mode==='hidden')return;
 if(mode==='custom')return text?.trim()||undefined;
 const labels=[item.container?.title,item.production?.title].filter((s):s is string=>Boolean(s?.trim()));
 return [...new Set(labels)].join(' · ')||item.section?.trim()||undefined;
}
