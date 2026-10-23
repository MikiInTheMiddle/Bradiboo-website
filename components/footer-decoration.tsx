import type {CSSProperties} from 'react';
type Image=number|{url?:string|null;width?:number|null;height?:number|null}|null;
export type FooterDecorationSettings={enabled?:boolean|null;image?:Image;mobileImage?:Image;layout?:string|null;position?:string|null;height?:number|null;mobileHeight?:number|null;maxWidth?:number|null}|null;
const url=(image?:Image)=>image&&typeof image==='object'?image.url||undefined:undefined;
export function footerDecorationStyle(settings?:FooterDecorationSettings):CSSProperties|undefined{
 if(!settings?.enabled||!url(settings.image))return;
 const image=typeof settings.image==='object'?settings.image:undefined;
 const mobile=typeof settings.mobileImage==='object'&&settings.mobileImage?settings.mobileImage:image;
 const ratio=(m:typeof image)=>m?.width&&m.height?m.height/m.width:0.1;
 return {'--footer-band-height':`calc(100vw * ${ratio(image)})`,'--footer-band-mobile-height':url(settings.mobileImage)?`calc(100vw * ${ratio(mobile)})`:`max(160px, calc(100vw * ${ratio(mobile)}))`,'--footer-decoration-height':`${settings.height??160}px`,'--footer-decoration-mobile-height':`${settings.mobileHeight??90}px`,'--footer-decoration-width':settings.layout==='center'?`${settings.maxWidth??960}px`:'100%'} as CSSProperties;
}
export function FooterDecoration({decoration}:{decoration?:FooterDecorationSettings}){
 const image=url(decoration?.image);
 if(!decoration?.enabled||!image)return null;
 const mobile=url(decoration.mobileImage);
 return <picture className="wf-footer-decoration" data-layout={decoration.layout||'band'} aria-hidden="true">{mobile&&<source media="(max-width:700px)" srcSet={mobile}/>}<img src={image} alt="" loading="lazy"/></picture>;
}
