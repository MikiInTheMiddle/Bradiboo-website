import assert from 'node:assert/strict';
import {databaseFetchWithReconnect} from '../lib/database-fetch';
const failure=(code:string)=>new TypeError('fetch failed',{cause:Object.assign(new Error('transport'),{code})});
let calls=0;
const reconnect=databaseFetchWithReconnect(async(input,init)=>{calls++;assert.equal(await new Request(input,init).text(),'preserved body');if(calls<3)throw failure('UND_ERR_CONNECT_TIMEOUT');return new Response('ok');});
assert.equal(await (await reconnect('https://example.test',{method:'POST',body:'preserved body'})).text(),'ok');assert.equal(calls,3);
for(const code of ['UND_ERR_SOCKET','UND_ERR_HEADERS_TIMEOUT','ECONNRESET']){calls=0;await assert.rejects(databaseFetchWithReconnect(async()=>{calls++;throw failure(code);})('https://example.test'));assert.equal(calls,1);}
calls=0;await assert.rejects(databaseFetchWithReconnect(async()=>{calls++;throw failure('UND_ERR_CONNECT_TIMEOUT');})('https://example.test'));assert.equal(calls,3);
calls=0;assert.equal((await databaseFetchWithReconnect(async()=>{calls++;return new Response('error',{status:503});})('https://example.test')).status,503);assert.equal(calls,1);
console.log('OK: reconnect before sending only; bounded retries; request body preserved; no ambiguous write/HTTP replay.');
const waiting:typeof fetch=async(input,init)=>new Promise((_,reject)=>{const signal=init?.signal||(input as Request).signal;if(signal.aborted){reject(signal.reason);return;}signal.addEventListener('abort',()=>reject(signal.reason),{once:true});});
const started=Date.now();const hold=setTimeout(()=>{},1000);
try{await assert.rejects(databaseFetchWithReconnect(waiting,20)('https://example.test'));assert.ok(Date.now()-started<500);}finally{clearTimeout(hold);}
const controller=new AbortController();controller.abort();await assert.rejects(databaseFetchWithReconnect(waiting)('https://example.test',{signal:controller.signal}).then(()=>{throw Error('Unexpected success');}));
console.log('OK: transport deadline bounds database waits.');
// Exercise the installed libSQL driver, not only the wrapper in isolation.
const {createClient}=await import('@libsql/client/http');
const sdkHold=setTimeout(()=>{},1500);
const sdkStart=Date.now();const sdk=createClient({url:'https://example.test',fetch:databaseFetchWithReconnect(waiting,25)});
try{await assert.rejects(sdk.execute('SELECT 1'));assert.ok(Date.now()-sdkStart<500);}finally{sdk.close();clearTimeout(sdkHold);}
console.log('OK: installed libSQL HTTP driver honors the deadline.');
const stalledBody:typeof fetch=async(input,init)=>new Response(new ReadableStream({start(stream){const signal=init?.signal||(input as Request).signal;signal.addEventListener('abort',()=>stream.error(signal.reason),{once:true});}}));
const bodyStart=Date.now();await assert.rejects(databaseFetchWithReconnect(stalledBody,25)('https://example.test'));assert.ok(Date.now()-bodyStart<500);
console.log('OK: stalled response body is bounded too.');
