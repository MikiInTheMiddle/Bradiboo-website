import type {WireBlock,WireLink} from './wireframe';
import {decodeTermName} from './sync-watch-terms';
import {safeLink} from './presentation';
export const productSections=[{value:'overview',label:'Titolo, descrizione e immagine principale'},{value:'card',label:'Card prodotto nella vetrina'},{value:'highlights',label:'Età, durata e difficoltà'},{value:'book',label:'Il libro'},{value:'bookGallery',label:'Galleria libro'},{value:'game',label:'Il gioco'},{value:'gameGallery',label:'Galleria gioco'},{value:'back',label:'Contenuto della confezione'},{value:'psico',label:'Approfondimento psicopedagogico'},{value:'skills',label:'Competenze'},{value:'specs',label:'Dati confezione'},{value:'videos',label:'Video'}];
type Image={url?:string;alt?:string;title?:string};
type Video={url?:string;media_location?:string;remote_medias?:{landscape?:string;portrait?:string;square?:string};local_medias?:{landscape?:Image|false;portrait?:Image|false;square?:Image|false}};
export type HeadlessProduct={id:number;slug:string;title:string;abstract?:{short?:string;long?:string};sku?:string;isbn?:string;pack?:{dimensions?:string;material?:string;language?:string};meta_infos?:{age?:string;duration?:string;difficulty?:string};visual?:{background_color?:string;main_image?:Image;main_video?:Video;image_gallery?:Image[]|false;detail_image?:Image;back_cover?:{landscape?:Image;portrait?:Image}};book_details?:{title?:string;text?:string;image_gallery?:Image[]|false;icons?:Image[]|false};game_details?:{title?:string;text?:string;image_gallery?:Image[]|false;icons?:Image[]|false};psico_details?:{title?:string;text?:string;develop?:{label:string;value:string}[]|false;develop_icons?:Image[]|false;video?:Video}};
export type ProductSection={type:WireBlock['type'];title:string;note?:string;image?:string;mobileImage?:string;media?:WireBlock['media'];icons?:Image[];items?:WireLink[]};
const text=(v?:string)=>decodeTermName((v||'').replace(/<\/(?:p|div|li)>/gi,'\n').replace(/<[^>]*>/g,'')).trim();
export function productVideo(v?:Video,portrait=false):WireBlock['media']{
 const order:('landscape'|'square'|'portrait')[]=portrait?['portrait','landscape','square']:['landscape','square','portrait'];
 const pick=(keys:typeof order)=>keys.map(k=>safeLink(v?.media_location==='local'?undefined:v?.remote_medias?.[k])||safeLink((v?.local_medias?.[k]||undefined)?.url)).find(Boolean)||safeLink(v?.url);
 const url=pick(order);return url?{kind:'video',url,mobileVideo:pick(['portrait','landscape','square'])}:undefined;
}
const videoURL=(v?:Video)=>productVideo(v)?.url;
const icons=(images:Image[]|false|undefined)=>(images||[]).filter(i=>safeLink(i.url)).map(i=>({...i,url:safeLink(i.url),alt:text(i.alt||i.title)}));
export function normalizeProductSection(p:HeadlessProduct,section:string,localCard?:WireLink):ProductSection{
 const card=(label:string,description?:string):WireLink=>({label,description,href:'',textOnly:true});
 if(section==='overview')return {type:'intro',title:text(p.title),note:text(p.abstract?.long||p.abstract?.short),image:safeLink(p.visual?.main_image?.url)};
 if(section==='card')return {type:'grid',title:'La nostra Bradibox',items:[{...localCard,label:text(p.title),description:text(p.abstract?.short),image:safeLink(p.visual?.main_image?.url),href:`/shop/bradibox/${encodeURIComponent(p.slug)}`}]};
 if(section==='highlights')return {type:'grid',title:'La Bradibox in breve',items:[...(p.meta_infos?.age?[card('Età',`${p.meta_infos.age}+`)]:[]),...(p.meta_infos?.duration?[card('Durata',`${p.meta_infos.duration} minuti`)]:[]),...(p.meta_infos?.difficulty?[card('Difficoltà',`${p.meta_infos.difficulty} su 4`)]:[]),...([p.book_details?.title,p.game_details?.title].some(Boolean)?[card('Contenuto',[p.book_details?.title,p.game_details?.title].filter(Boolean).map(t=>text(t)).join(' · '))]:[])]};
 if(section==='book'||section==='game'){const d=section==='book'?p.book_details:p.game_details;return {type:'split',title:`${section==='book'?'Il libro':'Il gioco'}${d?.title?': '+text(d.title):''}`,note:text(d?.text),image:d?.image_gallery?safeLink(d.image_gallery[0]?.url):undefined};}
 if(section==='bookGallery'||section==='gameGallery'){const book=section==='bookGallery';const gallery=(book?p.book_details:p.game_details)?.image_gallery;return {type:'grid',title:book?'Sfoglia il libro':'Dentro il gioco',items:(gallery||[]).flatMap((i,index)=>{const image=safeLink(i.url);return image?[{label:text(i.alt)||`${book?'Il libro':'Il gioco'} · ${index+1}`,href:'',image,alt:text(i.alt)}]:[]})};}
 if(section==='back')return {type:'media',title:'Dentro la Bradibox',image:safeLink(p.visual?.back_cover?.landscape?.url||p.visual?.back_cover?.portrait?.url),mobileImage:safeLink(p.visual?.back_cover?.portrait?.url)};
 if(section==='psico')return {type:'split',title:text(p.psico_details?.title)||'Cosa sviluppa',note:text(p.psico_details?.text),media:productVideo(p.psico_details?.video,true),icons:icons(p.psico_details?.develop_icons)};
 if(section==='skills')return {type:'grid',title:'Competenze in gioco',items:(p.psico_details?.develop||[]).map(d=>({...card(text(d.label),`${d.value} su 4`),rating:{value:Number(d.value),max:4}}))};
 if(section==='specs')return {type:'split',title:'Informazioni sulla confezione',image:safeLink(p.visual?.detail_image?.url),icons:[...icons(p.book_details?.icons),...icons(p.game_details?.icons)],items:[card('Codice',p.sku),card('ISBN',p.isbn),card('Dimensioni',p.pack?.dimensions),card('Materiale',p.pack?.material),card('Lingua',p.pack?.language)].filter(c=>c.description)};
 if(section==='videos')return {type:'media',title:'Guarda la Bradibox',media:productVideo(p.visual?.main_video),image:safeLink(p.visual?.main_image?.url),items:(p.visual?.image_gallery||[]).flatMap((i,index)=>safeLink(i.url)?[{label:text(i.alt)||`Bradibox · ${index+1}`,href:'',image:safeLink(i.url),alt:text(i.alt)}]:[])};
 return {type:'cta',title:'Guarda la Bradibox',items:[{label:'Presentazione della Bradibox',href:videoURL(p.visual?.main_video)||''},{label:'Approfondimento psicopedagogico',href:videoURL(p.psico_details?.video)||''}].filter(i=>i.href)};
}
export function resolveProductSection(remote:ProductSection|undefined,local:ProductSection,overrides:{title?:boolean;note?:boolean;media?:boolean;items?:boolean}):ProductSection{
 if(!remote)return local;
 return {type:remote.type,title:overrides.title?local.title:remote.title,note:overrides.note?local.note:remote.note,image:overrides.media?local.image:remote.image,mobileImage:overrides.media?local.mobileImage:remote.mobileImage,media:overrides.media?local.media:remote.media,icons:overrides.items?local.icons:remote.icons,items:overrides.items?local.items:overrides.media&&remote.items?remote.items.map((item,index)=>({...item,image:local.items?.[index]?.image})):remote.items};
}

export function productBackground(product?:HeadlessProduct):string|undefined {
 const colors:Record<string,string>={blue:'#00c3eb',green:'#b4dfce',purple:'#7235e8',lime:'#c1d75d',yellow:'#f9b400'};
 return colors[product?.visual?.background_color||''];
}
