'use client';
import Link from 'next/link';
import {useEffect,useRef,useState,useId} from 'react';
import {CookieLabel} from './cookie-label';
export type MobileMenuEntry={id:number;title:string;url:string;productions:{id:number;title:string;url:string}[]};
type Section={label:string;href:string;entries:MobileMenuEntry[]};
export function MobileNavigation({currentPath,sections,utilities}:{currentPath:string;sections:Section[];utilities:{label:string;href:string}[]}){
 const dialog=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 const [section,setSection]=useState<Section>();
 const [production,setProduction]=useState<MobileMenuEntry>();
 const [open,setOpen]=useState(false);
 const id=useId();
 const active=(href:string)=>currentPath===href||currentPath.startsWith(href+'/');
 const close=()=>{dialog.current?.close();};
 const launch=()=>{
  const current=sections.find(s=>active(s.href));
  setSection(current);setProduction(current?.entries.find(entry=>entry.productions.some(item=>active(item.url))));
  dialog.current?.showModal();setOpen(true);
 };
 useEffect(()=>{const media=window.matchMedia('(min-width:801px)');const resize=()=>{if(media.matches)dialog.current?.close();};media.addEventListener('change',resize);return ()=>media.removeEventListener('change',resize);},[]);
 const rows:MobileMenuEntry[]=production?production.productions.map(row=>({...row,productions:[]})):section?.entries||[];
 const destination=production?{href:production.url,label:production.title}:section;
 return <>
  <button ref={trigger} type="button" className="mobile-menu-trigger" aria-label="Apri menu" aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={launch}><svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
  <dialog ref={dialog} id={id} className="mobile-menu-dialog" aria-labelledby={`${id}-title`} onClose={()=>{setOpen(false);trigger.current?.focus();}} onClick={e=>{if(e.target!==e.currentTarget)return;const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}}>
   <div className="mobile-menu-panel">
    <div className="mobile-menu-heading"><h2 id={`${id}-title`}>{production?.title||section?.label||'Menu'}</h2><button type="button" className="mobile-menu-close" aria-label="Chiudi menu" onClick={close} autoFocus>×</button></div>
    <nav aria-label="Navigazione mobile">
     {section?<>
      <button type="button" className="mobile-menu-back" onClick={()=>{if(production)setProduction(undefined);else setSection(undefined);}}>← {production?section.label:'Menu'}</button>
      {destination&&<Link className="mobile-menu-destination" href={destination.href} aria-current={currentPath===destination.href?'page':undefined} onClick={close}>Vai a {destination.label} →</Link>}
      <div className="mobile-menu-options">{rows.map(row=>row.productions.length>0?<button type="button" key={row.id} aria-current={active(row.url)?'location':undefined} onClick={()=>setProduction(row)}><CookieLabel backgroundColor={active(row.url)?'#7135ed':'#eee8ff'} textColor={active(row.url)?'#fff':'#7135ed'}>{row.title}</CookieLabel><span aria-hidden="true">→</span></button>:<Link key={row.id} href={row.url} aria-current={active(row.url)?'page':undefined} onClick={close}><CookieLabel backgroundColor={active(row.url)?'#7135ed':'#eee8ff'} textColor={active(row.url)?'#fff':'#7135ed'}>{row.title}</CookieLabel></Link>)}</div>
     </>:<>
      <div className="mobile-menu-options mobile-menu-primary">{sections.filter(s=>s.href!=='/studio').map(s=><button type="button" key={s.href} onClick={()=>setSection(s)}><CookieLabel backgroundColor="#eee8ff" textColor="#7135ed">{s.label}</CookieLabel><span aria-hidden="true">→</span></button>)}</div>
      <div className="mobile-menu-options mobile-menu-secondary">{utilities.map(item=><Link key={item.href} href={item.href} aria-current={active(item.href)?'page':undefined} onClick={close}><CookieLabel backgroundColor="#eee8ff" textColor="#7135ed">{item.label}</CookieLabel></Link>)}{sections.filter(s=>s.href==='/studio').map(s=><button type="button" key={s.href} onClick={()=>setSection(s)}><CookieLabel backgroundColor="#eee8ff" textColor="#7135ed">{s.label}</CookieLabel><span aria-hidden="true">→</span></button>)}</div>
     </>}
    </nav>
   </div>
  </dialog>
 </>;
}
