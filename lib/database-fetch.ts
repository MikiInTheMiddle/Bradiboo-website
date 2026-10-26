/** Retry only failures establishing a connection: a request has not reached the DB.
 * Never replay a response timeout, closed socket, HTTP error or ambiguous write.
 */
const connectionFailures=new Set(['UND_ERR_CONNECT_TIMEOUT','ECONNREFUSED','ENETUNREACH','EHOSTUNREACH','EAI_AGAIN']);
function failedBeforeSending(error:unknown):boolean {
 let current:any=error;
 for(let depth=0;current&&depth<5;depth++,current=current.cause)if(connectionFailures.has(current.code))return true;
 return false;
}
export function databaseFetchWithReconnect(fetcher:typeof fetch=globalThis.fetch,deadlineMs=8000):typeof fetch {
 return async(input,init)=>{
  const original=new Request(input,init);
  const request=new Request(original,{signal:AbortSignal.any([original.signal,AbortSignal.timeout(deadlineMs)])});
  for(let attempt=0;;attempt++){
   try{return await fetcher(request.clone());}
   catch(error){
    if(attempt>=2||request.signal.aborted||!failedBeforeSending(error))throw error;
    await new Promise(resolve=>setTimeout(resolve,150*(attempt+1)));
   }
  }
 };
}
