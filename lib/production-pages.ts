import type {CollectionAfterChangeHook,CollectionBeforeValidateHook} from 'payload';
const id=(value:any)=>value&&typeof value==='object'?value.id:value;
/** Stable defaults only for new destinations; existing URLs remain authoritative. */
export const containerPageURL:CollectionBeforeValidateHook=({data,originalDoc})=>{
 if(data&&!(data.url===undefined?originalDoc?.url:data.url)&&(data.slug||originalDoc?.slug))data.url=`/guarda/${data.slug||originalDoc.slug}`;
 return data;
};
export const productionPageURL:CollectionBeforeValidateHook=async({data,originalDoc,req})=>{
 if(!data)return data;
 const url=data.url===undefined?originalDoc?.url:data.url;
 const slug=data.slug||originalDoc?.slug;
 if(url||!slug)return data;
 if(data.recordType==='episode'){data.url=`/guarda?contenuto=${encodeURIComponent(slug)}#watch-player`;return data;}
 const container=data.container===undefined?originalDoc?.container:data.container;
 if(data.recordType!=='production'||!container)return data;
 const parent=await req.payload.findByID({collection:'production-containers',id:id(container),depth:0,req});
 data.url=`${(parent.url||`/guarda/${parent.slug}`).replace(/\/$/,'')}/${slug}`;
 return data;
};
export function hierarchyPageBlocks(doc:any,relation:'contents'|'production-containers'){
 const container=relation==='production-containers';
 return [
  {blockType:'hero',label:container?'Presentazione del contenitore':'Presentazione della produzione',title:doc.title,presentation:'wide',wideOverlayOpacity:0,showBadge:false,items:[{label:doc.title,sourceMode:'linked',source:{relationTo:relation,value:doc.id}}]},
  {blockType:'collection',label:container?'Produzioni del contenitore':'Episodi della produzione',title:container?'Le produzioni':'Gli episodi',mode:'manual',presentation:'cards',contentSelection:{enabled:true,by:container?'container':'production',...(container?{container:doc.id,kind:'production'}:{production:doc.id,kind:'episode'}),limit:100,sort:'oldest'},cardAppearance:{cardFunction:container?'content':'video',composition:container?'stacked':'half'}},
 ];
}
export const ensureHierarchyPage=(relation:'contents'|'production-containers'):CollectionAfterChangeHook=>async({doc,req,context})=>{
 if(context.skipHierarchyPage||doc._status==='draft'||relation==='contents'&&(doc.recordType!=='production'||doc._status!=='published'))return doc;
 const path=doc.url;if(typeof path!=='string'||!path.startsWith('/guarda/')||path.includes('?')||path.includes('#'))return doc;
 const existing=await req.payload.find({collection:'pages',where:{path:{equals:path}},limit:1,depth:0,req});
 if(existing.docs.length)return doc;
 await req.payload.create({collection:'pages',req,context:{...context,skipHierarchyPage:true},data:{title:doc.title,path,group:relation==='contents'?'Produzione':'Contenitore',purpose:'Pagina collegata alla scheda centrale: presentazione e raccolta automatica.',galleryContext:{relationTo:relation,value:doc.id},blocks:hierarchyPageBlocks(doc,relation) as any,_status:'published'}});
 return doc;
};
