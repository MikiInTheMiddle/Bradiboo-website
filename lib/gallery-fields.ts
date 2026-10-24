import {visualMediaFilter} from './visual-media';
import {cardAudioField} from './card-audio';
import type {Field} from 'payload';
export const momentFields=():Field[]=>[cardAudioField(),
 {name:'image',label:'Immagine',type:'upload',relationTo:'media',required:true,filterOptions:visualMediaFilter},
 {name:'mobileImage',label:'Alternativa mobile (facoltativa)',type:'upload',relationTo:'media',filterOptions:visualMediaFilter},
 {name:'title',label:'Titolo (facoltativo)',type:'text'},
 {name:'caption',label:'Didascalia (facoltativa)',type:'textarea'},
 {name:'alt',label:'Testo alternativo locale (facoltativo)',type:'text',hooks:{beforeValidate:[({value})=>value||'']},admin:{description:'Vuoto: usa il testo alternativo già salvato nel Media.'}},
 {type:'row',fields:[{name:'focalX',label:'Focus orizzontale (%)',type:'number',min:0,max:100},{name:'focalY',label:'Focus verticale (%)',type:'number',min:0,max:100}]},
 {name:'content',label:'Episodio o produzione collegata (facoltativo)',type:'relationship',relationTo:'contents'},
 {name:'href',label:'Destinazione alternativa (facoltativa)',type:'text'},
];
export const galleryPhotosField=(name='momentPhotos',local=false):Field=>({name,label:'Foto',type:'upload',relationTo:'media',hasMany:true,filterOptions:visualMediaFilter,admin:{description:'Seleziona o carica più foto insieme. Testo alternativo e dimensioni provengono dai Media; non servono schede aggiuntive.',...(local?{condition:(_:any,s:any)=>s.gallerySourceMode==='manual'}:{})}});
export const momentsField=():Field=>({name:'moments',label:'Immagini con dettagli (facoltative)',type:'array',fields:momentFields(),admin:{description:'Archivio condiviso: le gallerie collegate usano questi elementi senza copiarli. L’ordine è trascinabile.'}});
export const galleryFields=():Field[]=>[
 {name:'gallerySourceMode',label:'Immagini della galleria',type:'radio',options:[{label:'Dalla sorgente della pagina',value:'page'},{label:'Da una sorgente scelta',value:'linked'},{label:'Inserite qui',value:'manual'}],admin:{layout:'horizontal',description:'Vuoto: usa la sorgente associata alla pagina (o il suo personaggio).'}},
 {name:'gallerySource',label:'Personaggio, contenitore, produzione o episodio',type:'relationship',relationTo:['characters','production-containers','contents'],validate:(value:any,{siblingData:s}:any)=>s.gallerySourceMode!=='linked'||Boolean(value)||'Scegli la sorgente della galleria.',admin:{condition:(_,s)=>s.gallerySourceMode==='linked'}},
 {name:'gallerySelectionMode',label:'Selezione immagini',type:'radio',options:[{label:'Tutte (anche le aggiunte future)',value:'all'},{label:'Solo quelle selezionate',value:'selected'}],admin:{layout:'horizontal',condition:(_,s)=>s.gallerySourceMode!=='manual'}},
 {name:'gallerySelected',label:'Scegli immagini',type:'json',admin:{condition:(_,s)=>s.gallerySourceMode!=='manual'&&s.gallerySelectionMode==='selected',components:{Field:'/components/admin/GallerySelection#GallerySelection'}}},
 galleryPhotosField('galleryPhotos',true),
 {type:'collapsible',label:'Titoli, didascalie e opzioni avanzate (facoltative)',admin:{initCollapsed:true,condition:(_,s)=>s.gallerySourceMode==='manual'},fields:[{name:'images',label:'Immagini con dettagli (ordine trascinabile)',type:'array',fields:momentFields()}]},
 {name:'galleryLayout',label:'Disposizione galleria',type:'radio',enumName:'gallery_layout',options:[{label:'Carosello',value:'carousel'},{label:'Nastro verticale',value:'reel'},{label:'Moodboard',value:'moodboard'}],admin:{layout:'horizontal',description:'Nastro verticale: immagini portrait a scorrimento orizzontale, senza autoplay. Moodboard: mosaico bilanciato automaticamente.'}},
 {name:'galleryGap',label:'Spazio tra immagini (px)',type:'number',min:0,max:64},
 {name:'galleryShowTitle',label:'Mostra titoli delle immagini',type:'checkbox',defaultValue:true},
 {name:'galleryShowCaption',label:'Mostra didascalie delle immagini',type:'checkbox',defaultValue:true},
];
