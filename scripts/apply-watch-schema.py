"""Reviewed additive migration: no tables/columns are replaced or removed."""
from pathlib import Path
import sqlite3, re, datetime
root=Path(__file__).resolve().parents[1]
db=sqlite3.connect(root/'bradiboo.db')
backup_dir=root/'work/backups';backup_dir.mkdir(parents=True,exist_ok=True)
backup=sqlite3.connect(backup_dir/('before-watch-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S')+'.db'))
db.backup(backup);backup.close()
before={t:db.execute(f'SELECT COUNT(*) FROM "{t}"').fetchone()[0] for t, in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")}
raw=(root/'scripts/watch-additive-schema.sql').read_text()
raw='\n'.join(line for line in raw.splitlines() if not line.startswith('--'))
statements=[s.strip() for s in raw.split(';') if s.strip()]
db.execute('PRAGMA foreign_keys=ON');db.execute('BEGIN')
try:
 for sql in statements:
  if sql.startswith('ALTER TABLE'):
   match=re.match(r'ALTER TABLE "([^"]+)" ADD COLUMN "([^"]+)"',sql)
   if not match:raise ValueError('Unexpected ALTER')
   table,column=match.groups()
   if any(c[1]==column for c in db.execute(f'PRAGMA table_info("{table}")')):continue
  elif sql.startswith('CREATE TABLE'):sql=sql.replace('CREATE TABLE','CREATE TABLE IF NOT EXISTS',1)
  elif sql.startswith('CREATE UNIQUE INDEX'):sql=sql.replace('CREATE UNIQUE INDEX','CREATE UNIQUE INDEX IF NOT EXISTS',1)
  elif sql.startswith('CREATE INDEX'):sql=sql.replace('CREATE INDEX','CREATE INDEX IF NOT EXISTS',1)
  else:raise ValueError('Only additive statements allowed')
  db.execute(sql)
 for table,count in before.items():assert db.execute(f'SELECT COUNT(*) FROM "{table}"').fetchone()[0]==count,table
 assert not list(db.execute('PRAGMA foreign_key_check'))
 db.commit();print('Schema Guarda aggiunto: tutti i record esistenti preservati.')
except:
 db.rollback();raise
