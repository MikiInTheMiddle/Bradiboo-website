import fs from 'node:fs';
import {getPayload} from 'payload';
import config from '../payload.config';
import type {Page} from '../payload-types';
const payload=await getPayload({config});
const pages=await payload.find({collection:'pages',where:{path:{in:['/shop','/shop/bradibox/dove-sei']}},depth:0,limit:10});
fs.mkdirSync('work/backups',{recursive:true});fs.writeFileSync(`work/backups/shop-link-${Date.now()}.json`,JSON.stringify(pages.docs,null,2));
const sections:Record<string,string>={'Scheda prodotto':'overview','Prodotto in evidenza':'card','Informazioni prodotto':'highlights','Il libro':'book','Galleria libro':'bookGallery','Il gioco':'game','Galleria gioco':'gameGallery','Contenuto della scatola':'back','Approfondimento':'psico','Competenze':'skills','Dati confezione':'specs','Video della Bradibox':'videos'};
for(const page of pages.docs){
 const blocks=(page.blocks||[]).map(b=>{
  if(b.blockType==='headlessProduct')return b;
  const section=sections[b.label];if(!section)return b;
  const source=b as typeof b&{items?:unknown[];cards?:unknown[]};
  const {blockType,items,cards,...common}=source;
  return {...common,blockType:'headlessProduct',section,cards:cards||items||[],overrideTitle:false,overrideNote:false,overrideMedia:false,overrideItems:false};
 }) as Page['blocks'];
 await payload.update({collection:'pages',id:page.id,data:{headlessProductSlug:'dove-sei',blocks,sourceReference:(page.sourceReference||'')+'\nCollegamento live WordPress: moduli Prodotto headless con override locali. Stato sold out e CTA Fillout locali.'}});
}
console.log('Vetrina e scheda collegate a WordPress. Copie importate conservate come fallback; disponibilità e Fillout locali.');
await payload.destroy();
