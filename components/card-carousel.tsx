'use client';
import {useCallback,useEffect,useId,useRef,useState,type ReactNode} from 'react';
export function CardCarousel({children,variant='carousel',label='Contenuti in primo piano'}:{children:ReactNode;variant?:'carousel'|'rail';label?:string}) {
 const ref=useRef<HTMLDivElement>(null);
 const trackID=useId();
 const [edges,setEdges]=useState({overflow:false,left:false,right:false});
 const measure=useCallback(()=>{
  const track=ref.current;if(!track)return;
  const maximum=track.scrollWidth-track.clientWidth;
  const next={overflow:maximum>2,left:track.scrollLeft>2,right:maximum-track.scrollLeft>2};
  setEdges(previous=>previous.overflow===next.overflow&&previous.left===next.left&&previous.right===next.right?previous:next);
 },[]);
 useEffect(()=>{
  const track=ref.current;if(!track)return;
  measure();const observer=new ResizeObserver(measure);observer.observe(track);
  for(const child of Array.from(track.children))observer.observe(child);
  return ()=>observer.disconnect();
 },[children,measure]);
 const settled=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>()=>{if(settled.current)clearTimeout(settled.current);},[]);
 const suspendHover=()=>{
  const track=ref.current;if(!track)return;
  for(const card of Array.from(track.children))card.setAttribute('data-hover-suspended','');
  if(settled.current)clearTimeout(settled.current);
  settled.current=setTimeout(()=>{for(const card of Array.from(track.children))card.removeAttribute('data-hover-suspended');settled.current=null;},160);
 };
 const move=(direction:number)=>{const track=ref.current;if(!track)return;suspendHover();track.scrollBy({left:direction*track.clientWidth*.85,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});};
 return <div className={variant==='rail'?'wf-rail-scroll':'wf-carousel'} data-scroll-left={edges.left||undefined} data-scroll-right={edges.right||undefined}>
  <div className={`wf-items wf-scroll-track${variant==='carousel'?' wf-carousel-items':''}`} ref={ref} id={trackID} onScroll={()=>{suspendHover();measure();}} tabIndex={edges.overflow?0:undefined} role="region" aria-label={label}>{children}</div>
  {edges.overflow&&<div className="wf-scroll-controls" aria-label={`Controlli: ${label}`}>
   {edges.left&&<button className="wf-scroll-previous" type="button" aria-controls={trackID} aria-label={`Scorri indietro: ${label}`} onClick={()=>move(-1)}><span aria-hidden="true">→</span></button>}
   {edges.right&&<button className="wf-scroll-next" type="button" aria-controls={trackID} aria-label={`Scorri avanti: ${label}`} onClick={()=>move(1)}><span aria-hidden="true">→</span></button>}
  </div>}
 </div>;
}
