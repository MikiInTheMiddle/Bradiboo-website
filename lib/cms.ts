import {productBackground} from './product-model';
import {hasBlockContent,requiresBlockItems} from './block-content-visibility';
import {branchPublication,hiddenBranchPath,hiddenBranchPage} from './branch-publication';
import {applyCardFunction,sourceVideo} from './card-function';
import {selectedAudio,sourceAudioTracks} from './card-audio';
import {resolveCardAudio,sourceAudio} from './card-audio';
import {contentSelectionBlocks,contentSelectionQuery,selectCharacterCards,type ContentSelection} from './content-selection';
import {profileCard,profileEntries} from './profile-model';
import {resolveGalleryMoments,simpleGalleryRows,sourceGalleryRows} from './gallery-model';
import {productionMetadata} from './production-metadata';
import {characterIdentityAppearance} from './character-card-identity';
import {edgeColor,resolveHeroPageBackground} from './hero-edge-color';
import {chooseHeroImage} from './hero-images';
import {inheritCard,sourceCard,linkedCard} from './card-source';
import {mergeWideAppearance,type WideAppearance} from './wide-appearance';
import {resolveFeaturedSlide} from './featured-model';
import {mergeCardAppearance,type CardAppearance} from './card-appearance';
import type {BlockTypography} from './text-style';
import { createLocalReq, getPayload } from 'payload';
import config from '@payload-config';
import {getHeadlessProduct} from './product-headless';
import {normalizeProductSection,resolveProductSection,type ProductSection} from './product-model';
import { getBraditime } from './braditime';
import { resolveColor, gradientColors } from './background';
import { safeLink, youtubeEmbed } from './presentation';
import type { WirePage, WireBlock, WireLink } from './wireframe';
import type { Media, Content, Character, WatchTerm } from '@/payload-types';
const preview = process.env.WIREFRAME_PREVIEW === 'true';
type Upload = number | Media | null;
type SlideSettings={cardFunction?:string;videoSettings?:any;audioSettings?:any;cardTitle?:string|null;cardDescription?:string|null;cardImage?:Upload;wideAppearance?:WideAppearance|null;mobileImage?:Upload;focalX?:number|null;focalY?:number|null;hideBadge?:boolean|null;slideBadge?:string|null};
type Card = SlideSettings & {profileField?:string;hidden?:boolean;sourceMode?:string;source?:{relationTo:'pages'|'contents'|'characters'|'production-containers'|'media';value:any}|null;overrideContent?:boolean;overrideImage?:boolean;sourceContent?:number|Content|null;mobileImage?:Upload;focalX?:number|null;focalY?:number|null;hideBadge?:boolean|null;appearance?:CardAppearance;label:string;href?:string|null;description?:string|null;image?:Upload;badge?:string|null;badgeBackgroundColor?:string|null;badgeTextColor?:string|null;ctaLabel?:string|null};
type Source = BlockTypography & {id?:string;showAudioControl?:boolean;
 contentSelection?:ContentSelection;
 customEdgeColor?:boolean;edgeColor?:string;randomHero?:boolean;heroImages?:{customEdgeColor?:boolean;edgeColor?:string;image?:Upload;mobileImage?:Upload;focalX?:number|null;focalY?:number|null}[];
 cardAppearance?:CardAppearance;cardOverrides?:{character?:number|Character|null;content?:number|Content|null;position?:number|null;wideAppearance?:WideAppearance|null;cardTitle?:string|null;cardDescription?:string|null;cardImage?:Upload;appearance?:CardAppearance;mobileImage?:Upload;focalX?:number|null;focalY?:number|null;hideBadge?:boolean|null;slideBadge?:string|null}[];
 cardLayout?:'auto'|'grid'|'carousel'|'compact';presentation?:'cards'|'wide';wideOverlayOpacity?:number;slideOverrides?:({content:number|Content}&Card)[];
 blockType:string;label:string;title:string;note?:string|null;draft?:boolean;items?:Card[];cards?:Card[];panels?:Card[];
 profileAudioOverride?:boolean;profileAudio?:Upload;profileAudioCaption?:string;section?:string;overrideTitle?:boolean;overrideNote?:boolean;overrideMedia?:boolean;overrideItems?:boolean;mode?:string;limit?:number;production?:number|Content|null;character?:number|Character|null;media?:Upload;mediaMobileImage?:Upload;showMedia?:boolean;mediaSource?:string;youtubeURL?:string;
 galleryPhotos?:any[];gallerySourceMode?:string;gallerySource?:{relationTo:'characters'|'contents'|'production-containers';value:any};gallerySelectionMode?:string;gallerySelected?:unknown;images?:any[];galleryLayout?:string;galleryGap?:number;galleryShowTitle?:boolean;galleryShowCaption?:boolean;ctaAlign?:import('./cta-alignment').CTAAlignment;eyebrowMode?:'auto'|'custom'|'hidden'|null;eyebrowText?:string|null;mobileImage?:Upload;focalX?:number;focalY?:number;showText?:boolean;contentLayout?:string;showBadge?:boolean;badge?:string;badgeBackgroundColor?:string;badgeTextColor?:string;backgroundColor?:string;backgroundMode?:string;backgroundImage?:Upload;backgroundOpacity?:number;backgroundBlur?:number;ctaLabel?:string;ctaURL?:string;
 themeTerms?:(number|WatchTerm)[];keywordTerms?:(number|WatchTerm)[];entries?:{content:number|Content;wideAppearance?:WideAppearance|null;cardTitle?:string|null;cardDescription?:string|null;cardImage?:Upload;appearance?:CardAppearance;mobileImage?:Upload;focalX?:number|null;focalY?:number|null;hideBadge?:boolean|null;slideBadge?:string|null}[];cast?:{character:number|Character;wideAppearance?:WideAppearance|null;cardTitle?:string|null;cardDescription?:string|null;cardImage?:Upload;appearance?:CardAppearance;mobileImage?:Upload;focalX?:number|null;focalY?:number|null;hideBadge?:boolean|null;slideBadge?:string|null}[];locale?:string;selectionMode?:string;characterFilters?:Record<string,boolean>;
 selections?:(SlideSettings & {activityID:string;appearance?:CardAppearance;customize?:boolean;overrides?:{title?:string;description?:string;image?:Upload;ctaLabel?:string;ctaURL?:string}})[];
};
const mediaURL = (m?:Upload) => typeof m === 'object' && m ? m.url || undefined : undefined;
const color = resolveColor;
function normalizedWide(value?:WideAppearance|null):WideAppearance|undefined {return value?{...value,image:undefined,backgroundImage:mediaURL(value.image as Upload)}:undefined;}
function cardContent(value?:SlideSettings){return Object.fromEntries(Object.entries({label:value?.cardTitle||undefined,description:value?.cardDescription??undefined,image:mediaURL(value?.cardImage)}).filter(([,v])=>v!==undefined));}
function slideSettings(value?:SlideSettings){return value?Object.fromEntries(Object.entries({actionSettings:{cardFunction:value.cardFunction,videoSettings:value.videoSettings,audioSettings:value.audioSettings},wideAppearance:normalizedWide(value.wideAppearance),mobileImage:mediaURL(value.mobileImage),focalX:value.focalX??undefined,focalY:value.focalY??undefined,hideBadge:value.hideBadge??undefined,wideBadge:value.slideBadge||undefined}).filter(([,v])=>v!==undefined)):{};}
function manualCard(c:Card):WireLink {return {cardFunction:c.cardFunction,...sourceVideo({playbackSource:c.videoSettings?.mode==='upload'?'file':'youtube',playbackFile:c.videoSettings?.file,playbackURL:c.videoSettings?.url}),cardAudio:resolveCardAudio(undefined,c.audioSettings),...slideSettings(c),mobileImage:mediaURL(c.mobileImage),focalX:c.focalX??undefined,focalY:c.focalY??undefined,hideBadge:c.hideBadge||undefined,appearance:c.appearance,label:c.label,href:safeLink(c.href)||'',description:c.description||undefined,image:mediaURL(c.image),badge:c.badge||undefined,badgeBackgroundColor:c.badgeBackgroundColor||undefined,badgeTextColor:c.badgeTextColor||undefined,ctaLabel:c.ctaLabel||undefined};}
function contentCard(c:Content):WireLink {return {audioTracks:sourceAudioTracks(c),...sourceVideo(c),cardAudio:sourceAudio(c),...productionMetadata(c),label:c.title,href:c.kind==='episodio'?`/guarda?contenuto=${encodeURIComponent(c.slug)}#watch-player`:safeLink(c.url)||'',description:c.description||undefined,image:mediaURL(c.cover),mobileImage:mediaURL(c.coverMobile),badge:c.highlightBadge||undefined,badgeBackgroundColor:c.highlightBadgeBackgroundColor||undefined,badgeTextColor:c.highlightBadgeTextColor||undefined};}
export async function getCMSPage(path: string): Promise<WirePage | undefined> {
 const payload=await getPayload({config});
 const req=await createLocalReq({},payload);
 const publication=await branchPublication(payload);if(hiddenBranchPath(path,publication))return;
 const result=await payload.find({req,collection:'pages',where:{path:{equals:path}},limit:1,depth:3,overrideAccess:preview});
 const page=result.docs[0];if(!page)return;
 if(hiddenBranchPage(page,publication))return;
 const product=page.headlessProductSlug?await getHeadlessProduct(page.headlessProductSlug):undefined;
 const blocks:WireBlock[]=[];
 let heroBackground:{color?:string;mobileColor?:string;endColor?:string;mobileEndColor?:string}|undefined;
 const mediaEnd=(m?:Upload)=>typeof m==='object'&&m&&(m as any).hasHeroGradientEndColor?edgeColor((m as any).heroGradientEndColor):undefined;
 const mediaEdge=(m?:Upload)=>typeof m==='object'&&m?edgeColor((m as any).bottomEdgeColor):undefined;
 let characterIdentities:Map<string,WireLink>|undefined;
 const cardSources=new Map<string,Promise<WireLink|undefined>>();
 const resolveManual=async(c:Card):Promise<WireLink>=>{
  const local=manualCard(c);
  if(!linkedCard(c))return local;
  const relation=c.source?.relationTo||'contents';
  const selected=c.source?.value||c.sourceContent;
  const id=typeof selected==='object'?selected?.id:selected;
  if(!id)return local;
  const key=`${relation}:${id}`;
  if(!cardSources.has(key))cardSources.set(key,(async()=>{
   try{const doc=await payload.findByID({req,collection:relation,id,depth:2,overrideAccess:false});return sourceCard(relation,doc);}
   catch(error:any){if([401,403,404].includes(error.status))return;throw error;}
  })());
  const base=await cardSources.get(key);
  const unavailable=relation==='contents'&&publication.hiddenContents.has(id)||relation==='production-containers'&&publication.hiddenContainers.has(id);
  return !base&&unavailable?{...local,hidden:true}:inheritCard(base,local,c);
 };

 for(const block of (page.blocks || []) as unknown as Source[]) {
  if(block.draft)continue;
  const sourceMedia=typeof block.media==='object'&&block.media?block.media:undefined;
  const youtube=youtubeEmbed(block.youtubeURL);
  const visual:Partial<WireBlock>={showAudioControl:block.showAudioControl,ctaAlign:block.ctaAlign,eyebrowMode:block.eyebrowMode,eyebrowText:block.eyebrowText,mobileImage:mediaURL(block.mobileImage),focalX:block.focalX,focalY:block.focalY,showText:block.showText!==false,contentLayout:block.contentLayout,backgroundMode:block.backgroundMode,backgroundImage:mediaURL(block.backgroundImage),textColor:block.textColor,titleColor:block.titleColor,noteColor:block.noteColor,headingLevel:block.headingLevel,titleSize:block.titleSize,titleCustomSize:block.titleCustomSize,titleAlign:block.titleAlign,titleWeight:block.titleWeight,noteSize:block.noteSize,noteCustomSize:block.noteCustomSize,noteAlign:block.noteAlign,noteWeight:block.noteWeight,badge:block.showBadge?block.badge:undefined,badgeBackgroundColor:block.badgeBackgroundColor?color(block.badgeBackgroundColor):'#ffffff',badgeTextColor:block.badgeTextColor,backgroundColor:color(block.backgroundColor),opacity:(block.backgroundOpacity??100)/100,blur:block.backgroundBlur||0,
   media:block.showMedia?(block.mediaSource==='youtube'?(youtube?{kind:'youtube',url:youtube}:undefined):(sourceMedia?.url?{kind:sourceMedia.mimeType?.startsWith('video/')?'video':'image',url:sourceMedia.url,mobileImage:mediaURL(block.mediaMobileImage)}:undefined)):undefined};
  let items:WireLink[]=await Promise.all((block.items||[]).map(resolveManual));let type=block.blockType;
  if(type==='headlessProduct'){
   const section=block.section||'overview';
   visual.productSection=section;
   const local:ProductSection={media:visual.media,mobileImage:visual.media?.mobileImage,type:section==='overview'?'hero':['book','game'].includes(section)?'split':section==='psico'?'intro':section==='back'?'media':section==='videos'?'cta':'grid',title:block.title,note:block.note||undefined,image:mediaURL(block.media),items:await Promise.all((block.cards||[]).map(resolveManual))};
   let remote:ProductSection|undefined;
   if(product){try{remote=normalizeProductSection(product,section,local.items?.[0]);}catch{/* Invalid remote section: keep the saved snapshot. */}}
   const resolved=resolveProductSection(remote,local,{title:block.overrideTitle,note:block.overrideNote,media:block.overrideMedia,items:block.overrideItems});
   block.title=resolved.title;block.note=resolved.note;type=resolved.type;items=resolved.items||[];
   visual.media=block.showMedia?(resolved.media||(resolved.image?{kind:'image',url:resolved.image,mobileImage:mediaURL(block.mediaMobileImage)||resolved.mobileImage}:undefined)):undefined;
   visual.icons=resolved.icons;
   if(section==='specs'){visual.facts=items.filter(item=>item.description).map(item=>({label:item.label,value:item.description!}));items=[];}
   if(['bookGallery','gameGallery'].includes(section)||section==='videos'&&items.length){visual.gallerySettings={layout:'carousel',showTitle:false,showCaption:false};items=items.map((item,index)=>({...item,momentID:`product-${block.id}-${index}`,ratio:16/9}));}
  }
  const pageCharacter=typeof page.character==='object'&&page.character?page.character:undefined;
  if(type==='hero'&&pageCharacter)visual.characterHero=true;
  if(type==='hero'&&(page.path==='/guarda/format'||page.title.toLowerCase()==='bradibites'))visual.compactMobileHero=true;
  if(type==='characterProfile'&&pageCharacter){
   const c=pageCharacter;
   if(!block.overrideNote)block.note=c.description||undefined;
   if(block.showMedia&&!block.overrideMedia)visual.media=mediaURL(c.portrait)?{kind:'image',url:mediaURL(c.portrait)!,mobileImage:mediaURL(c.portraitMobile)}:undefined;
   visual.audio=block.profileAudioOverride?mediaURL(block.profileAudio):mediaURL(c.voiceClip);
   visual.audioCaption=block.profileAudioOverride?block.profileAudioCaption||undefined:c.voiceCaption||undefined;
   const rows:Card[]=block.cards??profileEntries.map(f=>({sourceMode:'profile',profileField:f.key,label:f.label}));
   items=(await Promise.all(rows.filter(row=>!row.hidden).map(async row=>{
    if(row.sourceMode!=='profile')return resolveManual(row);
    const base=profileCard(c,row.profileField);
    if(!base||(!base.description&&!base.cardAudio&&!row.overrideContent&&!row.audioSettings?.file))return undefined;
    return inheritCard(base,manualCard(row),row);
   }))).filter((item):item is WireLink=>Boolean(item));
   type='split';
  }
  if(type==='characterMoments'||type==='gallery'){
   let rows:any[]=[...simpleGalleryRows(block.galleryPhotos||[]),...(block.images||[])];
   if(block.gallerySourceMode!=='manual'){
    const source=block.gallerySourceMode==='linked'?block.gallerySource:page.galleryContext||(page.character?{relationTo:'characters' as const,value:page.character}:undefined);
    const id=source?.value&&typeof source.value==='object'?source.value.id:source?.value;
    if(source?.relationTo&&id){
     try{const doc=await payload.findByID({req,collection:source.relationTo,id,depth:2,overrideAccess:preview});rows=sourceGalleryRows(doc);}
     catch(error:any){if(![401,403,404].includes(error.status))throw error;rows=[];}
    }else rows=[];
   }
   items=resolveGalleryMoments(rows,block.gallerySourceMode==='manual'?'all':block.gallerySelectionMode,block.gallerySelected);
   visual.gallerySettings={layout:block.galleryLayout||(type==='characterMoments'?'moodboard':'carousel'),gap:block.galleryGap??20,showTitle:block.galleryShowTitle!==false,showCaption:block.galleryShowCaption!==false};
   visual.gallery=true;type='grid';

  }
  if(type==='characterFriends'&&pageCharacter){
   const selected=pageCharacter.friends?.filter((c):c is Character=>typeof c==='object')||[];
   const others=selected.length?selected:(await payload.find({req,collection:'characters',where:{id:{not_equals:pageCharacter.id}},limit:100,depth:1,overrideAccess:false})).docs;
   items=others.filter(c=>c.id!==pageCharacter.id).map(c=>({audioTracks:sourceAudioTracks(c),cardAudio:sourceAudio(c),section:c.editorialSection||'Braditriboo',identityAppearance:characterIdentityAppearance(c.cardIdentity),label:c.name,href:`/braditriboo/${c.slug}`,image:mediaURL(c.portrait),mobileImage:mediaURL(c.portraitMobile)}));type='rail';
  }
  if(block.backgroundMode==='page')visual.backgroundColor='transparent';
  if(type==='hero')Object.assign(visual,{heroImageMode:block.backgroundMode==='image',ownBackground:block.backgroundMode==='own'||block.backgroundMode==='image',backgroundImage:mediaURL(block.backgroundImage),opacity:(block.backgroundOpacity??100)/100,blur:block.backgroundBlur||0,...(block.backgroundMode==='image'?{backgroundColor:'#223668'}:{}),cta:block.ctaLabel&&safeLink(block.ctaURL)?{label:block.ctaLabel,href:safeLink(block.ctaURL)!}:undefined});
  let heroEnd=mediaEnd(block.backgroundImage);
  let heroMobileEnd=heroEnd;
  let heroColor=block.customEdgeColor?edgeColor(block.edgeColor):mediaEdge(block.backgroundImage);
  let heroMobileColor=block.customEdgeColor?edgeColor(block.edgeColor):mediaEdge(block.mobileImage)||heroColor;
  if(type==='hero'&&block.backgroundMode==='image'&&block.randomHero){
   const chosen=chooseHeroImage((block.heroImages||[]).map(c=>({image:mediaURL(c.image),mobileImage:mediaURL(c.mobileImage),focalX:c.focalX??50,focalY:c.focalY??50,color:c.customEdgeColor?edgeColor(c.edgeColor):mediaEdge(c.image),mobileColor:c.customEdgeColor?edgeColor(c.edgeColor):mediaEdge(c.mobileImage)||mediaEdge(c.image),endColor:mediaEnd(c.image),mobileEndColor:mediaEnd(c.image)})));
   if(chosen){Object.assign(visual,{backgroundImage:chosen.image,mobileImage:chosen.mobileImage,focalX:chosen.focalX,focalY:chosen.focalY});heroColor=chosen.color;heroMobileColor=chosen.mobileColor;heroEnd=chosen.endColor;heroMobileEnd=chosen.mobileEndColor;}
  }
  if(!heroBackground&&type==='hero'&&block.backgroundMode==='image')heroBackground={color:heroColor,mobileColor:heroMobileColor,endColor:heroEnd,mobileEndColor:heroMobileEnd};
  if(type==='featured') {
   visual.skipReveal=true;
   const resolveSlide=(original:WireLink,override?:Card)=>({...resolveFeaturedSlide(original,override?manualCard(override):undefined),cardAudio:resolveCardAudio(selectedAudio(original,override?.audioSettings),override?.audioSettings)});
   if(block.mode==='automatic') {
    const list=await payload.find({req,collection:'contents',where:{highlight:{equals:true}},sort:['highlightOrder','-createdAt'],limit:block.limit||6,depth:1,overrideAccess:false});
    items=list.docs.map(c=>resolveSlide(contentCard(c),block.slideOverrides?.find(o=>(typeof o.content==='object'?o.content.id:o.content)===c.id)));
   }else items=await Promise.all((block.cards||[]).map(async c=>resolveFeaturedSlide(await resolveManual(c))));
  visual.presentation=block.presentation||'cards';visual.wideOverlayOpacity=block.wideOverlayOpacity??55;
   visual.carousel=items.length>1;type='media';
  }
  if(type==='collection') {
   if(block.mode==='catalog')items=(block.entries||[]).flatMap(e=>typeof e.content==='object'&&e.content._status==='published'?[{...contentCard(e.content),cardAudio:resolveCardAudio(sourceAudio(e.content,(e as any).audioSettings?.track||'card'),(e as any).audioSettings),...cardContent(e),...slideSettings(e),appearance:e.appearance}]:[]);
   else if(block.mode==='characters')items=(block.cast||[]).flatMap(e=>typeof e.character==='object'?[{audioTracks:sourceAudioTracks(e.character),section:e.character.editorialSection||'Braditriboo',identityAppearance:characterIdentityAppearance(e.character.cardIdentity),mobileImage:mediaURL(e.character.portraitMobile),...slideSettings(e),appearance:e.appearance,label:e.character.name,href:`/braditriboo/${e.character.slug}`,image:mediaURL(e.character.portrait),cardAudio:resolveCardAudio(sourceAudio(e.character,(e as any).audioSettings?.track||'card'),(e as any).audioSettings),...cardContent(e)}]:[]);
   else items=await Promise.all((block.cards||[]).map(resolveManual));
   type='grid';
  }
  if(type==='episodes'){
   const id=typeof block.production==='object'&&block.production?block.production.id:block.production;
   const episodes=id?(await payload.find({req,collection:'contents',where:{and:[{parent:{equals:id}},{kind:{equals:'episodio'}}]},sort:'createdAt',limit:block.limit||24,depth:1,overrideAccess:false})).docs:[];
   items=episodes.map(contentCard);type='rail';

  }
  if(type==='companySplit'){items=await Promise.all((block.panels||[]).map(resolveManual));type='split';}
  if(type==='braditime') {
   const explicit=Object.entries(block.characterFilters||{}).filter(([,v])=>v).map(([k])=>k);
   const manual=block.selectionMode==='manual';const selections=block.selections||[];
   const result=await getBraditime({locale:block.locale||'it',limit:block.limit||6,characters:manual?[]:explicit,themes:manual?[]:(block.themeTerms||[]).flatMap(t=>typeof t==='object'?[t.slug]:[]),keywords:manual?[]:(block.keywordTerms||[]).flatMap(t=>typeof t==='object'?[t.slug]:[]),selectedIDs:manual?selections.map(s=>s.activityID):undefined});
   items=result.items.map(item=>{const selection=selections.find(s=>s.activityID===item.id);const o=selection?.customize?selection.overrides:undefined;
    return {...item,cardAudio:resolveCardAudio(undefined,selection?.audioSettings),...slideSettings(selection),appearance:selection?.appearance,label:o?.title||item.label,description:o?.description||item.description,image:mediaURL(o?.image)||item.image,href:safeLink(o?.ctaURL)||item.href,ctaLabel:o?.ctaLabel||'Apri su Braditime'};});
   if(result.message)block.note=[block.note,result.message].filter(Boolean).join(' ');type='rail';
  }
  if(type==='dynamic') {
   const relation=block.character||page.character;const id=typeof relation==='object'&&relation?relation.id:relation;
   const contents=id?await payload.find({req,collection:'contents',where:{characters:{contains:id}},sort:'-createdAt',limit:block.limit||6,depth:1,overrideAccess:false}):{docs:[]};items=contents.docs.map(contentCard);type='rail';
  }
  if(contentSelectionBlocks.has(block.blockType)&&block.contentSelection?.enabled){
   if(block.contentSelection.by==='characters'){
    const characters=await payload.find({req,collection:'characters',limit:1000,depth:1,overrideAccess:false});
    items=selectCharacterCards(characters.docs,block.contentSelection,page.character).map(c=>sourceCard('characters',c)!);
   }else{
   const selected=await payload.find({req,collection:'contents',...contentSelectionQuery(block.contentSelection,page.character),depth:2,overrideAccess:false});
   items=selected.docs.map(contentCard);
   }
  }
  items=items.filter(item=>!item.hidden&&!hiddenBranchPath(item.href,publication));
  if(items.some(item=>/^\/braditriboo\/[^/]+$/.test(item.href)&&!item.identityAppearance)){
   if(!characterIdentities){const characters=await payload.find({req,collection:'characters',limit:100,depth:1,overrideAccess:false});characterIdentities=new Map(characters.docs.map(c=>[`/braditriboo/${c.slug}`,sourceCard('characters',c)!]));}
   items=items.map(item=>{const source=characterIdentities?.get(item.href);return source?{...source,...item,image:item.image||source.image,mobileImage:item.mobileImage||source.mobileImage,identityAppearance:item.identityAppearance||source.identityAppearance}:item;});
  }
  items=items.map((item,index)=>{const override=block.cardOverrides?.find(o=>{
   if(typeof o.character==='object'&&o.character)return item.href===`/braditriboo/${o.character.slug}`;
   if(typeof o.content==='object'&&o.content)return item.href===contentCard(o.content).href;
   return !o.character&&!o.content&&o.position===index+1;
  });return applyCardFunction({...item,...cardContent(override),...slideSettings(override),appearance:block.presentation==='wide'?undefined:mergeCardAppearance(item.identityAppearance,block.cardAppearance,item.appearance,override?.appearance),cardAudio:resolveCardAudio(selectedAudio(item,(override as any)?.audioSettings),(override as any)?.audioSettings),wideAppearance:mergeWideAppearance(item.wideAppearance,normalizedWide(override?.wideAppearance))},{...item.actionSettings,...override,cardFunction:(override as any)?.cardFunction||item.actionSettings?.cardFunction||block.cardAppearance?.cardFunction});});
  if(['watchExperience','zapExperience'].includes(type)){visual.watchRailMode=(block as any).railMode||'all';visual.watchRailSelections=((block as any).railSelections||[]).map((r:any)=>({...r,surface:r.surface?{...r.surface,backgroundImage:mediaURL(r.surface.backgroundImage),mobileImage:mediaURL(r.surface.mobileImage)}:undefined}));visual.cardAppearance={...block.cardAppearance,...(block.ctaAlign&&block.ctaAlign!=='inherit'?{ctaAlign:block.ctaAlign}:{}),...(block.eyebrowMode?{eyebrowMode:block.eyebrowMode,eyebrowText:block.eyebrowText}:{})};visual.catalogOverrides=(block.cardOverrides||[]).map(o=>({cardFunction:(o as any).cardFunction,videoSettings:(o as any).videoSettings,audioSettings:(o as any).audioSettings,id:typeof o.content==='object'&&o.content?String(o.content.id):typeof o.content==='number'?String(o.content):undefined,position:o.position??undefined,appearance:o.appearance,title:o.cardTitle,description:o.cardDescription,image:mediaURL(o.cardImage),mobileImage:mediaURL(o.mobileImage),focalX:o.focalX??undefined,focalY:o.focalY??undefined}));}
  visual.presentation=block.presentation||'cards';visual.wideOverlayOpacity=block.wideOverlayOpacity??55;visual.cardLayout=block.cardLayout;
  if(block.ctaLabel&&safeLink(block.ctaURL))visual.cta={label:block.ctaLabel,href:safeLink(block.ctaURL)!};
  if(block.cardLayout==='compact')visual.carousel=false;
  if(block.cardLayout==='grid'){visual.carousel=false;if(type==='rail')type='grid';}
  if(block.cardLayout==='carousel')visual.carousel=items.length>1;
  const resolved:WireBlock={type:(type==='contact'?'list':type) as WireBlock['type'],label:block.label,title:block.title,note:block.note||undefined,status:block.draft?'draft':undefined,items,...visual,requiresItems:requiresBlockItems(block.blockType,Boolean(block.contentSelection?.enabled))};
  if(hasBlockContent(resolved))blocks.push(resolved);
 }
 return {cloudBackground:{enabled:Boolean(page.cloudBackground?.enabled),layers:[page.cloudBackground?.layer1,page.cloudBackground?.layer2,page.cloudBackground?.layer3].map(v=>mediaURL(v)||'')},footerOverride:page.footerOverride,redirectTo:safeLink(page.redirectTo),path:page.path,title:page.title,group:page.group||'',purpose:page.purpose||'',status:page._status==='draft'?'draft':undefined,blocks,...resolveHeroPageBackground({color:gradientColors(page.pageBackgroundColor)?page.pageBackgroundColor!:color(page.pageBackgroundColor)==='transparent'&&(page.blocks||[]).some((b:any)=>b.blockType==='headlessProduct'&&b.section==='overview')?productBackground(product)||'transparent':color(page.pageBackgroundColor),image:mediaURL(page.pageBackgroundImage)},{linked:Boolean(page.heroBackground),override:Boolean(page.customHeroBackground),color:page.heroBackgroundColor,mode:page.heroBackgroundMode,endColor:page.heroBackgroundEndColor,overrideEnd:Boolean(page.customHeroBackgroundEnd)},heroBackground)};
}
export async function getCMSPages(){const payload=await getPayload({config});const result=await payload.find({collection:'pages',where:{hideFromSitemap:{not_equals:true}},limit:100,sort:'createdAt',depth:0,overrideAccess:preview});const publication=await branchPublication(payload);return result.docs.filter(page=>!hiddenBranchPage(page,publication)).map(page=>({path:page.path,title:page.title,group:page.group||'',purpose:page.purpose||'',status:page._status==='draft'?'draft' as const:undefined}));}
export async function getMenu(){const payload=await getPayload({config});return (await payload.findGlobal({slug:'navigation',depth:0})).items||[];}

export async function getSiteNavigation(){const payload=await getPayload({config});return payload.findGlobal({slug:'navigation',depth:1});}
