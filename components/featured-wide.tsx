'use client';
import {VisualMedia} from './visual-media';
import {ConsentVideo} from '@/components/cookie-consent';

import {CardVideo} from './card-video';
import {CardAudioPlayer,CardAudioBlockControl} from './card-audio';
import {visibilityAttributes,ctaVariables} from '@/lib/card-controls';
import {resolveCTAAlignment} from '@/lib/cta-alignment';
import {CardEyebrow} from './card-eyebrow';
import {useRef,useState,type CSSProperties} from 'react';
import Link from '@/components/site-link';
import {ChevronLeft,ChevronRight} from 'lucide-react';
import type {WireBlock} from '@/lib/wireframe';
import {resolveColor} from '@/lib/background';
import {blockHeading,blockTextStyle,textColorValue} from '@/lib/text-style';
import {CookieLabel} from './cookie-label';

export function FeaturedWide({block}:{block:WireBlock}) {
 const isSingleBlock=!block.items?.length;
 const items:NonNullable<WireBlock['items']>=block.items?.length?block.items:[{label:block.title,description:block.note,href:block.cta?.href||'',ctaLabel:block.cta?.label,image:block.backgroundImage,mobileImage:block.mobileImage,focalX:block.focalX,focalY:block.focalY,badge:block.badge,hideBadge:!block.badge}];
 const [current,setCurrent]=useState(0);
 const start=useRef<number|null>(null);
 const [labelTransition,setLabelTransition]=useState<{previous?:string;direction:number;id:number}>({direction:1,id:0});
 if(!items.length)return null;
 const active=Math.min(current,items.length-1);
 const item=items[active];
 const labelFor=(index:number)=>items[index].hideBadge?undefined:items[index].wideBadge?.trim()||items[index].badge?.trim()||'Highlights';
 const select=(next:number,direction:number)=>{
  if(next===active)return;
  setLabelTransition(t=>({previous:labelFor(active),direction,id:t.id+1}));
  setCurrent(next);
 };
 const move=(offset:number)=>select((active+offset+items.length)%items.length,Math.sign(offset));
 const appearance=item.wideAppearance;
 const typography={...block,...appearance};
 const Heading=blockHeading(block.headingLevel,block.type==='hero');
 const backgroundMode=appearance?.backgroundMode||(block.backgroundMode==='page'?'transparent':block.backgroundMode==='own'?'color':block.backgroundMode==='image'?'image':isSingleBlock?(block.backgroundImage?'image':'transparent'):'image');
 const image=appearance?.mediaVisibility==='hide'?undefined:appearance?.backgroundImage||item.image||block.backgroundImage;
 const badge=labelFor(active);
 return <div className="featured-wide" role="region" aria-roledescription="carosello" aria-label={block.title}
  onTouchStart={e=>{start.current=e.touches[0].clientX;}}
  onTouchEnd={e=>{if(start.current!==null){const delta=e.changedTouches[0].clientX-start.current;if(Math.abs(delta)>50&&items.length>1)move(delta<0?1:-1);}start.current=null;}}
  onTouchCancel={()=>{start.current=null;}}
  onKeyDown={e=>{if(e.key==='ArrowRight'){e.preventDefault();move(1);}if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}}}>
  {badge&&<CookieLabel className="featured-wide-badge" backgroundColor={item.wideAppearance?.badgeBackgroundColor||item.badgeBackgroundColor||(isSingleBlock?block.badgeBackgroundColor:undefined)} textColor={item.wideAppearance?.badgeTextColor||item.badgeTextColor||(isSingleBlock?block.badgeTextColor:undefined)}>
   <span className="featured-wide-label-window" aria-live="polite" aria-atomic="true" style={{'--label-direction':labelTransition.direction} as CSSProperties}>
    {labelTransition.previous&&labelTransition.previous!==badge&&<span key={`out-${labelTransition.id}`} className="featured-wide-label-out" aria-hidden="true">{labelTransition.previous}</span>}
    <span key={`in-${labelTransition.id}`} className={labelTransition.previous&&labelTransition.previous!==badge?'featured-wide-label-in':undefined}>{badge}</span>
   </span>
  </CookieLabel>}
  <div className="featured-wide-viewport" style={{borderRadius:appearance?.borderRadius??undefined,border:appearance?.borderColor?`1px solid ${textColorValue(appearance.borderColor)||'transparent'}`:undefined}}>
  <div className="featured-wide-slide" role="group" aria-roledescription="slide" aria-label={`${active+1} di ${items.length}`}>
   <div className="featured-wide-background" aria-hidden="true" style={{backdropFilter:(appearance?.backgroundBlur??block.blur)?`blur(${appearance?.backgroundBlur??block.blur}px)`:undefined,WebkitBackdropFilter:(appearance?.backgroundBlur??block.blur)?`blur(${appearance?.backgroundBlur??block.blur}px)`:undefined}}>
    <div style={{position:'absolute',inset:0,backgroundColor:backgroundMode==='transparent'||backgroundMode==='image'&&image?'transparent':appearance?.backgroundColor?resolveColor(appearance.backgroundColor):block.backgroundColor||'#223668',opacity:(appearance?.backgroundOpacity??((block.opacity??1)*100))/100}}/>
   {backgroundMode==='image'&&image&&<div key={image+active} className="featured-wide-picture" style={{opacity:block.compactMobileHero?1:(appearance?.backgroundOpacity??((block.opacity??1)*100))/100,filter:(appearance?.backgroundBlur??block.blur)?`blur(${appearance?.backgroundBlur??block.blur}px)`:undefined}}><VisualMedia src={image} mobileImage={item.mobileImage} alt="" loading={block.type==='hero'?'eager':'lazy'} fetchPriority={block.type==='hero'?'high':undefined} style={{objectPosition:`${item.focalX??50}% ${item.focalY??50}%`}}/></div>}
   </div>
   <div className="featured-wide-scrim" aria-hidden="true" style={{'--wide-shade':(appearance?.overlayOpacity??(backgroundMode==='image'?(block.wideOverlayOpacity??55):0))/100*(backgroundMode==='image'?(appearance?.backgroundOpacity??((block.opacity??1)*100))/100:1)} as CSSProperties}/>
   <div {...visibilityAttributes(appearance)} style={ctaVariables(appearance) as CSSProperties} className="featured-wide-content" aria-live="polite" aria-atomic="true">
    {block.showText!==false&&<><CardEyebrow item={item} settings={[block,block.cardAppearance,item.wideAppearance]}/>{block.gallerySettings?.showTitle!==false&&item.label?.trim()&&<Heading className="featured-wide-title" style={{...blockTextStyle(typography,'title'),...(block.characterHero?{'--character-title-base':blockTextStyle(typography,'title')?.fontSize,'--character-title-fit':'13.7vw'}: {})} as CSSProperties}>{item.label}</Heading>}
    {block.gallerySettings?.showCaption!==false&&item.description&&<p className="featured-wide-note" style={blockTextStyle(typography,'note')}>{item.description}</p>}
    </>}{isSingleBlock&&block.facts&&<dl className="wf-facts">{block.facts.map(f=><div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl>}
    {isSingleBlock&&block.audio&&<div><audio controls src={block.audio} preload="none"/>{block.audioCaption&&<p>{block.audioCaption}</p>}</div>}
    {isSingleBlock&&block.media&&<div className="wf-module-media">{block.media.kind==='youtube'?<ConsentVideo src={block.media.url} title={block.title+' — video'} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen/>:block.media.kind==='video'?<video src={block.media.url} controls playsInline preload="metadata"/>:<VisualMedia src={block.media.url} mobileImage={block.media.mobileImage} alt={block.title} loading="lazy"/>}</div>}
    {item.cardFunction==='video'&&<CardVideo item={item}/>}
    {item.cardAudio&&<><CardAudioPlayer key={active+item.cardAudio.url} audio={item.cardAudio} title={item.label}/>{block.showAudioControl&&<CardAudioBlockControl/>}</>}
    {item.href&&item.cardFunction!=='video'&&item.cardAudio?.ctaMode!=='audio'&&<div className="wf-cta-row" data-cta-align={resolveCTAAlignment(block.ctaAlign,block.cardAppearance?.ctaAlign,item.wideAppearance?.ctaAlign)}><Link className="featured-wide-cta" href={item.href}>{item.ctaLabel||'Scopri di più'} <span aria-hidden="true">→</span></Link></div>}
   </div>
  </div>
  </div>
  {items.length>1&&<>
   <button type="button" className="featured-wide-arrow featured-wide-prev" aria-label="Contenuto precedente" onClick={()=>move(-1)}><span aria-hidden="true">→</span></button>
   <button type="button" className="featured-wide-arrow featured-wide-next" aria-label="Contenuto successivo" onClick={()=>move(1)}><span aria-hidden="true">→</span></button>
   <div className="featured-wide-dots" aria-label="Scegli contenuto">{items.map((slide,index)=><button type="button" key={index} aria-label={`Mostra ${index+1}: ${slide.label}`} aria-current={active===index?'true':undefined} onClick={()=>select(index,index>active?1:-1)}><span/></button>)}</div>
  </>}
 </div>;
}
