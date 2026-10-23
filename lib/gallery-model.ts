import {sourceAudio,resolveCardAudio} from './card-audio';
import {safeLink} from './presentation';
import type {WireLink} from './wireframe';
export type GalleryItem=WireLink & {momentID:string;ratio:number;mobileRatio?:number};
export function resolveGalleryMoments(rows:any[],selectionMode?:string|null,selected?:unknown):GalleryItem[]{
 const ids=Array.isArray(selected)?new Set(selected.map(String)):new Set<string>();
 return rows.flatMap((row:any,index:number)=>{
  const image=row.image&&typeof row.image==='object'?row.image:undefined;
  if(!image?.url||image.mimeType&&!image.mimeType.startsWith('image/'))return [];
  const id=String(row.id??index);
  if(selectionMode==='selected'&&!ids.has(id))return [];
  const mobile=row.mobileImage&&typeof row.mobileImage==='object'?row.mobileImage:undefined;
  const linked=row.content&&typeof row.content==='object'&&row.content._status==='published'?row.content:undefined;
  return [{cardAudio:resolveCardAudio(sourceAudio(linked),row.audioSettings),appearance:row.appearance,momentID:id,label:row.title||'',description:row.caption||undefined,image:image.url,mobileImage:mobile?.url,alt:row.alt||image.alt||'',focalX:row.focalX??50,focalY:row.focalY??50,ratio:image.width&&image.height?image.width/image.height:1.5,mobileRatio:mobile?.width&&mobile.height?mobile.width/mobile.height:undefined,href:safeLink(row.href)||(linked?(linked.kind==='episodio'?`/guarda?contenuto=${encodeURIComponent(linked.slug)}#watch-player`:safeLink(linked.url)):undefined)||''}];
 });
}
export function justifiedRows(items:GalleryItem[],width:number,gap:number){
 const target=width<700?170:250;const rows:GalleryItem[][]=[];let row:GalleryItem[]=[];let sum=0;
 const ratio=(i:GalleryItem)=>Math.max(.6,Math.min(2.2,width<700?i.mobileRatio||i.ratio:i.ratio));
 for(const item of items){row.push(item);sum+=ratio(item);if(sum*target+gap*(row.length-1)>=width){rows.push(row);row=[];sum=0;}}
 if(row.length){if(row.length===1&&rows.length)rows[rows.length-1].push(...row);else rows.push(row);}
 const height=(items:GalleryItem[])=>(width-gap*(items.length-1))/items.reduce((s,i)=>s+ratio(i),0);
 // Balance the trailing row rather than stretching a small remainder excessively.
 if(rows.length>1){const previous=rows[rows.length-2],last=rows[rows.length-1];
  while(previous.length>1){const candidate=[previous[previous.length-1],...last];
   if(Math.abs(height(previous.slice(0,-1))-height(candidate))>=Math.abs(height(previous)-height(last)))break;
   last.unshift(previous.pop()!);
  }
 }
 return rows.map(items=>({items,ratios:items.map(ratio),height:Math.max(1,Math.min(width<700?320:420,height(items)))}));
}

export function simpleGalleryRows(photos:any[]=[]){return photos.filter(m=>m&&typeof m==='object'&&m.url&&(!m.mimeType||m.mimeType.startsWith('image/'))).map(m=>({id:`photo-${m.id}`,image:m,alt:m.alt||''}));}
export function sourceGalleryRows(doc:any){return [...simpleGalleryRows(doc?.momentPhotos||[]),...(doc?.moments||[])];}
