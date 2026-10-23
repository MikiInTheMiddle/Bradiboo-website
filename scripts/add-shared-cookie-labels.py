"""Add only the badge color column, with backup and data integrity checks."""
import datetime
from pathlib import Path
import sqlite3
import sys
root = Path(__file__).resolve().parents[1]
path = Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'bradiboo.db'
additions = [('pages_blocks_hero_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('pages_blocks_intro_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('pages_blocks_media_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('pages_blocks_split_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('pages_blocks_grid_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('pages_blocks_rail_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('pages_blocks_dynamic_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('pages_blocks_cta_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('pages_blocks_list_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('pages_blocks_contact_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('pages_blocks_headless_product_cards', 'badge_background_color', 'TEXT', "'#ffffff'"), ('pages_blocks_watch_experience', 'show_badge', 'INTEGER', 'false'), ('pages_blocks_watch_experience', 'badge', 'TEXT', None), ('pages_blocks_watch_experience', 'badge_background_color', 'TEXT', "'#ffffff'"), ('pages_blocks_zap_experience', 'show_badge', 'INTEGER', 'false'), ('pages_blocks_zap_experience', 'badge', 'TEXT', None), ('pages_blocks_zap_experience', 'badge_background_color', 'TEXT', "'#ffffff'"), ('pages_blocks_featured_cards', 'badge_background_color', 'TEXT', "'#ffffff'"), ('pages_blocks_collection_cards', 'badge_background_color', 'TEXT', "'#ffffff'"), ('pages_blocks_company_split_panels', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_hero_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_intro_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_media_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_split_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_grid_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_rail_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_dynamic_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_cta_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_list_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_contact_items', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_headless_product_cards', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_watch_experience', 'show_badge', 'INTEGER', 'false'), ('_pages_v_blocks_watch_experience', 'badge', 'TEXT', None), ('_pages_v_blocks_watch_experience', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_zap_experience', 'show_badge', 'INTEGER', 'false'), ('_pages_v_blocks_zap_experience', 'badge', 'TEXT', None), ('_pages_v_blocks_zap_experience', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_featured_cards', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_collection_cards', 'badge_background_color', 'TEXT', "'#ffffff'"), ('_pages_v_blocks_company_split_panels', 'badge_background_color', 'TEXT', "'#ffffff'"), ('contents', 'highlight_badge_background_color', 'TEXT', "'#ffffff'"), ('_contents_v', 'version_highlight_badge_background_color', 'TEXT', "'#ffffff'")]
db = sqlite3.connect(path)
backup_dir = root / 'work/backups'
backup_dir.mkdir(parents=True, exist_ok=True)
backup_path = backup_dir / ('before-shared-cookie-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f') + '.db')
backup = sqlite3.connect(backup_path)
db.backup(backup)
backup.close()
tables = [r[0] for r in db.execute("select name from sqlite_master where type='table' and name not like 'sqlite_%'")]
counts = {table: db.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0] for table in tables}
added = 0
db.execute('PRAGMA foreign_keys=ON')
with db:
 for table,column,kind,default in additions:
  assert table in tables, table
  if any(r[1]==column for r in db.execute(f'PRAGMA table_info("{table}")')): continue
  sql=f'ALTER TABLE "{table}" ADD COLUMN "{column}" {kind}'
  if default is not None: sql+=' DEFAULT '+default
  db.execute(sql)
  added += 1
 for table, count in counts.items():
  assert db.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0] == count, table
 assert not db.execute('PRAGMA foreign_key_check').fetchall()
print(f'OK: {added} additive columns; existing record counts and foreign keys preserved. Backup: {backup_path.name}')
