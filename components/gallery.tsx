'use client';
import {VisualMedia} from './visual-media';
import {CardVideo} from './card-video';
import {CardAudioPlayer,CardAudioBlockControl} from './card-audio';
import {useEffect,useId,useRef,useState,type CSSProperties,type ReactNode,type KeyboardEvent,type PointerEvent} from 'react';
import Link from 'next/link';
import {justifiedRows,type GalleryItem} from '@/lib/gallery-model';
import {blockTextStyle} from '@/lib/text-style';
import {cardSurfaceStyle,cardHoverAttributes} from '@/lib/card-style';
import type {WireBlock} from '@/lib/wireframe';
export function Gallery({block}:{block:WireBlock}){
 const root=useRef<HTMLDivElement>(null);const [width,setWidth]=useState(0);
 useEffect(()=>{if(!root.current)return;const observer=new ResizeObserver(entries=>setWidth(entries[0].contentRect.width));observer.observe(root.current);return()=>observer.disconnect();},[]);
 const items=(block.items||[]) as GalleryItem[];const settings=block.gallerySettings||{};const gap=settings.gap??20;const layout=settings.layout||'carousel';
 const card=(item:GalleryItem,ratio?:number)=>{
  const props={className:'gallery-card',...cardHoverAttributes(item.appearance),style:{...cardSurfaceStyle(item.appearance),...(ratio?{flex:`${ratio} 1 0px`}:{})} as CSSProperties};
  const content=<><VisualMedia src={item.image!} mobileImage={item.mobileImage} alt={item.alt||''} loading="lazy" style={{objectPosition:`${item.focalX??50}% ${item.focalY??50}%`}}/>{(settings.showTitle!==false&&item.label||settings.showCaption!==false&&item.description)&&<span className="gallery-caption">{settings.showTitle!==false&&item.label&&<strong className="card-title" style={item.appearance?blockTextStyle(item.appearance,'title'):undefined}>{item.label}</strong>}{settings.showCaption!==false&&item.description&&<span className="card-description" style={item.appearance?blockTextStyle(item.appearance,'note'):undefined}>{item.description}</span>}</span>}</>;
  if(item.cardAudio||item.cardFunction==='video')return <article key={item.momentID} {...props}>{content}{item.href&&item.cardFunction!=='video'&&item.cardAudio?.ctaMode!=='audio'&&<Link href={item.href}>Scopri di più →</Link>}{item.cardFunction==='video'?<CardVideo item={item}/>:item.cardAudio&&<CardAudioPlayer audio={item.cardAudio} title={item.label}/>}</article>;
  return item.href?<Link key={item.momentID} href={item.href} {...props}>{content}</Link>:<article key={item.momentID} {...props} tabIndex={0}>{content}</article>;
 };
 if(layout==='thumbnails')return <>{block.showAudioControl&&items.some(i=>i.cardAudio)&&<CardAudioBlockControl/>}<GalleryThumbnails items={items} title={block.title} gap={gap} renderCard={card}/></>;
 return <>{block.showAudioControl&&items.some(i=>i.cardAudio)&&<CardAudioBlockControl/>}<div ref={root} className={`wf-gallery gallery-${layout}`} style={{'--gallery-gap':`${gap}px`} as CSSProperties}>{layout==='moodboard'?justifiedRows(items,width||1024,gap).map((row,index)=><div className="gallery-mosaic-row" key={index} style={{height:row.height}}>{row.items.map((item,i)=>card(item,row.ratios[i]))}</div>):<div className="gallery-track" tabIndex={0} aria-label="Immagini della galleria">{items.map(item=>card(item))}</div>}</div></>;
}


