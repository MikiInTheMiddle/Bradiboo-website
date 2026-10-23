import type {Access,Payload,Where,CheckboxField} from 'payload';
const id=(value:any)=>value&&typeof value==='object'?value.id:value;
const published=(doc:any)=>!doc._status||doc._status==='published';
export const exploreVisibilityField:CheckboxField={name:'showInExplore',label:'Mostra in Esplora',type:'checkbox',defaultValue:true,admin:{description:'Riguarda solo il menu Esplora. Per nascondere tutto il ramo già online usa Annulla pubblicazione.'}};
type Publication=Awaited<ReturnType<typeof loadPublication>>;
const snapshots=new WeakMap<Payload,{expires:number;value:Promise<Publication>}>();
const pagePaths=new WeakMap<Publication,Promise<string[]>>();
export function invalidateBranchPublication({req,doc}:any){snapshots.delete(req.payload);return doc;}
/** Share the small hierarchy snapshot across nested access checks, never full documents. */
export function branchPublication(payload:Payload):Promise<Publication>{
 const cached=snapshots.get(payload);if(cached&&cached.expires>Date.now())return cached.value;
 const value=loadPublication(payload);snapshots.set(payload,{expires:Date.now()+1000,value});
 void value.catch(()=>{if(snapshots.get(payload)?.value===value)snapshots.delete(payload);});
 return value;
}
async function loadPublication(payload:Payload){
 const [containers,contents]=await Promise.all([
  payload.find({collection:'production-containers',limit:10000,depth:0,overrideAccess:true,draft:false,select:{id:true,_status:true,url:true}}),
  payload.find({collection:'contents',limit:10000,depth:0,overrideAccess:true,draft:false,select:{id:true,_status:true,url:true,slug:true,container:true,parent:true,recordType:true}}),
 ]);
 const hiddenContainers=new Set(containers.docs.filter(c=>!published(c)).map(c=>c.id));
 const hiddenContents=new Set(contents.docs.filter(c=>!published(c)||hiddenContainers.has(id(c.container))).map(c=>c.id));
 for(const c of contents.docs)if(c.recordType==='episode'&&hiddenContents.has(id(c.parent)))hiddenContents.add(c.id);
 const urls=[...containers.docs.filter(c=>hiddenContainers.has(c.id)),...contents.docs.filter(c=>hiddenContents.has(c.id))].flatMap(c=>c.url?.startsWith('/')&&!c.url.includes('?')?[c.url.replace(/\/$/,'')]:[]);
 const links=contents.docs.filter(c=>hiddenContents.has(c.id)).flatMap(c=>[c.url,`/guarda?contenuto=${encodeURIComponent(c.slug)}#watch-player`]).filter(Boolean) as string[];
 return {hiddenContainers,hiddenContents,urls,links};
}
export function hiddenBranchPath(path:string,state:Awaited<ReturnType<typeof branchPublication>>){return state.links.includes(path)||state.urls.some(url=>path===url||path.startsWith(url+'/'));}
export function hiddenBranchPage(page:any,state:Awaited<ReturnType<typeof branchPublication>>){
 const source=page.galleryContext;
 return hiddenBranchPath(page.path,state)||source?.relationTo==='contents'&&state.hiddenContents.has(id(source.value))||source?.relationTo==='production-containers'&&state.hiddenContainers.has(id(source.value));
}
export function branchRead(kind:'contents'|'production-containers'|'pages'):Access{return async({req})=>{
 if(req.user)return true;
 const state=await branchPublication(req.payload);
 if(kind==='production-containers')return {and:[{_status:{equals:'published'}},{id:{not_in:[...state.hiddenContainers]}}]} as Where;
 if(kind==='contents')return {and:[{_status:{equals:'published'}},{id:{not_in:[...state.hiddenContents]}}]} as Where;
 if(!state.hiddenContainers.size&&!state.hiddenContents.size)return {_status:{equals:'published'}};
 if(!pagePaths.has(state))pagePaths.set(state,(async()=>{
  const pages=await req.payload.find({collection:'pages',limit:10000,depth:0,overrideAccess:true,draft:false,select:{path:true,galleryContext:true}});
  return pages.docs.filter(page=>hiddenBranchPage(page,state)).map(page=>page.path);
 })());
 const paths=await pagePaths.get(state)!;
 return {and:[{_status:{equals:'published'}},{path:{not_in:paths}}]} as Where;
};}
