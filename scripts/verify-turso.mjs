import {createClient} from '@libsql/client';
import {createHash} from 'node:crypto';
process.loadEnvFile('/private/tmp/bradiboo-production.env');
const local=createClient({url:process.env.SOURCE_DATABASE_URL||'file:./bradiboo.db'});
const remote=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
try {
 const tables=(await local.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")).rows.map(r=>r.name);
 const hash=result=>createHash('sha256').update(JSON.stringify(result.rows.map(row=>result.columns.map(col=>row[col])))).digest('hex');
 for(let i=0;i<tables.length;i+=10){
  const sql=tables.slice(i,i+10).map(t=>`SELECT * FROM "${t.replaceAll('"','""')}" ORDER BY rowid`);
  const [a,b]=await Promise.all([local.batch(sql,'read'),remote.batch(sql,'read')]);
  for(let j=0;j<a.length;j++)if(hash(a[j])!==hash(b[j]))throw Error(`Data mismatch: ${tables[i+j]}`);
 }
 const integrity=await remote.execute('PRAGMA foreign_key_check');
 if(integrity.rows.length)throw Error('Foreign keys invalid');
 console.log(`Verified identical data in ${tables.length} tables; foreign keys valid.`);
}finally{local.close();remote.close();}
