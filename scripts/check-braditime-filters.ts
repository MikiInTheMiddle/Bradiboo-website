import assert from 'node:assert/strict';
import {normalizeActivities} from '../lib/braditime-model';
const rows=[{id:1,slug:'a',title:'A',language:{code:'it'},postTaxonomy:{tax_topic:[{slug:'empatia'}],tax_keyword:[{slug:'carta'}]}},{id:2,slug:'b',title:'B',language:{code:'it'},postTaxonomy:{tax_topic:[{slug:'calma'}],tax_keyword:[{slug:'carta'}]}},{id:3,slug:'c',title:'C',language:{code:'it'},postTaxonomy:{tax_topic:[{slug:'empatia'}],tax_keyword:[{slug:'natura'}]}}];
const base={locale:'it',limit:10,destination:'https://example.test/activities/'};
assert.deepEqual(normalizeActivities(rows,{...base,themes:['empatia'],keywords:['carta']}).map(r=>r.id),['1']);
assert.equal(normalizeActivities(rows,{...base,themes:['empatia','calma']}).length,3);
assert.deepEqual(normalizeActivities(rows,{...base,themes:['assente']}),[]);
assert.deepEqual(normalizeActivities(rows,{...base,selectedIDs:['3','1']}).map(r=>r.id),['3','1']);
console.log('Braditime: temi/keyword combinati, OR per categoria, nessun fallback e ordine manuale verificati.');
