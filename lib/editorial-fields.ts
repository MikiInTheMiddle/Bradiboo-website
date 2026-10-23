import {watchRailSelectionFields} from './watch-rail-selection';
import {ctaAlignmentField} from './cta-alignment';
import {eyebrowFields} from './card-eyebrow';
import {heroEdgeFields} from './hero-edge-color';
import {cardSourceFields,linkedCard} from './card-source';
import {featuredFields,slideMediaFields} from './featured-fields';
import {cardAppearanceField} from './card-appearance';
import type { Field, Block } from 'payload';
import {textFields} from './text-fields';
import {productSections} from './product-model';
export { palette } from './background';
import { colorField as color } from './color-field';
const url = (name: string, label: string): Field => ({ name, label, type: 'text', validate: (v: string | null | undefined) => !v || /^\/(?!\/)/.test(v) || /^(https?:\/\/|mailto:)/.test(v) ? true : 'Usa un percorso interno /… oppure un URL http/https.' });
export const badgeFields = (): Field[] => [
 { name: 'showBadge', label: 'Mostra etichetta', type: 'checkbox', defaultValue: false },
 { name: 'badge', label: 'Testo etichetta', type: 'text', admin: { condition: (_, sibling) => Boolean(sibling.showBadge) } },
 { ...color('badgeBackgroundColor','Colore fondo etichetta'), defaultValue:'#ffffff', admin:{...color('badgeBackgroundColor','Colore fondo etichetta').admin, condition:(_,sibling)=>Boolean(sibling.showBadge)} },
 { ...color('badgeTextColor','Colore testo etichetta'), admin:{...color('badgeTextColor','Colore testo etichetta').admin, condition:(_,sibling)=>Boolean(sibling.showBadge)} },
];
export const commonFields = (): Field[] => [
 {name:'showAudioControl',label:'Mostra comando audio del blocco',type:'checkbox',admin:{description:'Facoltativo. Permette di fermare gli audio del blocco; ogni card mantiene il proprio Play/Pausa.'}},
 ...eyebrowFields(),
 ctaAlignmentField(),
 ...textFields(),
 cardAppearanceField('cardAppearance','Default degli elementi (solo questo blocco)'),
 {name:'cardOverrides',label:'Personalizzazioni dei singoli elementi richiamati',type:'array',admin:{description:'Scegli il personaggio o contenuto richiamato. Per gallerie e altri elementi usa la posizione (1 = prima card). Vale solo in questo modulo.'},fields:[{type:'tabs',tabs:[{label:'Elemento',fields:[{name:'character',label:'Personaggio',type:'relationship',relationTo:'characters'},{name:'content',label:'Contenuto',type:'relationship',relationTo:'contents'},{name:'position',label:'Oppure posizione della card',type:'number',min:1,admin:{description:'Usata se non scegli un personaggio o contenuto.'}}]},{label:'Aspetto',fields:[cardAppearanceField()]}]}]},
 ...badgeFields(),
 color('backgroundColor','Colore fondo blocco'),
 {name:'backgroundOpacity',label:'Opacità fondo (%)',type:'number',min:0,max:100},
 {name:'backgroundBlur',label:'Sfocatura dietro il blocco (px)',type:'number',min:0,max:30},
 {name:'mediaMobileImage',label:'Media — immagine alternativa mobile',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'image/'}},admin:{condition:(_,s)=>Boolean(s.showMedia)&&s.mediaSource!=='youtube',description:'Solo per immagini del contenuto, non per il fondo. Facoltativa: senza alternativa viene usata la principale.'}},
 { name: 'showMedia', label: 'Mostra media del blocco', type: 'checkbox', defaultValue: false },
 { name: 'mediaSource', label: 'Sorgente media', type: 'select', options: [{ label: 'File caricato', value: 'upload' }, { label: 'YouTube', value: 'youtube' }], defaultValue: 'upload', admin: { condition: (_, s) => Boolean(s.showMedia) } },
 { name: 'youtubeURL', label: 'URL YouTube', type: 'text', admin: { condition: (_, s) => Boolean(s.showMedia) && s.mediaSource === 'youtube' }, validate: (v: string | null | undefined) => {
  if (!v) return true;
  try { const u = new URL(v); return ['youtube.com','www.youtube.com','youtu.be','m.youtube.com'].includes(u.hostname) && u.protocol === 'https:' ? true : 'Inserisci un link HTTPS YouTube.'; } catch { return 'URL non valido'; }
 } },
];
export const ctaFields = (): Field[] => [{ name: 'ctaLabel', label: 'Testo CTA', type: 'text' }, url('ctaURL','Destinazione CTA')];
export const cardFields = (): Field[] => [{type:'tabs',tabs:[
 {label:'Contenuto',fields:[
  ...cardSourceFields(),
  {name:'label',label:'Titolo card / override locale',type:'text',validate:(v:any,{siblingData}:any)=>linkedCard(siblingData)||Boolean(v?.trim())||'Inserisci un titolo per la card manuale.'},
  {name:'description',label:'Descrizione',type:'textarea'},
  {name:'image',label:'Immagine card',type:'upload',relationTo:'media'},
  {name:'ctaLabel',label:'Testo CTA',type:'text'},url('href','Destinazione'),
  {name:'badge',label:'Etichetta del contenuto (facoltativa)',type:'text'},
  {...color('badgeBackgroundColor','Colore fondo etichetta precedente'),defaultValue:'#ffffff',admin:{hidden:true}},
 ]},
 {label:'Aspetto',fields:[cardAppearanceField()]},

]}];
export const heroFields: Field[] = [
 { name: 'backgroundMode', label: 'Tipo di fondo', type: 'select', defaultValue: 'page', options: [{label:'Trasparente',value:'page'},{label:'Colore',value:'own'},{label:'Immagine',value:'image'}] },
 { name: 'backgroundImage', label: 'Immagine di fondo', type: 'upload', relationTo: 'media', admin: { condition: (_,s) => s.backgroundMode === 'image' } },
 ...heroEdgeFields('backgroundImage').map(f=>({...f,admin:{...f.admin,condition:((previous)=>((d:any,s:any,c:any)=>s.backgroundMode==='image'&&(!s.randomHero||!s.heroImages?.length)&&(!previous||previous(d,s,c))))(f.admin?.condition)}} as Field)),
 {name:'randomHero',label:'Scegli un’immagine casuale a ogni apertura',type:'checkbox',admin:{condition:(_,s)=>s.backgroundMode==='image',description:'Una sola immagine per visita. Se il set è vuoto viene usata l’immagine di fondo.'}},
 {name:'heroImages',label:'Set immagini della Hero',type:'array',admin:{condition:(_,s)=>s.backgroundMode==='image'&&Boolean(s.randomHero),description:'Ogni immagine può avere una variante mobile e un proprio punto focale.'},fields:[
  {name:'image',label:'Immagine principale',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'image/'}}},
  ...heroEdgeFields('image'),
  {name:'mobileImage',label:'Alternativa mobile',type:'upload',relationTo:'media',filterOptions:{mimeType:{contains:'image/'}}},
  {type:'row',fields:[{name:'focalX',label:'Focus orizzontale (%)',type:'number',min:0,max:100,admin:{width:'50%'}},{name:'focalY',label:'Focus verticale (%)',type:'number',min:0,max:100,admin:{width:'50%'}}]},
 ]},
 ...ctaFields(),
];
const featuredCardFields=():Field[]=>[
 {name:'sourceContent',label:'Eredita da un contenuto (facoltativo)',type:'relationship',relationTo:'contents',admin:{description:'Sorgente precedente. Puoi continuare a usarla o selezionare una nuova sorgente sopra.',condition:(_,s)=>Boolean(s.sourceContent)&&!s.source}},
 ...cardFields().map(f=>f.type==='tabs'?{...f,tabs:[...f.tabs.map(t=>({...t,fields:t.fields.map(child=>'name' in child&&child.name==='label'?{...child,required:false,validate:undefined}:child)})),{label:'Immagini responsive',fields:slideMediaFields()}]}:f),
];
const base: Field[] = [{ name: 'label', label: 'Nome editoriale', type:'text', required:true }, {name:'title',label:'Titolo',type:'text',required:true}, {name:'note',label:'Sottotesto',type:'textarea'}, {name:'draft',label:'Modulo in bozza',type:'checkbox'}, {name:'media',label:'Media del blocco',type:'upload',relationTo:'media'}];
export const extraBlocks: Block[] = [
 {slug:'headlessProduct',labels:{singular:'Prodotto headless + override',plural:'Sezioni prodotto headless'},fields:[
  ...base.map((f):Field=>f.type==='text'&&f.name==='title'?{...f,label:'Titolo locale / fallback',admin:{description:'Con override disattivato il sito usa WordPress. I valori locali restano come copia di sicurezza.'}}:f.type==='textarea'&&f.name==='note'?{...f,label:'Testo locale / fallback'}:f),...commonFields(),...heroFields,
  {name:'section',label:'Sezione da WordPress',type:'select',required:true,options:productSections},
  {name:'overrideTitle',label:'Usa titolo locale',type:'checkbox',defaultValue:false},
  {name:'overrideNote',label:'Usa testo locale',type:'checkbox',defaultValue:false},
  {name:'overrideMedia',label:'Usa media locale',type:'checkbox',defaultValue:false},
  {name:'overrideItems',label:'Usa card / galleria / dati locali',type:'checkbox',defaultValue:false},
  {name:'cards',label:'Card locali / copia di sicurezza',type:'array',fields:cardFields()},
 ]},
 {slug:'watchExperience',labels:{singular:'Guarda — player e catalogo',plural:'Catalogo Guarda'},fields:[{name:'label',label:'Nome editoriale',type:'text',required:true},{name:'title',label:'Titolo ricerca',type:'text',required:true},{name:'note',label:'Introduzione ricerca',type:'textarea'},{name:'draft',label:'Modulo in bozza',type:'checkbox'},...commonFields(),...watchRailSelectionFields(),{name:'media',label:'Media del blocco',type:'upload',relationTo:'media'}]},
 {slug:'zapExperience',labels:{singular:'ZAP! — player e pulsanti',plural:'ZAP!'},fields:[{name:'label',label:'Nome editoriale',type:'text',required:true},{name:'title',label:'Titolo pulsanti',type:'text',required:true},{name:'note',label:'Introduzione pulsanti',type:'textarea'},{name:'draft',label:'Modulo in bozza',type:'checkbox'},...commonFields(),{name:'media',label:'Media del blocco',type:'upload',relationTo:'media'}]},
 {slug:'episodes',labels:{singular:'Episodi della produzione',plural:'Episodi'},fields:[...base,...commonFields(),{name:'production',label:'Serie / miniserie / format',type:'relationship',relationTo:'contents',required:true,filterOptions:{recordType:{equals:'production'}}},{name:'limit',label:'Numero massimo',type:'number',defaultValue:24,min:1,max:100}]},
 {slug:'featured',labels:{singular:'Contenuti in primo piano',plural:'Primo piano'},fields:[...base,...commonFields(),...featuredFields,{name:'mode',label:'Selezione',type:'select',defaultValue:'manual',options:[{label:'Card manuali',value:'manual'},{label:'Automatico: contenuti In primo piano',value:'automatic'}]}, {name:'cards',label:'Slide / card manuali (ordine trascinabile)',type:'array',fields:featuredCardFields(),admin:{condition:(_,s)=>s.mode!=='automatic'}},{name:'limit',label:'Massimo contenuti automatici',type:'number',defaultValue:6,min:1,max:24,admin:{condition:(_,s)=>s.mode==='automatic'}}]},
 {slug:'collection',labels:{singular:'Griglia manuale / catalogo',plural:'Raccolte'},fields:[...base,...commonFields(),{name:'mode',label:'Sorgente',type:'select',defaultValue:'manual',options:[{label:'Card manuali',value:'manual'},{label:'Contenuti da catalogo',value:'catalog'},{label:'Personaggi',value:'characters'}]}, {name:'cards',label:'Card manuali',type:'array',fields:cardFields(),admin:{condition:(_,s)=>s.mode==='manual'}},{name:'entries',label:'Contenuti (ordine trascinabile)',type:'array',fields:[{type:'tabs',tabs:[{label:'Contenuto',fields:[{name:'content',label:'Contenuto',type:'relationship',relationTo:'contents',required:true}]},{label:'Aspetto',fields:[cardAppearanceField()]}]}],admin:{condition:(_,s)=>s.mode==='catalog'}},{name:'cast',label:'Personaggi (ordine trascinabile)',type:'array',fields:[{type:'tabs',tabs:[{label:'Contenuto',fields:[{name:'character',label:'Personaggio',type:'relationship',relationTo:'characters',required:true}]},{label:'Aspetto',fields:[cardAppearanceField()]}]}],admin:{condition:(_,s)=>s.mode==='characters'}}]},
 {slug:'companySplit',labels:{singular:'Split Studio / Partnership',plural:'Split aziendali'},fields:[...base,...commonFields(),{name:'panels',label:'Parti dello split',type:'array',minRows:2,maxRows:2,fields:cardFields()}]},
];
export const characterCheckboxes: Field = { name: 'characterFilters', label: 'Personaggi (almeno uno; nessuna spunta = tutti)', type:'group', fields:['bradford','placido','joe','petronilla','nancy','mimi'].map(name=>({name,label:name==='mimi'?'Mimì':name[0].toUpperCase()+name.slice(1),type:'checkbox' as const})) };
export const activitySelections: Field = { name:'selections',label:'Attività e personalizzazioni (ordine trascinabile)',type:'array',fields:[
 cardAppearanceField(),
 {name:'activityID',label:'Attività WordPress',type:'text',required:true,admin:{components:{Field:'/components/admin/ActivitySelect#ActivitySelect'}}},
 {name:'customize',label:'Personalizza per questo blocco',type:'checkbox',defaultValue:false},
 {name:'overrides',label:'Override locali (vuoto = valore WordPress)',type:'group',admin:{condition:(_,s)=>Boolean(s.customize)},fields:[{name:'title',label:'Titolo',type:'text'},{name:'description',label:'Descrizione',type:'textarea'},{name:'image',label:'Copertina',type:'upload',relationTo:'media'},...ctaFields()]},
] };
