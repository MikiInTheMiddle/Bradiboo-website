import assert from 'node:assert/strict';
import {getPayload} from 'payload';
import {registerHooks} from 'node:module';
import config from '../payload.config';
import {contentSelectionBlocks,contentSelectionQuery} from '../lib/content-selection';
registerHooks({resolve(s,c,n){return s==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:n(s,c);}});
const {getCMSPage}=await import('../lib/cms');
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw Error('Solo copia DB temporanea');
const p=await getPayload({config});
try{
 const page=(await p.find({collection:'pages',where:{path:{equals:'/braditriboo/bradford'}},depth:0})).docs[0];
 const before=await getCMSPage(page.path);
 const disabled=page.blocks!.map(b=>({...b,contentSelection:contentSelectionBlocks.has(b.blockType)?{enabled:false,by:'all' as const}:undefined}));
 await p.update({collection:'pages',id:page.id,data:{blocks:disabled as any}});
 assert.deepEqual(await getCMSPage(page.path),before,'Disattivato: rendering precedente identico');
 const check=async(selection:any)=>{
  const expected=await p.find({collection:'contents',...contentSelectionQuery(selection,page.character),depth:0,overrideAccess:false});
  await p.update({collection:'pages',id:page.id,data:{blocks:[{blockType:'collection',label:'Auto test',title:'Auto test',mode:'manual',cards:[{sourceMode:'manual',label:'Conservata',description:'Non perdere',href:'/shop'}],contentSelection:selection}] as any}});
  const result=(await getCMSPage(page.path))!.blocks[0];
  assert.deepEqual(result.items?.map(i=>i.label),expected.docs.map(i=>i.title));return result;
 };
 for(const selection of [{enabled:true,by:'character'},{enabled:true,by:'container',container:1,kind:'production',sort:'title',limit:2},{enabled:true,by:'production',production:9},{enabled:true,by:'all',kind:'episode',sort:'oldest',limit:3}])await check(selection);
 let stored=await p.findByID({collection:'pages',id:page.id,depth:0});const configured:any=stored.blocks![0];configured.contentSelection.enabled=false;
 await p.update({collection:'pages',id:page.id,data:{blocks:[configured]}});assert.equal((await getCMSPage(page.path))!.blocks[0].items?.[0].label,'Conservata');
 for(const blockType of contentSelectionBlocks){
  await p.update({collection:'pages',id:page.id,data:{blocks:[{blockType,label:`Auto ${blockType}`,title:'Test',contentSelection:{enabled:true,by:'all',kind:'episode',limit:1},cardAppearance:{enabled:true,backgroundMode:'transparent'},cardOverrides:[{position:1,cardTitle:'Override locale',appearance:{hoverMode:'custom',hoverBackgroundColor:'#123456'}}]}] as any}});
  const rendered=(await getCMSPage(page.path))!.blocks[0];assert.equal(rendered.items?.length,1,blockType);assert.equal(rendered.items?.[0].label,'Override locale',blockType);assert.equal(rendered.items?.[0].appearance?.hoverBackgroundColor,'#123456',blockType);
 }
 await check({enabled:true,by:'character',character:page.character,kind:'episode'});
 const characterID=typeof page.character==='object'?page.character!.id:page.character!;
 const episode=(await p.find({collection:'contents',where:{recordType:{equals:'episode'}},limit:1,depth:0})).docs[0];
 await p.update({collection:'contents',id:episode.id,data:{characters:[characterID],_status:'published'}});
 assert.ok((await getCMSPage(page.path))!.blocks[0].items?.some(i=>i.label===episode.title),'Nuove associazioni si propagano');
 console.log(`OK: modalità disattiva identica, ritorno alle card manuali conservate, filtri personaggio/contenitore/produzione/tipo/ordine/limite, aggiornamenti sorgente e override nei ${contentSelectionBlocks.size} blocchi condivisi.`);
}finally{await p.destroy();}
