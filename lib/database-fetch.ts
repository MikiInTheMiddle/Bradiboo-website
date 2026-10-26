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
  const controller=new AbortController();
  const cancel=()=>controller.abort(original.signal.reason);
  if(original.signal.aborted)cancel();
  else original.signal.addEventListener('abort',cancel,{once:true});
  // Keep the controller strongly referenced for the complete libSQL response.
  // Buffer SQL responses here so a stalled body is bounded too, not just headers.
  const timer=setTimeout(()=>controller.abort(new DOMException('Database request deadline exceeded','TimeoutError')),deadlineMs);
  const request=new Request(original,{signal:controller.signal});
  try{
   for(let attempt=0;;attempt++){
    try{
     request.signal.throwIfAborted();
     const response=await fetcher(request.clone(),{signal:controller.signal});
     const body=await response.arrayBuffer();
     return new Response([204,205,304].includes(response.status)?null:body,{status:response.status,statusText:response.statusText,headers:response.headers});
    }catch(error){
     if(attempt>=2||controller.signal.aborted||!failedBeforeSending(error))throw error;
     await new Promise(resolve=>setTimeout(resolve,150*(attempt+1)));
    }
   }
  }finally{clearTimeout(timer);original.signal.removeEventListener('abort',cancel);}
 };
}
