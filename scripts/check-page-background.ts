import assert from 'node:assert/strict';
import {getPayload} from 'payload';
import config from '../payload.config';
import {gradientColors,pageBackgroundStyle,resolveColor,validBackground} from '../lib/background';
assert.ok(process.env.DATABASE_URL?.includes('/tmp/'), 'Use a disposable database copy in /tmp.');
const payload=await getPayload({config});
try {
 const page=(await payload.find({collection:'pages',limit:1,depth:0})).docs[0];
 assert.ok(page);
 const original=page.blocks?.length;
 const gradient='linear-gradient(to bottom, #123456 0%, #abcdef 100%)';
 for(const value of ['mint','#1a2b3c',gradient,'transparent']) {
  await payload.update({collection:'pages',id:page.id,data:{pageBackgroundColor:value}});
  const saved=await payload.findByID({collection:'pages',id:page.id,depth:0});
  assert.equal(saved.pageBackgroundColor,value);
  assert.equal(saved.blocks?.length,original);
 }
 assert.equal(resolveColor('mint'),'#b4dfce');
 assert.deepEqual(gradientColors(gradient),['#123456','#abcdef']);
 assert.equal(pageBackgroundStyle({backgroundColor:gradient}).backgroundImage,gradient);
 assert.equal(pageBackgroundStyle({backgroundColor:gradient}).backgroundAttachment,'scroll');
 assert.equal(validBackground('red'),false);
 assert.equal(validBackground(gradient,true),true);
 assert.equal(validBackground(gradient),false);
 await assert.rejects(()=>payload.update({collection:'pages',id:page.id,data:{pageBackgroundColor:'invalid'}}));
 console.log('OK: legacy colors, HEX, gradient and transparent round-trip; validation and page modules preserved.');
} finally { await payload.destroy(); }
