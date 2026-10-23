// Imports a reviewed SQLite dump only into an empty database, in one transaction.
import fs from 'node:fs';
import { createClient } from '@libsql/client';
const env = process.loadEnvFile('/private/tmp/bradiboo-production.env');
const client = createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
if(tables.rows.length) throw Error('Destination is not empty; refusing to overwrite it.');
const dump=JSON.parse(fs.readFileSync('/private/tmp/bradiboo-database-export.json','utf8'));
// Referenced tables must exist before inserts, even with deferred constraints.
const statements=[...dump.filter(s=>s.startsWith('CREATE TABLE ')),...dump.filter(s=>!s.startsWith('CREATE TABLE '))];
const tx=await client.transaction('write');
try {
  await tx.execute('PRAGMA defer_foreign_keys=ON');
  for(let start=0;start<statements.length;start+=400){
    await tx.batch(statements.slice(start,start+400));
    if(start%2000===0)console.log(`Imported ${Math.min(start+400,statements.length)}/${statements.length} statements`);
  }
  const errors=await tx.execute('PRAGMA foreign_key_check');
  if(errors.rows.length)throw Error(`Foreign key violations: ${errors.rows.length}`);
  await tx.commit();
  console.log('Import committed; foreign keys valid.');
}catch(error){await tx.rollback();throw error;}finally{client.close();}
