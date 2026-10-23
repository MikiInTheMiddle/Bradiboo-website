import {getPayload} from 'payload';
import config from '../payload.config';
const payload=await getPayload({config});
try{
 const page=(await payload.find({collection:'pages',where:{path:{equals:'/'}},depth:0,limit:1})).docs[0];
 if(!page)throw new Error('Home non trovata');
 const blocks=page.blocks as any[];
 const hero=blocks[0];
 if(hero?.blockType!=='hero')throw new Error('Il primo modulo non è una Hero');
 hero.randomHero=true;
 hero.titleAlign='center';hero.noteAlign='center';
 if(!hero.heroImages?.length&&hero.backgroundImage)hero.heroImages=[{image:hero.backgroundImage,mobileImage:hero.mobileImage,focalX:hero.focalX??50,focalY:hero.focalY??50}];
 await payload.update({collection:'pages',id:page.id,data:{blocks}});
 console.log('Home: casuale attivo con immagine esistente, testi centrati; altri moduli conservati.');
}finally{await payload.destroy();}
