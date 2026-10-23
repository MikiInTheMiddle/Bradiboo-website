ALTER TABLE watch_rails ADD COLUMN surface_background_mode TEXT;
ALTER TABLE watch_rails ADD COLUMN surface_background_color TEXT;
ALTER TABLE watch_rails ADD COLUMN surface_background_image_id INTEGER REFERENCES media(id) ON DELETE SET NULL;
ALTER TABLE watch_rails ADD COLUMN surface_mobile_image_id INTEGER REFERENCES media(id) ON DELETE SET NULL;
ALTER TABLE watch_rails ADD COLUMN surface_focal_x NUMERIC;
ALTER TABLE watch_rails ADD COLUMN surface_focal_y NUMERIC;
ALTER TABLE watch_rails ADD COLUMN surface_background_opacity NUMERIC;
ALTER TABLE watch_rails ADD COLUMN surface_overlay_opacity NUMERIC;
ALTER TABLE watch_rails ADD COLUMN surface_text_color TEXT;
