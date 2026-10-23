import {resolveCardEyebrow,type EyebrowSettings} from '@/lib/card-eyebrow';
export function CardEyebrow({item,settings=[]}:{item:{container?:{title:string};production?:{title:string};section?:string};settings?:(EyebrowSettings|null|undefined)[]}){
 const text=resolveCardEyebrow(item,...settings);
 return text?<span className="card-eyebrow">{text}</span>:null;
}
