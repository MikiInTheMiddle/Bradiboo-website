"""Rename only inherited standard titles. Keep custom overrides and revision history."""
import sqlite3,datetime,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
c=sqlite3.connect(root/'bradiboo.db')
backup=root/'work/backups'/f'profile-labels-{datetime.datetime.now():%Y%m%d-%H%M%S}.db'
with sqlite3.connect(backup) as dest:c.backup(dest)
with c:
 for key,old,new in [('identity','Chi è','Chi sono'),('passions','Passioni e competenze','Cosa mi piace'),('traits','Peculiarità','Come sono')]:
  cur=c.execute('UPDATE pages_blocks_character_profile_cards SET label=? WHERE profile_field=? AND source_mode=? AND COALESCE(override_content,0)=0 AND label=?',(new,key,'profile',old))
  print(new,cur.rowcount)
c.close()
