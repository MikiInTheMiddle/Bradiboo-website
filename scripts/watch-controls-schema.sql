-- Nullable media controls, existing settings untouched.
ALTER TABLE watch ADD COLUMN zap_logo_id INTEGER REFERENCES media(id) ON DELETE SET NULL;
ALTER TABLE watch ADD COLUMN search_icon_id INTEGER REFERENCES media(id) ON DELETE SET NULL;
