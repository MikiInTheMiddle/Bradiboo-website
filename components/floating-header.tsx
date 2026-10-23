'use client';
import {useEffect,useRef,useState,type ReactNode,type PointerEvent} from 'react';
/** Align contextual navigation to the main menu's centre. */
export function FloatingHeader({children,immersive=false}:{children:ReactNode;immersive?:boolean}){
 const [revealed,setRevealed]=useState(!immersive);
 const header=useRef<HTMLElement>(null);
 function rotateButton(event:PointerEvent<HTMLElement>){
  if(event.pointerType!=='mouse'||!(event.target instanceof Element))return;
  const button=event.target.closest<HTMLElement>('a:not(.wf-logo),button');
  if(!button||!event.currentTarget.contains(button)||event.relatedTarget instanceof Node&&button.contains(event.relatedTarget))return;
  button.style.setProperty('--menu-hover-angle',`${((.25+Math.random()*1.75)*(Math.random()<.5?-1:1)).toFixed(2)}deg`);
 }
 useEffect(()=>{
  const root=header.current;const menu=root?.querySelector<HTMLElement>('.wf-header-main > nav');if(!root||!menu)return;
  const align=()=>{
   const bounds=menu.getBoundingClientRect();root.style.setProperty('--explore-center',`${bounds.left+bounds.width/2-root.getBoundingClientRect().left}px`);
  };
  align();const observer=new ResizeObserver(align);observer.observe(root);observer.observe(menu);return ()=>observer.disconnect();
 },[]);
 useEffect(()=>{
  if(!immersive){setRevealed(true);return;}
  const hero=header.current?.closest('.site-ui')?.querySelector<HTMLElement>('.home-entrance');
  if(!hero){setRevealed(true);return;}
  let frame=0;
  const update=()=>{frame=0;const bounds=hero.getBoundingClientRect();setRevealed(bounds.height>0&&bounds.top<=-bounds.height/2);};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
  update();const observer=new ResizeObserver(schedule);observer.observe(hero);
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);window.addEventListener('pageshow',schedule);
  return ()=>{cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);window.removeEventListener('pageshow',schedule);};
 },[immersive]);
 return <header ref={header} onPointerOver={rotateButton} className="wf-header" data-revealed={revealed} inert={!revealed} aria-hidden={!revealed||undefined}>{children}</header>;
}
