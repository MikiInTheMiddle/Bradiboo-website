import {createClient} from '@libsql/client';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {installMediaPublicationIndex} from '../lib/media-publication-index.ts';
if(!process.argv[2]?.startsWith('/private/tmp/'))throw Error('Temporary environment file required');
process.loadEnvFile(process.argv[2]);
const client=createClient({url:process.env.TURSO_DATABASE_URL,authToken:process.env.TURSO_AUTH_TOKEN});
const hash=rows=>createHash('sha256').update(JSON.stringify(rows)).digest('hex');
try{
 const tx=await client.transaction('write');
 try{
  const tables=['navigation','pages','characters'];const before=await Promise.all(tables.map(async table=>hash((await tx.execute(`SELECT * FROM "${table}" ORDER BY id`)).rows)));
  for(const sql of fs.readFileSync('scripts/site-settings-schema.sql','utf8').replace(/^--.*$/gm,'').split(';').map(s=>s.trim()).filter(Boolean))await tx.execute(sql);
  for(let i=0;i<tables.length;i++)if(hash((await tx.execute(`SELECT * FROM "${tables[i]}" ORDER BY id`)).rows)!==before[i])throw Error('Existing editorial data changed');
  if((await tx.execute('PRAGMA foreign_key_check')).rows.length)throw Error('Invalid foreign keys');
  await tx.commit();
 }catch(error){await tx.rollback();throw error;}
 const count=await installMediaPublicationIndex(client,['site_settings']);
 console.log(`Global settings schema ready; publication triggers installed on ${count} table; existing editorial rows unchanged.`);
}finally{client.close();}
