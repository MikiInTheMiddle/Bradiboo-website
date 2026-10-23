import {createLocalReq,getAccessResults,type Payload,type TypedUser} from 'payload';
import {getFieldPaths} from 'payload/shared';
export async function selectZapAdminTab(payload:Payload,user:TypedUser):Promise<boolean>{
 const req=await createLocalReq({user},payload);
 const permissions=await getAccessResults({req});if(!permissions.globals?.watch?.read)return false;
 const global=payload.config.globals.find(g=>g.slug==='watch');if(!global)return false;
 const index=global.fields.findIndex(f=>f.type==='tabs');const field=global.fields[index];if(!field||field.type!=='tabs')return false;
 const zapIndex=field.tabs.findIndex(t=>t.label==='ZAP!');if(zapIndex<0)return false;
 // Payload's actual path for an unnamed root tab is _index-N, not tabs-N.
 const {path}=getFieldPaths({field,index,parentIndexPath:'',parentPath:'',parentSchemaPath:'watch'});
 const key='global-watch';
 const current=(await payload.find({collection:'payload-preferences',req,overrideAccess:false,where:{and:[{key:{equals:key}},{'user.value':{equals:user.id}},{'user.relationTo':{equals:user.collection}}]},limit:1,depth:0})).docs[0];
 const value=(current?.value||{}) as {fields?:Record<string,unknown>;[key:string]:unknown};
 const data={key,user:{relationTo:user.collection,value:user.id},value:{...value,fields:{...value.fields,[path]:{...(value.fields?.[path] as object||{}),tabIndex:zapIndex}}}};
 // Passing req is essential: Payload's preference hook takes user from req.user.
 if(current)await payload.update({collection:'payload-preferences',id:current.id,data,req,overrideAccess:false});
 else await payload.create({collection:'payload-preferences',data,req,overrideAccess:false});
 return true;
}
