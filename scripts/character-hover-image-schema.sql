-- Optional shared character hover artwork.
ALTER TABLE "characters" ADD COLUMN "card_identity_hover_image_id" INTEGER REFERENCES "media"("id") ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS `characters_card_identity_card_identity_hover_image_idx` ON `characters` (`card_identity_hover_image_id`);
