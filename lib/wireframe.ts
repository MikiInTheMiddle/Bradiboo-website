import type {FooterOverride} from './footer-override';
import type {WideAppearance} from './wide-appearance';
import type {CardAppearance} from './card-appearance';
import type {BlockTypography} from './text-style';
export type WireLink = {rating?:{value:number;max:number};hidden?:boolean;cardFunction?:string;actionSettings?:any;audioTracks?:Record<string,import('./card-audio').CardAudio|undefined>;cardAudio?:import('./card-audio').CardAudio;textOnly?:boolean;section?:string;container?:{id:string;title:string;href?:string};production?:{id:string;title:string;href?:string};identityAppearance?:CardAppearance; wideAppearance?:WideAppearance; wideBadge?:string;mobileImage?:string;focalX?:number;focalY?:number;hideBadge?:boolean;appearance?:CardAppearance; label: string; href: string; image?: string; description?: string; badge?: string; badgeBackgroundColor?: string; badgeTextColor?:string; ctaLabel?: string; video?: string; youtube?: string; alt?: string };
export type WireBlock = BlockTypography & {productSection?:string;icons?:{url?:string;alt?:string}[];requiresItems?:boolean;showAudioControl?:boolean;gallerySettings?:{layout?:string;gap?:number;showTitle?:boolean;showCaption?:boolean};ctaAlign?:import('./cta-alignment').CTAAlignment;
 eyebrowMode?:'auto'|'custom'|'hidden'|null;eyebrowText?:string|null;
  watchRailMode?:string;watchRailSelections?:import('./watch-rail-selection').WatchRailSelection[];cardAppearance?:CardAppearance;catalogOverrides?:{cardFunction?:string;videoSettings?:any;audioSettings?:any;id?:string;position?:number;appearance?:CardAppearance;title?:string|null;description?:string|null;image?:string;mobileImage?:string;focalX?:number;focalY?:number}[];
  cardLayout?:'auto'|'grid'|'carousel'|'compact';presentation?:'cards'|'wide';wideOverlayOpacity?:number;
  type: 'watchExperience' | 'zapExperience' | 'hero' | 'intro' | 'grid' | 'rail' | 'split' | 'media' | 'related' | 'cta' | 'list';
  heroImageMode?:boolean;
  skipReveal?:boolean;
  label: string;
  title: string;
  note?: string;
  items?: WireLink[];
  status?: 'draft';
  mobileImage?:string;focalX?:number;focalY?:number;showText?:boolean; contentLayout?:string; backgroundMode?:string; badge?: string; badgeBackgroundColor?: string; badgeTextColor?:string; backgroundColor?: string; backgroundImage?: string; opacity?: number; blur?: number; ownBackground?: boolean;
  media?: { url: string; mobileImage?:string; mobileVideo?:string; kind: 'image' | 'video' | 'youtube' }; cta?: WireLink; carousel?: boolean; facts?: {label:string;value:string}[]; audio?: string; audioCaption?: string; emptyMessage?: string; gallery?: boolean;
};
export type WirePage = {footerOverride?:FooterOverride; path: string; group: string; title: string; purpose: string; status?: 'draft'; blocks: WireBlock[]; redirectTo?:string; backgroundColor?: string; backgroundImage?: string; backgroundMobileColor?:string };

const characters: WireLink[] = ['Bradford','Placido','Joe','Petronilla','Nancy','Mimì'].map(name => ({ label:name, href:`/braditriboo/${name.toLowerCase().replace('ì','i')}` }));
const formats: WireLink[] = ['Focus','Fitness','Arte','Natura','Scienza','Cultura'].map(name => ({ label:name, href:`/guarda/format/${name.toLowerCase()}` }));

