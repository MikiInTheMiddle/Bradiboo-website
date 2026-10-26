import {createServer} from 'node:http';
import {createClient} from '@libsql/client/http';
import {publicRead} from '../../../../../../lib/public-cache';
import {databaseFetchWithReconnect} from '../../../../../../lib/database-fetch';
export const dynamic='force-dynamic';
const read=publicRead('isolated-patched-fetch-deadline',async()=>{
 const server=createServer(()=>{});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const client=createClient({url:`http://127.0.0.1:${server.address().port}`,fetch:databaseFetchWithReconnect(globalThis.fetch,100)});
 const started=Date.now();
 try{
  await client.execute('SELECT 1');return {bounded:false};
 }catch{return {bounded:Date.now()-started<1500};}
 finally{client.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
},2);
export async function GET(){return Response.json(await read());}
