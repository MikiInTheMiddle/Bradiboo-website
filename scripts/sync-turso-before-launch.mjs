// Initial launch only: reconcile edits made locally after the first snapshot.
import {createClient} from '@libsql/client';
process.loadEnvFile('/private/tmp/bradiboo-production.env');
const local=createClient({url:'file:./bradiboo.db'});
const baseline=createClient({url:process.env.BASELINE_DATABASE_URL||'file:./work/backups/deploy-20261023-122434/bradiboo.db'});
const remote=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
const quote=s=>'"'+s.replaceAll('"','""')+'"';
const changes=[];
try{
 const ephemeral=new Set(['users_sessions','payload_preferences','payload_preferences_rels']);
 const tables=(await local.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name")).rows.map(r=>r.name).filter(t=>!ephemeral.has(t));
 for(let start=0;start<tables.length;start+=10){
  const group=tables.slice(start,start+10);
  const statements=group.map(t=>`SELECT * FROM ${quote(t)} ORDER BY rowid`);
  const [a,b,original]=await Promise.all([local.batch(statements,'read'),remote.batch(statements,'read'),baseline.batch(statements,'read')]);
  for(let j=0;j<group.length;j++){
   const table=group[j],cols=a[j].columns;
   // Refuse any remote editorial changes since import; never overwrite them.
   const originalColumns=original[j].columns;
   const editorialRows=result=>JSON.stringify(result.rows.map(row=>originalColumns.map(c=>row[c])));
   if(editorialRows(b[j])!==editorialRows(original[j]))throw Error('Remote data changed since import; refusing sync: '+table);
   const rows=r=>r.rows.map(row=>cols.map(c=>row[c]));
   if(JSON.stringify(rows(a[j]))===JSON.stringify(rows(b[j])))continue;
   // Payload regenerates relation row IDs on save. Keep existing remote IDs when
   // every logical relationship is identical; no deletion or content change.
   if(table.endsWith('_rels')){
    const logical=result=>JSON.stringify(result.rows.map(row=>JSON.stringify(cols.filter(c=>c!=='id').map(c=>row[c]))).sort());
    if(logical(a[j])===logical(b[j])){console.log('Preserved equivalent relationship IDs: '+table);continue;}
   }
   const info=await local.execute(`PRAGMA table_info(${quote(table)})`);
   const keys=info.rows.filter(c=>Number(c.pk)>0).sort((x,y)=>x.pk-y.pk).map(c=>c.name);
   if(!keys.length)throw Error('Missing primary key: '+table);
   const key=row=>JSON.stringify(keys.map(k=>row[k]));
   const before=new Map(b[j].rows.map(row=>[key(row),JSON.stringify(cols.map(c=>row[c]))]));
   const after=new Set(a[j].rows.map(key));
   for(const row of a[j].rows)if(before.get(key(row))!==JSON.stringify(cols.map(c=>row[c]))){
    changes.push({sql:`INSERT INTO ${quote(table)} (${cols.map(quote).join(',')}) VALUES (${cols.map(()=>'?').join(',')}) ON CONFLICT (${keys.map(quote).join(',')}) DO UPDATE SET ${cols.filter(c=>!keys.includes(c)).map(c=>`${quote(c)}=excluded.${quote(c)}`).join(',')}`,args:cols.map(c=>row[c])});
   }
   for(const row of b[j].rows)if(!after.has(key(row)))throw Error('Local deletion requires review; no rows will be deleted: '+table);
   console.log('Reconciled table: '+table);
  }
 }
 const tx=await remote.transaction('write');
 try{
  await tx.execute('PRAGMA defer_foreign_keys=ON');
  for(let i=0;i<changes.length;i+=100)await tx.batch(changes.slice(i,i+100));
  if((await tx.execute('PRAGMA foreign_key_check')).rows.length)throw Error('Foreign keys invalid');
  await tx.commit();console.log(`Synchronized ${changes.length} changed rows before launch.`);
 }catch(error){await tx.rollback();throw error;}
}finally{local.close();remote.close();baseline.close();}
