import type { Access, Field, PayloadRequest } from 'payload';

/** Follow upload fields, never unrelated numeric IDs or draft blocks. */
export function collectMediaReferences(fields: Field[], data: any, ids = new Set<number>()): Set<number> {
  if (!data || data.draft === true) return ids;
  for (const field of fields) {
    if (field.type === 'tabs') {
      for (const tab of field.tabs) collectMediaReferences(tab.fields, 'name' in tab && tab.name ? data[tab.name] : data, ids);
      continue;
    }
    const value = 'name' in field && field.name ? data[field.name] : data;
    if (value == null) continue;
    if (field.type === 'upload' || field.type === 'relationship') {
      for (const entry of Array.isArray(value) ? value : [value]) {
        const media = field.relationTo === 'media' ? entry : entry?.relationTo === 'media' ? entry.value : undefined;
        const id = typeof media === 'object' ? media?.id : media;
        if (id != null && Number.isInteger(Number(id))) ids.add(Number(id));
      }
    } else if (field.type === 'blocks') {
      for (const block of value) {
        const schema = field.blocks?.find(item => typeof item !== 'string' && item.slug === block.blockType);
        if (schema && typeof schema !== 'string') collectMediaReferences(schema.fields, block, ids);
      }
    } else if ('fields' in field) {
      for (const item of field.type === 'array' ? value : [value]) collectMediaReferences(field.fields, item, ids);
    }
  }
  return ids;
}

async function publicMedia(req: PayloadRequest): Promise<number[]> {
  const ids = new Set<number>();
  for (const collection of ['pages', 'contents', 'characters', 'production-containers'] as const) {
    let page = 1;
    do {
      const result = await req.payload.find({ collection, page, limit: 100, depth: 0, draft: false, overrideAccess: false, user: null });
      for (const doc of result.docs) collectMediaReferences(req.payload.collections[collection].config.fields, doc, ids);
      if (!result.hasNextPage) break;
      page++;
    } while (true);
  }
  for (const global of req.payload.config.globals) {
    const doc = await req.payload.findGlobal({ slug: global.slug as 'navigation' | 'watch', depth: 0, overrideAccess: false, user: null });
    collectMediaReferences(global.fields, doc, ids);
  }
  return [...ids];
}

export const publishedMediaRead: Access = async ({ req }) => {
  if (req.user) return true;
  // Request-local only: no shared cache can expose a newly unpublished file.
  const context = req.context as { publishedMediaIDs?: Promise<number[]> };
  context.publishedMediaIDs ??= publicMedia(req);
  return { id: { in: await context.publishedMediaIDs } };
};
