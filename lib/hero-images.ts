export type HeroImage={image?:string;mobileImage?:string;focalX?:number;focalY?:number;color?:string;mobileColor?:string;endColor?:string;mobileEndColor?:string};
/** Pick once on the server; preserve mobile and focal data from that same row. */
export function chooseHeroImage(images:HeroImage[],random=Math.random):HeroImage|undefined{
 const valid=images.filter(image=>Boolean(image.image));
 if(!valid.length)return;
 const index=Math.min(valid.length-1,Math.max(0,Math.floor(random()*valid.length)));
 return valid[index];
}
