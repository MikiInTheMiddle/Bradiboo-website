'use client';

import { useRef, type ReactNode, type PointerEvent, type MouseEvent, type CSSProperties } from 'react';
import {useRouter} from 'next/navigation';

export function SiteInteractions({ children, className = '',style }: { children: ReactNode; className?: string;style?:CSSProperties }) {
 const router=useRouter();
 const touch=useRef<{id:number;x:number;y:number;started:number;link:HTMLAnchorElement;cancelled:boolean}|null>(null);
 const handledTouch=useRef<HTMLAnchorElement|null>(null);
 function beginTouch(event:PointerEvent<HTMLDivElement>) {
  if(event.pointerType!=='touch'||!event.isPrimary||!(event.target instanceof Element))return;
  const link=event.target.closest<HTMLAnchorElement>('a[data-card-kind="character"][href]');
  if(!link||link.target==='_blank'||link.hasAttribute('download'))return;
  handledTouch.current=null;
  touch.current={id:event.pointerId,x:event.clientX,y:event.clientY,started:event.timeStamp,link,cancelled:false};
  link.setPointerCapture(event.pointerId);
 }
 function moveTouch(event:PointerEvent<HTMLDivElement>) {
  const gesture=touch.current;
  if(gesture?.id===event.pointerId&&Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>10)gesture.cancelled=true;
 }
 function endTouch(event:PointerEvent<HTMLDivElement>) {
  const gesture=touch.current;touch.current=null;
  if(!gesture||gesture.id!==event.pointerId||gesture.cancelled||event.timeStamp-gesture.started>500||Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)>10)return;
  const destination=new URL(gesture.link.href,window.location.href);
  if(destination.origin!==window.location.origin)return;
  // Navigate on a completed tap rather than relying on Safari's synthetic hover/click.
  event.preventDefault();handledTouch.current=gesture.link;
  gesture.link.setAttribute('data-navigation-pending','true');
  router.push(destination.pathname+destination.search+destination.hash);
 }

 function rotateCard(event:PointerEvent<HTMLDivElement>) {
  if(event.pointerType!=='mouse'||!(event.target instanceof Element))return;
  const card=event.target.closest<HTMLElement>('.wf-items > a, .wf-items > article, .watch-card, .gallery-card');
  if(!card||!event.currentTarget.contains(card)||event.relatedTarget instanceof Node&&card.contains(event.relatedTarget))return;
  const angle=(0.25+Math.random()*1.75)*(Math.random()<0.5?-1:1);
  card.style.setProperty('--card-hover-angle',`${angle.toFixed(2)}deg`);
 }
 function leaveCard(event:MouseEvent<HTMLDivElement>) {
  if(handledTouch.current&&event.target instanceof Node&&handledTouch.current.contains(event.target)){event.preventDefault();handledTouch.current=null;return;}
  if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!(event.target instanceof Element))return;
  const link=event.target.closest<HTMLAnchorElement>('.wf-items > a[href],.watch-card[href],.gallery-card[href]');
  if(!link||link.target==='_blank'||link.hasAttribute('download'))return;
  const destination=new URL(link.href,window.location.href);
  if(destination.origin!==window.location.origin||destination.pathname===window.location.pathname)return;
  link.setAttribute('data-navigation-leaving','');link.setAttribute('data-hover-suspended','');
 }
 function resetLeavingCard(event:PointerEvent<HTMLDivElement>) {
  if(!(event.target instanceof Element))return;
  const card=event.target.closest<HTMLElement>('[data-navigation-leaving]');
  if(!card||event.relatedTarget instanceof Node&&card.contains(event.relatedTarget))return;
  card.removeAttribute('data-navigation-leaving');card.removeAttribute('data-hover-suspended');
 }
 return <div style={style} onPointerDownCapture={beginTouch} onPointerMoveCapture={moveTouch} onPointerUpCapture={endTouch} onPointerCancelCapture={()=>{touch.current=null;}} onContextMenuCapture={()=>{touch.current=null;}} onPointerOver={rotateCard} onPointerOut={resetLeavingCard} onClickCapture={leaveCard} className={`site-interactions ${className}`}>
  {children}
 </div>;
}
