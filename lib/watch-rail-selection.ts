import type {Field} from 'payload';
import {cardAppearanceField,mergeCardAppearance} from './card-appearance';
import {watchRailSurfaceField,type WatchRailSurface} from './watch-rail-surface';
import type {WatchRail} from './watch-model';
import type {CardAppearance} from './card-appearance';
export type WatchRailSelection={railID:string;draft?:boolean|null;title?:string|null;description?:string|null;surface?:WatchRailSurface;cardAppearance?:CardAppearance};
export function watchRailSelectionFields():Field[]{return [
 {name:'railMode',label:'Fascioni sotto al player',type:'radio',defaultValue:'all',options:[{label:'Tutti i fascioni centralizzati',value:'all'},{label:'Scegli e riordina qui',value:'selected'},{label:'Nessuno',value:'none'}],admin:{layout:'horizontal'}},
 {name:'railSelections',dbName:'watch_page_rails',label:'Fascioni della pagina (ordine trascinabile)',type:'array',admin:{components:{RowLabel:'/components/admin/WatchRailSelect#WatchRailRowLabel'},condition:(_,s)=>s.railMode==='selected',description:'Le selezioni e i metadati restano centralizzati. Qui scegli l’ordine e gli override validi solo in questa pagina.'},fields:[
 {name:'railID',label:'Fascione centralizzato',type:'text',required:true,admin:{components:{Field:'/components/admin/WatchRailSelect#WatchRailSelect'}}},
 {name:'draft',label:'Nascondi questo fascione',type:'checkbox'},
 {type:'tabs',tabs:[{label:'Contenuto',fields:[{name:'title',label:'Titolo locale (vuoto = eredita)',type:'text'},{name:'description',label:'Introduzione locale (vuoto = eredita)',type:'textarea'}]},{label:'Fondo',fields:[watchRailSurfaceField()]},{label:'Stile comune delle card',fields:[cardAppearanceField('cardAppearance','Stile delle card di questo fascione')]}]},
 ]},
 ];}
export function selectWatchRails(rails:WatchRail[],mode?:string,selections:WatchRailSelection[]=[]):WatchRail[]{
 if(mode==='none')return [];if(mode!=='selected')return rails;
 return selections.flatMap(row=>{const source=rails.find(r=>r.id===row.railID);if(!source||row.draft)return [];const ownSurface=row.surface?.backgroundMode&&row.surface.backgroundMode!=='inherit';const surface={...source.surface,...(ownSurface?Object.fromEntries(Object.entries(row.surface||{}).filter(([,value])=>value!=null)):{}),...(row.surface?.backgroundBlur!=null?{backgroundBlur:row.surface.backgroundBlur}:{}),...(row.surface?.textColor&&row.surface.textColor!=='transparent'?{textColor:row.surface.textColor}:{})};
 return [{...source,title:row.title||source.title,description:row.description||source.description,surface,items:source.items.map(item=>({...item,appearance:mergeCardAppearance(item.appearance,row.cardAppearance)}))}];});
}
