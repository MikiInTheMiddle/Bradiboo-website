import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {createClient} from '@libsql/client/http';
import {databaseFetchWithReconnect} from '../lib/database-fetch';
let mode='headers';
const server=createServer((_req,res)=>{if(mode==='body'){res.writeHead(200,{'Content-Type':'application/json'});res.write('{');}});
await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=(server.address() as {port:number}).port;
try{
 for(mode of ['headers','body']){
  const client=createClient({url:`http://127.0.0.1:${port}`,fetch:databaseFetchWithReconnect(globalThis.fetch,100)});
  const started=Date.now();
  try{await assert.rejects(client.execute('SELECT 1'));assert.ok(Date.now()-started<1500,`Unbounded ${mode} wait`);}finally{client.close();}
 }
 console.log('PASS: real libSQL + native fetch aborts stalled headers and stalled body against an isolated HTTP server.');
}finally{server.closeAllConnections();await new Promise<void>(resolve=>server.close(()=>resolve()));}
