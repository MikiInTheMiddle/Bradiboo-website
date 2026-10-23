import {applyWatchCardFunction} from './watch-card-function';
import {sourceAudioTracks} from './card-audio';
import {sourceAudio,resolveCardAudio} from './card-audio';
import {productionMetadata} from './production-metadata';
import {mergeCardAppearance} from './card-appearance';
import 'server-only';
import { createLocalReq, getPayload } from 'payload';
import config from '@payload-config';
import { youtubeEmbed, safeLink } from './presentation';
import { defaultWatchFilters, filterWatch, type WatchItem, type WatchRail, type WatchCharacter } from './watch-model';
import type { WatchTerm } from '@/payload-types';
import { watchSamples } from './watch-samples';
const preview=process.env.WIREFRAME_PREVIEW==='true';
const mediaURL=(m:any)=>m&&typeof m==='object'?m.url||undefined:undefined;
function rowContent(row:any){return {...(row?.cardTitle?{title:row.cardTitle}:{}),...(row?.cardDescription!=null?{description:row.cardDescription}:{}),...(mediaURL(row?.cardImage)?{image:mediaURL(row.cardImage)}:{}),...(mediaURL(row?.mobileImage)?{mobileImage:mediaURL(row.mobileImage)}:{}),...(row?.focalX!=null?{focalX:row.focalX}:{}),...(row?.focalY!=null?{focalY:row.focalY}:{})};}

export async function getWatchData(){
 const payload=await getPayload({config});
 const req=await createLocalReq({},payload);
 const [result,cast,settings,vocabulary]=await Promise.all([
  payload.find({req,collection:'contents',limit:1000,depth:2,overrideAccess:false,sort:'-createdAt'}),
  payload.find({req,collection:'characters',limit:100,depth:1,overrideAccess:false,sort:'createdAt'}),
  payload.findGlobal({req,slug:'watch',depth:2,overrideAccess:false}),
  payload.find({req,collection:'watch-terms',limit:1000,sort:'name',depth:0,overrideAccess:false}),
 ]);
 const termSlugs=(values?: (number|WatchTerm)[]|null)=>(values||[]).flatMap(t=>t&&typeof t==='object'?[t.slug]:[]);
 const themeOptions=vocabulary.docs.filter(t=>t.taxonomy==='topic').map(t=>({value:t.slug,label:t.name}));
 const keywordOptions=vocabulary.docs.filter(t=>t.taxonomy==='keyword').map(t=>({value:t.slug,label:t.name}));
 const characters:WatchCharacter[]=cast.docs.map(c=>({id:c.slug,name:c.name,image:typeof c.portrait==='object'&&c.portrait?.url?c.portrait.url:`/characters/${c.slug}.svg`}));
 const items:WatchItem[]=result.docs.flatMap(c=>{
  if(c.recordType==='production')return [];
  const kind=c.watchKind||(c.kind==='episodio'?'serie':undefined);if(!kind)return [];
  const youtube=c.playbackSource==='youtube'?youtubeEmbed(c.playbackURL):undefined;
  const file=c.playbackSource==='file'&&typeof c.playbackFile==='object'&&c.playbackFile?.mimeType?.startsWith('video/')?c.playbackFile.url:undefined;
  const video:WatchItem['video']=youtube?{kind:'youtube',url:youtube}:file?{kind:'file',url:file}:undefined;
  if(!video&&!preview)return [];
  const override=settings.cardOverrides?.find(o=>String(typeof o.content==='object'&&o.content?o.content.id:o.content)===String(c.id));
  return [applyWatchCardFunction({audioTracks:sourceAudioTracks(c),cardAudio:resolveCardAudio(sourceAudio(c),(override as any)?.audioSettings),...rowContent(override),appearance:mergeCardAppearance(settings.cardAppearance,override?.appearance),id:String(c.id),slug:c.slug,title:override?.cardTitle||c.title,badge:c.highlightBadge||undefined,badgeBackgroundColor:c.highlightBadgeBackgroundColor||undefined,badgeTextColor:c.highlightBadgeTextColor||undefined,description:override?.cardDescription??c.description??'',emotionalCore:c.emotionalCore||undefined,...productionMetadata(c),href:safeLink(c.url),image:mediaURL(override?.cardImage)||mediaURL(c.cover),mobileImage:mediaURL(override?.mobileImage)||mediaURL(c.coverMobile),characters:c.characters?.flatMap(p=>p&&typeof p==='object'?[p.slug]:[])||[],themes:termSlugs(c.themeTerms),keywords:termSlugs(c.keywordTerms),kind,demo:false,video},{...override,cardFunction:(override as any)?.cardFunction||(settings.cardAppearance as any)?.cardFunction})];
 });
 if(preview&&settings.showSamples!==false)items.push(...watchSamples);
 const playableItems=items.filter(i=>Boolean(i.video)&&!i.demo);
 const rails:WatchRail[]=(settings.rails||[]).map((r,index)=>{
  const selected=r.mode==='manual'?(r.entries||[]).flatMap(e=>{const id=e.content&&typeof e.content==='object'?e.content.id:e.content;const item=playableItems.find(i=>i.id===String(id));return item?[applyWatchCardFunction({...item,cardAudio:resolveCardAudio(item.cardAudio,(e as any).audioSettings),...rowContent(e),appearance:mergeCardAppearance(item.appearance,e.appearance)},e)]:[]}):filterWatch(playableItems,{keywordMatch:r.keywordMatch||'any',characters:(r.characters||[]).flatMap(c=>c&&typeof c==='object'?[c.slug]:[]),themes:termSlugs(r.themeTerms),keywords:termSlugs(r.keywordTerms)});
  return {id:r.id||String(index),title:r.title,description:r.description||undefined,surface:r.surface?{...r.surface,backgroundImage:mediaURL(r.surface.backgroundImage),mobileImage:mediaURL(r.surface.mobileImage)}:undefined,items:selected.slice(0,r.limit||6).map(item=>{const entry=r.entries?.find(e=>String(typeof e.content==='object'&&e.content?e.content.id:e.content)===item.id);return applyWatchCardFunction({...item,...rowContent(entry),title:(entry as any)?.cardTitle||item.title,description:(entry as any)?.cardDescription??item.description,image:mediaURL((entry as any)?.cardImage)||item.image,appearance:mergeCardAppearance(item.appearance,r.cardAppearance,entry?.appearance)},{...entry,cardFunction:(entry as any)?.cardFunction||(r.cardAppearance as any)?.cardFunction});})};
 }).filter(r=>r.items.length);
 const filters=settings.filters?.length?settings.filters.map(f=>({key:f.key,label:f.label||defaultWatchFilters.find(d=>d.key===f.key)?.label||f.key,placement:f.placement})):defaultWatchFilters;
 const remoteButtons=(settings.remoteButtons||[]).map((b,index)=>({id:b.id||String(index),label:b.label,icon:b.icon||'shapes',image:typeof b.image==='object'&&b.image?.url?b.image.url:undefined,keywords:termSlugs(b.keywordTerms)}));
 return {items,characters,rails,preview,filters,remoteButtons,fullZap:settings.fullZap===true,zapLogo:mediaURL(settings.zapLogo),searchIcon:mediaURL(settings.searchIcon),themeOptions,keywordOptions};
}
