import type {GlobalConfig} from 'payload';

export const siteSettings:GlobalConfig={
 slug:'site-settings',label:'Impostazioni generali',
 admin:{group:'Sito e pagine',description:'Configurazioni condivise da tutte le pagine del sito.'},
 access:{read:()=>true,update:({req})=>Boolean(req.user)},
 fields:[{name:'favicon',label:'Favicon del sito',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'image/'}},admin:{description:'Icona unica per tutte le pagine. Consigliata un’immagine quadrata PNG da 512 × 512 px oppure SVG. Salvando, l’icona scelta viene resa pubblica. Vuoto: mantiene l’icona predefinita.'}}],
};
