import {execFileSync} from 'node:child_process';
import {readFile,mkdir,writeFile,copyFile,access} from 'node:fs/promises';
import path from 'node:path';
import {getPayload} from 'payload';
import config from '../payload.config';
execFileSync('python3',['scripts/audit-unused-media.py'],{stdio:'inherit'});
const report=JSON.parse(await readFile('work/reports/media-unused-audit-20261020.json','utf8'));
const stamp=new Date().toISOString().replace(/[:.]/g,'-');
const backup=path.resolve('work/backups',`unused-media-${stamp}`);await mkdir(backup,{recursive:true});
execFileSync('python3',['-c','import sqlite3,sys; a=sqlite3.connect("bradiboo.db"); b=sqlite3.connect(sys.argv[1]); a.backup(b); b.close(); a.close()',path.join(backup,'before-cleanup.db')]);
const p=await getPayload({config});
try{
 const archived=[];
 for(const candidate of report.unused){
  const media=await p.findByID({collection:'media',id:candidate.id,depth:0});
  if(media.filename!==candidate.filename)throw new Error('Media cambiato durante la verifica');
  const filenames=new Set<string>();
  const walk=(obj:any)=>{if(!obj||typeof obj!=='object')return;for(const [key,value] of Object.entries(obj)){if(key==='filename'&&typeof value==='string')filenames.add(path.basename(value));else if(typeof value==='object')walk(value);}};walk(media);
  for(const file of filenames){const source=path.resolve('media',file);await access(source);await copyFile(source,path.join(backup,file));}
  await writeFile(path.join(backup,`media-${media.id}.json`),JSON.stringify(media,null,2));
  await p.delete({collection:'media',id:media.id});archived.push({id:media.id,filename:media.filename});
 }
 await writeFile(path.join(backup,'manifest.json'),JSON.stringify({archived,historicalRetained:report.historicalOnly},null,2));
 console.log('Rimossi dalla libreria e archiviati:',archived,'Backup:',backup);
}finally{await p.destroy();}
