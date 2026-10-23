import {applyCardFunction} from './card-function';
import {resolveCardAudio,selectedAudio} from './card-audio';
import type {WatchItem} from './watch-model';
export function applyWatchCardFunction(item:WatchItem,row:any):WatchItem{
 const fn=row?.cardFunction==='inherit'?undefined:row?.cardFunction;
 const original=item.sourceVideo||item.video;
 const sourceAudio=item.sourceCardAudio||item.cardAudio;
 const sourceItem={...item,cardAudio:sourceAudio};
 const value=applyCardFunction({label:item.title,href:item.href||'',cardAudio:resolveCardAudio(selectedAudio(sourceItem,row?.audioSettings),row?.audioSettings),audioTracks:item.audioTracks,video:original?.kind==='file'?original.url:undefined,youtube:original?.kind==='youtube'?original.url:undefined},{...row,cardFunction:fn});
 return {...item,sourceCardAudio:sourceAudio,sourceVideo:original,cardFunction:fn||item.cardFunction,cardAudio:value.cardAudio,video:value.video?{kind:'file',url:value.video}:value.youtube?{kind:'youtube',url:value.youtube}:undefined};
}
