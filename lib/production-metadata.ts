import {safeLink} from './presentation';
/** Stable IDs for filters plus editorial labels for optional card eyebrows. */
export function productionMetadata(doc:any){
 const parent=doc.parent&&typeof doc.parent==='object'&&doc.parent.id!==doc.id?doc.parent:undefined;
 const container=doc.container&&typeof doc.container==='object'?doc.container:parent?.container&&typeof parent.container==='object'?parent.container:undefined;
 return {
  section:doc.editorialSection||undefined,
  container:container?{id:String(container.id),title:container.title,href:safeLink(container.url)||undefined}:undefined,
  production:parent?{id:String(parent.id),title:parent.title,href:safeLink(parent.url)||undefined}:doc.recordType==='production'?{id:String(doc.id),title:doc.title,href:safeLink(doc.url)||undefined}:undefined,
 };
}
