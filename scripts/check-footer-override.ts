import assert from 'node:assert/strict';
import {resolveFooterOverride} from '../lib/footer-override';
import {footerDecorationStyle} from '../components/footer-decoration';
import {getPayload} from 'payload';
import config from '../payload.config';
const global={enabled:true,image:{url:'/global.webp',width:1000,height:100},mobileImage:{url:'/global-mobile.webp'},layout:'band',position:'overlap'};
assert.equal(resolveFooterOverride(global,{enabled:false,customColor:true,color:'#123456'}).color,undefined);
assert.equal(resolveFooterOverride(global,{enabled:false,customImage:true,image:{url:'/local.webp'}}).decoration,global);
assert.equal(resolveFooterOverride(global,{enabled:true,customColor:true,color:'#123456'}).decoration,global);
const local=resolveFooterOverride(global,{enabled:true,customImage:true,image:{url:'/local.webp',width:1000,height:200}});
assert.equal(local.decoration?.mobileImage,null);assert.equal(local.decoration?.layout,'band');
assert.equal(footerDecorationStyle(local.decoration)?.['--footer-band-height' as keyof ReturnType<typeof footerDecorationStyle>],'calc(100vw * 0.2)');
assert.equal(resolveFooterOverride(global,{enabled:true,customImage:true}).decoration,global);
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw new Error('Solo DB temporaneo');
const p=await getPayload({config});
try{
 const nav=await p.findGlobal({slug:'navigation',depth:0});
 const other=await p.findByID({collection:'pages',id:1,depth:0});
 await p.update({collection:'pages',id:3,data:{footerOverride:{enabled:true,customColor:true,color:'#123456',customImage:true,image:50}}});
 let page=await p.findByID({collection:'pages',id:3,depth:1});
 assert.equal(resolveFooterOverride(global,page.footerOverride).color,'#123456');
 assert.ok((page.footerOverride?.image as any)?.url);
 await p.update({collection:'pages',id:3,data:{footerOverride:{...page.footerOverride,image:50,enabled:false}}});
 page=await p.findByID({collection:'pages',id:3,depth:0});assert.equal(page.footerOverride?.image,50);assert.equal(page.footerOverride?.color,'#123456');
 assert.equal(resolveFooterOverride(global,page.footerOverride).decoration,global);
 assert.deepEqual(await p.findGlobal({slug:'navigation',depth:0}),nav);
 assert.deepEqual((await p.findByID({collection:'pages',id:1,depth:0})).footerOverride,other.footerOverride);
 console.log('OK: colore/immagine indipendenti, fallback globale, immagine mobile coerente, dimensioni da media locale, spegnimento conserva valori, globale e altre pagine invariati.');
}finally{await p.destroy();}
