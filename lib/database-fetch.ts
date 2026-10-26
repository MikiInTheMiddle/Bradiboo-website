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
  if(original.signal.aborted)cancel();else original.signal.addEventListener('abort',cancel,{once:true});
  const timer=setTimeout(()=>controller.abort(new DOMException('Database request deadline exceeded','TimeoutError')),deadlineMs);
  let rejectAbort:(reason:unknown)=>void=()=>{};
  const aborted=new Promise<never>((_,reject)=>{rejectAbort=reject;});
  const onAbort=()=>rejectAbort(controller.signal.reason);
  controller.signal.addEventListener('abort',onAbort,{once:true});
  const exchange=async()=>{
   controller.signal.throwIfAborted();
   const body=['GET','HEAD'].includes(original.method)?undefined:await original.arrayBuffer();
   for(let attempt=0;;attempt++){
    try{
     controller.signal.throwIfAborted();
     // URL + explicit init preserves the signal through Next's patched fetch.
     // SQL transport must never be cached; only the published DTO above it is.
     const response=await fetcher(original.url,{method:original.method,headers:original.headers,body,signal:controller.signal,cache:'no-store',redirect:original.redirect});
     const bytes=await response.arrayBuffer();
     return new Response([204,205,304].includes(response.status)?null:bytes,{status:response.status,statusText:response.statusText,headers:response.headers});
    }catch(error){
     if(attempt>=2||controller.signal.aborted||!failedBeforeSending(error))throw error;
     await new Promise(resolve=>setTimeout(resolve,150*(attempt+1)));
    }
   }
  };
  try{return await Promise.race([exchange(),aborted]);}
  finally{clearTimeout(timer);original.signal.removeEventListener('abort',cancel);controller.signal.removeEventListener('abort',onAbort);}
 };
}
