import fs from 'node:fs';
import {getPayload} from 'payload';
import config from '../payload.config';
import source from '../lib/studio-source.json';
import type {Page} from '../payload-types';
const payload=await getPayload({config});
const nav=await payload.findGlobal({slug:'navigation',depth:0});
if((nav.coherenceVersion||0)>=1){console.log('Allineamento già applicato: modifiche editoriali preservate.');await payload.destroy();process.exit(0);}
const all=await payload.find({collection:'pages',depth:0,limit:100});
fs.mkdirSync('work/backups',{recursive:true});fs.writeFileSync(`work/backups/coherence-${Date.now()}.json`,JSON.stringify({pages:all.docs,navigation:nav},null,2));
type Block=NonNullable<Page['blocks']>[number];
const block=(blockType:string,label:string,title:string,note?:string,items?:{label:string;description?:string;href?:string}[])=>({blockType,label,title,note,...(items?{items}:{}),draft:false}) as Block;
const hero=(title:string,note?:string)=>block('hero','Introduzione',title,note);
const intro=(title:string,note:string)=>block('intro',title,title,note);
const cards=(title:string,rows:{label:string;description?:string;href?:string}[])=>({blockType:'collection',label:title,title,mode:'manual',cards:rows,draft:false}) as Block;
const plain=(text:string)=>text.replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ');
const contact=()=>block('cta','Contatti','Parliamone',undefined,[{label:'Scrivi a ciao@bradiboo.com',href:'mailto:ciao@bradiboo.com'}]);
const save=async(path:string,title:string,blocks:Block[],sourceReference:string,group='Bradiboo Studio')=>{const existing=all.docs.find(p=>p.path===path);const data={title,path,blocks,sourceReference,group,purpose:existing?.purpose||title,_status:'published' as const};if(existing)await payload.update({collection:'pages',id:existing.id,data});else await payload.create({collection:'pages',data});};
const watch=all.docs.find(p=>p.path==='/guarda')!;
// Retain only modules which are really rendered, preserving existing cluster data.
const watchHero=watch.blocks?.find(b=>b.blockType==='hero');
const clusters=(watch.blocks||[]).filter(b=>['Series rail','Miniseries rail','Formats rail'].includes(b.label));
await save('/guarda','Guarda',[
 {...watchHero,blockType:'hero',label:'Introduzione Guarda',title:'Che storia guardiamo?',note:'Scegli un personaggio, segui una curiosità o lasciati guidare dalle nostre raccolte.',ctaLabel:'Non sai cosa scegliere? Prova ZAP!',ctaURL:'/guarda/telecomando'} as Block,
 block('watchExperience','Player e catalogo','Trova la tua prossima storia'),
 ...clusters,
], 'Pagina allineata ai moduli frontend; le raccolte e i filtri si configurano in Guarda — catalogo e fascioni.','Guarda');
await save('/guarda/telecomando','ZAP!',[
 {...hero('Lasciati sorprendere.','Accendi qualche curiosità. Al resto pensiamo noi.'),ctaLabel:'Preferisci scegliere? Esplora Guarda',ctaURL:'/guarda'} as Block,
 block('zapExperience','Player e pulsanti ZAP!','Premi e scopri una storia','Un pulsante, una storia. Oppure lasciati sorprendere.'),
], 'Esperienza ZAP!: pulsanti configurati in Guarda — catalogo e fascioni.','Guarda');
const pilot=all.docs.find(p=>p.path==='/guarda/serie/bradiboo/episodio-pil');if(pilot)await payload.update({collection:'pages',id:pilot.id,data:{redirectTo:'/guarda?contenuto=episodio-pil#watch-player',hideFromSitemap:true,purpose:'Percorso storico: apre il pilot nella scheda integrata di Guarda.'}});
const deck='Bradiboo_Deck 2026.pdf';
await save('/studio','Bradiboo Studio',[
 hero('Dietro il mondo Bradiboo','Bradiboo è una entertainment IP company che dà vita a storie, contenuti, prodotti ed esperienze pensati per essere vissuti e condivisi da bambini e famiglie.'),
 intro('Un nuovo universo narrativo per bambini e famiglie','Ogni giorno porta con sé piccole grandi sfide, emozioni e scoperte. Le trasformiamo in storie in cui bambini e adulti possano riconoscersi e guardare insieme ciò che succede da un altro punto di vista.'),
 cards('Dentro Bradiboo',[{label:'Perché Bradiboo',href:'/studio/perche-bradiboo',description:'Molto più di una storia.'},{label:'Il nostro approccio',href:'/studio/approccio',description:'Crescere insieme. Ad ogni età.'},{label:'Partnership',href:'/studio/partnership',description:'Scriviamo insieme il prossimo capitolo.'},{label:'Il team',href:'/studio/team'},{label:'Contatti',href:'/studio/contatti'}]),
 cards('Un mondo che può vivere ovunque',[{label:'Animation & Content',description:'Series · Miniseries · Bradibites · Specials',href:'/guarda'},{label:'Publishing',description:'Books · Activity Books'},{label:'Consumer products',description:'Toys · Games',href:'/shop'},{label:'Experiences',description:'Schools · Events · Live'},{label:'Licensing',description:'Characters · Products · Brand collaborations',href:'/studio/partnership'},{label:'Digital',description:'Platform · Apps · Interactive Experiences'}]),contact(),
],`${deck}, pp. 2–3, 18, 20, 23.`);
await save('/studio/perche-bradiboo','Perché Bradiboo',[
 hero('Crescere è complicato. Per tutti.','Un nuovo universo narrativo per bambini e famiglie.'),
 intro('Molto più di una storia','Bradiboo è una entertainment IP company che dà vita a storie, contenuti, prodotti ed esperienze pensati per essere vissuti e condivisi da bambini e famiglie.'),
 intro('Una storia alla volta','Siamo sempre al fianco dei veri sognatori di domani, perché possano cambiare il mondo una storia alla volta.'),
 intro('Il nostro manifesto','Siamo per le persone, per ogni tipo di famiglia, per i bambini.\n\nCreiamo contenuti, prodotti ed esperienze per ridare valore al tempo. Creiamo business inclusivi, sostenibili, per tutti, ovunque, per condividere il nostro credo: un futuro migliore parte dalle emozioni dei più piccoli.\n\nCrediamo che a dare valore al tempo passato insieme sia la qualità, non la quantità. Vogliamo incoraggiare a raccontare, a creare, a condividere e a confrontarsi attraverso nuove routine, stimolare la curiosità e la creatività attraverso il racconto ed il gioco, perché possano contribuire a rendere il mondo un posto migliore per tutti.'),
 block('cta','Approccio','Come si traduce nelle storie',undefined,[{label:'Il nostro approccio',href:'/studio/approccio'}]),
],`${deck}, pp. 2–3, 22; repo legacy bradiworld/manifesto/page.tsx. Correzioni ortografiche minime.`);
await save('/studio/approccio','Il nostro approccio',[
 hero('Crescere insieme. Ad ogni età.','Bradiboo unisce sensibilità psicopedagogica e storytelling per creare storie capaci di parlare a bambini e adulti insieme. Emozioni, relazioni e piccole grandi sfide della crescita convivono con comicità, avventura e scoperta, senza diventare mai una lezione.'),
 cards('Il nostro approccio',[{label:'Per i bambini',description:'Bradiboo parla il loro linguaggio, senza parlare loro dall’alto.'},{label:'Anche per gli adulti',description:'Lo stesso universo offre sfumature e significati diversi a chi lo vive da un’altra altezza.'},{label:'Emozioni senza zucchero',description:'Anche ciò che è complesso può essere affrontato con leggerezza, senza semplificarlo.'},{label:'Senza imporre',description:'Bradiboo apre nuovi punti di vista, senza imporre una morale o una conclusione, lasciando a ciascuno lo spazio per trovare il proprio.'}]),
 ...source.approach.map(s=>intro(s.title,`${s.subtitle}\n\n${s.text}`)),
 block('cta','Esplora le storie','Vedi l’approccio nelle storie',undefined,[{label:'Vai a Guarda',href:'/guarda'}]),
],`${deck}, p. 17; repo legacy bradiworld/psicopedagogia/page.tsx (cinque sezioni esistenti).`);
await save('/studio/partnership','Partnership',[
 hero('Scriviamo insieme il prossimo capitolo.','Cerchiamo partner internazionali per sviluppare, produrre e portare Bradiboo a nuovi pubblici e nuovi mercati.'),
 cards('Cosa cerchiamo',[{label:'Produzione',description:'Partner per sviluppare e produrre la serie e i nuovi contenuti animati.'},{label:'Distribuzione',description:'Partner per portare Bradiboo su piattaforme e mercati internazionali.'},{label:'Broadcast',description:'Broadcaster e piattaforme interessati a portare Bradiboo al proprio pubblico.'},{label:'Licensing',description:'Partner per trasformare personaggi e storie in prodotti, esperienze e nuove categorie.'}]),
 intro('Un mondo che può vivere ovunque','Bradiboo è un mondo pensato per vivere attraverso media, prodotti ed esperienze diverse, portando personaggi e storie in nuovi momenti della vita di bambini e famiglie.'),
 cards('Collaborazioni e progetti',[{label:'Aziende e brand',description:'Vogliamo creare un ponte sostenibile, etico e consapevole tra la vostra azienda ed il tessuto sociale per regalare tempo di qualità ovunque serve.',href:'/studio/partnership/aziende'},{label:'Partner sociali',description:'Siamo qui per aiutarvi a rendere il mondo un posto migliore per bambini e famiglie.',href:'/studio/partnership/sociale'}]),contact(),
],`${deck}, pp. 18, 20; repo legacy bradicollab/page.tsx.`);
for(const [slug,title,section] of [['aziende','Aziende e brand',source.companies],['sociale','Partner sociali',source.social]] as const){
 await save(`/studio/partnership/${slug}`,title,[hero(title),...section.services.map(s=>intro(s.title,plain(s.text))),cards('Come lavoriamo insieme',section.steps.map(s=>({label:s.title,description:plain(s.text)}))),contact()],`Repo legacy bradicollab/${slug}/page.tsx: servizi e fasi già esistenti.`);
}
const deckTeam=[{label:'Michele Panzeri',description:'Co-founder · Design & Motion, Strategy & Stuff'},{label:'Lorenzo Di Capua',description:'Co-founder · Strategy & Stuff'},{label:'Andrea Motta',description:'Co-founder · Words & Stuff'},{label:'Martina Mazzoleni',description:'Advisor · Psicopedagogia'}];
const otherTeam=source.team.filter(p=>!deckTeam.some(d=>d.label===`${p.name} ${p.surname}`)).map(p=>({label:`${p.name} ${p.surname}`,description:[p.role,p.skill].filter(Boolean).join(' · ')}));
await save('/studio/team','Il team',[hero('Le persone dietro Bradiboo'),cards('Founder e advisor',deckTeam),cards('Collaboratori',otherTeam),contact()],`${deck}, p. 21: founder e advisor. Repo legacy bradiworld/team/page.tsx: collaboratori attivi (esclusi i record commentati). Ruoli da revisione editoriale successiva.`);
await save('/studio/contatti','Contatti',[
 hero('Parliamo di Bradiboo'),
 block('cta','Canali di contatto','Scrivici','Informazioni, collaborazioni e progetti: ciao@bradiboo.com',[{label:'Apri la tua email',href:'mailto:ciao@bradiboo.com'}]),
 cards('Cerchi una collaborazione?',[{label:'Produzione, distribuzione e licensing',href:'/studio/partnership'},{label:'Aziende e brand',href:'/studio/partnership/aziende'},{label:'Partner sociali',href:'/studio/partnership/sociale'}]),
],`${deck}, p. 23. Il precedente form segnaposto è sostituito dal contatto email reale, senza invii simulati.`);
await payload.updateGlobal({slug:'navigation',data:{coherenceVersion:1,brand:'BRADIBOO',studioLabel:'Studio',studioHref:'/studio',studioNavTitle:'Bradiboo Studio',studioItems:[{label:'Studio',href:'/studio'},{label:'Perché Bradiboo',href:'/studio/perche-bradiboo'},{label:'Approccio',href:'/studio/approccio'},{label:'Partnership',href:'/studio/partnership'},{label:'Team',href:'/studio/team'},{label:'Contatti',href:'/studio/contatti'}],footerTitle:'BRADIBOO',footerItems:[{label:'Mappa del sito',href:'/mappa-sito'},{label:'Bradiboo Studio',href:'/studio'},{label:'Contatti',href:'/studio/contatti'}],footerNote:'Quality time for a better tomorrow'}});
console.log('Guarda/ZAP!, mappa, navigazione condivisa e Studio allineati. Fonti registrate sulle pagine.');
await payload.destroy();
