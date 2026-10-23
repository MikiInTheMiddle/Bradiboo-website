# Private media: publication index

Storage remains private. Media URLs and the editorial UI are unchanged. Anonymous media access uses `MEDIA_PUBLICATION_INDEX=true` to read a small SQL lookup instead of loading every public document. Authenticated editors retain private access.

## Consistency and migration

Run `scripts/rebuild-media-publication-index.ts` explicitly with `MEDIA_INDEX_APPLY=true`, the required database environment, schema push disabled, and a backup. `MEDIA_INDEX_ENV_FILE` optionally loads a private env file. The additive migration installs two technical tables and INSERT/UPDATE/DELETE triggers on the editorial root and nested tables, excluding draft version tables. No content or Payload field is rewritten. Re-run after schema migrations to cover new nested tables.

Triggers advance a revision **inside the same transaction as the edit**, including deletes, nested arrays and changes to parent publication. Saving a version-only draft leaves the still-published document unchanged. On the next anonymous request a dirty index is recomputed using the existing public access rules, with a fresh hierarchy snapshot. The rebuild installs only if the database revision still matches; concurrent changes cause a retry. Errors fail closed. A clean request uses one indexed SQL query; no previous authorization is cached across requests. Multiple public references are treated as a union, so removing one reference never revokes a file still used elsewhere.

Rebuilding lazily after commit avoids trying to update the index in an `afterChange` hook before Payload's transaction has committed, and avoids gaps between the editorial transaction and invalidation. The first request after an edit may still do the more expensive scan. `MEDIA_PUBLICATION_INDEX=false` restores the original live-scan path, without removing data.

## Verification

- `scripts/check-media-publication-index.ts`: shared references, publish/unpublish, deletion, replacement, nested edits, transaction rollback, a concurrent edit during rebuild and error recovery.
- `scripts/check-media-index-integration.ts`: disposable Payload database only; compares all anonymous media IDs with the original scan and checks that an authenticated editor still sees private files.
- TypeScript, production build and live page/media checks before release.

The index is not a CDN cache. A publication withdrawal is checked against committed database state, without intentionally granting a cache grace period. Original files remain in private Blob storage.
