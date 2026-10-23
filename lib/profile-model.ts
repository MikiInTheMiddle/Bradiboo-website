import {sourceAudio,sourceAudioTracks} from './card-audio';
import type {WireLink} from './wireframe';
export const profileEntries=[{key:'identity',label:'Chi sono'},{key:'tagline',label:'In una frase'},{key:'passions',label:'Cosa mi piace'},{key:'traits',label:'Come sono'},{key:'music',label:'Il suo universo musicale'}];
export function profileCard(character:any,key?:string):WireLink|undefined{
 const field=profileEntries.find(f=>f.key===key);if(!field||!character)return;
 const value=character[field.key];const text=Array.isArray(value)?value.map((v:any)=>v.text).filter(Boolean).join(' · '):value;
 return {profileField:key,audioTracks:sourceAudioTracks(character),cardAudio:key==='music'?sourceAudio({cardAudio:character.musicAudio}):undefined,label:field.label,description:text||undefined,href:'',textOnly:true,image:undefined,mobileImage:undefined};
}
