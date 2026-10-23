import type { Payload } from 'payload';
import { pages } from './wireframe';
export async function seedWireframe(payload: Payload) {
  const existing = await payload.find({ collection: 'pages', limit: 1 });
  if (existing.totalDocs) return;
  const characterIDs = new Map<string, number>();
  for (const page of pages.filter(p => p.group === 'Personaggio')) {
    const slug = page.path.split('/').pop()!;
    const character = await payload.create({ collection: 'characters', data: { name: page.title, slug } });
    characterIDs.set(slug, character.id);
  }
  await payload.create({ collection: 'contents', data: {
    title: 'Episodio pilota', slug: 'episodio-pil', kind: 'episodio', url: '/guarda/serie/bradiboo/episodio-pil',
    characters: [...characterIDs.values()].slice(0,3), _status: 'published',
    description: 'Contenuto dimostrativo importato dal wireframe.',
  } });
  for (const page of pages) {
    const character = page.group === 'Personaggio' ? characterIDs.get(page.path.split('/').pop()!) : undefined;
    await payload.create({ collection: 'pages', data: {
      title: page.title, path: page.path, group: page.group, purpose: page.purpose,
      _status: page.status === 'draft' ? 'draft' : 'published', character,
      blocks: page.blocks.map(block => ({
        blockType: character && block.label === 'Watch character' ? 'dynamic' : block.type === 'related' ? 'rail' : block.type,
        label: block.label, title: block.title, note: block.note, draft: block.status === 'draft', items: block.items?.map(item => ({label:item.label,href:item.href})),
      })),
    } });
  }
  await payload.updateGlobal({ slug: 'navigation', data: { items: [
    { label: 'Braditriboo', href: '/braditriboo' }, { label: 'Guarda', href: '/guarda' }, { label: 'Shop ↗', href: '/shop' },
  ] } });
}
