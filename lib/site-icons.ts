import type {Metadata} from 'next';
type IconMedia={url?:string|null;mimeType?:string|null;width?:number|null;height?:number|null;updatedAt?:string|null};
export function siteIcons(media?:IconMedia|null):Metadata['icons']{
 if(!media?.url)return {icon:[{url:'/favicon.svg',type:'image/svg+xml'}]};
 const relative=media.url.startsWith('/');
 const url=new URL(media.url,'https://bradiboo.com');
 if(!['https:','http:'].includes(url.protocol))return {icon:[{url:'/favicon.svg',type:'image/svg+xml'}]};
 if(media.updatedAt)url.searchParams.set('v',media.updatedAt);
 const href=relative?url.pathname+url.search+url.hash:url.href;
 const sizes=media.mimeType==='image/svg+xml'?'any':media.width&&media.height?`${media.width}x${media.height}`:undefined;
 return {icon:[{url:href,type:media.mimeType||undefined,sizes}],...(media.mimeType==='image/png'?{apple:[{url:href,sizes}]}:{})};
}
