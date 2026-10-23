import {hasBlockContent} from '@/lib/block-content-visibility';
import {FloatingHeader} from './floating-header';
import {FooterLinks,FooterNote} from './site-footer-links';
import {WatchNavigation} from './watch-navigation';
import {WatchNavigationMenu} from './watch-navigation-menu';
import {ConsentVideo} from '@/components/cookie-consent';
import {CardVideo} from './card-video';
import {CardAudioPlayer,CardAudioBlockControl} from './card-audio';
import {Gallery} from './gallery';
import {resolveCTAAlignment} from '@/lib/cta-alignment';
import {resolveColor} from '@/lib/background';
import {resolveFooterOverride,type FooterOverride} from '@/lib/footer-override';
import {CardEyebrow} from './card-eyebrow';
import {FooterDecoration,footerDecorationStyle} from './footer-decoration';
import {HomeEntrance} from './home-entrance';
import {FeaturedWide} from './featured-wide';
import {cardSurfaceStyle,cardHoverAttributes} from '@/lib/card-style';
import {CookieLabel} from './cookie-label';
import {blockHeading,blockTextStyle,textColorValue} from '@/lib/text-style';
import Link from 'next/link';
import { HomeReveal } from './home-reveal';
import { UXPreview } from './ux-preview';
import { pageBackgroundStyle } from '@/lib/background';
import { CardCarousel } from './card-carousel';
import {Fragment,type CSSProperties} from 'react';
import { getSiteNavigation } from '@/lib/cms';
import type { WireBlock, WirePage } from '@/lib/wireframe';

export async function WireShell({children,currentPath='/',immersiveHome=false,footerOverride}:{children:React.ReactNode;currentPath?:string;immersiveHome?:boolean;footerOverride?:FooterOverride}){
 const navigation=await getSiteNavigation();
 const footer=resolveFooterOverride(navigation.footerDecoration,footerOverride);
 const decorationStyle=footerDecorationStyle(footer.decoration);
 const active=(href:string)=>href==='/'?currentPath==='/':href==='/studio'?currentPath==='/studio':currentPath===href||currentPath.startsWith(href+'/');
 const links=(items:{label:string;href:string}[],contextual=false)=>items.map((item,index)=>{
  const link=<Link key={`${item.href}-${index}`} href={item.href} aria-current={active(item.href)?'page':undefined}><CookieLabel className="navigation-cookie">{item.label}</CookieLabel></Link>;
  return contextual&&active(item.href)&&['/guarda','/braditriboo'].includes(item.href)?<WatchNavigation key={`${item.href}-${index}`} currentPath={currentPath}>{link}</WatchNavigation>:link;
 });
 const primaryItems=(navigation.items||[]).filter(item=>item.href!=='/shop'&&!item.href.startsWith('/shop/'));
 const shopItems=(navigation.items||[]).filter(item=>item.href==='/shop'||item.href.startsWith('/shop/'));
 const studioLink=navigation.studioHref?<Link className="wf-studio" href={navigation.studioHref} aria-current={currentPath==='/studio'||currentPath.startsWith('/studio/')?'page':undefined}><CookieLabel className="navigation-cookie">{navigation.studioLabel}</CookieLabel></Link>:null;
 const studioMenu=currentPath==='/studio'||currentPath.startsWith('/studio/');
 const studioEntries=(navigation.studioItems||[]).filter(item=>item.href!==navigation.studioHref).map((item,index)=>({id:index,title:item.label,url:item.href,productions:[]}));
 const studioControl=studioMenu&&studioLink&&studioEntries.length?<WatchNavigationMenu currentPath={currentPath} label={navigation.studioNavTitle||'Navigazione Studio'} className="navigation-studio" alwaysOpen containers={studioEntries}>{studioLink}</WatchNavigationMenu>:studioLink;
 return <UXPreview key={currentPath} style={decorationStyle} className={`site-ui${currentPath.startsWith('/legal/')?' legal-ui':''}${currentPath==='/'?' home-ui':''}${immersiveHome?' home-immersive':''}`} enabled={process.env.WIREFRAME_PREVIEW === 'true'}><FloatingHeader immersive={immersiveHome}><div className="wf-header-main"><Link href="/" className="wf-logo">{<img src="/bradiboo-logo.svg" width={173} height={35} alt={navigation.brand||'Bradiboo'}/>}</Link><nav aria-label="Navigazione principale">{links(primaryItems,true)}</nav><div className="wf-header-utilities">{shopItems.map(item=><Link key={item.href} className="wf-studio" href={item.href} aria-current={active(item.href)?'page':undefined}><CookieLabel className="navigation-cookie">{item.label}</CookieLabel></Link>)}{studioControl}</div></div></FloatingHeader>{children}<footer className={`wf-footer${decorationStyle?' wf-footer-decorated':''}`} data-footer-layout={footer.decoration?.layout||'band'} data-footer-decoration={footer.decoration?.position||'inside'} style={{...decorationStyle,...(footer.color?{background:resolveColor(footer.color)}:{})}}><FooterDecoration decoration={footer.decoration}/><strong>{navigation.footerTitle}</strong><FooterLinks/>{navigation.footerNote&&<FooterNote text={navigation.footerNote}/>}</footer></UXPreview>;
}

