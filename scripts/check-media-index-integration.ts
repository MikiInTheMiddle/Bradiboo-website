import assert from 'node:assert/strict';
import {getPayload,createLocalReq} from 'payload';
import type {Client} from '@libsql/client';
import {installMediaPublicationIndex} from '../lib/media-publication-index';
import {rebuildMediaPublicationIndex} from '../lib/published-media';
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw Error('Disposable test database required');
const {default:config}=await import('../payload.config');
const p=await getPayload({config});
try{
 process.env.MEDIA_PUBLICATION_INDEX='false';
 const baseline=await p.find({collection:'media',depth:0,limit:1000,overrideAccess:false,user:null});
 const client=(p.db as unknown as {client:Client}).client;
 await installMediaPublicationIndex(client,['pages','contents','characters','production_containers',...p.config.globals.map(g=>g.slug.replaceAll('-','_'))]);
 await rebuildMediaPublicationIndex(await createLocalReq({},p));
 process.env.MEDIA_PUBLICATION_INDEX='true';
 const indexed=await p.find({collection:'media',depth:0,limit:1000,overrideAccess:false,user:null});
 assert.deepEqual(indexed.docs.map(d=>d.id).sort(),baseline.docs.map(d=>d.id).sort(),'Index must preserve the existing anonymous permission set');
 const users=await p.find({collection:'users',depth:0,limit:1});
 const all=await p.find({collection:'media',depth:0,limit:1000,overrideAccess:false,user:users.docs[0]});
 assert.ok(all.docs.length>indexed.docs.length,'An authenticated editor must still see private media');
 console.log(`Integration passed: ${indexed.docs.length} public media; ${all.docs.length-indexed.docs.length} private files available only to the editor.`);
}finally{await p.destroy();}
