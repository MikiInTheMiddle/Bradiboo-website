/** Retry only failures establishing a connection: a request has not reached the DB.
 * Never replay a response timeout, closed socket, HTTP error or ambiguous write.
 */
const connectionFailures=new Set(['UND_ERR_CONNECT_TIMEOUT','ECONNREFUSED','ENETUNREACH','EHOSTUNREACH','EAI_AGAIN']);
function failedBeforeSending(error:unknown):boolean {
 let current:any=error;
 for(let depth=0;current&&depth<5;depth++,current=current.cause)if(connectionFailures.has(current.code))return true;
 return false;
}
export function databaseFetchWithReconnect(fetcher:typeof fetch=globalThis.fetch):typeof fetch {
 return async(input,init)=>{
  const request=new Request(input,init);
  // Serverless instances can resume with sockets already closed by the DB proxy.
  // Do not reuse those idle HTTP connections; preserve DB transaction semantics.
  request.headers.set('Connection','close');
  for(let attempt=0;;attempt++){
   try{return await fetcher(request.clone());}
   catch(error){
    if(attempt>=2||request.signal.aborted||!failedBeforeSending(error))throw error;
    await new Promise(resolve=>setTimeout(resolve,150*(attempt+1)));
   }
  }
 };
}
