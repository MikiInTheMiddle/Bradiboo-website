-- Additive global settings; no existing editorial rows are modified.
CREATE TABLE IF NOT EXISTS "site_settings" (
 "id" integer PRIMARY KEY NOT NULL,
 "favicon_id" integer REFERENCES "media"("id") ON UPDATE NO ACTION ON DELETE SET NULL,
 "updated_at" text,
 "created_at" text
);
CREATE INDEX IF NOT EXISTS "site_settings_favicon_idx" ON "site_settings" ("favicon_id");
