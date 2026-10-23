import assert from 'node:assert/strict';
import fs from 'node:fs';
import {randomUUID} from 'node:crypto';
import {createClient} from '@libsql/client';
import {indexedPublishedMedia,installMediaPublicationIndex} from '../lib/media-publication-index';
const file='/private/tmp/bradiboo-index-test-'+randomUUID()+'.db';
const client=createClient({url:'file:'+file});
try {
 await client.batch([
  'CREATE TABLE pages(id INTEGER PRIMARY KEY, published INTEGER, media INTEGER)',
  'CREATE TABLE pages_items(id INTEGER PRIMARY KEY, media INTEGER)',
  'INSERT INTO pages VALUES(1,1,7),(2,1,7),(3,0,9)',
 ],'write');
 assert.equal(await installMediaPublicationIndex(client,['pages']),2);
 let scans=0;
 const collect=async()=>{scans++;return (await client.execute('SELECT media FROM pages WHERE published=1')).rows.map(r=>Number(r.media));};
 const read=()=>indexedPublishedMedia(client,collect);
 assert.deepEqual(await read(),[7]);
 await Promise.all(Array.from({length:20},read));
 assert.equal(scans,1,'Clean index does not scan documents again');
 await client.execute('UPDATE pages SET published=0 WHERE id=1');
 assert.deepEqual(await read(),[7],'A second published reference keeps the media visible');
 await client.execute('DELETE FROM pages WHERE id=2');
 assert.deepEqual(await read(),[],'Deleting the last published reference revokes the media');
 await client.execute('UPDATE pages SET published=1 WHERE id=3');
 assert.deepEqual(await read(),[9],'Publishing grants only the referenced media');
 await client.execute('UPDATE pages SET media=11 WHERE id=3');
 assert.deepEqual(await read(),[11],'Changing a reference revokes the old file');
 const state=()=>client.execute('SELECT revision FROM bradiboo_media_publication_state');
 const previous=(await state()).rows[0].revision;
 const tx=await client.transaction('write');await tx.execute('UPDATE pages SET media=99 WHERE id=3');await tx.rollback();
 assert.equal((await state()).rows[0].revision,previous,'Rolled-back edits do not invalidate committed publication');
 await client.execute('INSERT INTO pages_items VALUES(1,7)');
 assert.notEqual((await state()).rows[0].revision,previous,'Nested editorial tables invalidate in the same transaction');
 let changed=false;
 const racing=async()=>{const ids=await collect();if(!changed){changed=true;await client.execute('UPDATE pages SET published=0 WHERE id=3');}return ids;};
 assert.deepEqual(await indexedPublishedMedia(client,racing),[],'An edit during rebuild cannot install stale grants');
 await client.execute('UPDATE pages SET published=1 WHERE id=3');
 await assert.rejects(()=>indexedPublishedMedia(client,async()=>{throw Error('scan failed');}),/scan failed/);
 assert.deepEqual(await read(),[11],'A failed rebuild recovers without serving the old snapshot');
 console.log('Publication, shared references, unpublish, deletion, replacement, transaction rollback, nested edits, rebuild races and failure recovery passed.');
} finally {client.close();fs.rmSync(file,{force:true});}
