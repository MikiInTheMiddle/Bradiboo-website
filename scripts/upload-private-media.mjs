import fs from 'node:fs/promises';
import path from 'node:path';
import {createClient} from '@libsql/client';
import {put,head,BlobNotFoundError} from '@vercel/blob';
process.loadEnvFile('/private/tmp/bradiboo-production.env');
const local=createClient({url:'file:./bradiboo.db'});
const files=(await local.execute('SELECT id,filename,mime_type,filesize FROM media ORDER BY id')).rows;
local.close();
// Preflight all files before starting transfers.
for(const file of files){
 if(path.basename(file.filename)!==file.filename)throw Error('Invalid media filename');
 const stat=await fs.stat(path.join('media',file.filename));
 if(stat.size!==Number(file.filesize))throw Error(`File size mismatch: media ${file.id}`);
}
let done=0;const queue=[...files];
await Promise.all(Array.from({length:4},async()=>{
 while(queue.length){
  const file=queue.shift();const key=`media/${file.filename}`;
  const existing=await head(key).catch(error=>{if(error instanceof BlobNotFoundError)return null;throw error;});
  if(!existing)await put(key,await fs.readFile(path.join('media',file.filename)),{access:'private',contentType:file.mime_type,addRandomSuffix:false});
  const stored=await head(key);
  if(stored.size!==Number(file.filesize))throw Error(`Uploaded file size mismatch: ${file.id}`);
  done++;if(done%10===0||done===files.length)console.log(`Verified private media: ${done}/${files.length}`);
 }
}));
