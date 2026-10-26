import assert from 'node:assert/strict';
import {withdrawsPublicContent} from '../lib/public-cache-policy';
assert.equal(withdrawsPublicContent({_status:'draft'},{_status:'published'}),true);
assert.equal(withdrawsPublicContent({_status:'published'},{_status:'published'}),false);
assert.equal(withdrawsPublicContent({_status:'draft'},{_status:'draft'}),false);
assert.equal(withdrawsPublicContent({blocks:[{id:'a',draft:true}]},{blocks:[{id:'a',draft:false}]}),true);
assert.equal(withdrawsPublicContent({blocks:[{id:'a',draft:true}]},{blocks:[{id:'a',draft:true}]}),false);
console.log('PASS: unpublish and newly hidden blocks expire immediately; ordinary edits use background refresh.');
