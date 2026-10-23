'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {useEffect,useRef,useState,useId,type CSSProperties} from 'react';
import {CookieLabel} from './cookie-label';
export type MobileMenuEntry={id:number;title:string;url:string;productions:{id:number;title:string;url:string}[]};
type Section={label:string;href:string;entries:MobileMenuEntry[]};
export function MobileNavigation({currentPath,sections,utilities,brand='Bradiboo'}:{currentPath:string;sections:Section[];utilities:{label:string;href:string}[];brand?:string}){
 const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|undefined>(undefined);
 const [section,setSection]=useState<Section>();
 const [production,setProduction]=useState<MobileMenuEntry>();
 const [open,setOpen]=useState(false),[closing,setClosing]=useState(false);
 const [phase,setPhase]=useState<'idle'|'out'|'in'>('idle');
 const [backward,setBackward]=useState(false);
 const [selectedAngle,setSelectedAngle]=useState(1);
 const [geometry,setGeometry]=useState<CSSProperties>({});
 const id=useId(),router=useRouter();
 const pendingHref=useRef<string|null>(null);
 const active=(href:string)=>currentPath===href||currentPath.startsWith(href+'/');
 const close=()=>{if(dialog.current?.open&&!closing){clearTimeout(timer.current);dialog.current.style.setProperty('--mobile-current-height',`${dialog.current.getBoundingClientRect().height}px`);setClosing(true);}};
 const go=(event:{preventDefault:()=>void},href:string)=>{event.preventDefault();pendingHref.current=href;close();};
 const launch=()=>{
  setSelectedAngle([-2,-1,1,2][Math.floor(Math.random()*4)]);
  const bar=trigger.current?.closest('.wf-header-main')?.getBoundingClientRect();
  if(bar)setGeometry({'--mobile-left':`${bar.left}px`,'--mobile-top':`${bar.top}px`,'--mobile-width':`${bar.width}px`,'--mobile-bar-height':`${bar.height}px`} as CSSProperties);
  const current=sections.find(s=>active(s.href));
  setSection(current);setProduction(current?.entries.find(entry=>entry.productions.some(item=>active(item.url))));
  pendingHref.current=null;setPhase('idle');setClosing(false);dialog.current?.showModal();dialog.current?.querySelector<HTMLButtonElement>('.mobile-menu-close')?.focus({preventScroll:true});setOpen(true);
 };
 const level=(next?:Section,child?:MobileMenuEntry,back=false)=>{
  if(phase==='out')return;
  setBackward(back);setPhase('out');clearTimeout(timer.current);
  timer.current=setTimeout(()=>{setSection(next);setProduction(child);setPhase('in');},window.matchMedia('(prefers-reduced-motion:reduce)').matches?0:160);
 };
 useEffect(()=>{const media=window.matchMedia('(min-width:801px)');const resize=()=>{if(media.matches)dialog.current?.close();else if(dialog.current?.open){const bar=trigger.current?.closest('.wf-header-main')?.getBoundingClientRect();if(bar)setGeometry({'--mobile-left':`${bar.left}px`,'--mobile-top':`${bar.top}px`,'--mobile-width':`${bar.width}px`,'--mobile-bar-height':`${bar.height}px`} as CSSProperties);}};media.addEventListener('change',resize);window.addEventListener('resize',resize);return ()=>{media.removeEventListener('change',resize);window.removeEventListener('resize',resize);clearTimeout(timer.current);};},[]);
 const rows:MobileMenuEntry[]=production?production.productions.map(row=>({...row,productions:[]})):section?.entries||[];
 const destination=production?{href:production.url,label:production.title}:section;
 const label=(text:string,selected:boolean)=>selected?<CookieLabel backgroundColor="#7135ed" textColor="#fff">{text}</CookieLabel>:<span className="mobile-menu-text">{text}</span>;
 const arrow=<span className="mobile-menu-arrow" aria-hidden="true">→</span>;
 return <>
  <button ref={trigger} type="button" className="mobile-menu-trigger" aria-label="Apri menu" aria-haspopup="dialog" aria-expanded={open} aria-controls={id} onClick={launch}><svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26"><path d="M4 6h16M4 12h16M4 18h16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button>
  <dialog ref={dialog} id={id} className="mobile-menu-dialog" aria-label="Menu principale" style={{...geometry,'--menu-selected-angle':`${selectedAngle}deg`} as CSSProperties} data-closing={closing} onCancel={e=>{e.preventDefault();close();}} onClose={()=>{setOpen(false);setClosing(false);const href=pendingHref.current;pendingHref.current=null;if(href)router.push(href);else trigger.current?.focus();}} onAnimationEnd={e=>{if(e.target===e.currentTarget&&closing)dialog.current?.close();}} onClick={e=>{if(e.target!==e.currentTarget)return;const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}}>
   <div className="wf-header-main mobile-menu-bar"><Link href="/" className="wf-logo" onNavigate={e=>go(e,'/')}><img src="/bradiboo-logo.svg" width={173} height={35} alt={brand}/></Link><button type="button" className="mobile-menu-trigger mobile-menu-close" aria-label="Chiudi menu" onClick={close} autoFocus><svg aria-hidden="true" viewBox="0 0 24 24" width="26" height="26"><path d="m6 6 12 12M18 6 6 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg></button></div>
   <div className="mobile-menu-scroll"><nav className="mobile-menu-level" aria-label="Navigazione mobile" data-phase={phase} data-backward={backward} inert={phase==='out'||closing} onAnimationEnd={e=>{if(e.target===e.currentTarget&&phase==='in'){setPhase('idle');if(!e.currentTarget.contains(document.activeElement))e.currentTarget.querySelector<HTMLElement>('button,a')?.focus({preventScroll:true});}}}>
    {section?<>
     <button type="button" className="mobile-menu-back" onClick={()=>level(production?section:undefined,undefined,true)}>← {production?section.label:'Menu'}</button>
     <div className="mobile-menu-options">
      {destination&&<Link href={destination.href} aria-current={currentPath===destination.href?'page':undefined} onNavigate={e=>go(e,destination.href)}>{label(`Vai a ${destination.label}`,currentPath===destination.href)}</Link>}
      {rows.map(row=>row.productions.length>0?<button type="button" key={row.id} aria-current={active(row.url)?'location':undefined} onClick={()=>level(section,row)}>{label(row.title,active(row.url))}{arrow}</button>:<Link key={row.id} href={row.url} aria-current={active(row.url)?'page':undefined} onNavigate={e=>go(e,row.url)}>{label(row.title,active(row.url))}</Link>)}
     </div>
    </>:<>
     <div className="mobile-menu-options mobile-menu-primary">{sections.filter(s=>s.href!=='/studio').map(s=><button type="button" key={s.href} aria-current={active(s.href)?'location':undefined} onClick={()=>level(s)}>{label(s.label,active(s.href))}{arrow}</button>)}</div>
     <div className="mobile-menu-options mobile-menu-secondary">{utilities.map(item=><Link key={item.href} href={item.href} aria-current={active(item.href)?'page':undefined} onNavigate={e=>go(e,item.href)}>{label(item.label,active(item.href))}</Link>)}{sections.filter(s=>s.href==='/studio').map(s=><button type="button" key={s.href} aria-current={active(s.href)?'location':undefined} onClick={()=>level(s)}>{label(s.label,active(s.href))}{arrow}</button>)}</div>
    </>}
   </nav></div>
  </dialog>
 </>;
}
