import type {CardAppearance} from './card-appearance';
export const watchThemes = [
 {value:'curiosita',label:'Curiosità',icon:'sparkles'}, {value:'amicizia',label:'Amicizia',icon:'heart'},
 {value:'pazienza',label:'Pazienza',icon:'hourglass'}, {value:'fiducia',label:'Fiducia',icon:'sun'},
 {value:'appartenenza',label:'Appartenenza',icon:'users'}, {value:'autenticita',label:'Essere sé stessi',icon:'star'},
 {value:'cambiamento',label:'Cambiamento',icon:'wind'}, {value:'determinazione',label:'Provare ancora',icon:'mountain'},
];
export const watchKeywords = [
 {value:'natura',label:'Natura',icon:'leaf'}, {value:'arte',label:'Arte',icon:'palette'},
 {value:'musica',label:'Musica',icon:'music'}, {value:'scienza',label:'Scienza',icon:'flask'},
 {value:'scoperte',label:'Scoperte',icon:'compass'}, {value:'gioco',label:'Gioco',icon:'shapes'},
 {value:'famiglia',label:'Famiglia',icon:'home'}, {value:'spazio',label:'Spazio',icon:'rocket'},
 {value:'movimento',label:'Movimento',icon:'bike'},
];
export type WatchItem={sourceCardAudio?:import('./card-audio').CardAudio;sourceVideo?:{kind:'youtube'|'file';url:string};cardFunction?:string;audioTracks?:Record<string,import('./card-audio').CardAudio|undefined>;cardAudio?:import('./card-audio').CardAudio;section?:string;mobileImage?:string;focalX?:number;focalY?:number;appearance?:CardAppearance;id:string;slug?:string;title:string;description:string;badge?:string;badgeBackgroundColor?:string;badgeTextColor?:string;emotionalCore?:string;container?:{id:string;title:string;href?:string};production?:{id?:string;title:string;href?:string};href?:string;image?:string;characters:string[];themes:string[];keywords:string[];kind:string;demo:boolean;video?:{kind:'youtube'|'file';url:string}};
export type WatchFilters={containers?:string[];productions?:string[];characters:string[];themes:string[];keywords:string[];keywordMatch?:'any'|'all';query?:string;kind?:string;playableOnly?:boolean};
export type WatchRail={surface?:import('./watch-rail-surface').WatchRailSurface;id:string;title:string;description?:string;items:WatchItem[]};
export type WatchCharacter={id:string;name:string;image?:string};
export function filterWatch(items:WatchItem[],f:WatchFilters){
 const matches=(selected:string[],actual:string[])=>!selected.length||selected.some(t=>actual.includes(t));
 const q=f.query?.trim().toLocaleLowerCase('it');
 return items.filter(i=>(!f.containers?.length||Boolean(i.container&&f.containers.includes(i.container.id)))&&(!f.productions?.length||Boolean(i.production?.id&&f.productions.includes(i.production.id)))&&(!f.playableOnly||Boolean(i.video))&&(!f.kind||i.kind===f.kind)&&matches(f.characters,i.characters)&&matches(f.themes,i.themes)&&(!f.keywords.length||(f.keywordMatch==='all'?f.keywords.every(k=>i.keywords.includes(k)):f.keywords.some(k=>i.keywords.includes(k))))&&(!q||[i.title,i.description,i.production?.title,i.container?.title,...i.keywords,...i.themes].join(' ').toLocaleLowerCase('it').includes(q)));
}
export function pickWatch(items:WatchItem[],previous?:string,rng:()=>number=Math.random){const pool=items.length>1?items.filter(i=>i.id!==previous):items;return pool[Math.min(pool.length-1,Math.floor(rng()*pool.length))];}

export const watchFilterOptions=[{value:'characters',label:'Personaggi'},{value:'themes',label:'Temi ed emozioni'},{value:'keywords',label:'Argomenti'},{value:'kind',label:'Tipo di contenuto'},{value:'availability',label:'Disponibilità'}] as const;
export type WatchFilterConfig={key:typeof watchFilterOptions[number]['value'];label:string;placement:'primary'|'secondary'|'hidden'};
export type RemoteButton={id:string;label:string;image?:string;icon:string;keywords:string[]};
export const defaultWatchFilters:WatchFilterConfig[]=watchFilterOptions.map(f=>({key:f.value,label:f.label,placement:f.value==='characters'?'primary':'secondary'}));

export function remoteMatches(items:WatchItem[],keywords:string[]){return items.filter(i=>Boolean(i.video)&&keywords.some(k=>i.keywords.includes(k)));}
