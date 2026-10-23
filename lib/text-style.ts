import type { CSSProperties } from 'react';
import {resolveColor} from './background';
export type BlockTypography = {
 textColor?:string|null;titleColor?:string|null;noteColor?:string|null;
 headingLevel?:string|null;titleSize?:string|null;titleCustomSize?:number|null;titleAlign?:string|null;titleWeight?:string|null;
 noteSize?:string|null;noteCustomSize?:number|null;noteAlign?:string|null;noteWeight?:string|null;
};
export const textColorValue=(value?:string|null)=>{const resolved=resolveColor(value);return resolved==='transparent'?undefined:resolved;};
const titleSizes:Record<string,string>={h1:'clamp(44px, 7vw, 96px)',h2:'clamp(34px, 4.3vw, 60px)',h3:'clamp(28px, 3.2vw, 44px)',h4:'clamp(24px, 2.5vw, 34px)',h5:'clamp(20px, 2vw, 26px)',h6:'clamp(18px, 1.6vw, 22px)'};
const noteSizes:Record<string,string>={small:'16px',medium:'clamp(18px, 1.55vw, 22px)',large:'clamp(22px, 2vw, 28px)'};
export function blockHeading(value?:string|null,hero=false):'h1'|'h2'|'h3'|'h4'|'h5'|'h6' {
 return value&&/^h[1-6]$/.test(value)?value as 'h1'|'h2'|'h3'|'h4'|'h5'|'h6':hero?'h1':'h2';
}
export function blockTextStyle(block:BlockTypography,target:'title'|'note'):CSSProperties {
 const size=target==='title'?block.titleSize:block.noteSize;
 const custom=target==='title'?block.titleCustomSize:block.noteCustomSize;
 const alignment=target==='title'?block.titleAlign:block.noteAlign;
 const weight=target==='title'?block.titleWeight:block.noteWeight;
 const fontSize=size==='custom'&&typeof custom==='number'&&Number.isFinite(custom)?`clamp(${Math.min(custom,target==='title'?36:20)}px, ${custom/12}vw, ${custom}px)`:(target==='title'?titleSizes:noteSizes)[size||''];
 return {
  color:textColorValue(target==='title'?block.titleColor:block.noteColor)||textColorValue(block.textColor),
  fontSize,
  textAlign:alignment&&['left','center','right'].includes(alignment)?alignment as 'left'|'center'|'right':undefined,
  fontWeight:weight&&/^[4-8]00$/.test(weight)?Number(weight):undefined,
  // Align within the full text column, including when a default max-width applies.
  marginInline:alignment==='center'?'auto':alignment==='right'?'auto 0':undefined,
 };
}
