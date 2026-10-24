'use client';

import { type ReactNode, type PointerEvent, type MouseEvent, type CSSProperties } from 'react';

export function SiteInteractions({ children, className = '',style }: { children: ReactNode; className?: string;style?:CSSProperties }) {
 function rotateCard(event:PointerEvent<HTMLDivElement>) {
  if(event.pointerType!=='mouse'||!(event.target instanceof Element))return;
  const card=event.target.closest<HTMLElement>('.wf-items > a, .wf-items > article, .watch-card, .gallery-card');
  if(!card||!event.currentTarget.contains(card)||event.relatedTarget instanceof Node&&card.contains(event.relatedTarget))return;
  const angle=(0.25+Math.random()*1.75)*(Math.random()<0.5?-1:1);
  card.style.setProperty('--card-hover-angle',`${angle.toFixed(2)}deg`);
 }
 function leaveCard(event:MouseEvent<HTMLDivElement>) {
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
 return <div style={style} onPointerOver={rotateCard} onPointerOut={resetLeavingCard} onClickCapture={leaveCard} className={`site-interactions ${className}`}>
  {children}
 </div>;
}