export const pages: WirePage[] = [
  { path:'/', group:'Principale', title:'Home', purpose:'Ingresso sintetico nell’universo Bradiboo e nei suoi contenuti principali.', blocks:[
    {type:'hero',label:'Hero immersivo',title:'Ingresso nell’Isola',note:'Media animato futuro + messaggio essenziale + CTA primaria.'},
    {type:'media',label:'Contenuto in primo piano',title:'Pilot / trailer / novità',items:[{label:'Apri contenuto',href:'/guarda/serie/bradiboo/episodio-pil'}]},
    {type:'split',label:'World introduction',title:'Benvenuti sull’Isola',status:'draft',note:'Da pubblicare quando saranno disponibili materiali sufficienti sull’Isola.',items:[{label:'Anteprima pagina Il mondo',href:'/il-mondo'}]},
    {type:'grid',label:'Character grid',title:'La Braditriboo',items:characters},
    {type:'rail',label:'Media ecosystem',title:'Un mondo, tanti modi di raccontarlo',items:[{label:'Serie',href:'/guarda/serie'},{label:'Miniserie',href:'/guarda/miniserie'},{label:'Format',href:'/guarda/format'}]},
    {type:'rail',label:'Featured formats',title:'Ognuno ha qualcosa da raccontare',items:formats.slice(0,4)},
    {type:'split',label:'Braditime entry',title:'Attività dal mondo Braditime',status:'draft',note:'Card alimentate in futuro dalle API del WordPress headless Braditime e collegate all’ambiente esterno.',items:[{label:'Anteprima integrazione Braditime',href:'/gioca'}]},
    {type:'cta',label:'Partnership teaser',title:'Un mondo che può crescere',items:[{label:'Scopri le partnership',href:'/studio/partnership'}]},
    {type:'cta',label:'Adult / professional layer',title:'Dietro Bradiboo',items:[{label:'Entra in Bradiboo Studio',href:'/studio'}]},
  ]},
  { path:'/il-mondo', group:'Bozze non pubblicate', title:'Il mondo', status:'draft', purpose:'Pagina conservata in bozza finché non saranno disponibili materiali sufficienti sull’Isola.', blocks:[
    {type:'hero',label:'World hero',title:'Benvenuti sull’Isola'},
    {type:'intro',label:'World statement',title:'Un piccolo mondo dove ogni angolo può nascondere qualcosa'},
    {type:'grid',label:'Places grid',title:'Luoghi dell’Isola',note:'Segnaposto: spiagge, boschi, montagne, grotte e futuri luoghi canonici.'},
    {type:'rail',label:'Characters in the world',title:'Chi abita l’Isola',items:characters},
    {type:'rail',label:'Stories from the world',title:'Storie ambientate qui',items:[{label:'Serie',href:'/guarda/serie/bradiboo'},{label:'Che giornata!',href:'/guarda/miniserie/che-giornata'}]},
    {type:'cta',label:'Next exploration',title:'Continua a esplorare',items:[{label:'Conosci la Braditriboo',href:'/braditriboo'}]},
  ]},
  { path:'/braditriboo', group:'Braditriboo', title:'La Braditriboo', purpose:'Indice dei sei personaggi e accesso alle relative pagine-hub.', blocks:[
    {type:'hero',label:'Index hero',title:'Sei amici. Sei modi di vedere il mondo.'},
    {type:'grid',label:'Character grid',title:'Scegli un personaggio',items:characters},
    {type:'rail',label:'Featured ensemble content',title:'Avventure della Braditriboo',items:[{label:'Bradiboo - La serie',href:'/guarda/serie/bradiboo'},{label:'Che giornata!',href:'/guarda/miniserie/che-giornata'}]},
    {type:'cta',label:'World connection',title:'Scopri dove vivono',status:'draft',note:'Collegamento da attivare con la pubblicazione della pagina Il mondo.',items:[{label:'Anteprima Isola',href:'/il-mondo'}]},
  ]},
  { path:'/guarda', group:'Guarda', title:'Guarda', purpose:'Hub di tutto l’ecosistema audiovisivo.', blocks:[
    {type:'hero',label:'Watch hero',title:'Le storie di Bradiboo'},
    {type:'media',label:'Featured content',title:'Contenuto principale del momento',items:[{label:'Apri il pilot',href:'/guarda/serie/bradiboo/episodio-pil'}]},
    {type:'rail',label:'Series rail',title:'Serie',items:[{label:'Bradiboo - La serie',href:'/guarda/serie/bradiboo'},{label:'Vedi tutte',href:'/guarda/serie'}]},
    {type:'rail',label:'Miniseries rail',title:'Miniserie',items:[{label:'Che giornata!',href:'/guarda/miniserie/che-giornata'},{label:'Vedi tutte',href:'/guarda/miniserie'}]},
    {type:'rail',label:'Formats rail',title:'Format',items:[...formats,{label:'Vedi tutti',href:'/guarda/format'}]},
    {type:'rail',label:'Browse by character',title:'Scopri per personaggio',items:characters},
    {type:'cta',label:'Braditime connection',title:'Dalla visione a Braditime',status:'draft',note:'Integrazione futura con attività esterne provenienti dalle API Braditime.',items:[{label:'Anteprima Braditime',href:'/gioca'}]},
  ]},
  { path:'/guarda/serie', group:'Guarda / Serie', title:'Serie', purpose:'Indice delle serie long-form.', blocks:[
    {type:'hero',label:'Category hero',title:'Serie'},
    {type:'grid',label:'Property grid',title:'Tutte le serie',items:[{label:'Bradiboo - La serie',href:'/guarda/serie/bradiboo'}]},
    {type:'related',label:'Related categories',title:'Altri modi di guardare',items:[{label:'Miniserie',href:'/guarda/miniserie'},{label:'Format',href:'/guarda/format'}]},
  ]},
  { path:'/guarda/miniserie', group:'Guarda / Miniserie', title:'Miniserie', purpose:'Indice delle produzioni short-form narrative.', blocks:[
    {type:'hero',label:'Category hero',title:'Miniserie'},
    {type:'grid',label:'Property grid',title:'Tutte le miniserie',items:[{label:'Che giornata!',href:'/guarda/miniserie/che-giornata'}]},
    {type:'related',label:'Related categories',title:'Altri modi di guardare',items:[{label:'Serie',href:'/guarda/serie'},{label:'Format',href:'/guarda/format'}]},
  ]},
  { path:'/guarda/format', group:'Guarda / Format', title:'Format', purpose:'Indice dei contenuti verticali legati alle passioni dei personaggi.', blocks:[
    {type:'hero',label:'Category hero',title:'Ognuno ha qualcosa da raccontare'},
    {type:'grid',label:'Format grid',title:'Tutti i format',items:formats},
    {type:'rail',label:'Browse by host',title:'Scopri per personaggio',items:characters},
    {type:'related',label:'Related categories',title:'Altri modi di guardare',items:[{label:'Serie',href:'/guarda/serie'},{label:'Miniserie',href:'/guarda/miniserie'}]},
  ]},
  { path:'/guarda/serie/bradiboo', group:'Property', title:'Bradiboo - La serie', purpose:'Template di una serie e contenitore degli episodi.', blocks:[
    {type:'hero',label:'Property hero',title:'Titolo + logline + hero media / trailer'},
    {type:'split',label:'Property overview',title:'Sinossi e informazioni essenziali'},
    {type:'rail',label:'Episodes rail',title:'Episodi',items:[{label:'Episodio pilota',href:'/guarda/serie/bradiboo/episodio-pil'}]},
    {type:'rail',label:'Cast rail',title:'Personaggi',items:characters},
    {type:'related',label:'Related Braditime activities',title:'Attività Braditime collegate',status:'draft',note:'Query futura per serie o personaggi; apertura nell’ambiente Braditime esterno.',items:[{label:'Anteprima integrazione',href:'/gioca'}]},
    {type:'related',label:'Related products',title:'Dal mondo della serie',items:[{label:'Prodotti collegati',href:'/shop'}]},
    {type:'cta',label:'More from watch',title:'Altro da guardare',items:[{label:'Torna a Guarda',href:'/guarda'}]},
  ]},
  { path:'/guarda/miniserie/che-giornata', group:'Property', title:'Che giornata!', purpose:'Template di una miniserie short-form.', blocks:[
    {type:'hero',label:'Property hero',title:'Titolo + logline + hero media / trailer'},
    {type:'split',label:'Property overview',title:'La vita quotidiana della Braditriboo'},
    {type:'rail',label:'Episodes rail',title:'Episodi'},
    {type:'rail',label:'Cast rail',title:'Personaggi',items:characters},
    {type:'related',label:'Related content',title:'Altre storie',items:[{label:'Bradiboo - La serie',href:'/guarda/serie/bradiboo'}]},
  ]},
  { path:'/guarda/serie/bradiboo/episodio-pil', group:'Contenuto', title:'Episodio pilota', purpose:'Template di un singolo episodio o contenuto video.', blocks:[
    {type:'media',label:'Primary media',title:'Player video / poster'},
    {type:'intro',label:'Content information',title:'Titolo + descrizione + dati episodio'},
    {type:'rail',label:'Featured characters',title:'Personaggi in questo episodio',items:characters.slice(0,3)},
    {type:'related',label:'Related Braditime activities',title:'Prova un’attività su Braditime',status:'draft',note:'Card futura associata all’episodio tramite API WordPress.',items:[{label:'Anteprima integrazione',href:'/gioca'}]},
    {type:'related',label:'Continue watching',title:'Continua a guardare',items:[{label:'Torna alla serie',href:'/guarda/serie/bradiboo'}]},
    {type:'related',label:'Related products',title:'Prodotti collegati',items:[{label:'Vai allo shop',href:'/shop'}]},
  ]},
  { path:'/gioca', group:'Bozze non pubblicate', title:'Braditime — integrazione', status:'draft', purpose:'Bozza tecnica per l’integrazione con l’ambiente Braditime esterno alimentato da WordPress headless.', blocks:[
    {type:'intro',label:'Integration statement',title:'Braditime è un ambiente esterno',note:'Il sito Bradiboo mostra card contestuali; l’attività completa si apre su Braditime.'},
    {type:'list',label:'API requirements',title:'API WordPress: attività, personaggi, cover, URL, stato e metadati'},
    {type:'rail',label:'Featured activities',title:'Esempio di card ricevute via API',items:[{label:'Attività Braditime esterna',href:'/gioca/braditime'}]},
    {type:'grid',label:'Integration points',title:'Homepage · Personaggi · Episodi · Serie'},
  ]},
  { path:'/gioca/braditime', group:'Bozze non pubblicate', title:'Card Braditime esterna', status:'draft', purpose:'Esempio tecnico di una card locale che apre un’attività nell’applicazione Braditime esterna.', blocks:[
    {type:'media',label:'External card preview',title:'Cover e dati ricevuti via API'},
    {type:'list',label:'Imported metadata',title:'Titolo · descrizione · personaggi · età · URL esterno'},
    {type:'cta',label:'External destination',title:'Apri nell’ambiente Braditime',note:'L’URL definitivo arriverà dalle API WordPress.'},
  ]},
  { path:'/shop', group:'Shop', title:'Shop', purpose:'Vetrina editoriale che porta all’ecommerce separato.', blocks:[
    {type:'hero',label:'Shop hero',title:'Prodotti dal mondo Bradiboo'},
    {type:'rail',label:'Featured products',title:'In evidenza'},
    {type:'grid',label:'Product categories',title:'Libri · Giochi · Bradibox · Collezioni'},
    {type:'rail',label:'Browse by character',title:'Scegli per personaggio',items:characters},
    {type:'cta',label:'External commerce',title:'Continua nello shop',note:'Link al dominio ecommerce esterno.'},
  ]},
  { path:'/studio', group:'Bradiboo Studio', title:'Bradiboo Studio', purpose:'Secondo livello per adulti, azienda e interlocutori professionali.', blocks:[
    {type:'hero',label:'Studio hero',title:'Dietro il mondo Bradiboo'},
    {type:'grid',label:'Studio navigation',title:'Esplora',items:[{label:'Perché Bradiboo',href:'/studio/perche-bradiboo'},{label:'Il nostro approccio',href:'/studio/approccio'},{label:'Partnership',href:'/studio/partnership'},{label:'Team',href:'/studio/team'},{label:'Contatti',href:'/studio/contatti'}]},
    {type:'intro',label:'Company statement',title:'Entertainment IP company'},
    {type:'split',label:'Approach preview',title:'Storytelling e sensibilità psicopedagogica',items:[{label:'Approfondisci',href:'/studio/approccio'}]},
    {type:'split',label:'Partnership preview',title:'Scriviamo insieme il prossimo capitolo',items:[{label:'Scopri le partnership',href:'/studio/partnership'}]},
  ]},
  { path:'/studio/perche-bradiboo', group:'Bradiboo Studio', title:'Perché Bradiboo', purpose:'Reason why e manifesto, trasferiti dall’attuale sito.', blocks:[{type:'hero',label:'Statement hero',title:'Crescere è complicato. Per tutti.'},{type:'intro',label:'Reason why',title:'Molto più di una storia'},{type:'list',label:'Manifesto principles',title:'Principi e valori'},{type:'cta',label:'Approach connection',title:'Come si traduce nelle storie',items:[{label:'Il nostro approccio',href:'/studio/approccio'}]}]},
  { path:'/studio/approccio', group:'Bradiboo Studio', title:'Il nostro approccio', purpose:'Approccio narrativo e psicopedagogico rivolto agli adulti.', blocks:[{type:'hero',label:'Approach hero',title:'Crescere insieme. Ad ogni età.'},{type:'grid',label:'Approach principles',title:'Per i bambini · Anche per gli adulti · Emozioni senza zucchero · Senza imporre'},{type:'split',label:'Method detail',title:'Sensibilità psicopedagogica + storytelling'},{type:'cta',label:'Stories connection',title:'Vedi l’approccio nelle storie',items:[{label:'Vai a Guarda',href:'/guarda'}]}]},
  { path:'/studio/partnership', group:'Bradiboo Studio', title:'Partnership', purpose:'Landing professionale che raccoglie sviluppo della property, produzione, distribuzione e licensing.', blocks:[{type:'hero',label:'Partner hero',title:'Scriviamo insieme il prossimo capitolo'},{type:'split',label:'Property overview',title:'Stato e potenziale dell’IP'},{type:'rail',label:'Media slate',title:'Serie · Miniserie · Format',items:[{label:'Esplora i contenuti',href:'/guarda'}]},{type:'grid',label:'Partner areas',title:'Produzione · Distribuzione · Broadcast · Licensing'},{type:'split',label:'Publishing opportunity',title:'Publishing · libri e activity book'},{type:'split',label:'Products opportunity',title:'Prodotti · toys e games',items:[{label:'Vai allo shop',href:'/shop'}]},{type:'split',label:'Experiences opportunity',title:'Esperienze · scuole, eventi e live'},{type:'split',label:'Digital opportunity',title:'Digital · platform, app ed esperienze interattive'},{type:'cta',label:'Professional contact',title:'Parliamone',items:[{label:'Contatti',href:'/studio/contatti'}]}]},
  { path:'/studio/team', group:'Bradiboo Studio', title:'Team', purpose:'Presenta le persone dietro Bradiboo.', blocks:[{type:'hero',label:'Team hero',title:'Le persone dietro Bradiboo'},{type:'grid',label:'Team grid',title:'Founder e advisor'},{type:'cta',label:'Contact',title:'Contatta il team',items:[{label:'Contatti',href:'/studio/contatti'}]}]},
  { path:'/studio/contatti', group:'Bradiboo Studio', title:'Contatti', purpose:'Contatti generali e professionali.', blocks:[{type:'hero',label:'Contact hero',title:'Parliamo di Bradiboo'},{type:'split',label:'Contact channels',title:'Famiglie / informazioni generali · Partner / professionisti'},{type:'list',label:'Contact form',title:'Modulo di contatto'},{type:'cta',label:'Back to world',title:'Torna nel mondo Bradiboo',items:[{label:'Home',href:'/'}]}]},
];

