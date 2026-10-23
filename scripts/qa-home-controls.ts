import { getPayload } from 'payload';
import config from '../payload.config';
const payload=await getPayload({config});
const args=process.argv;
const existing=await payload.find({collection:'pages',where:{path:{equals:'/qa-home-controls'}},limit:1});
if(args.includes('--clean') || process.env.CLEAN_QA === 'true'){
 for(const p of existing.docs)await payload.delete({collection:'pages',id:p.id});
}else if(!existing.totalDocs){
 await payload.create({collection:'pages',data:{title:'QA controlli Home',path:'/qa-home-controls',_status:'draft',pageBackgroundColor:'mint',blocks:[
 {blockType:'hero',label:'QA Hero',title:'QA Hero nitida',backgroundMode:'own',backgroundOpacity:35,backgroundBlur:4,backgroundColor:'coral',showBadge:true,badge:'QA etichetta',ctaLabel:'Apri Studio',ctaURL:'/studio',showMedia:true,mediaSource:'youtube',youtubeURL:'https://youtu.be/dQw4w9WgXcQ'},
 {blockType:'featured',label:'QA carosello',title:'QA multipli',mode:'manual',cards:[{label:'QA prima',href:'/guarda'},{label:'QA seconda',href:'/studio'}]},
 {blockType:'braditime',label:'QA override',title:'QA attività',draft:true,selectionMode:'manual',locale:'it',limit:2,selections:[{activityID:'3056',customize:true,overrides:{title:'QA titolo personalizzato',description:'QA descrizione personalizzata',ctaLabel:'QA CTA',ctaURL:'/studio'}},{activityID:'206'}]},
 {blockType:'intro',label:'QA nascosto',title:'QA senza etichetta',showBadge:false,badge:'NON MOSTRARE QUESTA ETICHETTA',showMedia:false,mediaSource:'youtube',youtubeURL:'https://youtu.be/aaaaaaaaaaa'},
 ]}});
}
await payload.destroy();