function Cards({block,home=false}:{block:WireBlock;home?:boolean}) {
 const cards=block.items?.map((item,index)=>{
  const slug=item.href.match(/^\/braditriboo\/(mimi|nancy|petronilla|joe|placido|bradford)$/)?.[1];
  const candidate=item.image || (home&&slug?`/characters/${slug}.svg`:undefined);
  const appearance=item.appearance?.enabled?item.appearance:undefined;
  const image=appearance?.composition==='overlay'&&['color','transparent'].includes(appearance.backgroundMode||'')?undefined:candidate;
  const onlyCTA=appearance?.titleVisibility==='hide'&&appearance?.descriptionVisibility==='hide'&&appearance?.mediaVisibility==='hide';
  const cardStyle=cardSurfaceStyle(appearance);
  const badge=appearance?.badgeMode==='hidden'?undefined:appearance?.badgeText||item.badge;
  const content=<Fragment key="content">{badge&&<CookieLabel className="wf-card-badge" backgroundColor={appearance?.badgeBackgroundColor||item.badgeBackgroundColor||block.badgeBackgroundColor} textColor={appearance?.badgeTextColor||item.badgeTextColor||block.badgeTextColor}>{badge}</CookieLabel>}{image?<picture className={appearance?.composition==='overlay'?'wf-card-picture-overlay':undefined}>{item.mobileImage&&<source media="(max-width: 700px)" srcSet={item.mobileImage}/>}<img src={image} alt={item.alt || ""} loading="lazy" style={{objectPosition:`${item.focalX??50}% ${item.focalY??50}%`}} className="wf-card-image"/></picture>:!item.textOnly&&<span className="wf-placeholder" aria-hidden="true"/>}{appearance?.composition==='overlay'&&<span className="wf-card-media-space" aria-hidden="true"/>}<CardEyebrow item={item} settings={[block.cardAppearance,appearance]}/><strong className="card-title" style={appearance?blockTextStyle(appearance,'title'):undefined}>{item.label}</strong>{item.rating&&<meter min={0} max={item.rating.max} value={item.rating.value} aria-label={`${item.label}: ${item.rating.value} su ${item.rating.max}`}/>}{item.description&&<p className="card-description" style={appearance?blockTextStyle(appearance,'note'):undefined}>{item.description}</p>}{item.cardFunction==='video'&&<CardVideo item={item}/>}
{item.cardAudio&&item.cardAudio.ctaMode!=='link'&&<CardAudioPlayer audio={item.cardAudio} title={item.label}/>}
{(item.ctaLabel||onlyCTA)&&item.href&&item.cardAudio?.ctaMode!=='audio'&&item.cardFunction!=='video'&&<span className="card-cta" data-cta-align={resolveCTAAlignment(block.ctaAlign,appearance?.ctaAlign)}>{item.ctaLabel||'Scopri di più'} →</span>}</Fragment>;
  if(item.cardAudio||item.cardFunction==='video')return <article {...cardHoverAttributes(appearance)} style={cardStyle} key={index}>{item.href&&item.cardFunction!=='video'&&item.cardAudio?.ctaMode!=='audio'&&<Link key="destination" className="wf-card-audio-link" href={item.href} aria-label={item.label}/>}{item.cardAudio?.ctaMode==='link'&&<CardAudioPlayer key="audio" audio={item.cardAudio} title={item.label}/>}{content}</article>;
  return item.href?<Link {...cardHoverAttributes(appearance)} style={cardStyle} href={item.href} key={`${item.href}-${index}`}>{content}</Link>:<article {...cardHoverAttributes(appearance)} style={cardStyle} key={index}>{content}</article>;
 });
 return <>{block.showAudioControl&&block.items?.some(i=>i.cardAudio)&&<CardAudioBlockControl/>}{block.cardLayout!=='compact'&&(block.carousel||block.type==='rail')?<CardCarousel variant={block.carousel?'carousel':'rail'} label={block.title||block.label}>{cards}</CardCarousel>:<div className="wf-items">{cards}</div>}</>;
}
function BackgroundPicture({block}:{block:WireBlock}) {
 return block.backgroundImage?<picture className="wf-background-picture">{block.mobileImage&&<source media="(max-width: 700px)" srcSet={block.mobileImage}/>}<img src={block.backgroundImage} alt="" loading="lazy" style={{objectPosition:`${block.focalX??50}% ${block.focalY??50}%`}}/></picture>:null;
}
function Block({block,index,home=false}:{block:WireBlock;index:number;home?:boolean}) {
 if(!hasBlockContent(block))return null;
 const Heading=blockHeading(block.headingLevel,home&&block.type==='hero');
 if(block.presentation==='wide')return <section data-block-type={block.type} data-reveal={block.skipReveal?'off':undefined} className="wf-block wf-featured-wide"><div className="wf-block-label">BLOCK {String(index+1).padStart(2,'0')} · {block.label} · WIDE</div><FeaturedWide block={block}/></section>;
 const own=block.type==='hero'&&block.ownBackground;
 const imageHero=block.type==='hero'&&block.heroImageMode;
 const style={'--block-veil':(block.wideOverlayOpacity??55)/100,position:'relative',isolation:'isolate',color:textColorValue(block.textColor)||(imageHero?'#ffffff':undefined),...(block.type==='hero'?{}:{backgroundColor:block.backgroundColor?`color-mix(in srgb, ${block.backgroundColor} ${(block.opacity??1)*100}%, transparent)`:undefined,backdropFilter:block.blur?`blur(${block.blur}px)`:undefined})} as CSSProperties;
 return <section data-product-section={block.productSection} data-block-type={block.type} data-card-layout={block.cardLayout} data-content-layout={block.contentLayout} data-show-text={block.showText===false||!block.title?.trim()&&!block.note?.trim()&&block.eyebrowMode!=='custom'?'false':undefined} data-reveal={block.skipReveal?'off':undefined} style={style} className={`wf-block wf-${block.type}${block.items?.every(item=>item.href.startsWith('/braditriboo/'))&&block.items.length?' wf-character-grid':''}${block.status==='draft'?' wf-draft':''}${block.type==='hero'?' wf-hero-layered':''}${imageHero?' wf-hero-image':''}`}>
  {block.type!=='hero'&&block.backgroundMode==='image'&&block.backgroundImage&&<div className="wf-block-background-image" aria-hidden="true" style={{opacity:block.opacity??1,filter:block.blur?`blur(${block.blur}px)`:undefined}}><BackgroundPicture block={block}/></div>}
  {block.type==='hero'&&<div aria-hidden="true" className="wf-hero-background" style={{backgroundColor:own?block.backgroundColor:'transparent',opacity:own?block.opacity:1,filter:own&&block.blur?`blur(${block.blur}px)`:undefined,backdropFilter:!own&&block.blur?`blur(${block.blur}px)`:undefined}}>{own&&block.backgroundMode==='image'&&<BackgroundPicture block={block}/>}</div>}
  <div className="wf-block-label">BLOCK {String(index+1).padStart(2,'0')} · {block.label} · TYPE: {block.type}{block.status==='draft'?' · DRAFT / NON PUBBLICATO':''}</div>
  {block.badge&&<CookieLabel className="wf-block-badge" backgroundColor={block.badgeBackgroundColor} textColor={block.badgeTextColor}>{block.badge}</CookieLabel>}
  <div className="wf-block-content"><div><CardEyebrow item={{}} settings={[block]}/>{block.title?.trim()&&<Heading className="wf-block-title" style={blockTextStyle(block,'title')}>{block.title}</Heading>}{block.note&&<p className="wf-description" style={blockTextStyle(block,'note')}>{block.note}</p>}{block.icons?.length&&<ul className="product-icons" aria-label="Caratteristiche del prodotto">{block.icons.map((icon,index)=><li key={`${icon.url}-${index}`}><img src={icon.url} alt={icon.alt||''} loading="lazy"/></li>)}</ul>}{block.facts&&<dl className="wf-facts">{block.facts.map(f=><div key={f.label}><dt>{f.label}</dt><dd>{f.value}</dd></div>)}</dl>}{block.audio&&<div><audio controls src={block.audio} preload="none"/>{block.audioCaption&&<p>{block.audioCaption}</p>}</div>}{block.emptyMessage&&<p>{block.emptyMessage}</p>}</div>
  {block.media&&<div className="wf-module-media">{block.media.kind==='youtube'?<ConsentVideo src={block.media.url} title={block.title+' — video YouTube'} loading="lazy" allow="encrypted-media; picture-in-picture" allowFullScreen/>:block.media.kind==='video'?<video controls playsInline preload="metadata">{block.media.mobileVideo&&<source media="(max-width:700px)" src={block.media.mobileVideo}/>}<source src={block.media.url}/></video>:<picture>{block.media.mobileImage&&<source media="(max-width:700px)" srcSet={block.media.mobileImage}/>}<img src={block.media.url} alt={block.title} loading="lazy"/></picture>}</div>}
  {!!block.items?.length&&(block.gallerySettings?<Gallery block={block}/>:<Cards block={block} home={home}/>)}{block.cta&&<div className="wf-cta-row" data-cta-align={resolveCTAAlignment(block.ctaAlign)}><Link className="wf-action" href={block.cta.href}>{block.cta.label} →</Link></div>}</div>
 </section>;
}
export function WirePageView({page}:{page:WirePage}){
 const home=page.path==='/';
 const visibleBlocks=page.blocks.filter(hasBlockContent);
 const hero=home&&visibleBlocks[0]?.type==='hero'?visibleBlocks[0]:undefined;
 const blocks=hero?visibleBlocks.slice(1):visibleBlocks;
 const content=<>{hero&&<HomeEntrance><Block block={{...hero,skipReveal:true}} index={0} home/></HomeEntrance>}<div className="wf-page-background" data-hero-background={page.backgroundMobileColor?'true':undefined} style={pageBackgroundStyle(page)}><main className="wf-main"><div className={`wf-page-meta${page.status==='draft'?' wf-page-draft':''}`}><div><span>PAGE TEMPLATE</span><h1>{page.title}</h1>{page.status==='draft'&&<b>DRAFT / NON PUBBLICATA</b>}</div><div><span>ROUTE</span><code>{page.path}</code><p>{page.purpose}</p></div></div><BlockSequence blocks={blocks} home={home} offset={hero?1:0}/></main></div></>;
 return <WireShell footerOverride={page.footerOverride} currentPath={page.path} immersiveHome={Boolean(hero)}>{home?<HomeReveal>{content}</HomeReveal>:content}</WireShell>;
}