for (const character of characters) pages.push({ path:character.href, group:'Personaggio', title:character.label, purpose:'Template hub del personaggio: identità, contenuti, attività e prodotti.', blocks:[
  {type:'hero',label:'Character hero',title:`${character.label}: identità + character media`},
  {type:'split',label:'Meet character',title:'Descrizione, carattere, passioni e tratti distintivi'},
  {type:'rail',label:'Watch character',title:`Guarda con ${character.label}`,items:[{label:'Contenuti collegati',href:'/guarda'}]},
  {type:'rail',label:'Character formats',title:'Format e aree tematiche',items:[{label:'Esplora i format',href:'/guarda/format'}]},
  {type:'rail',label:'Braditime character cards',title:`Attività Braditime con ${character.label}`,status:'draft',note:'Query futura sulle attività WordPress taggate con questo personaggio; apertura su Braditime esterno.',items:[{label:'Anteprima integrazione Braditime',href:'/gioca'}]},
  {type:'related',label:'Character products',title:'Prodotti collegati',items:[{label:'Vai allo shop',href:'/shop'}]},
  {type:'rail',label:'Other characters',title:'Incontra gli altri',items:characters.filter(c=>c.href!==character.href)},
]});

for (const format of formats) pages.push({ path:format.href, group:'Format', title:format.label, purpose:'Template di un format verticale associato a personaggio e area tematica.', blocks:[
  {type:'hero',label:'Format hero',title:`${format.label}: titolo + host + media`},
  {type:'intro',label:'Format overview',title:'Concept e promessa editoriale'},
  {type:'rail',label:'Format episodes',title:'Contenuti del format'},
  {type:'related',label:'Host character',title:'Conosci chi lo conduce',items:characters.slice(0,1)},
  {type:'related',label:'Related Braditime activities',title:'Attività Braditime correlate',status:'draft',note:'Integrazione futura tramite API WordPress.',items:[{label:'Anteprima integrazione',href:'/gioca'}]},
  {type:'cta',label:'More formats',title:'Altri format',items:[{label:'Tutti i format',href:'/guarda/format'}]},
]});

export const pageByPath = new Map(pages.map(page => [page.path,page]));
