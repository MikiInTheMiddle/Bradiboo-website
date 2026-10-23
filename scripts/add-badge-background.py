"""Add only the badge color column, with backup and data integrity checks."""
import datetime
from pathlib import Path
import sqlite3
import sys
root = Path(__file__).resolve().parents[1]
path = Path(sys.argv[1]) if len(sys.argv) > 1 else root / 'bradiboo.db'
blocks = ['hero','intro','media','split','grid','rail','dynamic','cta','list','contact','headless_product','episodes','featured','collection','company_split','character_profile','character_moments','character_friends','braditime']
db = sqlite3.connect(path)
backup_dir = root / 'work/backups'
backup_dir.mkdir(parents=True, exist_ok=True)
backup_path = backup_dir / ('before-badge-color-' + datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f') + '.db')
backup = sqlite3.connect(backup_path)
db.backup(backup)
backup.close()
tables = [r[0] for r in db.execute("select name from sqlite_master where type='table' and name not like 'sqlite_%'")]
counts = {table: db.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0] for table in tables}
added = 0
db.execute('PRAGMA foreign_keys=ON')
with db:
 for prefix in ['pages_blocks_', '_pages_v_blocks_']:
  for block in blocks:
   table = prefix + block
   assert table in tables, table
   if any(r[1] == 'badge_background_color' for r in db.execute(f'PRAGMA table_info("{table}")')):
    continue
   db.execute(f'ALTER TABLE "{table}" ADD COLUMN "badge_background_color" TEXT DEFAULT \'#ffffff\'')
   added += 1
 for table, count in counts.items():
  assert db.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0] == count, table
 assert not db.execute('PRAGMA foreign_key_check').fetchall()
print(f'OK: {added} additive columns; existing record counts and foreign keys preserved. Backup: {backup_path.name}')
