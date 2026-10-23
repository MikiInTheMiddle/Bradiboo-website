"""Read-only audit of current, historical and literal Media references."""
import sqlite3,json,urllib.parse
from pathlib import Path
root=Path(__file__).resolve().parents[1]
db=sqlite3.connect(root/'bradiboo.db');db.row_factory=sqlite3.Row
media=[dict(r) for r in db.execute('select * from media')]
refs={r['id']:[] for r in media}
tables=[r[0] for r in db.execute("select name from sqlite_master where type='table' and name not like 'sqlite_%'")]
for table in tables:
 if table.startswith('payload_locked'):continue
 for fk in db.execute(f'pragma foreign_key_list("{table}")'):
  if fk['table']!='media':continue
  for row in db.execute(f'SELECT DISTINCT "{fk["from"]}" FROM "{table}" WHERE "{fk["from"]}" IS NOT NULL'):
   if row[0] in refs:refs[row[0]].append({'table':table,'column':fk['from']})
candidates=[m for m in media if not refs[m['id']]]
texts=[]
for folder in ['app','components','lib','public']:
 for file in (root/folder).rglob('*'):
  if file.is_file() and file.suffix in ['.js','.ts','.tsx','.json','.css','.svg']:
   try:texts.append((str(file.relative_to(root)),file.read_text()))
   except UnicodeError:pass
for m in candidates:
 needles=[m['filename'],urllib.parse.quote(m['filename'])]
 for name,text in texts:
  if any(n in text for n in needles):refs[m['id']].append({'literal':name})
 for table in tables:
  if table=='media' or table.startswith('payload_locked'):continue
  for column in db.execute(f'pragma table_info("{table}")'):
   if not any(x in column['type'].lower() for x in ['text','char','json']):continue
   for value, in db.execute(f'SELECT "{column["name"]}" FROM "{table}" WHERE "{column["name"]}" IS NOT NULL'):
    if isinstance(value,str) and any(n in value for n in needles):refs[m['id']].append({'literal_table':table,'column':column['name']});break
report={'total':len(media),'unused':[m for m in media if not refs[m['id']]],'historicalOnly':[{'id':m['id'],'filename':m['filename']} for m in media if refs[m['id']] and all(r.get('table','').startswith('_') for r in refs[m['id']])],'references':refs}
output=root/'work/reports/media-unused-audit-20261020.json';output.parent.mkdir(parents=True,exist_ok=True);output.write_text(json.dumps(report,indent=2))
print(json.dumps({k:v for k,v in report.items() if k!='references' and k!='unused'},ensure_ascii=False))
print('Unused:',[(m['id'],m['filename']) for m in report['unused']])
