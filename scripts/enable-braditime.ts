import { getPayload } from 'payload';
import config from '../payload.config';
const payload = await getPayload({ config });
const pages = await payload.find({ collection: 'pages', limit: 100, depth: 0 });
let updated = 0;
for (const page of pages.docs) {
 const blocks = (page.blocks || []).map(block => {
  if (block.label === 'Braditime entry' || block.label === 'Braditime character cards' || block.label === 'Related Braditime activities') {
   return { blockType: 'braditime' as const, label: block.label, title: block.title, note: block.note, draft: true, locale: 'it' as const, limit: 6 };
  }
  return block;
 });
 if (JSON.stringify(blocks) !== JSON.stringify(page.blocks)) {
  await payload.update({ collection: 'pages', id: page.id, data: { blocks }, draft: page._status === 'draft' });updated++;
 }
}
console.log(`Moduli Braditime in bozza: ${updated} pagine aggiornate.`);
await payload.destroy();
