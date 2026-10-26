'use client';
import Link from '@/components/site-link';
import {CookieLabel} from './cookie-label';
import {useEffect,useId,useRef,useState,type ReactNode} from 'react';
type Entry={id:number;title:string;url:string;productions:{id:number;title:string;url:string}[]};
function ToggleMark({open}:{open:boolean}){return <svg className="watch-toggle-mark" aria-hidden="true" viewBox="0 0 16 16" width="16" height="16"><path d="M3 8h10"/>{!open&&<path d="M8 3v10"/>}</svg>;}
export function WatchNavigationMenu({containers,currentPath,label='Contenitori di Guarda',className='',alwaysOpen=false,children}:{containers:Entry[];currentPath:string;label?:string;className?:string;alwaysOpen?:boolean;children:ReactNode}){
 const [expanded,setExpanded]=useState<number|null>(null);
 const [menuOpen,setMenuOpen]=useState(false);
 const visible=alwaysOpen||menuOpen;
 const root=useRef<HTMLDivElement>(null);
 const button=useRef<HTMLButtonElement>(null);
 const prefix=useId();
 const section=currentPath.startsWith('/studio')?'Studio':currentPath.startsWith('/braditriboo')?'Braditriboo':'Guarda';
 useEffect(()=>{setExpanded(null);setMenuOpen(false);},[currentPath]);
 useEffect(()=>{
  if(alwaysOpen||!menuOpen)return;
  const close=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node)){setMenuOpen(false);setExpanded(null);}};
  document.addEventListener('pointerdown',close);
  return ()=>document.removeEventListener('pointerdown',close);
 },[menuOpen,alwaysOpen]);
 const active=(url:string)=>currentPath===url?'page' as const:currentPath.startsWith(url+'/')?'location' as const:undefined;
 const selected=containers.find(c=>c.id===expanded);
 return <div ref={root} className={`navigation-explore-item ${className}`} onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)){setExpanded(null);setMenuOpen(false);}}} onKeyDown={event=>{if(event.key==='Escape'){event.stopPropagation();if(expanded!==null){root.current?.querySelector<HTMLButtonElement>(`button[data-container="${expanded}"]`)?.focus();setExpanded(null);}else{setMenuOpen(false);button.current?.focus();}}}}>
  <div className="navigation-explore-trigger">{children}{!alwaysOpen&&<button ref={button} type="button" className="navigation-explore-drop" aria-label={`Esplora ${section}`} title={`Esplora ${section}`} aria-expanded={menuOpen} aria-controls={`${prefix}-containers`} onClick={()=>{setMenuOpen(!menuOpen);setExpanded(null);}}><ToggleMark open={menuOpen}/></button>}</div>
  <div className="watch-context" data-menu-open={visible} hidden={!visible}>
   <div className="watch-explore-bar"><nav id={`${prefix}-containers`} className="watch-container-menu" aria-label={label}>
    {containers.map(container=>container.productions.length===0?<Link key={container.id} href={container.url} aria-current={active(container.url)} onClick={()=>{setMenuOpen(false);setExpanded(null);}}>{container.title}</Link>:<button key={container.id} data-container={container.id} type="button" aria-current={active(container.url)} aria-expanded={expanded===container.id} aria-controls={`${prefix}-productions`} onClick={()=>setExpanded(expanded===container.id?null:container.id)}>{container.title}<ToggleMark open={expanded===container.id}/></button>)}
   </nav></div>
   {selected&&<nav id={`${prefix}-productions`} className="watch-production-panel" aria-label={`Produzioni di ${selected.title}`}><Link href={selected.url} aria-current={currentPath===selected.url?'page':undefined} onClick={()=>{setMenuOpen(false);setExpanded(null);}}><CookieLabel>Tutte le produzioni</CookieLabel></Link>{selected.productions.map(production=><Link key={production.id} href={production.url} aria-current={currentPath===production.url?'page':undefined} onClick={()=>{setExpanded(null);setMenuOpen(false);}}><CookieLabel>{production.title}</CookieLabel></Link>)}</nav>}
  </div>
 </div>;
}
