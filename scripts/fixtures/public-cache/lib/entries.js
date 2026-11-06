import fs from 'node:fs/promises';
import {publicRead} from '../../../../lib/public-cache';
import {pageTag} from '../../../../lib/public-cache-tags';
export const readEntry=publicRead('isolated-static-entry',async(slug)=>{
 await fs.appendFile('/private/tmp/bradiboo-static-reads.txt',slug+'\n');
 const state=JSON.parse(await fs.readFile('/private/tmp/bradiboo-static-entries.json','utf8'));
 if(state.fail)throw new Error('Simulated CMS outage');
 return state.entries[slug]?.published?state.entries[slug].value:null;
},false,slug=>({tags:[pageTag('/entries/'+slug)]}));
