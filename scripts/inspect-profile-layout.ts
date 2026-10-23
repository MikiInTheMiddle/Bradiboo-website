import {getPayload} from 'payload';import config from '../payload.config';import {readFile,readdir} from 'node:fs/promises';
const p=await getPayload({config});try{
 const file=(await readdir('work/backups')).filter(f=>f.startsWith('bradford-layout-')).sort()[0];const old=JSON.parse(await readFile('work/backups/'+file,'utf8'));const now=await p.findByID({collection:'pages',id:old.id,depth:0});
 function diff(a:any,b:any,path:string){if(JSON.stringify(a)===JSON.stringify(b))return;if(a&&b&&typeof a==='object'&&typeof b==='object'){for(const k of new Set([...Object.keys(a),...Object.keys(b)]))diff(a[k],b[k],path+'.'+k);}else console.log(path,JSON.stringify(a),'→',JSON.stringify(b));}
 diff(old.blocks,now.blocks,'blocks');
}finally{await p.destroy();}
