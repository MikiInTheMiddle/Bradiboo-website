import assert from 'node:assert/strict';
import {getPayload,createLocalReq,type Where} from 'payload';
import config from '../payload.config';
import {selectZapAdminTab} from '../lib/zap-admin-shortcut';
const payload=await getPayload({config});
try{
 const record=(await payload.find({collection:'users',limit:1})).docs[0];assert.ok(record);
 const user={...record,collection:'users' as const};const req=await createLocalReq({user},payload);
 const where:Where={and:[{key:{equals:'global-watch'}},{'user.value':{equals:user.id}},{'user.relationTo':{equals:'users'}}]};
 await payload.delete({collection:'payload-preferences',where,req,overrideAccess:false});
 assert.equal(await selectZapAdminTab(payload,user),true);
 const first=(await payload.find({collection:'payload-preferences',where,req,overrideAccess:false,depth:0})).docs[0];
 assert.equal((first.value as {fields:Record<string,{tabIndex:number}>}).fields['_index-0'].tabIndex,2);
 assert.equal(first.user.value,user.id);
 await payload.update({collection:'payload-preferences',id:first.id,req,overrideAccess:false,data:{value:{fields:{'_index-0':{tabIndex:0,keep:'preserved'},other:{keep:true}},custom:'unchanged'}}});
 assert.equal(await selectZapAdminTab(payload,user),true);
 const found=await payload.find({collection:'payload-preferences',where,req,overrideAccess:false,depth:0});assert.equal(found.totalDocs,1);
 const value=found.docs[0].value as {fields:Record<string,{tabIndex?:number;keep?:unknown}>;custom:string};
 assert.equal(value.fields['_index-0'].tabIndex,2);assert.equal(value.fields['_index-0'].keep,'preserved');assert.equal(value.fields.other.keep,true);assert.equal(value.custom,'unchanged');
 console.log('OK: primo accesso e accessi successivi selezionano ZAP!, rispettano utente/permessi e conservano le altre preferenze. Test su copia DB.');
}finally{await payload.destroy();}
