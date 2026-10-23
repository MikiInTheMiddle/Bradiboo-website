'use client';
import {useEffect,useRef,useState} from 'react';
import type {CardAudio} from '@/lib/card-audio';
export function CardAudioPlayer({audio,title}:{audio:CardAudio;title:string}){
 const ref=useRef<HTMLAudioElement>(null);const [playing,setPlaying]=useState(false);const [failed,setFailed]=useState(false);const [blocked,setBlocked]=useState(false);
 useEffect(()=>{const el=ref.current;if(!el)return;let attempted=false;
 const play=()=>{if(el.closest('[data-audio-disabled="true"]'))return;setFailed(false);void el.play().catch(()=>{setPlaying(false);setBlocked(true);});};
 const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting&&audio.autoplay&&!attempted){attempted=true;play();}},{threshold:0.15});observer.observe(el.closest('.wf-items > article,.watch-card,.gallery-card,.featured-wide-content')||el.parentElement!);
 const otherPlay=(event:Event)=>{if(event.target instanceof HTMLMediaElement&&event.target!==el)el.pause();};document.addEventListener('play',otherPlay,true);
 const visibility=()=>{if(document.hidden)el.pause();};document.addEventListener('visibilitychange',visibility);
 return()=>{el.pause();observer.disconnect();document.removeEventListener('visibilitychange',visibility);document.removeEventListener('play',otherPlay,true);};
 },[audio.url,audio.autoplay]);
 return <span className="card-audio-control"><audio ref={ref} src={audio.url} loop={audio.loop} preload="none" onPlay={()=>{for(const p of document.querySelectorAll('audio'))if(p!==ref.current)p.pause();setPlaying(true);}} onPause={()=>setPlaying(false)} onEnded={()=>setPlaying(false)} onError={()=>{setFailed(true);setPlaying(false);}}/>{(audio.ctaMode!=='link'||blocked)&&<button type="button" aria-label={`${playing?'Pausa':audio.label||'Ascolta'}: ${title}`} aria-pressed={playing} onClick={e=>{e.stopPropagation();const el=ref.current;if(!el)return;for(let root=el.closest('[data-audio-disabled="true"]');root;root=el.closest('[data-audio-disabled="true"]')){root.removeAttribute('data-audio-disabled');root.dispatchEvent(new Event('audio-enabled'));}setFailed(false);if(el.paused)void el.play().catch(()=>setFailed(true));else el.pause();}}>{playing?'❚❚ Pausa':`▶ ${audio.label||'Ascolta'}`}</button>}{failed&&<small role="status">Audio non disponibile. Riprova.</small>}</span>;
}
export function CardAudioBlockControl(){const ref=useRef<HTMLButtonElement>(null);const [disabled,setDisabled]=useState(false);
 useEffect(()=>{const root=ref.current?.closest('.wf-block,.featured-wide,.watch-rail,.watch-experience,section');const enabled=()=>setDisabled(false);root?.addEventListener('audio-enabled',enabled);return()=>root?.removeEventListener('audio-enabled',enabled);},[]);
 return <button ref={ref} className="card-audio-block" type="button" aria-pressed={disabled} onClick={()=>{const root=ref.current?.closest('.wf-block,.featured-wide,.watch-rail,.watch-experience,section');if(!root)return;root.setAttribute('data-audio-disabled',String(!disabled));if(!disabled)root.querySelectorAll('audio').forEach(p=>p.pause());setDisabled(!disabled);}}>{disabled?'Abilita audio del blocco':'Disattiva audio del blocco'}</button>;
}
