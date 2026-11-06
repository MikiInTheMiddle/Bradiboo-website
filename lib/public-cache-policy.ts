/** Withdrawals must remove the old copy immediately; ordinary edits can keep
 * the last published copy available while the new one refreshes. */
export function withdrawsPublicContent(doc:any,previousDoc?:any){
 if(doc?._status==='draft'&&previousDoc?._status==='published')return true;
 return (doc?.blocks||[]).some((block:any)=>block.draft===true&&(previousDoc?.blocks||[]).some((old:any)=>old.id===block.id&&old.draft!==true));
}

/** Draft autosaves must not invalidate public pages. An explicit unpublish
 * (draft=false) still expires the old public version immediately. */
export function skipsPublicInvalidation({doc,previousDoc,req,deleted=false}:any){
 if(deleted||doc?._status!=='draft')return false;
 if(req?.query?.draft===true||req?.query?.draft==='true')return true;
 // After a saved draft, previousDoc may itself be a draft even when a live
 // version exists. Only draft=true proves this is a non-public autosave.
 return !previousDoc;
}
export function changesPublicHierarchy(slug:string,doc:any,previousDoc?:any){
 if(!['contents','production-containers'].includes(slug))return false;
 const id=(value:any)=>value&&typeof value==='object'?value.id:value;
 return ['_status','url','recordType','container','parent'].some(key=>id(doc?.[key])!==id(previousDoc?.[key]));
}

/** Editing an episode description must not regenerate every page's menu. */
export function changesPublicNavigation(slug:string,doc:any,previousDoc?:any){
 if(!['characters','contents','production-containers'].includes(slug))return false;
 if(slug==='contents'&&doc?.recordType!=='production'&&previousDoc?.recordType!=='production')return false;
 const id=(value:any)=>value&&typeof value==='object'?value.id:value;
 return ['name','title','slug','url','_status','showInExplore','recordType','container'].some(key=>id(doc?.[key])!==id(previousDoc?.[key]));
}
