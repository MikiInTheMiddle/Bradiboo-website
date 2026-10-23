"""Apply only additive schema differences from a disposable publication schema."""
import sqlite3,datetime,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
ref=sqlite3.connect(sys.argv[1]);db=sqlite3.connect(root/'bradiboo.db')
backup=sqlite3.connect(root/'work/backups'/('before-branch-publication-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S')+'.db'));db.backup(backup);backup.close()
names={r[0] for r in db.execute('select name from sqlite_master')};sql=[];initialize=False
for table,create in ref.execute("select name,sql from sqlite_master where type='table' and name not like 'sqlite_%'"):
 if table not in names:
  assert table.startswith('_production_containers_v'),table
  sql.append(create+';');continue
 old={c[1] for c in db.execute(f'pragma table_info("{table}")')}
 for c in ref.execute(f'pragma table_info("{table}")'):
  if c[1] in old:continue
  assert c[1] in ['_status','show_in_explore','version_show_in_explore'],(table,c)
  assert not c[3]
  statement=f'ALTER TABLE "{table}" ADD COLUMN "{c[1]}" {c[2]}'
  if c[4] is not None:statement+=' DEFAULT '+c[4]
  sql.append(statement+';')
  if table=='production_containers' and c[1]=='_status':initialize=True
for name,create in ref.execute("select name,sql from sqlite_master where type='index' and sql is not null"):
 if name not in names:sql.append(create+';')
before={t:db.execute(f'select count(*) from "{t}"').fetchone()[0] for (t,) in db.execute("select name from sqlite_master where type='table' and name not like 'sqlite_%'")}
with db:
 for statement in sql:db.execute(statement)
 if initialize:db.execute('UPDATE production_containers SET _status=?',('published',))
 for table,count in before.items():assert db.execute(f'select count(*) from "{table}"').fetchone()[0]==count
 assert not list(db.execute('pragma foreign_key_check'))
(root/'scripts/branch-publication-schema.sql').write_text('\n'.join(sql)+'\n'+("UPDATE production_containers SET _status='published';\n" if initialize else ''))
print('Additive statements:',len(sql),'; existing containers kept published; child states unchanged.')
