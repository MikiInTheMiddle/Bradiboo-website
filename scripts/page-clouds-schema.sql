-- Additive page-cloud settings. Existing pages remain disabled.
ALTER TABLE "pages" ADD COLUMN "cloud_background_enabled" INTEGER DEFAULT false;
ALTER TABLE "pages" ADD COLUMN "cloud_background_layer1_id" INTEGER REFERENCES "media"("id") ON DELETE SET NULL;
ALTER TABLE "pages" ADD COLUMN "cloud_background_layer2_id" INTEGER REFERENCES "media"("id") ON DELETE SET NULL;
ALTER TABLE "pages" ADD COLUMN "cloud_background_layer3_id" INTEGER REFERENCES "media"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS `pages_cloud_background_cloud_background_layer1_idx` ON `pages` (`cloud_background_layer1_id`);
CREATE INDEX IF NOT EXISTS `pages_cloud_background_cloud_background_layer2_idx` ON `pages` (`cloud_background_layer2_id`);
CREATE INDEX IF NOT EXISTS `pages_cloud_background_cloud_background_layer3_idx` ON `pages` (`cloud_background_layer3_id`);
ALTER TABLE "_pages_v" ADD COLUMN "version_cloud_background_enabled" INTEGER DEFAULT false;
ALTER TABLE "_pages_v" ADD COLUMN "version_cloud_background_layer1_id" INTEGER REFERENCES "media"("id") ON DELETE SET NULL;
ALTER TABLE "_pages_v" ADD COLUMN "version_cloud_background_layer2_id" INTEGER REFERENCES "media"("id") ON DELETE SET NULL;
ALTER TABLE "_pages_v" ADD COLUMN "version_cloud_background_layer3_id" INTEGER REFERENCES "media"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS `_pages_v_version_cloud_background_version_cloud_backgrou_idx` ON `_pages_v` (`version_cloud_background_layer1_id`);
CREATE INDEX IF NOT EXISTS `_pages_v_version_cloud_background_version_cloud_backgr_1_idx` ON `_pages_v` (`version_cloud_background_layer2_id`);
CREATE INDEX IF NOT EXISTS `_pages_v_version_cloud_background_version_cloud_backgr_2_idx` ON `_pages_v` (`version_cloud_background_layer3_id`);
