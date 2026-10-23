import type {Field,UploadField} from 'payload';
export type CardAudio={url:string;autoplay?:boolean;loop?:boolean;ctaMode?:'link'|'audio'|'both';label?:string};
export const audioUpload=(name='cardAudio',label='Audio della card'):UploadField=>({name,label,type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'audio/'}}});
export const cardAudioField=():Field=>({name:'audioSettings',label:'Audio',type:'group',fields:[
 {name:'mode',label:'Sorgente audio',type:'radio',enumName:'ca_mode',options:[{label:'Eredita',value:'inherit'},{label:'Nessuno',value:'none'},{label:'File locale',value:'upload'}],admin:{layout:'horizontal',description:'Vuoto: eredita dalla scheda collegata, se ha una traccia.'}},
 {...audioUpload('file','File audio locale'),admin:{condition:(_,s)=>s.mode==='upload'}},
 {name:'track',label:'Traccia da ereditare',type:'select',enumName:'ca_track',options:[{label:'Audio della card',value:'card'},{label:'Musica del personaggio',value:'music'},{label:'Voce del personaggio',value:'voice'}],admin:{condition:(_,s)=>!s.mode||s.mode==='inherit',description:'La traccia viene dalla scheda collegata. Musica e voce sono disponibili sui Personaggi.'}},
 {name:'ctaMode',label:'Comandi audio',type:'select',enumName:'ca_cta',options:[{label:'Solo collegamento (audio automatico)',value:'link'},{label:'Solo Play / Pausa',value:'audio'},{label:'Play / Pausa e collegamento',value:'both'}],admin:{condition:(_,s)=>s.mode!=='none',description:'Vuoto: link e pulsante audio. In Solo Play il clic non apre la destinazione.'}},
 {name:'label',label:'Testo Play (facoltativo)',type:'text',admin:{condition:(_,s)=>s.mode!=='none'&&s.ctaMode!=='link',placeholder:'Ascolta'}},
 {name:'autoplay',label:'Avvia quando entra in vista',type:'checkbox',admin:{condition:(_,s)=>s.mode!=='none',description:'Il browser può richiedere prima un’interazione. In quel caso resta disponibile Play.'}},
 {name:'loop',label:'Ripeti in loop',type:'checkbox',admin:{condition:(_,s)=>s.mode!=='none'}},
]});
export function resolveCardAudio(base:CardAudio|undefined,s:any):CardAudio|undefined{
 if(s?.mode==='none')return;
 const file=s?.file;const url=s?.mode==='upload'?(typeof file==='object'&&file?.mimeType?.startsWith('audio/')?file.url:undefined):base?.url;
 return url?{url,autoplay:s?.autoplay??base?.autoplay??false,loop:s?.loop??base?.loop??false,ctaMode:s?.ctaMode||base?.ctaMode||'both',label:s?.label||base?.label}:undefined;
}
export function sourceAudio(doc:any,track='card'):CardAudio|undefined{const m=doc?.[track==='music'?'musicAudio':track==='voice'?'voiceClip':'cardAudio'];return m&&typeof m==='object'&&m.mimeType?.startsWith('audio/')&&m.url?{url:m.url}:undefined;}

export function sourceAudioTracks(doc:any){return {card:sourceAudio(doc),music:sourceAudio(doc,'music'),voice:sourceAudio(doc,'voice')};}
export function selectedAudio(item:any,s:any){return s?.track?item.audioTracks?.[s.track]:item.cardAudio;}
