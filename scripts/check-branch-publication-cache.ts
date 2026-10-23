import assert from 'node:assert/strict';import {getPayload} from 'payload';import config from '../payload.config';import {branchPublication,invalidateBranchPublication} from '../lib/branch-publication';
const p=await getPayload({config});try{
 const find=p.find.bind(p);let queries=0;
 (p as any).find=(args:any)=>{if(args.overrideAccess===true&&args.select&&['contents','production-containers'].includes(args.collection))queries++;return find(args);};
 invalidateBranchPublication({req:{payload:p}});const start=performance.now();
 const snapshots=await Promise.all(Array.from({length:100},()=>branchPublication(p)));
 assert.equal(queries,2);assert.ok(snapshots.every(x=>x===snapshots[0]));
 console.log({checks:100,hierarchyQueries:queries,milliseconds:Math.round(performance.now()-start)});
 invalidateBranchPublication({req:{payload:p}});await branchPublication(p);assert.equal(queries,4);console.log('OK: reads shared, invalidation immediately refreshes.');
}finally{await p.destroy()}
