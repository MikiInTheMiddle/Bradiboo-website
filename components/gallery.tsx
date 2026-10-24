'use client';
import {VisualMedia} from './visual-media';
import {CardVideo} from './card-video';
import {CardAudioPlayer,CardAudioBlockControl} from './card-audio';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
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
 return <>{block.showAudioControl&&items.some(i=>i.cardAudio)&&<CardAudioBlockControl/>}<div ref={root} className={`wf-gallery gallery-${layout}`} style={{'--gallery-gap':`${gap}px`} as CSSProperties}>{layout==='moodboard'?justifiedRows(items,width||1024,gap).map((row,index)=><div className="gallery-mosaic-row" key={index} style={{height:row.height}}>{row.items.map((item,i)=>card(item,row.ratios[i]))}</div>):<div className="gallery-track" tabIndex={0} aria-label="Immagini della galleria">{items.map(item=>card(item))}</div>}</div></>;
}
