'use client';
import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {visualMediaKind} from '@/lib/visual-media';
type Props={src:string;mobileImage?:string;alt?:string;className?:string;style?:CSSProperties;loading?:'lazy'|'eager';fetchPriority?:'high'|'low'|'auto';};
function Animation({src,alt='',className,style}:Props){
 const canvas=useRef<HTMLCanvasElement>(null);const video=useRef<HTMLVideoElement>(null);const [failed,setFailed]=useState(false);
 const kind=visualMediaKind(src);
 useEffect(()=>{
  let disposed=false;let instance:import('@lottiefiles/dotlottie-web').DotLottie|undefined;const reduced=matchMedia('(prefers-reduced-motion:reduce)');const target=canvas.current||video.current;if(!target)return;
  const update=()=>{if(reduced.matches){instance?.pause();instance?.setFrame(0);video.current?.pause();}else{instance?.play();void video.current?.play().catch(()=>{});}};
  const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)return;observer.disconnect();if(kind==='lottie')void import('@lottiefiles/dotlottie-web').then(({DotLottie})=>{if(disposed||!canvas.current)return;DotLottie.setWasmUrl('/animation-runtime/dotlottie-player.wasm');instance=new DotLottie({canvas:canvas.current,src,autoplay:!reduced.matches,loop:true,assetResolver:()=>null,layout:{fit:'contain',align:[.5,.5]},renderConfig:{autoResize:true,freezeOnOffscreen:true,devicePixelRatio:Math.min(devicePixelRatio,2)},stateMachineConfig:{openUrlPolicy:{requireUserInteraction:true,whitelist:[]}}});instance.addEventListener('loadError',()=>{if(!disposed)setFailed(true);});}).catch(()=>{if(!disposed)setFailed(true);});else update();},{rootMargin:'150px'});observer.observe(target);reduced.addEventListener('change',update);
  return()=>{disposed=true;observer.disconnect();reduced.removeEventListener('change',update);instance?.destroy();};
 },[src,kind]);
 if(failed)return <span className={className} style={style} role="img" aria-label={alt||'Animazione non disponibile'}/>;
 return kind==='video'?<video ref={video} className={className} style={style} src={src} muted loop playsInline preload="metadata" aria-label={alt||undefined}/>:<canvas ref={canvas} className={className} style={style} role={alt?'img':undefined} aria-label={alt||undefined} aria-hidden={!alt||undefined}/>;
}
function GifImage({src,alt='',className,style,loading}:Props){
 const image=useRef<HTMLImageElement>(null);const canvas=useRef<HTMLCanvasElement>(null);const [reduced,setReduced]=useState(false);
 const draw=()=>{const img=image.current,frame=canvas.current;if(!img?.complete||!img.naturalWidth||!frame)return;frame.width=img.naturalWidth;frame.height=img.naturalHeight;frame.getContext('2d')?.drawImage(img,0,0);};
 useEffect(()=>{const query=matchMedia('(prefers-reduced-motion:reduce)');const update=()=>{setReduced(query.matches);if(query.matches)draw();};update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[src]);
 return <><img ref={image} src={src} alt={alt} loading={loading} className={className} style={{...style,display:reduced?'none':style?.display}} onLoad={draw}/><canvas ref={canvas} className={className} style={{...style,display:reduced?style?.display:'none'}} role="img" aria-label={alt||undefined} aria-hidden={!reduced||undefined}/></>;
}
function ResponsiveAnimation(props:Props){const [mobile,setMobile]=useState(false);useEffect(()=>{const query=matchMedia('(max-width:700px)');const update=()=>setMobile(query.matches);update();query.addEventListener('change',update);return()=>query.removeEventListener('change',update);},[]);const src=mobile&&props.mobileImage?props.mobileImage:props.src;const {mobileImage,...rest}=props;return visualMediaKind(src)==='image'?(/\.gif(?:[?#]|$)/i.test(src)?<GifImage {...rest} src={src}/>:<img {...rest} src={src}/>):<Animation {...props} src={src}/>;}
export function VisualMedia(props:Props){
 if(/\.gif(?:[?#]|$)/i.test(props.src)||props.mobileImage&&/\.gif(?:[?#]|$)/i.test(props.mobileImage)||visualMediaKind(props.src)!=='image'||props.mobileImage&&visualMediaKind(props.mobileImage)!=='image')return <ResponsiveAnimation {...props}/>;
 const {mobileImage,src,...rest}=props;
 return <picture>{mobileImage&&<source media="(max-width:700px)" srcSet={mobileImage}/>}<img src={src} {...rest}/></picture>;
}
