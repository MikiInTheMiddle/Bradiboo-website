import type {Field} from 'payload';
import type {WireLink} from './wireframe';
import {youtubeEmbed} from './presentation';
export const cardFunctionFields=():Field[]=>[
 {name:'cardFunction',label:'Funzione della card',type:'radio',enumName:'card_function',options:[{label:'Contenuto / pagina',value:'content'},{label:'Video',value:'video'},{label:'Audio',value:'audio'}],admin:{layout:'horizontal',components:{Field:'/components/admin/CardFunction#CardFunction'},description:'La funzione decide l’azione. Default/Wide e l’aspetto restano indipendenti.'}},
 {name:'videoSettings',label:'Video da riprodurre',type:'group',admin:{condition:(_,s)=>s.cardFunction==='video'},fields:[
 {name:'mode',label:'Sorgente video',type:'radio',enumName:'cv_mode',options:[{label:'Eredita dalla scheda collegata',value:'inherit'},{label:'File locale',value:'upload'},{label:'YouTube',value:'youtube'}],admin:{layout:'horizontal'}},
 {name:'file',label:'File video',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'video/'}},admin:{condition:(_,s)=>s.mode==='upload'}},
 {name:'url',label:'URL YouTube',type:'text',admin:{condition:(_,s)=>s.mode==='youtube'},validate:(v:any)=>!v||Boolean(youtubeEmbed(v))||'Inserisci un URL YouTube valido.'},
 ]},
];
export function sourceVideo(doc:any){return {video:doc?.playbackSource==='file'&&doc.playbackFile?.mimeType?.startsWith('video/')?doc.playbackFile.url:undefined,youtube:doc?.playbackSource==='youtube'?youtubeEmbed(doc.playbackURL):undefined};}
export function applyCardFunction(item:WireLink,row:any):WireLink{
 if(!row?.cardFunction||row.cardFunction==='inherit')return item;
 if(row.cardFunction==='content')return {...item,cardFunction:'content',cardAudio:undefined,video:undefined,youtube:undefined};
 if(row.cardFunction==='audio')return {...item,cardFunction:'audio',video:undefined,youtube:undefined,cardAudio:item.cardAudio?{...item.cardAudio,ctaMode:row.audioSettings?.ctaMode||'audio'}:undefined};
 const s=row.videoSettings;return {...item,cardFunction:'video',cardAudio:undefined,...(s?.mode==='upload'?{video:s.file?.mimeType?.startsWith('video/')?s.file.url:undefined,youtube:undefined}:s?.mode==='youtube'?{video:undefined,youtube:youtubeEmbed(s.url)}:{})};
}
