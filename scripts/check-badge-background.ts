import assert from 'node:assert/strict';
import {getPayload} from 'payload';
import config from '../payload.config';
assert.ok(process.env.DATABASE_URL?.includes('/tmp/'), 'Use disposable DB.');
const payload=await getPayload({config});
try {
 const page=(await payload.find({collection:'pages',where:{path:{equals:'/'}},limit:1,depth:0})).docs[0];
 assert.ok(page.blocks?.length);
 const before=page.blocks;
 const blocks=before.map(block=>({...block,badgeBackgroundColor:'#f8c023'}));
 await payload.update({collection:'pages',id:page.id,data:{blocks}});
 const saved=await payload.findByID({collection:'pages',id:page.id,depth:0});
 assert.equal(saved.blocks?.length,before.length);
 for(const [i,block] of saved.blocks!.entries()) {
  assert.ok('badgeBackgroundColor' in block);
  assert.equal(block.badgeBackgroundColor,'#f8c023');
  assert.equal(block.id,before[i].id);
  assert.equal(block.title,before[i].title);
 }
 const versions=await payload.findVersions({collection:'pages',where:{parent:{equals:page.id}},sort:'-createdAt',limit:1});
 const versionBlock=versions.docs[0].version.blocks?.[0];
 assert.ok(versionBlock && 'badgeBackgroundColor' in versionBlock);
 assert.equal(versionBlock.badgeBackgroundColor,'#f8c023');
 console.log('OK: custom badge color saved and versioned, original module IDs, titles and count preserved.');
} finally {await payload.destroy();}
