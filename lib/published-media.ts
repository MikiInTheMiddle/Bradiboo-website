import type { Client } from '@libsql/client';
import { indexedPublishedMedia } from './media-publication-index';
import { invalidateBranchPublication } from './branch-publication';
import type { Access, Field, Payload, PayloadRequest } from 'payload';

// Coalesce simultaneous anonymous checks (a page can request many images).
// Remove the promise as soon as it settles: never reuse an old authorization
// result for a later request after an editor has unpublished content.
const pendingChecks = new WeakMap<Payload, Promise<number[]>>();
function publicMediaCheck(req: PayloadRequest): Promise<number[]> {
  if (process.env.MEDIA_PUBLICATION_INDEX === 'true') {
    const client = (req.payload.db as unknown as {client: Client}).client;
    return indexedPublishedMedia(client, () => {
      invalidateBranchPublication({req});
      return publicMedia(req);
    });
  }
  const pending = pendingChecks.get(req.payload);
  if (pending) return pending;
  const check = publicMedia(req).finally(() => {
    if (pendingChecks.get(req.payload) === check) pendingChecks.delete(req.payload);
  });
  pendingChecks.set(req.payload, check);
  return check;
}

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
  // These reads are independent. Keep the authorization snapshot request-local,
  // but avoid one remote database round trip waiting for the previous collection.
  const collections = (['pages', 'contents', 'characters', 'production-containers'] as const).map(async collection => {
    let page = 1;
    do {
      const result = await req.payload.find({ collection, page, limit: 100, depth: 0, draft: false, overrideAccess: false, user: null });
      for (const doc of result.docs) collectMediaReferences(req.payload.collections[collection].config.fields, doc, ids);
      if (!result.hasNextPage) break;
      page++;
    } while (true);
  });
  const globals = req.payload.config.globals.map(async global => {
    const doc = await req.payload.findGlobal({ slug: global.slug as 'navigation' | 'watch' | 'site-settings', depth: 0, overrideAccess: false, user: null });
    collectMediaReferences(global.fields, doc, ids);
  });
  await Promise.all([...collections, ...globals]);
  return [...ids];
}

export const publishedMediaRead: Access = async ({ req }) => {
  if (req.user) return true;
  // Retain the result only within this request; other requests share in-flight
  // work above, never a settled authorization cache.
  const context = req.context as { publishedMediaIDs?: Promise<number[]> };
  context.publishedMediaIDs ??= publicMediaCheck(req);
  return { id: { in: await context.publishedMediaIDs } };
};

/** Administrative backfill; reads only publicly accessible documents. */
export async function rebuildMediaPublicationIndex(req: PayloadRequest) {
  const client = (req.payload.db as unknown as {client: Client}).client;
  return indexedPublishedMedia(client, () => {
    invalidateBranchPublication({req});
    return publicMedia(req);
  });
}
