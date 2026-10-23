import type {WireBlock} from './wireframe';
const collections=new Set(['grid','rail','related','dynamic','featured','collection','episodes','gallery','characterMoments','characterFriends','companySplit','braditime']);
export function requiresBlockItems(type:string,automatic=false){return automatic||collections.has(type);}
/** Collection headings describe their items; they are not a substitute for missing items. */
export function hasBlockContent(block:WireBlock){
 if(block.type==='watchExperience'||block.type==='zapExperience')return true; // Their catalog is resolved by WatchCMSPage.
 const hasItems=Boolean(block.items?.length);
 if(block.requiresItems??requiresBlockItems(block.type))return hasItems||Boolean(block.media?.url||block.audio||block.facts?.length);
 return hasItems||Boolean(block.media?.url||block.audio||block.backgroundMode==='image'&&block.backgroundImage||block.facts?.length||block.cta?.label&&block.cta.href||block.showText!==false&&(block.title?.trim()||block.note?.trim()||block.eyebrowMode==='custom'&&block.eyebrowText?.trim()));
}
