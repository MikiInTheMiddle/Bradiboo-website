# Isolated outage test. Run against localhost only, never production.
# Build: node node_modules/next/dist/bin/next build scripts/fixtures/public-cache --webpack
# Serve: node node_modules/next/dist/bin/next start scripts/fixtures/public-cache --hostname 127.0.0.1 --port 3005
import json,time,urllib.request,urllib.error
from pathlib import Path
state=Path('/private/tmp/bradiboo-cache-upstream.json')
state.write_text(json.dumps({'fail':False,'value':'published-v1'}))
Path('/private/tmp/bradiboo-cache-calls.txt').write_text('')
def call(path,method='GET'):
 try:
  with urllib.request.urlopen(urllib.request.Request('http://127.0.0.1:3005/api/'+path,method=method),timeout=10) as r:return r.status,json.load(r)
 except urllib.error.HTTPError as e:return e.code,json.load(e)
assert call('read')==(200,{'value':'published-v1'})
assert call('read')==(200,{'value':'published-v1'})
assert len(Path('/private/tmp/bradiboo-cache-calls.txt').read_text().splitlines())==1
state.write_text(json.dumps({'fail':True,'value':'never-published'}))
time.sleep(2.2)
assert call('read')==(200,{'value':'published-v1'})
time.sleep(.3)
assert call('read')==(200,{'value':'published-v1'})
assert call('invalidate','POST')[0]==200
time.sleep(.3)
assert call('read')==(503,{'unavailable':True}), 'Unpublished old version must not survive hard invalidation'
state.write_text(json.dumps({'fail':False,'value':'published-v2'}))
assert call('read')==(200,{'value':'published-v2'})
print('PASS: warm cache, no repeated query, upstream failure serves last public version, hard invalidation removes old version, failed cold read never cached, recovery loads new version.')
