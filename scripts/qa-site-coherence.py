"""Read-only checks against the running local preview; no CMS writes."""
import json,urllib.request,urllib.parse,sqlite3,concurrent.futures
from html.parser import HTMLParser
from pathlib import Path
base='http://127.0.0.1:3000'
class NavParser(HTMLParser):
 def __init__(self):super().__init__();self.nav=None;self.navs={};self.active=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='nav':self.nav=a.get('aria-label');self.navs.setdefault(self.nav,[])
  if tag=='a' and self.nav:
   self.navs[self.nav].append(a.get('href'))
   if a.get('aria-current')=='page':self.active.append((self.nav,a.get('href')))
 def handle_endtag(self,tag):
  if tag=='nav':self.nav=None

def read(path):
 r=urllib.request.urlopen(base+path,timeout=30);return r.status,r.read().decode(),r.url

def run():
 paths=['/','/guarda','/guarda/telecomando','/studio','/studio/approccio','/studio/perche-bradiboo','/studio/team','/studio/partnership','/studio/partnership/aziende','/studio/partnership/sociale','/studio/contatti','/mappa-sito']
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:pages=dict(zip(paths,pool.map(read,paths)))
 main=None;footer=None
 for path,(status,html,url) in pages.items():
  assert status==200,path
  parser=NavParser();parser.feed(html)
  if main is None:main=parser.navs['Navigazione principale'];footer=parser.navs['Footer']
  assert parser.navs['Navigazione principale']==main,(path,'menu principale diverso')
  assert parser.navs['Footer']==footer,(path,'footer diverso')
  if path.startswith('/studio'):
   assert len(parser.navs['Navigazione Studio'])==6,path
   active='/studio/partnership' if path.startswith('/studio/partnership/') else path
   assert ('Navigazione Studio',active) in parser.active,(path,parser.active)
  else:assert 'Navigazione Studio' not in parser.navs,path
 sitemap=pages['/mappa-sito'][1]
 assert 'href="/guarda/telecomando"' in sitemap
 assert 'href="/guarda/serie/bradiboo/episodio-pil"' not in sitemap
 assert 'href="mailto:ciao@bradiboo.com"' in pages['/studio/contatti'][1]
 assert 'Michele Panzeri' in pages['/studio/team'][1]
 assert 'BradiCare' in pages['/studio/partnership/sociale'][1]
 assert 'BradiYOU' in pages['/studio/partnership/aziende'][1]
 pilot=read('/guarda/serie/bradiboo/episodio-pil');assert 'contenuto=episodio-pil' in pilot[2]
 selected=read('/guarda?contenuto=video-ss2xsp6ykxo')[1]
 assert 'Scheda episodio: CHE GIORNATA! 1x01 ring, ring, RING!' in selected
 assert 'href="/guarda?contenuto=video-ss2xsp6ykxo#watch-player"' in read('/guarda/miniserie/che-giornata')[1]
 # All map destinations resolve, including intentionally draft preview areas.
 db=sqlite3.connect(Path(__file__).resolve().parents[1]/'bradiboo.db')
 map_paths=[r[0] for r in db.execute('select path from pages where coalesce(hide_from_sitemap,0)=0')]
 with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
  for path,response in zip(map_paths,pool.map(read,map_paths)):assert response[0]==200,path
 print(f'OK: {len(map_paths)} destinazioni mappa, menu/footer condivisi, contesto Studio isolato/attivo, fonti Studio, mailto, redirect e selezione player.')
if __name__=='__main__':run()
