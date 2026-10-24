import type {Where} from 'payload';
/** Uploaded visual media stays behind the existing Payload access rules. */
export function visualMediaKind(url:string):'image'|'video'|'lottie'{
 const path=url.split(/[?#]/)[0].toLowerCase();
 return /\.(json|lottie)$/.test(path)?'lottie':/\.(mp4|webm|mov|m4v|ogv)$/.test(path)?'video':'image';
}
export const visualMediaFilter=():Where=>({or:[{mimeType:{contains:'image/'}},{mimeType:{contains:'video/'}},{filename:{like:'.json'}},{filename:{like:'.lottie'}}]});
export function visualMediaURL(value:any):string|undefined{
 if(!value||typeof value!=='object')return;
 return !value.mimeType||value.mimeType.startsWith('image/')||value.mimeType.startsWith('video/')||visualMediaKind(value.filename||value.url||'')==='lottie'?value.url||undefined:undefined;
}
