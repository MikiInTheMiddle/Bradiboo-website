export type HeroImage={pageBackground?:{backgroundColor?:string;backgroundImage?:string;backgroundMobileColor?:string};image?:string;mobileImage?:string;focalX?:number;focalY?:number;color?:string;mobileColor?:string;endColor?:string;mobileEndColor?:string};
/** Keep the mobile variant and focal point from the selected row. */
export function chooseHeroImage(images:HeroImage[],random=Math.random):HeroImage|undefined{
 const valid=images.filter(image=>Boolean(image.image));
 if(!valid.length)return;
 const index=Math.min(valid.length-1,Math.max(0,Math.floor(random()*valid.length)));
 return valid[index];
}
