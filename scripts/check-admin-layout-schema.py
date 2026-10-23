"""Presentation-only changes must preserve the entire generated storage schema."""
import sqlite3,sys
before=sqlite3.connect(sys.argv[1]);after=sqlite3.connect(sys.argv[2])
def schema(db):
 result={}
 for name,kind,sql in db.execute("select name,type,sql from sqlite_master where name not like 'sqlite_%' and sql is not null"):
  if kind=='table':
   columns={r[1]:(r[2],r[3],r[4],r[5]) for r in db.execute(f'pragma table_info("{name}")')}
   keys=sorted(tuple(r[2:]) for r in db.execute(f'pragma foreign_key_list("{name}")'))
   result[name]=(kind,columns,keys)
  else:result[name]=(kind,' '.join(sql.split()))
 return result
old=schema(before);new=schema(after)
diffs=[name for name in sorted(set(old)|set(new)) if old.get(name)!=new.get(name)]
assert not diffs,'Schema changes: '+repr(diffs)
print(f'OK: {len(old)} tabelle/indici invariati. Nessuna migrazione dei dati richiesta.')
