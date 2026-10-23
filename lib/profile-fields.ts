import type {Field} from 'payload';
import {cardFields} from './editorial-fields';
import {profileEntries} from './profile-model';
export const profileFields=():Field[]=>[
 {name:'overrideNote',label:'Personalizza la descrizione del blocco',type:'checkbox',admin:{condition:(_,s)=>s.showText!==false,description:'Disattivato: eredita la descrizione del Personaggio. Attivo: usa il testo locale, anche se vuoto.'}},
 {name:'overrideMedia',label:'Personalizza il media del blocco',type:'checkbox',admin:{condition:(_,s)=>Boolean(s.showMedia),description:'Disattivato: con Mostra media attivo usa il ritratto e la variante mobile del Personaggio. Attivo: usa solo il media locale.'}},
 {name:'profileAudioOverride',label:'Personalizza audio e trascrizione',type:'checkbox'},
 {name:'profileAudio',label:'Audio locale (vuoto = nessun audio)',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'audio/'}},admin:{condition:(_,s)=>Boolean(s.profileAudioOverride)}},
 {name:'profileAudioCaption',label:'Trascrizione locale',type:'textarea',admin:{condition:(_,s)=>Boolean(s.profileAudioOverride)}},
 {name:'cards',label:'Informazioni e card (ordine trascinabile)',type:'array',defaultValue:profileEntries.map(f=>({sourceMode:'profile',profileField:f.key,label:f.label})),admin:{description:'Le voci del Personaggio restano collegate alla sorgente. Puoi ordinarle, rimuoverle, nasconderle o aggiungere card manuali/da altre sorgenti.'},fields:[
  {name:'profileField',label:'Informazione da mostrare',type:'select',enumName:'profile_info_key',options:profileEntries.map(f=>({label:f.label,value:f.key})),admin:{condition:(_,s)=>s.sourceMode==='profile',description:'Legge questo campo da Personaggi → personaggio associato alla pagina. Non legge il testo della pagina.'}},
  {name:'hidden',label:'Nascondi questa card',type:'checkbox'},
  ...cardFields().map(f=>f.type==='tabs'?{...f,tabs:f.tabs.map(t=>({...t,fields:t.fields.map(field=>{
   if('name'in field&&field.name==='sourceMode'&&field.type==='radio')return {...field,options:[...field.options,{label:'Informazione da mostrare',value:'profile'}],admin:{...field.admin,components:{...field.admin?.components,Field:{path:'/components/admin/CardSourceMode#CardSourceMode',clientProps:{allowProfile:true}}}}};
   return field;
  })}))}:f),
 ]},
];
