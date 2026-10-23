import sqlite3,json,concurrent.futures,urllib.request,urllib.error
from pathlib import Path
c=sqlite3.connect('bradiboo.db')
routes=c.execute("select path,redirect_to from pages where _status='published' order by path").fetchall()
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*args):return None
opener=urllib.request.build_opener(NoRedirect)
def check(row):
 route,redirect=row
 try:
  r=opener.open('http://localhost:3000'+route,timeout=90);body=r.read().decode();status=r.status
 except urllib.error.HTTPError as e:status=e.code;body=e.read().decode()
 except Exception as e:return {'path':route,'error':str(e),'ok':False}
 return {'path':route,'status':status,'ok':status in ([301,302,307,308] if redirect else [200]),'sharedShell':'site-ui' in body,'immersive':'home-immersive' in body,'error':'SQLITE_ERROR' in body or 'Impossibile caricare' in body}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:results=list(pool.map(check,routes))
Path('work/reports/site-routes-20261020.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
assert all(r['ok'] and not r.get('error') and (r['path']=='/' or not r.get('immersive')) for r in results)
print('OK:',len(results),'pagine pubblicate, menu immersivo solo Home.')
