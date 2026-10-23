import assert from 'node:assert/strict';
import {getPayload} from 'payload';
import config from '../payload.config';
const payload=await getPayload({config});
try{
 const page=(await payload.find({collection:'pages',where:{path:{equals:'/shop/bradibox/dove-sei'}},depth:0,limit:1})).docs[0];
 const oldBlocks=page.blocks;
 const saved=await payload.update({collection:'pages',id:page.id,depth:0,data:{title:'QA titolo con tab',blocks:oldBlocks}});
 assert.equal(saved.title,'QA titolo con tab');assert.deepEqual(saved.blocks,oldBlocks);
 assert.equal(saved.headlessProductSlug,page.headlessProductSlug);
 const character=(await payload.find({collection:'characters',limit:1,depth:0})).docs[0];
 const updated=await payload.update({collection:'characters',id:character.id,depth:0,data:{tagline:'QA tagline con tab'}});
 assert.equal(updated.tagline,'QA tagline con tab');assert.deepEqual(updated.moments,character.moments);assert.equal(updated.slug,character.slug);
 const watch=await payload.findGlobal({slug:'watch',depth:0});
 const after=await payload.updateGlobal({slug:'watch',depth:0,data:{showSamples:watch.showSamples,rails:watch.rails,remoteButtons:watch.remoteButtons,filters:watch.filters}});
 assert.deepEqual(after.rails,watch.rails);assert.deepEqual(after.remoteButtons,watch.remoteButtons);assert.deepEqual(after.filters,watch.filters);
 const nav=await payload.findGlobal({slug:'navigation',depth:0});
 const afterNav=await payload.updateGlobal({slug:'navigation',depth:0,data:{items:nav.items,studioItems:nav.studioItems,footerItems:nav.footerItems}});
 assert.deepEqual(afterNav.studioItems,nav.studioItems);assert.deepEqual(afterNav.footerItems,nav.footerItems);
 console.log('OK: salvataggio da configurazione con tab/accordion conserva moduli, collegamenti e associazioni. Solo copia temporanea del DB modificata.');
}finally{await payload.destroy();}