function GalleryThumbnails({items,title,gap,renderCard}:{items:GalleryItem[];title:string;gap:number;renderCard:(item:GalleryItem)=>ReactNode}){
 const [selected,setSelected]=useState(0);
 const [vertical,setVertical]=useState(false);
 const list=useRef<HTMLDivElement>(null);
 const swipe=useRef<{id:number;x:number;y:number}|null>(null);
 const swiped=useRef(false);
 const id=useId();
 const active=Math.min(selected,Math.max(0,items.length-1));
 useEffect(()=>{const query=matchMedia('(min-width:701px)');const update=()=>setVertical(query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);
 const select=(index:number,focus=false)=>{
  const next=Math.max(0,Math.min(items.length-1,index));setSelected(next);
  const button=list.current?.querySelectorAll<HTMLButtonElement>('button')[next];
  if(!button||!list.current)return;
  if(focus)button.focus({preventScroll:true});
  const rail=list.current;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const start=vertical?button.offsetTop:button.offsetLeft;
  const end=start+(vertical?button.offsetHeight:button.offsetWidth);
  const offset=vertical?rail.scrollTop:rail.scrollLeft;
  const size=vertical?rail.clientHeight:rail.clientWidth;
  if(start<offset||end>offset+size)rail.scrollTo({[vertical?'top':'left']:start<offset?start:end-size,behavior:reduced?'instant':'smooth'});
 };
 const keys=(event:KeyboardEvent<HTMLDivElement>)=>{
  const delta=['ArrowRight','ArrowDown'].includes(event.key)?1:['ArrowLeft','ArrowUp'].includes(event.key)?-1:0;
  if(!delta&&event.key!=='Home'&&event.key!=='End')return;
  event.preventDefault();select(event.key==='Home'?0:event.key==='End'?items.length-1:active+delta,true);
 };
 const startSwipe=(event:PointerEvent<HTMLDivElement>)=>{
  if(event.pointerType!=='touch'||!event.isPrimary||event.target instanceof Element&&event.target.closest('button,audio,video'))return;
  swiped.current=false;swipe.current={id:event.pointerId,x:event.clientX,y:event.clientY};
  const target=event.target instanceof Element?event.target.closest('a'):null;
  (target||event.currentTarget).setPointerCapture(event.pointerId);
 };
 const endSwipe=(event:PointerEvent<HTMLDivElement>)=>{
  const start=swipe.current;swipe.current=null;if(!start||start.id!==event.pointerId)return;
  const dx=event.clientX-start.x,dy=event.clientY-start.y;
  if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4){event.preventDefault();swiped.current=true;select(active+(dx<0?1:-1));}
 };
 if(!items.length)return null;
 const item=items[active];
 return <div className="wf-gallery gallery-thumbnails" role="region" aria-label={title||'Galleria con miniature'} style={{'--gallery-gap':`${gap}px`} as CSSProperties}>
  <div className="gallery-thumbnail-view" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-thumb-${active}`} onClickCapture={event=>{if(swiped.current){event.preventDefault();event.stopPropagation();swiped.current=false;}}} onPointerDown={startSwipe} onPointerUp={endSwipe} onPointerCancel={()=>{swipe.current=null;}}>
   <div className="gallery-thumbnail-image" key={item.momentID}>{renderCard(item)}</div>
   {items.length>1&&<div className="gallery-thumbnail-controls"><button type="button" aria-label="Immagine precedente" aria-controls={`${id}-panel`} disabled={active===0} onClick={()=>select(active-1)}><span aria-hidden="true" className="gallery-thumbnail-previous">→</span></button><button type="button" aria-label="Immagine successiva" aria-controls={`${id}-panel`} disabled={active===items.length-1} onClick={()=>select(active+1)}><span aria-hidden="true">→</span></button></div>}
  </div>
  <div className="gallery-thumbnail-navigation"><div ref={list} className="gallery-thumbnail-list" role="tablist" aria-label="Scegli immagine" aria-orientation={vertical?'vertical':'horizontal'} onKeyDown={keys}>{items.map((entry,index)=><button type="button" role="tab" id={`${id}-thumb-${index}`} key={entry.momentID} aria-controls={`${id}-panel`} aria-selected={index===active} tabIndex={index===active?0:-1} aria-label={entry.label||`Immagine ${index+1}`} onClick={()=>select(index)}><VisualMedia src={entry.image!} mobileImage={entry.mobileImage} alt="" loading="lazy" style={{objectPosition:`${entry.focalX??50}% ${entry.focalY??50}%`}}/></button>)}</div></div>
  <span className="gallery-thumbnail-status" role="status" aria-live="polite">Immagine {active+1} di {items.length}</span>
 </div>;
}