function BlockSequence({blocks,home=false,offset=0}:{blocks:WireBlock[];home?:boolean;offset?:number}) {
 const nodes:React.ReactNode[]=[];
 const render=(block:WireBlock,index:number)=><Block key={`${block.label}-${index}`} block={block} index={index+offset} home={home}/>;
 for(let i=0;i<blocks.length;i++) {
  if(blocks[i].productSection==='overview'&&blocks[i+1]?.productSection==='highlights') {
   nodes.push(<div className="product-summary" key={`summary-${i}`}>{render(blocks[i],i)}{render(blocks[i+1],i+1)}</div>);i++;
  } else if(blocks[i].productSection==='book'&&blocks[i+1]?.productSection==='bookGallery'&&blocks[i+2]?.productSection==='game'&&blocks[i+3]?.productSection==='gameGallery') {
   nodes.push(<div className="product-book-game" key={`book-game-${i}`}><div>{render(blocks[i],i)}{render(blocks[i+1],i+1)}</div><div>{render(blocks[i+2],i+2)}{render(blocks[i+3],i+3)}</div></div>);i+=3;
  } else if(blocks[i].productSection==='psico'&&blocks[i+1]?.productSection==='skills') {
   nodes.push(<div className="product-psychology" key={`psychology-${i}`}>{render(blocks[i],i)}{render(blocks[i+1],i+1)}</div>);i++;
  } else nodes.push(render(blocks[i],i));
 }
 return <>{nodes}</>;
}
export function WireBlocks({blocks}:{blocks:WireBlock[]}) { return <BlockSequence blocks={blocks}/>; }
