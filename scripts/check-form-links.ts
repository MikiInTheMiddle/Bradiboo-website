import assert from 'node:assert/strict';
import {formLinkBehavior,isFilloutLink} from '../lib/link-behavior';
for(const href of ['https://forms.fillout.com/t/example','https://bradiboo.fillout.com/t/form?name=ciao#section','https://fillout.com/t/form','//forms.fillout.com/t/example','https://FORMS.FILLOUT.COM/t/form'])assert.equal(isFilloutLink(href),true,href);
for(const href of ['/studio','mailto:ciao@bradiboo.com','https://fillout.com.other.example/form','https://fakefillout.com','https://example.com/?next=https://fillout.com','/fillout.com/form','javascript:alert(1)'])assert.equal(isFilloutLink(href),false,href);
assert.equal(isFilloutLink({protocol:'https:',hostname:'forms.fillout.com',pathname:'/t/example'}),true);
assert.deepEqual(formLinkBehavior('https://forms.fillout.com/t/example','nofollow noopener'),{target:'_blank',rel:'nofollow noopener noreferrer'});
assert.deepEqual(formLinkBehavior('/studio'),{});
console.log('OK: Fillout forms open in a new tab; relative/internal links, deceptive hosts and existing rel values are handled correctly.');
