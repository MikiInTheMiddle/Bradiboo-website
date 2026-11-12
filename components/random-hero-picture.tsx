'use client';

import {createContext,useContext,useEffect,useRef,useState,type CSSProperties,type ReactNode} from 'react';
import {chooseHeroImage,type HeroImage} from '@/lib/hero-images';
import {pageBackgroundStyle} from '@/lib/background';
import {VisualMedia} from './visual-media';

const HeroSelection=createContext<HeroImage|undefined>(undefined);

export function RandomHeroProvider({images,children}:{images:HeroImage[];children:ReactNode}){
 const [selected,setSelected]=useState<HeroImage>();
 const initialized=useRef(false);
 useEffect(()=>{
  if(initialized.current)return;
  initialized.current=true;
  let previous:string|null=null;
  try{previous=sessionStorage.getItem('bradiboo-home-hero');}catch{}
  const alternatives=images.filter(image=>image.image!==previous);
  const next=chooseHeroImage(alternatives.length?alternatives:images);
  setSelected(next);
  if(next?.image){
   try{sessionStorage.setItem('bradiboo-home-hero',next.image);}catch{}
  }
 },[images]);

 return <HeroSelection.Provider value={selected}>{children}</HeroSelection.Provider>;
}

export function HeroPageBackground({fallback,children}:{fallback:NonNullable<HeroImage['pageBackground']>;children:ReactNode}){
 const background=useContext(HeroSelection)?.pageBackground??fallback;
 return <div className="wf-page-background" data-hero-background={background.backgroundMobileColor?'true':undefined} style={pageBackgroundStyle(background)}>{children}</div>;
}

export function RandomHeroPicture({images,className="wf-background-picture",style}:{images:HeroImage[];className?:string;style?:CSSProperties}){
 const selected=useContext(HeroSelection);
 const renderPicture=(image:HeroImage|undefined)=>image?.image&&(
  <div className={`${className} wf-random-hero-picture`} style={{
   ...style,
   '--hero-loading-color':image.color,
   '--hero-mobile-loading-color':image.mobileColor||image.color,
  } as CSSProperties}>
   <VisualMedia src={image.image} mobileImage={image.mobileImage} alt="" loading="eager" fetchPriority="high" style={{objectPosition:`${image.focalX??50}% ${image.focalY??50}%`}}/>
  </div>
 );

 return <>{renderPicture(selected)}<noscript>{renderPicture(images[0])}</noscript></>;
}
