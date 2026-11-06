"""Local-only SSG/event-invalidation integration check (disposable fixture)."""
import json,time,urllib.request,urllib.error
from pathlib import Path
base='http://127.0.0.1:3008'
state=Path('/private/tmp/bradiboo-static-entries.json')
reads=Path('/private/tmp/bradiboo-static-reads.txt')
def call(path,data=None):
 req=urllib.request.Request(base+path,data=json.dumps(data).encode() if data is not None else None,headers={'Content-Type':'application/json'})
 try:
  with urllib.request.urlopen(req,timeout=15) as r:return r.status,r.read().decode(),dict(r.headers)
 except urllib.error.HTTPError as e:return e.code,e.read().decode(),dict(e.headers)
def save(value):state.write_text(json.dumps(value))
def edited(slug,doc=None,previous=None,**extra):
 return call('/api/edit',{'collectionSlug':'pages','doc':doc or {'path':'/entries/'+slug,'_status':'published'},'previousDoc':previous or {'path':'/entries/'+slug,'_status':'published'},**extra})
def wait_value(path,value):
 for _ in range(30):
  result=call(path)
  if result[0]==200 and value in result[1]:return result
  time.sleep(.1)
 raise AssertionError('Updated published content did not appear')
initial=len(reads.read_text().splitlines())
for _ in range(3):
 status,body,headers=call('/entries/one');assert status==200 and 'Published One V1' in body
 assert headers.get('x-nextjs-cache')=='HIT', headers
assert len(reads.read_text().splitlines())==initial,'A static page must not repeat the CMS read'
current=json.loads(state.read_text());current['entries']['one']['value']='Published One V2';save(current)
assert edited('one')[0]==200
wait_value('/entries/one','Published One V2')
assert call('/entries/two')[0]==200
assert reads.read_text().splitlines().count('two')==1,'Editing one page must not regenerate unrelated pages'
time.sleep(.3)
count=len(reads.read_text().splitlines())
assert edited('one',doc={'path':'/entries/one','_status':'draft'},req={'query':{'draft':'true'}})[0]==200
assert 'Published One V2' in call('/entries/one')[1]
assert len(reads.read_text().splitlines())==count,'Saving a draft must not invalidate the published snapshot'
current['entries']['one']['published']=False;save(current)
assert edited('one',doc={'path':'/entries/one','_status':'draft'})[0]==200
time.sleep(.1)
status,body,_=call('/entries/one');assert status==404 and 'Published One V2' not in body,'Unpublished content must disappear immediately'
assert call('/entries/new')[0]==404
current['entries']['new']={'published':True,'value':'Newly Published Page'};save(current)
assert edited('new',previous={'path':'/entries/new','_status':'draft'})[0]==200
wait_value('/entries/new','Newly Published Page')
print('PASS: SSG HIT with zero repeated reads; targeted edit; draft save does not invalidate; unpublish becomes 404; newly published path works without a rebuild.')
