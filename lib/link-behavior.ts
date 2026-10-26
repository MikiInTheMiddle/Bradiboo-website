import type {UrlObject} from 'url';

/** Fillout forms are destinations outside the site, including custom Fillout subdomains. */
export function isFilloutLink(href:string|UrlObject):boolean {
 try {
  const value=typeof href==='string'?href:href.hostname||href.host?`${href.protocol||'https:'}//${href.hostname||href.host}${href.pathname||'/'}`:'';
  const url=new URL(value,'https://bradiboo.com');
  const hostname=url.hostname.toLowerCase().replace(/\.$/,'');
  return ['https:','http:'].includes(url.protocol)&&(hostname==='fillout.com'||hostname.endsWith('.fillout.com'));
 } catch {return false;}
}
export function formLinkBehavior(href:string|UrlObject,rel?:string){
 if(!isFilloutLink(href))return {};
 return {target:'_blank' as const,rel:[...new Set([...(rel||'').split(/\s+/).filter(Boolean),'noopener','noreferrer'])].join(' ')};
}
