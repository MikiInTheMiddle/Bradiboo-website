import {getPayload} from 'payload';import config from '../payload.config';import {isDeepStrictEqual} from 'node:util';import {mkdir,writeFile} from 'node:fs/promises';
const p=await getPayload({config});try{
 const before=(await p.find({collection:'production-containers',limit:10000,depth:0,draft:false})).docs;
 await mkdir('work/backups',{recursive:true});await writeFile(`work/backups/container-versions-${Date.now()}.json`,JSON.stringify(before,null,2));
 for(const c of before){const versions=await p.findVersions({collection:'production-containers',where:{parent:{equals:c.id}},limit:1});if(!versions.totalDocs){await p.update({collection:'production-containers',id:c.id,data:{_status:c._status||'published'},draft:false,context:{skipHierarchyPage:true}});}}
 const after=(await p.find({collection:'production-containers',limit:10000,depth:0,draft:false})).docs;
 const clean=(v:any)=>{const n=structuredClone(v);delete n.updatedAt;return n;};
 for(const c of before){if(!isDeepStrictEqual(clean(c),clean(after.find(x=>x.id===c.id))))throw Error(`Container changed: ${c.id}`);}
 const visible=await p.find({collection:'production-containers',limit:10000,depth:0,draft:true});if(visible.totalDocs!==before.length)throw Error('Admin visibility failed');
 console.log({containersPreserved:before.length,visibleInAdmin:visible.totalDocs,titles:visible.docs.map(x=>x.title)});
}finally{await p.destroy()}
