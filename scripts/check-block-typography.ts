import assert from 'node:assert/strict';
import {getPayload} from 'payload';
import config from '../payload.config';
import {blockHeading,blockTextStyle} from '../lib/text-style';
assert.ok(process.env.DATABASE_URL?.includes('/tmp/'),'Use disposable DB.');
const payload=await getPayload({config});
try {
 const page=(await payload.find({collection:'pages',where:{path:{equals:'/'}},limit:1,depth:0})).docs[0];
 assert.ok(page.blocks?.length);
 const before=page.blocks;
 const typography={textColor:'#ffffff',titleColor:'#f8c023',headingLevel:'h3' as const,titleSize:'custom' as const,titleCustomSize:84,titleAlign:'center' as const,titleWeight:'600' as const,noteColor:'#b4dfce',noteSize:'custom' as const,noteCustomSize:26,noteAlign:'right' as const,noteWeight:'500' as const};
 const blocks=before.map(block=>({...block,...typography}));
 await payload.update({collection:'pages',id:page.id,data:{blocks}});
 const saved=await payload.findByID({collection:'pages',id:page.id,depth:0});
 assert.equal(saved.blocks?.length,before.length);
 for(const [i,block] of saved.blocks!.entries()) {
  assert.equal(block.id,before[i].id);assert.equal(block.title,before[i].title);
  for(const [key,value] of Object.entries(typography))assert.equal((block as unknown as Record<string,unknown>)[key],value);
 }
 const versions=await payload.findVersions({collection:'pages',where:{parent:{equals:page.id}},sort:'-createdAt',limit:1});
 const version=versions.docs[0].version.blocks?.[0];assert.ok(version&&'titleColor' in version);assert.equal(version.titleColor,typography.titleColor);
 const style=blockTextStyle(typography,'title');assert.equal(style.color,'#f8c023');assert.equal(style.textAlign,'center');assert.equal(style.fontWeight,600);assert.match(style.fontSize as string,/84px/);
 assert.equal(blockTextStyle(typography,'note').color,'#b4dfce');
 assert.equal(blockTextStyle({textColor:'#ffffff',titleColor:'transparent'},'title').color,'#ffffff');
 assert.equal(blockTextStyle({},'title').fontSize,undefined);
 assert.equal(blockHeading('h3',true),'h3');assert.equal(blockHeading('invalid',true),'h1');
 assert.equal(blockTextStyle({titleSize:'h2'},'title').fontSize,'clamp(34px, 4.3vw, 60px)');
 console.log('OK: typography fields and versions round-trip, IDs/texts preserved; independent hierarchy, responsive sizes, alignment and color inheritance verified.');
} finally {await payload.destroy();}
