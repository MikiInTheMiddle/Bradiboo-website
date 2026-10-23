import {visibilityAttributes,ctaVariables} from './card-controls';
import type {CSSProperties} from 'react';
import type {CardAppearance} from './card-appearance';
import {textColorValue} from './text-style';
export function cardSurfaceStyle(value?:CardAppearance):CSSProperties|undefined {
 const a=value?.enabled?value:undefined;
 if(!a)return;
 const restColor=a.backgroundMode==='transparent'?'transparent':a.backgroundColor?textColorValue(a.backgroundColor)||'transparent':undefined;
 const restBackground=restColor?`color-mix(in srgb, ${restColor} ${a.backgroundOpacity??100}%, transparent)`:undefined;
 const hoverColor=a.hoverBackgroundColor?textColorValue(a.hoverBackgroundColor)||'transparent':restColor||'var(--card-rest-color, transparent)';
 return {
  ...ctaVariables(a),
  '--card-rest-color':restColor,
  '--card-veil':(a.overlayOpacity??55)/100,
  '--card-image-opacity':(a.backgroundOpacity??100)/100,
  '--card-image-blur':`${a.backgroundBlur??0}px`,
  '--card-rest-background':restBackground,
  '--card-hover-background':a.hoverMode==='custom'?(a.hoverBackgroundColor||a.hoverOpacity!=null?`color-mix(in srgb, ${hoverColor} ${a.hoverOpacity??100}%, transparent)`:'var(--card-rest-background, transparent)'):undefined,
  '--card-hover-text':textColorValue(a.hoverTextColor),
  '--card-hover-title':textColorValue(a.hoverTitleColor)||textColorValue(a.hoverTextColor),
  '--card-hover-note':textColorValue(a.hoverNoteColor)||textColorValue(a.hoverTextColor),
  '--card-hover-badge-background':a.hoverBadgeBackgroundColor?textColorValue(a.hoverBadgeBackgroundColor)||'transparent':undefined,
  '--card-hover-badge-text':textColorValue(a.hoverBadgeTextColor),
  color:textColorValue(a.textColor),
  background:restBackground,
  backdropFilter:a.backgroundBlur!=null?`blur(${a.backgroundBlur}px)`:undefined,
  WebkitBackdropFilter:a.backgroundBlur!=null?`blur(${a.backgroundBlur}px)`:undefined,
  borderColor:a.borderColor?textColorValue(a.borderColor)||'transparent':undefined,
  borderRadius:a.borderRadius??undefined,
 } as CSSProperties;
}
export function cardHoverAttributes(a?:CardAppearance) {
 return {
  ...visibilityAttributes(a),
  'data-card-kind':a?.characterCard?'character':undefined,
  'data-card-hover':a?.hoverMode,
  'data-card-background':a?.composition==='overlay'?a.backgroundMode:undefined,
  'data-card-composition':a?.composition&&a.composition!=='inherit'?a.composition:undefined,
  'data-hover-text':Boolean(a?.hoverTextColor)||undefined,
  'data-hover-title':Boolean(a?.hoverTitleColor||a?.hoverTextColor)||undefined,
  'data-hover-note':Boolean(a?.hoverNoteColor||a?.hoverTextColor)||undefined,
 };
}
