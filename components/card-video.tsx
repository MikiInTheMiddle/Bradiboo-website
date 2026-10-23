'use client';
import {ConsentVideo} from '@/components/cookie-consent';

import {useEffect,useRef,useState} from 'react';
import type {WireLink} from '@/lib/wireframe';
export function CardVideo({item}:{item:WireLink}){const dialog=useRef<HTMLDialogElement>(null);const [open,setOpen]=useState(false);const root=useRef<HTMLSpanElement>(null);
 const launch=()=>{document.querySelectorAll('audio').forEach(a=>a.pause());setOpen(true);dialog.current?.showModal();};
 useEffect(()=>{const card=root.current?.closest<HTMLElement>('.wf-items > article,.gallery-card,.featured-wide-slide');if(!card)return;const click=(event:MouseEvent)=>{if((event.target as Element).closest('a,button,input,select,textarea,audio,video,iframe,dialog'))return;launch();};card.addEventListener('click',click);card.classList.add('card-video-clickable');return()=>{card.removeEventListener('click',click);card.classList.remove('card-video-clickable');};},[item.video,item.youtube]);
 return <span ref={root} className="card-audio-control"><button type="button" onClick={e=>{e.stopPropagation();launch();}}>▶ {item.ctaLabel||'Guarda ora'}</button><dialog ref={dialog} className="card-video-dialog" aria-label={item.label} onClose={()=>setOpen(false)}><button type="button" onClick={()=>dialog.current?.close()}>Chiudi video</button>{open&&(item.video?<video src={item.video} controls playsInline preload="none"/>:item.youtube?<ConsentVideo src={item.youtube} title={item.label} allow="encrypted-media; picture-in-picture" allowFullScreen/>:<p>Video non disponibile.</p>)}</dialog></span>;
}
