import assert from 'node:assert/strict';
import type {Field} from 'payload';
import {organizeBlock} from '../lib/admin-layout';
import {cardAppearanceField} from '../lib/card-appearance';
import {wideAppearanceField} from '../lib/wide-appearance';
import {elementLayout} from '../lib/admin-element-layout';
function flatten(fields:Field[]):Field[]{return fields.flatMap(f=>[f,...(f.type==='tabs'?f.tabs.flatMap(t=>flatten(t.fields)):'fields' in f?flatten(f.fields):[])]);}
const result=organizeBlock({slug:'grid',fields:[{name:'title',type:'text'},{name:'label',type:'text'},{name:'draft',type:'checkbox'},{name:'showBadge',type:'checkbox'},{name:'items',type:'array',fields:[{name:'label',type:'text'}]}]});
assert.equal('name' in result[0]&&result[0].name,'presentation');
const rootTabs=result.find(f=>f.type==='tabs');assert.ok(rootTabs?.type==='tabs');
assert.deepEqual(rootTabs.tabs.map(t=>t.label),['Contenuto','Fondo','Etichetta','Elementi','Stile card','Gestione']);
const flat=flatten(result);
const badge=flat.find(f=>'name' in f&&f.name==='showBadge')!;
assert.equal(badge.admin!.condition!({},{presentation:'wide',items:[{label:'a'}]},{} as never),false);
assert.equal(badge.admin!.condition!({},{presentation:'wide',items:[]},{} as never),true);
assert.equal(badge.admin!.condition!({},{presentation:'cards'},{} as never),true);
assert.ok(flatten(organizeBlock({slug:'hero',fields:[{name:'title',type:'text'}]})).some(f=>'name' in f&&f.name==='presentation'));
const rows=elementLayout([{name:'image',type:'upload',relationTo:'media'},cardAppearanceField(),wideAppearanceField(),{name:'slideBadge',type:'text'},{name:'hideBadge',type:'checkbox'}],'items');
const rowFields=flatten(rows);
assert.equal(rowFields.filter(f=>'name' in f&&f.name==='image'&&f.type==='upload').length,2); // Source image and explicit Wide override: never visible together.
const proxy=rowFields.find(f=>'name' in f&&f.name==='backgroundImageControl')!;
assert.equal(proxy.type,'ui');
assert.equal(proxy.admin!.condition!({},{composition:'overlay',backgroundMode:'image'},{blockData:{presentation:'cards'}} as never),true);
assert.equal(proxy.admin!.condition!({},{composition:'overlay',backgroundMode:'color'},{blockData:{presentation:'cards'}} as never),false);
assert.equal(proxy.admin!.condition!({},{composition:'stacked'},{blockData:{presentation:'cards'}} as never),false);
for(const key of ['slideBadge','hideBadge']){const admin=rowFields.find(f=>'name' in f&&f.name===key)?.admin;assert.ok(admin&&'hidden' in admin&&admin.hidden);}
const wideField=wideAppearanceField();assert.ok(wideField.type==='group');
const wideTabs=wideField.fields.find(f=>f.type==='tabs');assert.ok(wideTabs?.type==='tabs');
assert.ok(wideTabs.tabs.some(t=>t.label==='Etichetta'&&flatten(t.fields).some(f=>'name' in f&&f.name==='labelControl')&&flatten(t.fields).some(f=>'name' in f&&f.name==='badgeBackgroundColor')));
console.log('OK: Default/Wide, standalone and carousel labels, two element tabs, one contextual label panel, image controls hidden for color backgrounds.');
