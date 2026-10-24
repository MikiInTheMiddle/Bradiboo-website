import {visualMediaURL} from './visual-media';
import {sourceVideo} from './card-function';
import {selectedAudio,sourceAudioTracks} from './card-audio';
import {sourceAudio,resolveCardAudio} from './card-audio';
import {sourceCategoryField,filterCardSources} from './card-source-category';
import {productionMetadata} from './production-metadata';
import {characterIdentityAppearance} from './character-card-identity';
import {safeLink} from './presentation';
import type {Field} from 'payload';
import type {WireLink} from './wireframe';
export const cardSourceFields=():Field[]=>[
 {name:'sourceMode',label:'Contenuti della card',type:'radio',options:[{label:'Manuali',value:'manual'},{label:'Da sorgente',value:'linked'}],admin:{layout:'horizontal',components:{Field:'/components/admin/CardSourceMode#CardSourceMode'}}},
 sourceCategoryField,
 {name:'source',label:'Scheda di riferimento',type:'relationship',relationTo:['pages','contents','characters','production-containers','media'],validate:(value:any,{siblingData:s}:any)=>s.sourceMode!=='linked'||Boolean(value||s.sourceContent)||'Seleziona una sorgente.',filterOptions:filterCardSources,admin:{condition:(_,s)=>s.sourceMode==='linked'||Boolean(s.source)&&s.sourceMode!=='manual'&&s.sourceMode!=='profile',description:'Eredita titolo, descrizione, copertina e destinazione. La sorgente resta invariata.'}},
 {name:'overrideContent',label:'Personalizza testi e link solo in questa card',type:'checkbox',admin:{description:'Quando attivo, valgono i testi locali: una descrizione vuota non viene recuperata dalla sorgente.',condition:(_,s)=>s.sourceMode==='profile'||s.sourceMode==='linked'||Boolean(s.source)&&s.sourceMode!=='manual'&&s.sourceMode!=='profile'}},
 {name:'overrideImage',label:'Sostituisci l’immagine ereditata',type:'checkbox',admin:{condition:(_,s)=>s.sourceMode==='profile'||s.sourceMode==='linked'||Boolean(s.source)&&s.sourceMode!=='manual'&&s.sourceMode!=='profile'}},
];
export function linkedCard(s:any){return s.sourceMode==='profile'||s.sourceMode==='linked'||s.sourceMode!=='manual'&&Boolean(s.source||s.sourceContent);}
const image=visualMediaURL;
export function sourceCard(relation:string,doc:any):WireLink|undefined {
 if(!doc||!['characters','production-containers','media'].includes(relation)&&doc._status!=='published')return;
 if(relation==='media')return {label:doc.alt||doc.filename||'Immagine',image:image(doc),alt:doc.alt||undefined,href:''};
 if(relation==='characters')return {hoverImage:image(doc.cardIdentity?.hoverImage),audioTracks:sourceAudioTracks(doc),...sourceVideo(doc),cardAudio:sourceAudio(doc),section:doc.editorialSection||'Braditriboo',identityAppearance:characterIdentityAppearance(doc.cardIdentity),label:doc.name,description:doc.description||undefined,image:image(doc.portrait),mobileImage:image(doc.portraitMobile),href:`/braditriboo/${doc.slug}`};
 if(relation==='production-containers')return {audioTracks:sourceAudioTracks(doc),...sourceVideo(doc),cardAudio:sourceAudio(doc),section:doc.editorialSection||undefined,container:{id:String(doc.id),title:doc.title},label:doc.title,description:doc.description||undefined,image:image(doc.cover),mobileImage:image(doc.coverMobile),href:safeLink(doc.url)||''};
 if(relation==='contents')return {audioTracks:sourceAudioTracks(doc),...sourceVideo(doc),cardAudio:sourceAudio(doc),...productionMetadata(doc),label:doc.title,description:doc.description||undefined,image:image(doc.cover),mobileImage:image(doc.coverMobile),href:doc.kind==='episodio'?`/guarda?contenuto=${encodeURIComponent(doc.slug)}#watch-player`:safeLink(doc.url)||'',badge:doc.highlightBadge||undefined,badgeBackgroundColor:doc.highlightBadgeBackgroundColor||undefined,badgeTextColor:doc.highlightBadgeTextColor||undefined};
 const blocks=(doc.blocks||[]).filter((b:any)=>!b.draft);
 const hero=blocks.find((b:any)=>b.blockType==='hero')||blocks[0];
 const candidates=blocks.map((b:any)=>{
  if(image(b.backgroundImage)||image(b.media))return {image:image(b.backgroundImage)||image(b.media),mobileImage:image(b.backgroundImage)?image(b.mobileImage):image(b.mediaMobileImage)||image(b.mobileImage),focalX:b.focalX,focalY:b.focalY};
  const first=b.blockType==='hero'&&b.randomHero?b.heroImages?.find((row:any)=>image(row.image)):undefined;
  return first?{image:image(first.image),mobileImage:image(first.mobileImage),focalX:first.focalX,focalY:first.focalY}:undefined;
 });
 const coverBlock=candidates.find(Boolean);
 const cover=coverBlock?.image||image(doc.pageBackgroundImage)||image(doc.character?.portrait);
 const mobile=coverBlock?.mobileImage||(!coverBlock&&!image(doc.pageBackgroundImage)?image(doc.character?.portraitMobile):undefined);
 return {hoverImage:image(doc.character?.cardIdentity?.hoverImage),identityAppearance:doc.path?.startsWith('/braditriboo/')?characterIdentityAppearance(doc.character?.cardIdentity):undefined,label:hero?.title||doc.title,description:hero?.note||undefined,image:cover,mobileImage:mobile,focalX:coverBlock?.focalX??undefined,focalY:coverBlock?.focalY??undefined,href:safeLink(doc.path)||'',ctaLabel:hero?.ctaLabel||undefined};
}
export function inheritCard(base:WireLink|undefined,local:WireLink,settings:any):WireLink {
 if(!base||!linkedCard(settings))return local;
 const legacy=Boolean(settings.sourceContent)&&!settings.source;
 const texts=legacy||settings.overrideContent;
 const photo=legacy||settings.overrideImage;
 return {...local,...base,
  ...(texts?(legacy?Object.fromEntries(Object.entries({label:local.label,description:local.description,href:local.href,ctaLabel:local.ctaLabel}).filter(([,v])=>v!==undefined&&v!==null&&v!=='')):{label:local.label,description:local.description,href:local.href,ctaLabel:local.ctaLabel}):{}),
  ...(photo&&local.image?{image:local.image}:{}),
  cardAudio:resolveCardAudio(selectedAudio(base,settings.audioSettings),settings.audioSettings),appearance:local.appearance,wideAppearance:local.wideAppearance,mobileImage:local.mobileImage||base.mobileImage,focalX:local.focalX??base.focalX,focalY:local.focalY??base.focalY,hideBadge:local.hideBadge,wideBadge:local.wideBadge,
 };
}
