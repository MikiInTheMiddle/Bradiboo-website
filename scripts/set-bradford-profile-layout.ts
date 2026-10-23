import {getPayload} from 'payload';
import config from '../payload.config';
import {writeFile} from 'node:fs/promises';
const p=await getPayload({config});
try{
 const page=(await p.find({collection:'pages',where:{path:{equals:'/braditriboo/bradford'}},depth:0})).docs[0];
 if(!page)throw Error('Pagina Bradford non trovata');
 await writeFile(`work/backups/bradford-layout-${Date.now()}.json`,JSON.stringify(page,null,2));
 const blocks=page.blocks!.map(b=>b.blockType==='characterProfile'?{...b,cardLayout:'compact' as const}:b);
 const saved=await p.update({collection:'pages',id:page.id,data:{blocks},depth:0});
 const normalize=(rows:any[])=>rows.map(({cardLayout,...b})=>b);
 if(JSON.stringify(normalize(page.blocks!))!==JSON.stringify(normalize(saved.blocks!)))throw Error('Altri valori modificati: verificare backup');
 console.log('Bradford: solo disposizione Scheda personaggio aggiornata a Fila compatta.');
}finally{await p.destroy();}
