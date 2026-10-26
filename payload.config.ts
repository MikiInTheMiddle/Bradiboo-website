import {databaseFetchWithReconnect} from './lib/database-fetch';
import {branchRead,invalidateBranchPublication} from './lib/branch-publication';
import {publishedMediaRead} from './lib/published-media';
import {privateMediaStorage} from './lib/private-blob';
import {productionPageURL,ensureHierarchyPage} from './lib/production-pages';
import {galleryPhotosField,momentsField,galleryFields} from './lib/gallery-fields';
import {footerOverrideField} from './lib/footer-override';
import {mediaEdgeColor,solidEdgeField} from './lib/hero-edge-color';
import {productionContainers,hierarchyFields,productionHierarchy,syncProductionContainer} from './lib/production-hierarchy';
import path from 'node:path';
import { colorField } from './lib/color-field';
import { buildConfig, type Access, type Block, type Field } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { it } from '@payloadcms/translations/languages/it';
import sharp from 'sharp';
import { seedWireframe } from './lib/seed';
import {groupCollections,groupGlobals} from './lib/admin-navigation';
import {organizeBlock,organizeCollections,organizeGlobals} from './lib/admin-layout';
import { siteNavigationFields } from './lib/site-fields';
import {siteSettings} from './lib/site-settings';
import { watchTerms, termField } from './lib/watch-terms';
import { watchContentFields, watchGlobal } from './lib/watch-fields';
import { characterFields, characterBlocks } from './lib/character-fields';
import { commonFields, heroFields, extraBlocks, cardFields, characterCheckboxes, activitySelections } from './lib/editorial-fields';
const authenticated: Access = ({ req }) => Boolean(req.user);
const published: Access = ({ req }) => req.user ? true : { _status: { equals: 'published' } };
const editable = { create: authenticated, update: authenticated, delete: authenticated };
const title: Field = { name: 'title', label: 'Titolo', type: 'text', required: true };
const blockTypes = ['hero','intro','media','split','grid','rail','dynamic','cta','list','contact'] as const;
const blocks: Block[] = blockTypes.map(slug => ({ slug, labels: { singular: slug, plural: slug }, fields: [
  ...commonFields(), ...(slug === 'hero' ? heroFields : []),
  { name: 'label', label: 'Nome editoriale', type: 'text', required: true }, title,
  { name: 'note', label: 'Testo / descrizione', type: 'textarea' },
  { name: 'draft', label: 'Modulo in bozza', type: 'checkbox', defaultValue: false },
  { name: 'media', label: 'Media', type: 'upload', relationTo: 'media' },
  { name: 'items', label: 'Link e card manuali', type: 'array', fields: [
    ...cardFields(),
  ] },
  ...(slug === 'dynamic' ? [
    { name: 'character', label: 'Personaggio (vuoto = personaggio della pagina)', type: 'relationship', relationTo: 'characters' } as Field,
    { name: 'limit', label: 'Numero massimo', type: 'number', defaultValue: 6, min: 1, max: 24 } as Field,
  ] : []),
] }));
blocks.push(...extraBlocks, ...characterBlocks);
blocks.push({slug:'gallery',labels:{singular:'Galleria',plural:'Gallerie'},fields:[...commonFields(),{name:'label',label:'Nome editoriale',type:'text',required:true},title,{name:'note',label:'Introduzione',type:'textarea'},{name:'draft',label:'Modulo in bozza',type:'checkbox'},...galleryFields()]});
blocks.push({ slug: 'braditime', labels: { singular: 'Braditime — attività esterne', plural: 'Braditime' }, fields: [
 { name: 'label', label: 'Nome editoriale', type: 'text', defaultValue: 'Braditime', required: true }, title,
 { name: 'note', label: 'Sottotesto', type: 'textarea' },
 { name: 'draft', label: 'Modulo in bozza', type: 'checkbox', defaultValue: true },
 ...commonFields(),
 { name: 'media', label: 'Media del blocco', type: 'upload', relationTo: 'media' },
 { name: 'selectionMode', label: 'Modalità attività', type: 'select', defaultValue: 'automatic', options: [{label:'Automatico per personaggi',value:'automatic'},{label:'Scelta manuale attività',value:'manual'}] },
 characterCheckboxes,
 termField('themeTerms','Tematiche attività (modalità automatica)','topic'),
 termField('keywordTerms','Keyword attività (modalità automatica)','keyword'),
 activitySelections,
 { name: 'locale', label: 'Lingua', type: 'select', options: ['it','en'], defaultValue: 'it', required: true },
 { name: 'limit', label: 'Numero di attività', type: 'number', min: 1, max: 24, defaultValue: 6 },
 { name: 'character', label: 'Filtro personaggio', type: 'relationship', relationTo: 'characters', admin: { description: 'Vuoto: usa il personaggio della pagina, oppure tutte le attività. Le associazioni devono esistere in WordPress.' } },
] });
// Header labels follow the live title field without duplicating stored data.
for (const block of blocks) {
  block.fields=organizeBlock(block);
  block.admin = { ...block.admin, components: { ...block.admin?.components,
    Label: { path: '/components/admin/BlockTitle#BlockTitle', clientProps: { blockLabel: typeof block.labels?.singular === 'string' ? block.labels.singular : block.slug } },
  } };
}
export default buildConfig({
  plugins: [privateMediaStorage],
  secret: process.env.PAYLOAD_SECRET || '',
  admin: { user: 'users', components:{afterNavLinks:['/components/admin/ZapShortcut#ZapShortcut']}, meta: { titleSuffix: '— Bradiboo Content Studio' } },
  i18n: { supportedLanguages: { it }, fallbackLanguage: 'it' },
  editor: lexicalEditor(), sharp,
  db: sqliteAdapter({ push: process.env.PAYLOAD_SCHEMA_PUSH !== 'false', client: {
    url: process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || 'file:./bradiboo.db',
    authToken: process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN,
    fetch: databaseFetchWithReconnect(),
  } }),
  typescript: { outputFile: path.resolve('payload-types.ts') },
  collections: groupCollections(organizeCollections([watchTerms,
    { slug: 'users', labels: { singular: 'Utente', plural: 'Utenti' }, auth: true, access: { ...editable, read: authenticated }, fields: [{ name: 'name', label: 'Nome', type: 'text' }] },
    { slug: 'media', hooks:{beforeChange:[mediaEdgeColor]}, labels: { singular: 'Media', plural: 'Media' }, access: { ...editable, read: publishedMediaRead }, upload: { staticDir: path.resolve('media') }, fields: [{name:'bottomEdgeColor',label:'Colore bordo inferiore (automatico)',type:'text',admin:{readOnly:true,description:'Rilevato dall’immagine per il raccordo con il fondo pagina.'}}, {name:'hasHeroGradientEndColor',label:'Associa un colore finale al gradiente della Hero',type:'checkbox',admin:{description:'Quando questa immagine è usata come Hero, la pagina può ereditare questo colore finale. Il fondo Uniforme continua a usare solo il colore del bordo inferiore.'}}, {...solidEdgeField('heroGradientEndColor','Colore finale del gradiente'),admin:{...solidEdgeField('heroGradientEndColor','Colore finale del gradiente').admin,condition:(_,s)=>Boolean(s.hasHeroGradientEndColor)}}, { name: 'alt', label: 'Testo alternativo', type: 'text', required: true }] },
    { slug: 'characters', labels: { singular: 'Personaggio', plural: 'Personaggi' }, admin: { useAsTitle: 'name' }, access: { ...editable, read: () => true }, fields: [
      { name: 'name', label: 'Nome', type: 'text', required: true }, { name: 'slug', type: 'text', required: true, unique: true },
      ...characterFields,
      { name: 'description', label: 'Descrizione', type: 'textarea' }, { name: 'portrait', label: 'Ritratto principale', type: 'upload', relationTo: 'media' },
      {name:'portraitMobile',label:'Ritratto alternativo mobile',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'image/'}},admin:{description:'Facoltativo. Le card collegate lo ereditano; se manca viene usata l’immagine principale.'}},
    ] },
    productionContainers,
    { slug: 'contents', labels: { singular: 'Contenuto', plural: 'Contenuti' }, admin: { useAsTitle: 'title',defaultColumns:['title','recordType','container','parent','_status'],description:'Produzioni (sottocontenitori) ed episodi. Puoi crearli anche dal contenitore o dalla produzione di appartenenza.' }, hooks:{beforeValidate:[productionHierarchy,productionPageURL],afterChange:[invalidateBranchPublication,syncProductionContainer,ensureHierarchyPage('contents')],afterDelete:[invalidateBranchPublication]}, access: { ...editable, read: branchRead('contents') }, versions: { drafts: true }, fields: [title,galleryPhotosField(),momentsField(),{name:'editorialSection',label:'Sezione editoriale (facoltativa)',type:'text',admin:{description:'Usata nell’occhiello automatico quando non c’è una gerarchia contenitore/produzione. Non dipende dall’URL.'}},...hierarchyFields,
      { name: 'slug', type: 'text', required: true, unique: true },
      ...watchContentFields,
      { name: 'kind', label: 'Tipologia precedente (compatibilità)', type: 'select', required: true, options: ['serie','miniserie','format','episodio'],admin:{hidden:true} },
      { name: 'description', label: 'Descrizione', type: 'textarea' },
      { name: 'highlight', label: 'In primo piano', type: 'checkbox', defaultValue: false },
      { name: 'highlightOrder', label: 'Ordine in primo piano', type: 'number', defaultValue: 0 },
      { name: 'highlightBadge', label: 'Testo etichetta della card', type: 'text' },
      {...colorField('highlightBadgeBackgroundColor','Colore fondo etichetta della card'),defaultValue:'#ffffff'},
      colorField('highlightBadgeTextColor','Colore testo etichetta della card'),
      { name: 'characters', label: 'Personaggi', type: 'relationship', relationTo: 'characters', hasMany: true },
      { name: 'parent', label: 'Produzione / sottocontenitore', type: 'relationship', relationTo: 'contents',filterOptions:{recordType:{equals:'production'}},admin:{condition:(_,s)=>s.recordType==='episode',description:'Facoltativo: se selezionato, il contenitore superiore viene ricavato dalla produzione. Senza produzione puoi scegliere direttamente un contenitore.'} },
      { name: 'cover', label: 'Copertina principale', type: 'upload', relationTo: 'media' },
      {name:'coverMobile',label:'Copertina alternativa mobile',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'image/'}},admin:{description:'Ereditata da tutte le card collegate. Facoltativa: senza variante mobile viene usata la copertina principale.'}},
      { name: 'url', label: 'Pagina della produzione', type: 'text', admin:{condition:(_,s)=>s.recordType!=='episode',description:'Facoltativa: se vuota viene generata dal contenitore e dall’identificatore. La pagina viene creata alla prima pubblicazione; puoi poi modificarla in Pagine.'} },
    ] },
    { slug: 'pages', hooks:{afterChange:[invalidateBranchPublication],afterDelete:[invalidateBranchPublication]}, labels: { singular: 'Pagina', plural: 'Pagine' }, admin: { useAsTitle: 'title' }, access: { ...editable, read: branchRead('pages') }, versions: { drafts: true }, fields: [title,
      { name: 'path', label: 'Percorso URL', type: 'text', unique: true, required: true },
      {name:'headlessProductSlug',label:'Prodotto headless collegato (slug)',type:'text',admin:{description:'Esempio: dove-sei. I moduli Prodotto headless leggono questo record; gli override sono nei singoli moduli. Sold out e CTA restano locali.'}},
      { name: 'hideFromSitemap', label: 'Nascondi dalla mappa del sito', type:'checkbox', defaultValue:false },
      { name: 'redirectTo', label:'Reindirizza a (opzionale)',type:'text',admin:{description:'Per percorsi superati: la pagina viene conservata ma apre la destinazione indicata.'},validate:(v:string|null|undefined)=>!v||/^\/(?!\/)/.test(v)?true:'Usa un percorso interno /…'},
      { name: 'sourceReference',label:'Fonti editoriali (uso interno)',type:'textarea'},
      { name: 'group', label: 'Area', type: 'text' }, { name: 'purpose', label: 'Descrizione della pagina', type: 'textarea' },
      { name: 'parent', label: 'Pagina genitore', type: 'relationship', relationTo: 'pages' },
      {name:'galleryContext',label:'Sorgente editoriale della pagina',type:'relationship',relationTo:['characters','production-containers','contents'],admin:{description:'Usata dalle gallerie automatiche. Vuoto: usa il personaggio della pagina, se presente.'}},
      { name: 'character', label: 'Personaggio della pagina', type: 'relationship', relationTo: 'characters' },
      {name:'heroBackground',label:'Collega il fondo alla Hero',type:'checkbox',admin:{description:'Usa il colore del bordo inferiore della prima Hero. Con il set casuale il colore varia insieme all’immagine. Se il colore non è disponibile si usa il fondo manuale conservato.'}},
      {name:'customHeroBackground',label:'Personalizza il colore iniziale',type:'checkbox',admin:{condition:(_,s)=>Boolean(s.heroBackground)}},
      {...solidEdgeField('heroBackgroundColor','Colore iniziale'),admin:{...solidEdgeField('heroBackgroundColor','Colore iniziale').admin,condition:(_,s)=>Boolean(s.heroBackground)&&Boolean(s.customHeroBackground)}},
      {name:'heroBackgroundMode',label:'Sviluppo del fondo',type:'radio',defaultValue:'solid',options:[{label:'Uniforme',value:'solid'},{label:'Gradiente verticale',value:'gradient'}],admin:{layout:'horizontal',condition:(_,s)=>Boolean(s.heroBackground),description:'Il colore iniziale segue la Hero. Il gradiente arriva al colore finale in fondo alla pagina.'}},
      {name:'customHeroBackgroundEnd',label:'Usa il colore finale della pagina invece di quello del Media',type:'checkbox',admin:{condition:(_,s)=>Boolean(s.heroBackground)&&s.heroBackgroundMode==='gradient',description:'Disattivato: eredita il finale dal Media della Hero. Se manca, usa il colore della pagina già salvato come riserva.'}},
      {...solidEdgeField('heroBackgroundEndColor','Colore finale — fondo pagina'),admin:{...solidEdgeField('heroBackgroundEndColor','Colore finale — fondo pagina').admin,condition:(_,s)=>Boolean(s.heroBackground)&&s.heroBackgroundMode==='gradient'&&Boolean(s.customHeroBackgroundEnd)}},
      {name:'cloudBackground',label:'Nuvole sul fondo',type:'group',fields:[
       {name:'enabled',label:'Attiva nuvole animate',type:'checkbox',defaultValue:false,admin:{description:'Tre livelli progressivi sopra al fondo e sotto ai contenuti. Movimento ridotto su mobile.'}},
       ...[1,2,3].map(i=>({name:`layer${i}`,label:`Nuvole — livello ${i}`,type:'upload' as const,relationTo:'media' as const,admin:{condition:(_:unknown,s:any)=>Boolean(s.enabled),description:'Facoltativo: vuoto usa il livello predefinito.'}}))
      ]},
      footerOverrideField,
      colorField('pageBackgroundColor', 'Fondo pagina', true),
      { name: 'pageBackgroundImage', label: 'Immagine fondo pagina', type: 'upload', relationTo: 'media' },
      { name: 'blocks', label: 'Moduli', type: 'blocks', blocks, filterOptions:({siblingData})=>(siblingData as any)?.blocks?.some((b:any)=>b.blockType==='characterFriends')?true:blocks.filter(b=>b.slug!=='characterFriends').map(b=>b.slug) },
    ] },
  ])),
  globals: groupGlobals(organizeGlobals([siteSettings,watchGlobal, {slug:'navigation',label:'Menu, footer e navigazione Studio',access:{read:()=>true,update:authenticated},fields:siteNavigationFields}])),
  onInit: process.env.NODE_ENV === 'production' ? undefined : seedWireframe,
});
