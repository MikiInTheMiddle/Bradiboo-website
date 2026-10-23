import {selectWatchRails} from './watch-rail-selection';
import {applyWatchCardFunction} from './watch-card-function';
import {resolveCardAudio} from './card-audio';
import {mergeCardAppearance} from './card-appearance';
import type {WireBlock} from './wireframe';
import type {WatchItem,WatchRail} from './watch-model';
export function styleWatchModule(data:{items:WatchItem[];rails:WatchRail[]},block:WireBlock){
 const decorate=(item:WatchItem,index:number,railAppearance?:WatchItem['appearance'])=>{
  const override=block.catalogOverrides?.find(o=>o.id?o.id===item.id:o.position===index+1);
  return applyWatchCardFunction({...item,cardAudio:resolveCardAudio(item.cardAudio,override?.audioSettings),title:override?.title||item.title,description:override?.description??item.description,image:override?.image||item.image,mobileImage:override?.mobileImage||item.mobileImage,focalX:override?.focalX??item.focalX,focalY:override?.focalY??item.focalY,appearance:mergeCardAppearance(item.appearance,block.cardAppearance,railAppearance,override?.appearance)},{...override,cardFunction:override?.cardFunction||block.cardAppearance?.cardFunction});
 };
 return {items:data.items.map((item,index)=>decorate(item,index)),rails:selectWatchRails(data.rails,block.watchRailMode,block.watchRailSelections).map(rail=>({...rail,items:rail.items.map((item,index)=>decorate(item,index,block.watchRailMode==='selected'?block.watchRailSelections?.find(r=>r.railID===rail.id&&!r.draft)?.cardAppearance:undefined))}))};
}
