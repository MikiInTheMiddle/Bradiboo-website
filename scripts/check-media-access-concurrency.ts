import assert from 'node:assert/strict';
import {publishedMediaRead} from '../lib/published-media';
let reads=0;
const fields=[{name:'image',type:'upload',relationTo:'media'}];
const payload:any={
 collections:Object.fromEntries(['pages','contents','characters','production-containers'].map(k=>[k,{config:{fields}}])),
 config:{globals:[]},
 find:async()=>{reads++;await new Promise(resolve=>setTimeout(resolve,5));return {docs:[{image:7}],hasNextPage:false};},
};
const check=async()=>publishedMediaRead({req:{payload,context:{},user:null}} as any);
const results=await Promise.all(Array.from({length:20},check));
assert.equal(reads,4,'Concurrent anonymous reads share the same in-flight authorization scan');
assert.ok(results.every(r=>JSON.stringify(r)===JSON.stringify({id:{in:[7]}})));
await check();
assert.equal(reads,8,'A later request must recheck publication instead of reusing settled authorization');
payload.find=async()=>{throw new Error('database unavailable');};
await assert.rejects(check,/database unavailable/);
payload.find=async()=>{reads++;return {docs:[],hasNextPage:false};};
assert.deepEqual(await check(),{id:{in:[]}},'A failed scan must not poison later authorization');
assert.equal(await publishedMediaRead({req:{payload,context:{},user:{id:1}}} as any),true);
console.log('Concurrent media authorization, fresh checks, failure recovery and authenticated access passed.');
