import assert from 'node:assert/strict';
import {databaseFetchWithReconnect} from '../lib/database-fetch';
const failure=(code:string)=>new TypeError('fetch failed',{cause:Object.assign(new Error('transport'),{code})});
let calls=0;
const reconnect=databaseFetchWithReconnect(async request=>{calls++;assert.equal((request as Request).headers.get('connection'),'close');assert.equal(await (request as Request).text(),'preserved body');if(calls<3)throw failure('UND_ERR_CONNECT_TIMEOUT');return new Response('ok');});
assert.equal(await (await reconnect('https://example.test',{method:'POST',body:'preserved body'})).text(),'ok');assert.equal(calls,3);
for(const code of ['UND_ERR_SOCKET','UND_ERR_HEADERS_TIMEOUT','ECONNRESET']){calls=0;await assert.rejects(databaseFetchWithReconnect(async()=>{calls++;throw failure(code);})('https://example.test'));assert.equal(calls,1);}
calls=0;await assert.rejects(databaseFetchWithReconnect(async()=>{calls++;throw failure('UND_ERR_CONNECT_TIMEOUT');})('https://example.test'));assert.equal(calls,3);
calls=0;assert.equal((await databaseFetchWithReconnect(async()=>{calls++;return new Response('error',{status:503});})('https://example.test')).status,503);assert.equal(calls,1);
console.log('OK: reconnect before sending only; bounded retries; request body preserved; no ambiguous write/HTTP replay.');
