'use client';
import {useEffect,useRef} from 'react';
export type PageCloudSettings={enabled?:boolean;layers?:string[]};
export function PageClouds({settings}:{settings?:PageCloudSettings}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const element=root.current;if(!element||!settings?.enabled)return;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');let frame=0;
  const render=()=>{frame=0;const page=element.parentElement!;const box=page.getBoundingClientRect();const progress=Math.max(0,Math.min(1,-box.top/Math.max(1,page.offsetHeight-innerHeight)));const mobile=innerWidth<=700;Array.from(element.querySelectorAll<HTMLElement>('.page-cloud-layer')).forEach((layer,i)=>{const t=Math.max(0,Math.min(1,(progress-[0,.16,.36][i])/.38));const smooth=t*t*(3-2*t);layer.style.opacity=String(smooth*.9);const strength=reduced.matches?0:mobile?.35:1;layer.style.transform=`translate3d(${Math.sin(progress*Math.PI)*[5,-7,9][i]*strength}px,${progress*[18,35,55][i]*strength}px,0)`;});};
  const schedule=()=>{if(!frame)frame=requestAnimationFrame(render);};render();addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);reduced.addEventListener('change',schedule);const observer=new ResizeObserver(schedule);observer.observe(element.parentElement!);
  return()=>{cancelAnimationFrame(frame);removeEventListener('scroll',schedule);removeEventListener('resize',schedule);reduced.removeEventListener('change',schedule);observer.disconnect();};
 },[settings?.enabled]);
 if(!settings?.enabled)return null;
 return <div ref={root} className="page-clouds" aria-hidden="true"><div className="page-cloud-viewport">{[0,1,2].map(i=><div className="page-cloud-layer" key={i} style={{backgroundImage:`url(${JSON.stringify(settings.layers?.[i]||`/clouds/${i+1}.webp`)})`}}/>)}</div></div>;
}
