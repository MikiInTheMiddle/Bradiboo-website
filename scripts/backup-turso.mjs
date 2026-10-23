import {createClient} from '@libsql/client';
import fs from 'node:fs';
process.loadEnvFile('/private/tmp/bradiboo-production.env');
const destination=process.env.TURSO_BACKUP_FILE;
if(!destination?.startsWith('work/backups/')||fs.existsSync(destination))throw Error('A new backup path under work/backups is required');
const remote=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
const local=createClient({url:'file:./'+destination});
try {
 const schema=(await remote.execute("SELECT type,name,sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' ORDER BY name")).rows;
 const tables=schema.filter(r=>r.type==='table');
 const tx=await local.transaction('write');
 try{
  await tx.execute('PRAGMA defer_foreign_keys=ON');
  await tx.batch(tables.map(r=>r.sql));
  for(let start=0;start<tables.length;start+=10){
   const group=tables.slice(start,start+10);
   const rows=await remote.batch(group.map(r=>`SELECT * FROM "${r.name}" ORDER BY rowid`),'read');
   for(let j=0;j<group.length;j++){
    const result=rows[j];const sql=`INSERT INTO "${group[j].name}" (${result.columns.map(c=>'"'+c+'"').join(',')}) VALUES (${result.columns.map(()=>'?').join(',')})`;
    for(let k=0;k<result.rows.length;k+=400)await tx.batch(result.rows.slice(k,k+400).map(row=>({sql,args:result.columns.map(c=>row[c])})));
   }
  }
  await tx.batch(schema.filter(r=>r.type!=='table').map(r=>r.sql));
  if((await tx.execute('PRAGMA foreign_key_check')).rows.length)throw Error('Backup foreign keys invalid');
  await tx.commit();fs.chmodSync(destination,0o600);console.log('Verified remote backup: '+destination);
 }catch(error){await tx.rollback();throw error;}
}finally{local.close();remote.close();}
