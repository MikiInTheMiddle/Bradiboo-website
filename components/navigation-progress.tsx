'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {usePathname,useSearchParams} from 'next/navigation';
/** Immediate click acknowledgement; clears when the App Router commits the URL. */
export function NavigationProgress(){
 const path=usePathname(),query=useSearchParams().toString();
 const [busy,setBusy]=useState(false);
 const clicked=useRef<HTMLAnchorElement|null>(null),timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const pressed=useRef<HTMLElement|null>(null),pressTimer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const finish=useCallback(()=>{clearTimeout(timer.current);clicked.current?.removeAttribute('data-navigation-pending');clicked.current=null;setBusy(false);},[]);
 useEffect(()=>{finish();},[path,query,finish]);
 useEffect(()=>{
  const press=(event:PointerEvent)=>{
   if(event.pointerType==='mouse'||!(event.target instanceof Element))return;
   const target=event.target.closest<HTMLElement>('.wf-header a,.wf-header button,.wf-items > a,.wf-items > article,.watch-card,.gallery-card,.wf-action');
   if(!target)return;
   pressed.current?.removeAttribute('data-press-feedback');clearTimeout(pressTimer.current);pressed.current=target;
   const angle=((.25+Math.random()*1.75)*(Math.random()<.5?-1:1)).toFixed(2)+'deg';
   target.style.setProperty('--menu-hover-angle',angle);target.style.setProperty('--card-hover-angle',angle);target.setAttribute('data-press-feedback','true');
   pressTimer.current=setTimeout(()=>{target.removeAttribute('data-press-feedback');},450);
  };
  const start=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!(event.target instanceof Element))return;
   const link=event.target.closest<HTMLAnchorElement>('a[href]');
   if(!link||link.hasAttribute('download')||link.target&&link.target!=='_self')return;
   const url=new URL(link.href,location.href);
   if(url.origin!==location.origin||url.pathname===location.pathname&&url.search===location.search)return;
   clicked.current?.removeAttribute('data-navigation-pending');clicked.current=link;link.setAttribute('data-navigation-pending','true');
   setBusy(true);clearTimeout(timer.current);timer.current=setTimeout(finish,15000);
  };
  document.addEventListener('pointerdown',press,true);document.addEventListener('click',start,true);window.addEventListener('pageshow',finish);window.addEventListener('error',finish);
  return ()=>{document.removeEventListener('pointerdown',press,true);document.removeEventListener('click',start,true);clearTimeout(pressTimer.current);pressed.current?.removeAttribute('data-press-feedback');window.removeEventListener('pageshow',finish);window.removeEventListener('error',finish);clearTimeout(timer.current);clicked.current?.removeAttribute('data-navigation-pending');};
 },[finish]);
 return busy?<div className="navigation-progress" role="status" aria-label="Caricamento pagina"><span/></div>:null;
}
