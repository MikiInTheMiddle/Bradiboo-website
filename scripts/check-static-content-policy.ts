import assert from 'node:assert/strict';
import {pageCacheDependencies} from '../lib/page-cache-dependencies';
import {collectionTag,pageTag} from '../lib/public-cache-tags';
import {skipsPublicInvalidation,changesPublicHierarchy,changesPublicNavigation} from '../lib/public-cache-policy';
import type {Field} from 'payload';
const fields:Field[]=[{name:'character',type:'relationship',relationTo:'characters'},{name:'blocks',type:'blocks',blocks:[
 {slug:'collection',fields:[{name:'cards',type:'array',fields:[{name:'source',type:'relationship',relationTo:['contents','pages']}]}]},
 {slug:'featured',fields:[]},{slug:'headlessProduct',fields:[]},
]}];
const dependencies=(page:Record<string,unknown>)=>pageCacheDependencies(fields,page);
assert.equal(dependencies({blocks:[]}).revalidate,false,'Plain pages must never poll the CMS');
assert.deepEqual(dependencies({blocks:[]}).tags,[collectionTag('media')]);
assert.ok(dependencies({character:4}).tags.includes(collectionTag('characters')));
assert.ok(dependencies({blocks:[{blockType:'featured',mode:'automatic'}]}).tags.includes(collectionTag('contents')),'Empty automatic selections must also refresh for newly added episodes');
assert.ok(dependencies({blocks:[{blockType:'collection',cards:[{source:{relationTo:'pages',value:9}}]}]}).tags.includes(collectionTag('pages')));
assert.ok(dependencies({blocks:[{blockType:'collection',contentSelection:{enabled:true,by:'characters'}}]}).tags.includes(collectionTag('characters')));
assert.ok(!dependencies({blocks:[{blockType:'featured',mode:'automatic',draft:true}]}).tags.includes(collectionTag('contents')),'Draft blocks must not create public dependencies');
assert.equal(dependencies({blocks:[{blockType:'headlessProduct'}]}).revalidate,3600,'External WordPress content retains bounded freshness without polling all pages');
assert.ok(dependencies({blocks:[{blockType:'collection',cards:[{source:{relationTo:'contents',value:3}}]}]}).tags.includes(collectionTag('production-containers')),'Titles and labels inherited through production hierarchy must refresh together');
assert.equal(skipsPublicInvalidation({doc:{_status:'draft'},previousDoc:{_status:'published'},req:{query:{draft:'true'}}}),true);
assert.equal(skipsPublicInvalidation({doc:{_status:'draft'},previousDoc:{_status:'published'},req:{query:{draft:'false'}}}),false);
assert.equal(skipsPublicInvalidation({doc:{_status:'draft'}}),true);
assert.equal(skipsPublicInvalidation({doc:{_status:'draft'},previousDoc:{_status:'draft'},req:{query:{draft:'false'}}}),false,'Unpublish after an earlier saved draft must still expire the live page');
assert.equal(skipsPublicInvalidation({doc:{_status:'draft'},deleted:true}),false);
assert.equal(changesPublicHierarchy('contents',{_status:'published',parent:4},{_status:'published',parent:{id:4}}),false);
assert.equal(changesPublicHierarchy('contents',{_status:'draft'},{_status:'published'}),true);
assert.ok(pageTag('/'+'x'.repeat(1000)).length<256);
assert.notEqual(pageTag('/a'),pageTag('/b'));
console.log('PASS: precise dependency tags, drafts excluded, automatic selections, hierarchy changes and bounded external freshness.');

assert.equal(changesPublicNavigation('contents',{recordType:'episode',title:'New'},{recordType:'episode',title:'Old'}),false);
assert.equal(changesPublicNavigation('contents',{recordType:'production',title:'New'},{recordType:'production',title:'Old'}),true);
