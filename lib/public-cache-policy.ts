/** Withdrawals must remove the old copy immediately; ordinary edits can keep
 * the last published copy available while the new one refreshes. */
export function withdrawsPublicContent(doc:any,previousDoc?:any){
 if(doc?._status==='draft'&&previousDoc?._status==='published')return true;
 return (doc?.blocks||[]).some((block:any)=>block.draft===true&&(previousDoc?.blocks||[]).some((old:any)=>old.id===block.id&&old.draft!==true));
}
