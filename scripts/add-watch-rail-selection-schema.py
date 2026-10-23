import sqlite3,time
c=sqlite3.connect('bradiboo.db');b=sqlite3.connect(f'work/backups/before-watch-page-rail-selection-{int(time.time())}.db');c.backup(b);b.close()
columns=[r for r in c.execute('pragma table_info(watch_rails)') if r[1].startswith(('card_appearance_','surface_'))]
statements=[]
for prefix,version in [('',False),('_pages_v_',True)]:
 parent='_pages_v_blocks_watch_experience' if version else 'pages_blocks_watch_experience'
 table='_watch_page_rails_v' if version else 'watch_page_rails'
 if 'rail_mode' not in {r[1] for r in c.execute(f'pragma table_info({parent})')}:statements.append(f'ALTER TABLE "{parent}" ADD COLUMN rail_mode TEXT;')
 defs=['"_order" INTEGER NOT NULL',f'"_parent_id" {"INTEGER" if version else "TEXT"} NOT NULL',f'"id" {"INTEGER" if version else "TEXT"} PRIMARY KEY NOT NULL','"rail_i_d" TEXT','"draft" INTEGER','"title" TEXT','"description" TEXT']
 defs += [f'"{r[1]}" {r[2]}' for r in columns]
 if version:defs+=['"_uuid" TEXT']
 defs += [f'FOREIGN KEY("_parent_id") REFERENCES "{parent}"("id") ON DELETE CASCADE']
 for col in ['surface_background_image_id','surface_mobile_image_id']:defs += [f'FOREIGN KEY("{col}") REFERENCES media(id) ON DELETE SET NULL']
 statements.append(f'CREATE TABLE IF NOT EXISTS "{table}" ('+','.join(defs)+');')
 statements.append(f'CREATE INDEX IF NOT EXISTS "{table}_parent_idx" ON "{table}"("_parent_id");')
for sql in statements:c.execute(sql)
c.commit();open('scripts/watch-page-rails-schema.sql','w').write('\n'.join(statements)+'\n')
print('Additive page rail selection schema installed; existing settings retained.')
