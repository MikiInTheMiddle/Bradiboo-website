import {createClient} from '@libsql/client';
import {createHash} from 'node:crypto';
process.loadEnvFile('/private/tmp/bradiboo-production.env');
const local=createClient({url:process.env.SOURCE_DATABASE_URL||'file:./bradiboo.db'});
const remote=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
try {
 const logical=process.env.COMPARE_EDITORIAL_DATA==='true';
 const ephemeral=new Set(['users_sessions','payload_preferences','payload_preferences_rels']);
 const tables=(await local.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")).rows.map(r=>r.name).filter(t=>!logical||!ephemeral.has(t));
 const hash=(result,table)=>{
  const ignoreRelationID=logical&&table.endsWith('_rels');
  const cols=result.columns.filter(c=>!ignoreRelationID||c!=='id').sort();
  const rows=result.rows.map(row=>JSON.stringify(cols.map(col=>row[col])));
  // Physical rowid order can change when Payload rewrites an array. Array order
  // lives in explicit order columns and is still included in this comparison.
  rows.sort();
  return createHash('sha256').update(JSON.stringify(rows)).digest('hex');
 };
 for(let i=0;i<tables.length;i+=10){
  const sql=tables.slice(i,i+10).map(t=>`SELECT * FROM "${t.replaceAll('"','""')}" ORDER BY rowid`);
  const [a,b]=await Promise.all([local.batch(sql,'read'),remote.batch(sql,'read')]);
  for(let j=0;j<a.length;j++)if(hash(a[j],tables[i+j])!==hash(b[j],tables[i+j]))throw Error(`Data mismatch: ${tables[i+j]}`);
 }
 const integrity=await remote.execute('PRAGMA foreign_key_check');
 if(integrity.rows.length)throw Error('Foreign keys invalid');
 console.log(`Verified ${logical?'equivalent editorial':'identical'} data in ${tables.length} tables; foreign keys valid.`);
}finally{local.close();remote.close();}
