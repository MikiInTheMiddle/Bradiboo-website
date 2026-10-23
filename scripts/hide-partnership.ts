import {getPayload} from 'payload';
import config from '../payload.config';
const p=await getPayload({config});
try {
 const nav=await p.findGlobal({slug:'navigation',depth:0});
 await p.updateGlobal({slug:'navigation',data:{studioItems:(nav.studioItems||[]).filter(i=>!i.href?.startsWith('/studio/partnership'))}});
 const pages=await p.find({collection:'pages',where:{path:{like:'/studio/partnership'}},depth:0,limit:100});
 for(const page of pages.docs.filter(p=>p.path==='/studio/partnership'||p.path.startsWith('/studio/partnership/'))) {
  await p.update({collection:'pages',id:page.id,data:{_status:'draft',hideFromSitemap:true,redirectTo:'/studio'}});
  console.log('Conservata in bozza:',page.path);
 }
} finally {await p.destroy();}
