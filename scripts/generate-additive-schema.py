"""Compare a disposable Payload schema to local DB; emit nullable additions only."""
import sqlite3,sys
from pathlib import Path
root=Path(__file__).resolve().parents[1]
reference=sqlite3.connect(sys.argv[1]);current=sqlite3.connect(root/'bradiboo.db')
names={x[0] for x in current.execute('select name from sqlite_master')};statements=[]
for table,sql in reference.execute("select name,sql from sqlite_master where type='table' and name not like 'sqlite_%'"):
 if table not in names:statements.append(sql.replace('`','"')+';');continue
 columns={x[1] for x in current.execute(f'PRAGMA table_info("{table}")')}
 for column in reference.execute(f'PRAGMA table_info("{table}")'):
  if column[1] in columns:continue
  assert not column[3] and not column[5],'Only nullable additions supported'
  addition=f'ALTER TABLE "{table}" ADD COLUMN "{column[1]}" {column[2]}'
  if column[4] is not None:addition+=' DEFAULT '+column[4]
  for fk in reference.execute(f'PRAGMA foreign_key_list("{table}")'):
   if fk[3]==column[1]:addition+=f' REFERENCES "{fk[2]}"("{fk[4]}") ON UPDATE {fk[5]} ON DELETE {fk[6]}'
  statements.append(addition+';')
for name,sql in reference.execute("select name,sql from sqlite_master where type='index' and sql is not null"):
 if name not in names:statements.append(sql.replace('`','"')+';')
output=root/'scripts/watch-additive-schema.sql'
with output.open('a') as file:file.write('\n-- Additive schema extension\n'+'\n'.join(statements)+'\n')
print('Nullable additions/new tables/indexes:',len(statements))
