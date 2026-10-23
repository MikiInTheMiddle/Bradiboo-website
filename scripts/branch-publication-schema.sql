ALTER TABLE "production_containers" ADD COLUMN "show_in_explore" INTEGER DEFAULT true;
ALTER TABLE "production_containers" ADD COLUMN "_status" TEXT DEFAULT 'draft';
CREATE TABLE `_production_containers_v_version_moments` (
	`_order` integer NOT NULL,
	`_parent_id` integer NOT NULL,
	`id` integer PRIMARY KEY NOT NULL,
	`audio_settings_mode` text,
	`audio_settings_file_id` integer,
	`audio_settings_track` text,
	`audio_settings_cta_mode` text,
	`audio_settings_label` text,
	`audio_settings_autoplay` integer,
	`audio_settings_loop` integer,
	`image_id` integer,
	`mobile_image_id` integer,
	`title` text,
	`caption` text,
	`alt` text,
	`focal_x` numeric,
	`focal_y` numeric,
	`content_id` integer,
	`href` text,
	`_uuid` text,
	FOREIGN KEY (`audio_settings_file_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`mobile_image_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`content_id`) REFERENCES `contents`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`_parent_id`) REFERENCES `_production_containers_v`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE TABLE `_production_containers_v` (
	`id` integer PRIMARY KEY NOT NULL,
	`parent_id` integer,
	`version_show_in_explore` integer DEFAULT true,
	`version_title` text,
	`version_slug` text,
	`version_description` text,
	`version_card_audio_id` integer,
	`version_cover_id` integer,
	`version_cover_mobile_id` integer,
	`version_url` text,
	`version_updated_at` text,
	`version_created_at` text,
	`version__status` text DEFAULT 'draft',
	`created_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`updated_at` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
	`latest` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `production_containers`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`version_card_audio_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`version_cover_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`version_cover_mobile_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE TABLE `_production_containers_v_rels` (
	`id` integer PRIMARY KEY NOT NULL,
	`order` integer,
	`parent_id` integer NOT NULL,
	`path` text NOT NULL,
	`media_id` integer,
	`watch_terms_id` integer,
	FOREIGN KEY (`parent_id`) REFERENCES `_production_containers_v`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`media_id`) REFERENCES `media`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`watch_terms_id`) REFERENCES `watch_terms`(`id`) ON UPDATE no action ON DELETE cascade
);
ALTER TABLE "contents" ADD COLUMN "show_in_explore" INTEGER DEFAULT true;
ALTER TABLE "_contents_v" ADD COLUMN "version_show_in_explore" INTEGER DEFAULT true;
CREATE INDEX `production_containers__status_idx` ON `production_containers` (`_status`);
CREATE INDEX `_production_containers_v_version_moments_order_idx` ON `_production_containers_v_version_moments` (`_order`);
CREATE INDEX `_production_containers_v_version_moments_parent_id_idx` ON `_production_containers_v_version_moments` (`_parent_id`);
CREATE INDEX `_production_containers_v_version_moments_audio_settings__idx` ON `_production_containers_v_version_moments` (`audio_settings_file_id`);
CREATE INDEX `_production_containers_v_version_moments_image_idx` ON `_production_containers_v_version_moments` (`image_id`);
CREATE INDEX `_production_containers_v_version_moments_mobile_image_idx` ON `_production_containers_v_version_moments` (`mobile_image_id`);
CREATE INDEX `_production_containers_v_version_moments_content_idx` ON `_production_containers_v_version_moments` (`content_id`);
CREATE INDEX `_production_containers_v_parent_idx` ON `_production_containers_v` (`parent_id`);
CREATE INDEX `_production_containers_v_version_version_slug_idx` ON `_production_containers_v` (`version_slug`);
CREATE INDEX `_production_containers_v_version_version_card_audio_idx` ON `_production_containers_v` (`version_card_audio_id`);
CREATE INDEX `_production_containers_v_version_version_cover_idx` ON `_production_containers_v` (`version_cover_id`);
CREATE INDEX `_production_containers_v_version_version_cover_mobile_idx` ON `_production_containers_v` (`version_cover_mobile_id`);
CREATE INDEX `_production_containers_v_version_version_updated_at_idx` ON `_production_containers_v` (`version_updated_at`);
CREATE INDEX `_production_containers_v_version_version_created_at_idx` ON `_production_containers_v` (`version_created_at`);
CREATE INDEX `_production_containers_v_version_version__status_idx` ON `_production_containers_v` (`version__status`);
CREATE INDEX `_production_containers_v_created_at_idx` ON `_production_containers_v` (`created_at`);
CREATE INDEX `_production_containers_v_updated_at_idx` ON `_production_containers_v` (`updated_at`);
CREATE INDEX `_production_containers_v_latest_idx` ON `_production_containers_v` (`latest`);
CREATE INDEX `_production_containers_v_rels_order_idx` ON `_production_containers_v_rels` (`order`);
CREATE INDEX `_production_containers_v_rels_parent_idx` ON `_production_containers_v_rels` (`parent_id`);
CREATE INDEX `_production_containers_v_rels_path_idx` ON `_production_containers_v_rels` (`path`);
CREATE INDEX `_production_containers_v_rels_media_id_idx` ON `_production_containers_v_rels` (`media_id`);
CREATE INDEX `_production_containers_v_rels_watch_terms_id_idx` ON `_production_containers_v_rels` (`watch_terms_id`);
UPDATE production_containers SET _status='published';
