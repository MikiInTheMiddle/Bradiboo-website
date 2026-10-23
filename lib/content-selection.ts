import type {Field,Where} from 'payload';
export const contentSelectionBlocks=new Set(['hero','intro','media','split','grid','rail','list','cta','contact','dynamic','featured','collection','companySplit','episodes','characterProfile','characterFriends']);
export type ContentSelection={enabled?:boolean;by?:string;character?:any;container?:any;production?:any;kind?:string;charactersMode?:string;excludeCurrent?:boolean;limit?:number;sort?:string};
const id=(v:any)=>v&&typeof v==='object'?v.id:v;
export function contentSelectionQuery(s:ContentSelection,pageCharacter?:any):{where:Where;limit:number;sort:string}{
 const and:Where[]=[{_status:{equals:'published'}}];
 if(s.by==='character')and.push({characters:{contains:id(s.character)||id(pageCharacter)||-1}});
 if(s.by==='container')and.push({container:{equals:id(s.container)||-1}});
 if(s.by==='production')and.push({parent:{equals:id(s.production)||-1}});
 if(s.by==='production')and.push({recordType:{equals:'episode'}});
 else if(['production','episode'].includes(s.kind||''))and.push({recordType:{equals:s.kind}});
 return {where:{and},limit:Math.max(1,Math.min(100,s.limit??6)),sort:s.sort==='oldest'?'createdAt':s.sort==='title'?'title':'-createdAt'};
}
export const contentSelectionField=():Field=>({name:'contentSelection',label:'Selezione automatica dei contenuti',type:'group',fields:[
 {name:'enabled',label:'Popola automaticamente le card',type:'checkbox',admin:{description:'Disattivato: usa la selezione già configurata qui sotto, senza modificarla. Attivo: recupera le schede pubblicate secondo questi filtri.'}},
 {name:'by',label:'Richiama per',type:'radio',enumName:'cs_by',options:[{label:'Contenuti di un personaggio',value:'character'},{label:'Elenco personaggi',value:'characters'},{label:'Contenitore',value:'container'},{label:'Produzione / sottocontenitore',value:'production'},{label:'Tutto il catalogo',value:'all'}],admin:{layout:'horizontal',condition:(_,s)=>Boolean(s.enabled)},validate:(v:any,{siblingData:s}:any)=>!s.enabled||Boolean(v)||'Scegli come recuperare i contenuti.'},
 {name:'charactersMode',label:'Personaggi da mostrare',type:'radio',enumName:'cs_chars_mode',options:[{label:'Tutti',value:'all'},{label:'Amici del personaggio della pagina',value:'friends'}],admin:{layout:'horizontal',condition:(_,s)=>Boolean(s.enabled)&&s.by==='characters',description:'Gli amici si scelgono nella scheda centrale del personaggio. Se la lista è vuota, vengono mostrati tutti.'}},
 {name:'excludeCurrent',label:'Escludi il personaggio della pagina',type:'checkbox',admin:{condition:(_,s)=>Boolean(s.enabled)&&s.by==='characters'}},
 {name:'character',label:'Personaggio',type:'relationship',relationTo:'characters',admin:{condition:(_,s)=>Boolean(s.enabled)&&s.by==='character',description:'Vuoto: usa il personaggio associato alla pagina. Se manca, la raccolta resta vuota.'}},
 {name:'container',label:'Contenitore',type:'relationship',relationTo:'production-containers',admin:{condition:(_,s)=>Boolean(s.enabled)&&s.by==='container'},validate:(v:any,{siblingData:s}:any)=>!s.enabled||s.by!=='container'||Boolean(v)||'Scegli il contenitore.'},
 {name:'production',label:'Produzione / sottocontenitore',type:'relationship',relationTo:'contents',filterOptions:{recordType:{equals:'production'}},admin:{condition:(_,s)=>Boolean(s.enabled)&&s.by==='production'},validate:(v:any,{siblingData:s}:any)=>!s.enabled||s.by!=='production'||Boolean(v)||'Scegli la produzione.'},
 {name:'kind',label:'Tipo di contenuti',type:'select',enumName:'cs_kind',options:[{label:'Produzioni ed episodi',value:'all'},{label:'Produzioni / sottocontenitori',value:'production'},{label:'Episodi / video',value:'episode'}],admin:{condition:(_,s)=>Boolean(s.enabled)&&!['production','characters'].includes(s.by)}},
 {type:'row',fields:[{name:'limit',label:'Massimo card',type:'number',min:1,max:100,admin:{width:'35%',placeholder:'Automatico',description:'Vuoto: 6 contenuti, oppure tutti i personaggi (fino a 100).',condition:(_,s)=>Boolean(s.enabled)}},{name:'sort',label:'Ordine',type:'select',enumName:'cs_sort',options:[{label:'Più recenti prima',value:'newest'},{label:'Meno recenti prima',value:'oldest'},{label:'Titolo A–Z',value:'title'}],admin:{width:'65%',condition:(_,s)=>Boolean(s.enabled)}}]},
]});

/** Same selection for the frontend and the editor preview; friend order is authoritative. */
export function selectCharacterCards<T extends {id:any;name?:string;createdAt?:string;friends?:any[]|null}>(rows:T[],s:ContentSelection,pageCharacter?:any):T[]{
 const current=pageCharacter&&typeof pageCharacter==='object'?pageCharacter:rows.find(r=>String(r.id)===String(id(pageCharacter)));
 if(s.charactersMode==='friends'&&!current)return [];
 const friends=current?.friends?.map(id)||[];
 let selected:T[]=s.charactersMode==='friends'&&friends.length?friends.flatMap((key:any)=>rows.filter(r=>String(r.id)===String(key))):[...rows];
 if(!(s.charactersMode==='friends'&&friends.length))selected.sort((a,b)=>s.sort==='title'?(a.name||'').localeCompare(b.name||'','it'):s.sort==='oldest'?(a.createdAt||'').localeCompare(b.createdAt||'')||(Number(a.id)-Number(b.id)):(b.createdAt||'').localeCompare(a.createdAt||'')||(Number(b.id)-Number(a.id)));
 if(s.excludeCurrent)selected=selected.filter(r=>String(r.id)!==String(id(pageCharacter)));
 return selected.slice(0,Math.max(1,Math.min(100,s.limit??100)));
}
