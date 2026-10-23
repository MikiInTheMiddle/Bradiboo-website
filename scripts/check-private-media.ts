import assert from 'node:assert/strict';
import {getPayload} from 'payload';
import config from '../payload.config';
import {collectMediaReferences} from '../lib/published-media';
const fields:any=[{name:'image',type:'upload',relationTo:'media'},{name:'items',type:'array',fields:[{name:'image',type:'upload',relationTo:'media'}]},{name:'blocks',type:'blocks',blocks:[{slug:'test',fields:[{name:'image',type:'upload',relationTo:'media'}]}]}];
assert.deepEqual([...collectMediaReferences(fields,{image:2,items:[{image:3}],blocks:[{blockType:'test',image:4,draft:true}]})],[2,3]);
if(!process.env.DATABASE_URL?.startsWith('file:/private/tmp/'))throw Error('Disposable local database required');
const p=await getPayload({config});
try {
 const table:any=p.db.tables.media;
 console.log('Storage columns:',Object.entries(table).filter(([key])=>key==='prefix'||key==='_objectKey').map(([key,col]:any)=>[key,col.name]));
 const all=await p.find({collection:'media',limit:1000,depth:0});
 const publicFiles=await p.find({collection:'media',limit:1000,depth:0,overrideAccess:false,user:null});
 assert.ok(publicFiles.docs.length>0,'Published pages must expose their referenced images');
 assert.ok(publicFiles.docs.length<all.docs.length,'Unused images must remain private');
 console.log(`Media access: ${publicFiles.totalDocs} published references; ${all.totalDocs-publicFiles.totalDocs} private files.`);
}finally{await p.destroy();}
