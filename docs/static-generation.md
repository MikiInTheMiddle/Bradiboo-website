# Public page generation

Public pages are prerendered with Payload's **anonymous, published** access rules. Home, Guarda and the sitemap are static; the catch-all enumerates published pages with `generateStaticParams`. `dynamicParams=true` permits publishing a new page without a deploy. `dynamic='error'` makes an accidental request-time dependency fail the build rather than silently restoring per-visit rendering.

`publicRead` stores anonymous DTOs until invalidated. Per-page tags cover the source and its resolved DTO; schema inspection and automatic-selection rules add collection dependencies. Navigation has a separate tag so changing an episode description does not regenerate every menu. Metadata/footer reads are deduplicated within a render. Linked WordPress product/activity pages keep a one-hour refresh because that headless has no Payload write hook.

Payload hooks invalidate the changed page and consumers of changed shared content. Draft autosaves (`draft=true`) do not invalidate published snapshots. Ordinary edits retain the last good published version during a failed refresh. Withdrawals, deleted content and hidden blocks expire snapshots conservatively, including legacy cache entries. The hierarchy snapshot and cache invalidation are repeated after the write response to avoid pre-commit races. Purges propagate asynchronously; they are not an atomic database/CDN transaction.

The browser selects Guarda's episode from `?contenuto=` inside a small Suspense boundary. All frontend Next links use `SiteLink`, which enforces `prefetch={false}`. Admin/API routes and media authorization remain dynamic; private media never acquire shared-cache headers.

## Verification

- `scripts/check-static-content-policy.ts`: dependencies, automatic/empty selections, draft and hierarchy policy.
- `scripts/check-static-pages.py`: local fixture at port 3008; static HIT, no repeated source reads, targeted refresh, draft exclusion and new paths.
- `scripts/check-public-cache-outage.py`: fixture availability on upstream failure and hard withdrawal.
- `scripts/check-payload-static-local.ts`: real Payload API at port 3009; requires exactly `DATABASE_URL=file:/private/tmp/bradiboo-static-check.db`. Only a disposable DB copy is allowed. Creates a temporary local editor and test content; never run against Turso.
- Build the app with `BRADIBOO_BUILD_DIR=.next-static-check` to keep an existing dev server's `.next` untouched. The test directory is excluded from Git and Vercel uploads.

CLI/direct SQL edits have no Next request cache context: follow them with a controlled invalidation or a cache-version change. Do not treat a code deployment alone as a reliable invalidation of externally mutated data. Server-side randomized heroes are chosen when the page snapshot is generated, not on every visit.
