import {createLocalReq,getPayload} from 'payload';
import type {Client} from '@libsql/client';
import {installMediaPublicationIndex} from '../lib/media-publication-index';
import {rebuildMediaPublicationIndex} from '../lib/published-media';
if(process.env.MEDIA_INDEX_APPLY!=='true')throw Error('Explicit MEDIA_INDEX_APPLY=true is required');
if(process.env.MEDIA_INDEX_ENV_FILE)process.loadEnvFile(process.env.MEDIA_INDEX_ENV_FILE);
if(process.env.TURSO_DATABASE_URL)process.env.DATABASE_URL=process.env.TURSO_DATABASE_URL;
process.env.PAYLOAD_SCHEMA_PUSH='false';
Object.assign(process.env,{NODE_ENV:'production'});
const {default:config}=await import('../payload.config');
const p=await getPayload({config});
try{
 const client=(p.db as unknown as {client:Client}).client;
 const roots=['pages','contents','characters','production_containers',...p.config.globals.map(g=>g.slug.replaceAll('-','_'))];
 const tables=await installMediaPublicationIndex(client,roots);
 const ids=await rebuildMediaPublicationIndex(await createLocalReq({},p));
 console.log(`Publication index ready: ${ids.length} references; transactional invalidation on ${tables} editorial tables.`);
}finally{await p.destroy();}
