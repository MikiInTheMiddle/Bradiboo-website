import {getPayload} from 'payload';
import config from '../payload.config';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
const payload=await getPayload({config});
try{
 const navigation=await payload.findGlobal({slug:'navigation',depth:0});
 const existing=(await payload.find({collection:'pages',where:{path:{equals:'/legal/cookie-policy'}},depth:0,limit:1})).docs[0];
 const containers=(await payload.find({collection:'production-containers',limit:100,depth:0,sort:'id'})).docs;
 await mkdir('work/backups',{recursive:true});await writeFile(`work/backups/footer-legal-${Date.now()}.json`,JSON.stringify({navigation,cookiePage:existing||null},null,2));
 await payload.updateGlobal({slug:'navigation',data:{footerItems:[{label:'Guarda',href:'/guarda'},...containers.filter(c=>c.url).map(c=>({label:c.title,href:c.url!})),{label:'Braditriboo',href:'/braditriboo'},{label:'Studio',href:navigation.studioHref||'/studio'}],footerNote:'Bradiboo® - Tutti i diritti riservati © 2024 • Bradiboo è un marchio registrato. Nomi, grafiche, materiale, proposte e idee in questo sito di proprietà di Bradiboo Srls.\n\nBradiboo® srls - Via Balicco, 61 - 23900 Lecco (LC)\nbradiboo@pec.it - REA LC - 414688 • CF e n.iscr. al Registro Imprese 04030080131 • Capitale sociale 6000'}});
 if(!existing){
  const rows=JSON.parse(await readFile('content/legal/cookie-policy.json','utf8')) as {tag:string;text:string}[];
  const sections:{title:string;note:string;headingLevel:string}[]=[];
  for(const row of rows){if(row.tag.startsWith('h'))sections.push({title:row.text,note:'',headingLevel:row.tag==='h1'?'h2':row.tag});else if(sections.length)sections.at(-1)!.note+=(sections.at(-1)!.note?'\n\n':'')+row.text;}
  const blocks=sections.map((s,i)=>({blockType:'intro' as const,label:`Cookie Policy · ${i+1}`,title:s.title,note:s.note,headingLevel:s.headingLevel as 'h2'|'h3',titleSize:s.headingLevel==='h3'?'h5':'h4',titleAlign:'left',noteAlign:'left',showText:true,presentation:'cards',backgroundMode:'page',showMedia:false}));
  await payload.create({collection:'pages',data:{title:'Cookie Policy',path:'/legal/cookie-policy',group:'legal',sourceReference:'Testi importati integralmente da https://bradiboo.com/it/legal/cookie-policy/ il 22 ottobre 2026. La Privacy Policy rimane quella pubblicata su Iubenda (29492881). I riferimenti a servizi terzi descrivono il sito originale.',_status:'published',blocks:blocks as any}});
 }
 console.log('Footer aggiornato; Cookie Policy importata senza sovrascrivere eventuali pagine già presenti.');
}finally{await payload.destroy();}
