import {VisualMedia} from '../visual-media';
import {ConsentVideo} from '@/components/cookie-consent';
import type {CSSProperties,ReactNode} from 'react';
import type {WireBlock} from '@/lib/wireframe';
import {textColorValue} from '@/lib/text-style';
import {CookieLabel} from '../cookie-label';
import Link from '@/components/site-link';
export function WatchModuleFrame({block,children}:{block:WireBlock;children:ReactNode}){
 const image=block.backgroundMode==='image'?block.backgroundImage:undefined;
 return <section data-content-layout={block.contentLayout} className={`wf-watch-module wf-block wf-interactive-module${block.presentation==='wide'?' wf-interactive-wide':''}`} style={{color:textColorValue(block.textColor),backdropFilter:block.blur?`blur(${block.blur}px)`:undefined,'--block-veil':(block.wideOverlayOpacity??55)/100} as CSSProperties}>
  <div className="wf-interactive-background" aria-hidden="true" style={{backgroundColor:!image?block.backgroundColor:undefined,opacity:block.opacity??1,filter:block.blur?`blur(${block.blur}px)`:undefined}}>{image&&<picture>{block.mobileImage&&<source media="(max-width:700px)" srcSet={block.mobileImage}/>}<img src={image} alt="" style={{objectPosition:`${block.focalX??50}% ${block.focalY??50}%`}}/>{block.presentation==='wide'&&<span className="wf-interactive-veil"/>}</picture>}</div>
  {block.badge&&<CookieLabel className="wf-block-badge" backgroundColor={block.badgeBackgroundColor} textColor={block.badgeTextColor}>{block.badge}</CookieLabel>}
  <div className="wf-block-content wf-interactive-content"><div>{children}</div>
  {block.media&&<div className="wf-module-media">{block.media.kind==='youtube'?<ConsentVideo title={block.title} src={block.media.url} loading="lazy" allowFullScreen/>:block.media.kind==='video'?<video src={block.media.url} controls playsInline preload="metadata"/>:<VisualMedia src={block.media.url} mobileImage={block.media.mobileImage} alt={block.title} loading="lazy"/>}</div>}
  {block.cta&&<Link className="wf-action" href={block.cta.href}>{block.cta.label} →</Link>}</div>
 </section>;
}
