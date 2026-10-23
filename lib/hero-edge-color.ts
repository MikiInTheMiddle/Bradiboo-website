import sharp from 'sharp';
import path from 'node:path';
import type {CollectionBeforeChangeHook,Field,TextField} from 'payload';
import {colorField} from './color-field';

/** Sample the bottom 1% of the image, ignoring fully transparent pixels. */
export async function sampleBottomColor(input:Buffer|string):Promise<string|undefined>{
 const metadata=await sharp(input).metadata();
 if(!metadata.width||!metadata.height)return;
 const height=Math.max(1,Math.round(metadata.height*.01));
 const {data,info}=await sharp(input).extract({left:0,top:metadata.height-height,width:metadata.width,height}).resize({width:128}).toColourspace('srgb').ensureAlpha().raw().toBuffer({resolveWithObject:true});
 let weight=0;const sums=[0,0,0];
 for(let i=0;i<data.length;i+=info.channels){const alpha=data[i+3]/255;weight+=alpha;for(let c=0;c<3;c++)sums[c]+=data[i+c]*alpha;}
 if(!weight)return;
 return '#'+sums.map(value=>Math.round(value/weight).toString(16).padStart(2,'0')).join('');
}
export const mediaEdgeColor:CollectionBeforeChangeHook=async({data,originalDoc,req})=>{
 if(!req.file&&originalDoc?.bottomEdgeColor&&data.filename===undefined)return data;
 const filename=data.filename||originalDoc?.filename;
 try{
  const input=req.file?.data||(filename?path.join(process.cwd(),'media',path.basename(filename)):undefined);
  if(input&&(req.file?.mimetype||data.mimeType||originalDoc?.mimeType||'').startsWith('image/'))data.bottomEdgeColor=await sampleBottomColor(input)||null;
 }catch{data.bottomEdgeColor=null;}
 return data;
};
export function solidEdgeField(name:string,label:string):TextField{
 const base=colorField(name,label);
 return {...base,defaultValue:'#ffffff',hooks:{beforeValidate:[({value})=>edgeColor(value)||'#ffffff']},admin:{...base.admin,components:{Field:{path:'/components/admin/ColorField#ColorField',clientProps:{label,solidOnly:true}}}}};
}
export function heroEdgeFields(imageField:string):Field[]{return [
 {name:'edgeColorPreview',type:'ui',admin:{components:{Field:{path:'/components/admin/HeroEdgePreview#HeroEdgePreview',clientProps:{imageField}}}}},
 {name:'customEdgeColor',label:'Personalizza il colore di raccordo inferiore',type:'checkbox'},
 {...solidEdgeField('edgeColor','Colore di raccordo inferiore'),admin:{...solidEdgeField('edgeColor','Colore di raccordo inferiore').admin,condition:(_,s)=>Boolean(s.customEdgeColor)}},
];}
export function edgeColor(value:unknown):string|undefined{return typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value)?value:undefined;}
export function resolveHeroPageBackground(manual:{color?:string;image?:string},settings:{linked?:boolean;override?:boolean;color?:string|null;mode?:string|null;endColor?:string|null;overrideEnd?:boolean},hero?:{color?:string;mobileColor?:string;endColor?:string;mobileEndColor?:string}){
 if(!settings.linked)return {backgroundColor:manual.color,backgroundImage:manual.image};
 const override=settings.override?edgeColor(settings.color):undefined;
 const color=override||hero?.color;
 if(!color)return {backgroundColor:manual.color,backgroundImage:manual.image};
 const fallback=edgeColor(settings.endColor);
 const end=settings.overrideEnd?fallback:edgeColor(hero?.endColor)||fallback;
 const mobileEnd=settings.overrideEnd?fallback:edgeColor(hero?.mobileEndColor)||end;
 const background=(start:string,last?:string)=>settings.mode==='gradient'&&last?`linear-gradient(to bottom, ${start} 0%, ${last} 100%)`:start;
 return {backgroundColor:background(color,end),backgroundImage:undefined,backgroundMobileColor:background(override||hero?.mobileColor||color,mobileEnd)};
}
