import assert from 'node:assert/strict';
import fs from 'node:fs';
import {getPayload} from 'payload';
process.loadEnvFile('/private/tmp/bradiboo-production.env');
if(!process.env.TURSO_DATABASE_URL)throw Error('Remote Turso environment required');
process.env.DATABASE_URL=process.env.TURSO_DATABASE_URL;
Object.assign(process.env,{NODE_ENV:'production'});
process.env.PAYLOAD_SCHEMA_PUSH='false';
const {default:config}=await import('../payload.config');
const p=await getPayload({config});
try {
 for(const path of ['/','/braditriboo','/guarda','/shop','/studio']){
  const page=await p.find({collection:'pages',where:{path:{equals:path}},depth:3,limit:1,overrideAccess:false,user:null});
  assert.equal(page.docs.length,1,`Published route missing: ${path}`);
  assert.ok(page.docs[0].blocks?.length,`Empty route: ${path}`);
  console.log('Remote published page and relations verified: '+path);
 }
 const all=await p.find({collection:'media',depth:0,limit:1000});
 const visible=await p.find({collection:'media',depth:0,limit:1000,overrideAccess:false,user:null});
 const ids=new Set(visible.docs.map(d=>d.id));
 assert.ok(visible.totalDocs>0&&visible.totalDocs<all.totalDocs);
 const image=visible.docs.find(m=>m.mimeType?.startsWith('image/'))!;
 const audio=visible.docs.find(m=>m.mimeType?.startsWith('audio/'));
 const hidden=all.docs.find(m=>!ids.has(m.id))!;
 fs.writeFileSync('/private/tmp/bradiboo-http-media-check.json',JSON.stringify({image:{id:image.id,url:image.url,size:image.filesize},audio:audio?{id:audio.id,url:audio.url,size:audio.filesize}:null,hidden:{id:hidden.id,url:hidden.url}}),{mode:0o600});
 console.log(`Remote media access verified: ${visible.totalDocs} referenced, ${all.totalDocs-visible.totalDocs} private.`);
}finally{await p.destroy();}
