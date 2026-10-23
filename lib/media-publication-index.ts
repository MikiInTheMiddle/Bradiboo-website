import type { Client } from '@libsql/client';

const stateTable = 'bradiboo_media_publication_state';
const indexTable = 'bradiboo_media_publication_index';
const pending = new WeakMap<Client, Promise<number[]>>();
const quote = (name: string) => '"' + name.replaceAll('"', '""') + '"';

/** Additive migration: no editorial rows or Payload schema fields are changed. */
export async function installMediaPublicationIndex(client: Client, roots: string[]) {
  const tables = (await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")).rows
    .map(row => String(row.name)).filter(name => roots.some(root => name === root || name.startsWith(root + '_')));
  if (!tables.length) throw new Error('No editorial tables found for media publication index');
  const statements = [
    `CREATE TABLE IF NOT EXISTS ${stateTable} (singleton INTEGER PRIMARY KEY CHECK(singleton=1), revision INTEGER NOT NULL DEFAULT 0, indexed_revision INTEGER NOT NULL DEFAULT -1)`,
    `INSERT OR IGNORE INTO ${stateTable}(singleton) VALUES(1)`,
    `CREATE TABLE IF NOT EXISTS ${indexTable} (media_id INTEGER PRIMARY KEY)`,
  ];
  for (const table of tables) for (const operation of ['INSERT', 'UPDATE', 'DELETE']) {
    const trigger = quote(`bradiboo_media_dirty_${table}_${operation.toLowerCase()}`);
    statements.push(`CREATE TRIGGER IF NOT EXISTS ${trigger} AFTER ${operation} ON ${quote(table)} BEGIN UPDATE ${stateTable} SET revision=revision+1 WHERE singleton=1; END`);
  }
  // Re-running the migration also forces a fresh calculation after schema changes.
  statements.push(`UPDATE ${stateTable} SET revision=revision+1 WHERE singleton=1`);
  await client.batch(statements, 'write');
  return tables.length;
}

async function snapshot(client: Client) {
  const result = await client.execute(`SELECT s.revision, s.indexed_revision, i.media_id FROM ${stateTable} s LEFT JOIN ${indexTable} i ON s.revision=s.indexed_revision WHERE s.singleton=1`);
  if (!result.rows.length) throw new Error('Media publication index has not been initialized');
  return {
    revision: Number(result.rows[0].revision),
    ready: result.rows[0].revision === result.rows[0].indexed_revision,
    ids: result.rows.flatMap(row => row.media_id == null ? [] : [Number(row.media_id)]),
  };
}

async function rebuild(client: Client, collect: () => Promise<number[]>) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const before = await snapshot(client);
    if (before.ready) return before.ids;
    const ids = [...new Set(await collect())];
    if (ids.some(id => !Number.isSafeInteger(id) || id <= 0)) throw new Error('Invalid media reference');
    const tx = await client.transaction('write');
    try {
      const current = await tx.execute(`SELECT revision FROM ${stateTable} WHERE singleton=1`);
      if (Number(current.rows[0].revision) !== before.revision) {
        await tx.rollback();
        continue; // An edit committed during the scan: never publish that snapshot.
      }
      await tx.execute(`DELETE FROM ${indexTable}`);
      for (let start = 0; start < ids.length; start += 100) {
        const batch = ids.slice(start, start + 100);
        await tx.execute({ sql: `INSERT INTO ${indexTable}(media_id) VALUES ${batch.map(() => '(?)').join(',')}`, args: batch });
      }
      await tx.execute({ sql: `UPDATE ${stateTable} SET indexed_revision=? WHERE singleton=1`, args: [before.revision] });
      await tx.commit();
    } catch (error) {
      if (!tx.closed) await tx.rollback();
      throw error;
    }
    const after = await snapshot(client);
    if (after.ready) return after.ids;
  }
  // Fail closed during sustained edits or database errors, never return a stale list.
  throw new Error('Media publication changed during index rebuild; retry the request');
}

/** One indexed query on the normal read path; no cross-request authorization cache. */
export async function indexedPublishedMedia(client: Client, collect: () => Promise<number[]>) {
  const current = await snapshot(client);
  if (current.ready) return current.ids;
  const existing = pending.get(client);
  if (existing) return existing;
  const check = rebuild(client, collect).finally(() => {
    if (pending.get(client) === check) pending.delete(client);
  });
  pending.set(client, check);
  return check;
}
