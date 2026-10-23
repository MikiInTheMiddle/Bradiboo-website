import fs from 'node:fs';
import {getPayload} from 'payload';
import config from '../payload.config';
import type {Page} from '../payload-types';
import {decodeTermName} from '../lib/sync-watch-terms';
const payload=await getPayload({config});
const shop=(await payload.find({collection:'pages',where:{path:{equals:'/shop'}},depth:0,limit:1})).docs[0];
if(shop.sourceReference?.includes('shop-showcase-v1')){console.log('Shop già importato: modifiche in Payload preservate.');await payload.destroy();process.exit(0);}
const base=process.env.BRADITIME_API_BASE;if(!base)throw new Error('Headless non configurato');
const response=await fetch(new URL('wp-json/bradicore/v1/product/all',base.endsWith('/')?base:base+'/'),{signal:AbortSignal.timeout(15000)});
if(!response.ok)throw new Error('Catalogo non disponibile');
const catalog=await response.json();const product=catalog.find((p:{slug:string})=>p.slug==='dove-sei');if(!product)throw new Error('Dove sei? non trovato');
fs.mkdirSync('work/backups',{recursive:true});fs.writeFileSync(`work/backups/shop-${Date.now()}.json`,JSON.stringify({shop,source:product},null,2));
const text=(s:unknown)=>typeof s==='string'?decodeTermName(s.replace(/<\/(?:p|div|li)>/gi,'\n').replace(/<[^>]*>/g,'')).trim():'';
type Image={id?:number;ID?:number;url?:string;alt?:string;title?:string;mime_type?:string};
const images=new Map<string,number>();
async function image(media:Image|undefined,label:string){
 if(!media?.url)return undefined;
 if(images.has(media.url))return images.get(media.url);
 const name=`shop-dove-sei-${media.id||media.ID||label}.${media.mime_type==='image/png'?'png':'jpg'}`;
 const existing=(await payload.find({collection:'media',where:{filename:{equals:name}},limit:1,depth:0})).docs[0];
 if(existing){images.set(media.url,existing.id);return existing.id;}
 const res=await fetch(media.url,{signal:AbortSignal.timeout(20000)});if(!res.ok)throw new Error(`Immagine non disponibile: ${label}`);
 const mime=res.headers.get('content-type')?.split(';')[0];if(!mime?.startsWith('image/'))throw new Error('Formato immagine non valido');
 const data=Buffer.from(await res.arrayBuffer());
 const created=await payload.create({collection:'media',data:{alt:text(media.alt)||label},file:{data,mimetype:mime,name,size:data.length}});images.set(media.url,created.id);return created.id;
}
const formURL='https://forms.fillout.com/t/prvJGgrgkxus';
const ctaLabel='Avvisami quando disponibile';
const path='/shop/bradibox/dove-sei';
const cover=await image(product.visual.main_image,'Bradibox Dove sei? — confezione');
const bookGallery=[];for(const im of product.book_details.image_gallery||[])bookGallery.push({label:'Il libro — Dove sei?',image:await image(im,'Dove sei? — pagine del libro')});
const gameGallery=[];for(const im of product.game_details.image_gallery||[])gameGallery.push({label:'Il gioco — Mimetizoo',image:await image(im,'Mimetizoo — materiali di gioco')});
const back=await image(product.visual.back_cover?.landscape||product.visual.back_cover?.portrait,'Dove sei? — contenuto della confezione');
const block=(blockType:string,label:string,title:string,note?:string,extra:Record<string,unknown>={})=>({blockType,label,title,note,draft:false,...extra});
const cta=()=>block('cta','Richiesta disponibilità',ctaLabel,'La Bradibox è sold out. Puoi lasciare la tua richiesta tramite il modulo Fillout.',{items:[{label:ctaLabel,href:formURL,ctaLabel}]});
const videos=[{label:'Presentazione della Bradibox',url:product.visual.main_video?.remote_medias?.landscape||product.visual.main_video?.remote_medias?.square||product.visual.main_video?.remote_medias?.portrait},{label:'Approfondimento psicopedagogico',url:product.psico_details.video?.remote_medias?.landscape||product.psico_details.video?.remote_medias?.portrait||product.psico_details.video?.remote_medias?.square}].filter(v=>v.url);
const productBlocks=[
 block('hero','Scheda prodotto','Dove sei?',text(product.abstract.long||product.abstract.short),{showBadge:true,badge:'Sold out',showMedia:true,mediaSource:'upload',media:cover,ctaLabel,ctaURL:formURL}),
 ...(videos.length?[block('cta','Video della Bradibox','Guarda la Bradibox',undefined,{items:videos.map(v=>({label:v.label,href:v.url}))})]:[]),
 block('collection','Informazioni prodotto','La Bradibox in breve',undefined,{mode:'manual',cards:[{label:'Età',description:`${product.meta_infos.age}+`},{label:'Durata',description:`${product.meta_infos.duration} minuti`},{label:'Difficoltà',description:`${product.meta_infos.difficulty} su 4`},{label:'Contenuto',description:'Un libro e il gioco Mimetizoo'}]}),
 block('split','Il libro','Il libro: '+text(product.book_details.title),text(product.book_details.text),{showMedia:Boolean(bookGallery[0]),mediaSource:'upload',media:bookGallery[0]?.image}),
 block('collection','Galleria libro','Sfoglia il libro',undefined,{mode:'manual',cards:bookGallery}),
 block('split','Il gioco','Il gioco: '+text(product.game_details.title),text(product.game_details.text),{showMedia:Boolean(gameGallery[0]),mediaSource:'upload',media:gameGallery[0]?.image}),
 block('collection','Galleria gioco','Dentro Mimetizoo',undefined,{mode:'manual',cards:gameGallery}),
 ...(back?[block('media','Contenuto della scatola','Dentro la Bradibox',undefined,{showMedia:true,mediaSource:'upload',media:back})]:[]),
 block('intro','Approfondimento','Cosa sviluppa',text(product.psico_details.text)),
 block('collection','Competenze','Competenze in gioco',undefined,{mode:'manual',cards:(product.psico_details.develop||[]).map((d:{label:string;value:string})=>({label:text(d.label),description:`${d.value} su 4`}))}),
 block('collection','Dati confezione','Informazioni sulla confezione',undefined,{mode:'manual',cards:[{label:'Codice',description:product.sku},{label:'ISBN',description:product.isbn},{label:'Dimensioni',description:product.pack.dimensions},{label:'Materiale',description:product.pack.material},{label:'Lingua',description:product.pack.language}].filter(c=>c.description)}),
 cta(),
 block('cta','Torna alla vetrina','Le Bradibox',undefined,{items:[{label:'Torna allo Shop',href:'/shop'}]}),
] as Page['blocks'];
const existing=(await payload.find({collection:'pages',where:{path:{equals:path}},depth:0,limit:1})).docs[0];
const sourceReference='shop-showcase-v1. Repo legacy bradishop/bradibox/[slug]/page.tsx e components/formFillout.tsx. Headless product ID '+product.id+'. Scheda online verificata https://bradiboo.com/it/bradishop/bradibox/dove-sei/. Sold out confermato dall’utente: lo status live dell’API non indica disponibilità. CTA Fillout dalla repo; nessun invio effettuato.';
const data={title:'Dove sei? — Bradibox',path,group:'Shop',purpose:'Scheda della Bradibox sold out, con richiesta disponibilità tramite Fillout.',sourceReference,blocks:productBlocks,_status:'published' as const};
if(existing)await payload.update({collection:'pages',id:existing.id,data});else await payload.create({collection:'pages',data});
await payload.update({collection:'pages',id:shop.id,data:{purpose:'Vetrina della Bradibox attuale: shop chiuso, prodotto sold out, richieste tramite Fillout.',sourceReference,blocks:[
 block('hero','Introduzione Shop','Le Bradibox','Una libreria, un playground, un laboratorio creativo. Tutto in una scatola.',{showBadge:true,badge:'Shop chiuso · Sold out'}),
 block('intro','Presentazione','Storie da vivere insieme','Un kit narrativo che contiene un libro e un gioco per stimolare la creatività, l’immaginazione, la consapevolezza e il dialogo. Si basa sulle LIFE SKILLS, una serie di competenze da allenare per vivere bene con noi stessi e con gli altri.'),
 block('collection','Prodotto in evidenza','La nostra Bradibox',undefined,{mode:'manual',cards:[{label:'Dove sei?',description:text(product.abstract.short),image:cover,badge:'Sold out',href:path,ctaLabel:'Scopri la Bradibox'}]}),
 cta(),
] as Page['blocks']}});
const nav=await payload.findGlobal({slug:'navigation',depth:0});await payload.updateGlobal({slug:'navigation',data:{items:(nav.items||[]).map(i=>i.href==='/shop'?{...i,label:'Shop'}:i)}});
console.log(`Vetrina e scheda Dove sei? importate. ${images.size} immagini. CTA Fillout esistente, nessun acquisto.`);
await payload.destroy();
