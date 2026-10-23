import assert from 'node:assert/strict';
import {registerHooks} from 'node:module';
import {getPayload} from 'payload';
import config from '../payload.config';
registerHooks({resolve(s,c,next){return s==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:next(s,c);}});
const {getCMSPage}=await import('../lib/cms');
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw new Error('Solo DB temporaneo');
const p=await getPayload({config});
try{
 const page=(await p.find({collection:'pages',where:{path:{equals:'/braditriboo/bradford'}},depth:0})).docs[0];
 assert.ok(page);
 const profile:any=page.blocks?.find(b=>b.blockType==='characterProfile');assert.ok(profile);
 const character=await p.findByID({collection:'characters',id:page.character as number,depth:1});
 const save=async(b:any)=>p.update({collection:'pages',id:page.id,data:{blocks:page.blocks!.map(row=>row.id===profile.id?b:row)}});
 const read=async()=>{const b=(await getCMSPage(page.path))!.blocks.find(b=>b.label===profile.label);assert.ok(b);return b;};
 const b:any={...profile,showMedia:true,overrideMedia:false,cards:[{sourceMode:'profile',profileField:'identity',label:'Chi è'},{sourceMode:'manual',label:'Locale',description:'Testo locale'}]};
 await save(b);let rendered=await read();
 assert.equal(rendered.note,character.description);assert.equal(rendered.media?.url,(character.portrait as any)?.url);
 assert.equal(rendered.items?.[0].description,character.identity);assert.equal(rendered.items?.[0].textOnly,true);assert.equal(rendered.items?.[1].label,'Locale');assert.equal(rendered.facts,undefined);
 b.overrideNote=true;b.note='';b.overrideMedia=true;b.media=null;await save(b);rendered=await read();assert.equal(rendered.note,undefined);assert.equal(rendered.media,undefined);
 b.cards[0].overrideContent=true;b.cards[0].description='';b.cards[0].label='Titolo locale';await save(b);rendered=await read();assert.equal(rendered.items?.[0].label,'Titolo locale');assert.equal(rendered.items?.[0].description,undefined);
 b.cards[0].overrideContent=false;b.overrideNote=false;b.overrideMedia=false;await save(b);rendered=await read();assert.equal(rendered.items?.[0].description,character.identity);assert.equal(rendered.note,character.description);
 b.cards[0].hidden=true;await save(b);rendered=await read();assert.equal(rendered.items?.length,1);assert.equal(rendered.items?.[0].label,'Locale');
 b.cards=[];await save(b);rendered=await read();assert.equal(rendered.items?.length,0,'Nessuna ricreazione delle card rimosse');
 b.cards=[{sourceMode:'profile',profileField:'tagline',label:'In una frase',appearance:{enabled:true,backgroundMode:'transparent',composition:'overlay'}}];b.presentation='wide';await save(b);rendered=await read();assert.equal(rendered.presentation,'wide');assert.equal(rendered.items?.[0].description,character.tagline);
 console.log('OK: descrizione/media ereditati, override vuoti, voci collegate, card manuali, nascondi/rimuovi, Wide e assenza di testo duplicato.');
}finally{await p.destroy();}
