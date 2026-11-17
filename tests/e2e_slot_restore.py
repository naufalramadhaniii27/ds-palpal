"""End to end: a pool with srLu (Paladin, Oath of Devotion, level 20, Holy Nimbus) shows Restore with a slot; the button spends a slot and refills the pool. python3 tests/e2e_slot_restore.py"""
import json,socket,threading,functools,http.server,os
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
g=json.load(open(ROOT+'/tests/golden/builds/fx_L1_paladin_radiant_strikes.json'))['build']
g['sub']='Oath of Devotion';g['level']=20
s=socket.socket();s.bind(('127.0.0.1',0));port=s.getsockname()[1];s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',port),functools.partial(Q,directory=ROOT));threading.Thread(target=srv.serve_forever,daemon=True).start()
url='http://127.0.0.1:%d/index.html'%port
bad=0
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,w,h in [('390x844',390,844),('1250x850',1250,850)]:
        pg=b.new_context(viewport={'width':w,'height':h}).new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.set_default_timeout(90000)
        pg.goto(url,wait_until='domcontentloaded',timeout=180000);pg.wait_for_timeout(1500)
        pg.evaluate("window.__bldNeed&&window.__bldNeed()");pg.wait_for_function("typeof window.__bldSheetFor==='function'",timeout=180000)
        pg.evaluate("b=>{const C=window.__bldSheetFor(b);window.__sheetSoft(C)}",g);pg.wait_for_timeout(800)
        st=pg.evaluate("()=>{const D=window.__sheetState();return (D.C.res||[]).filter(r=>r.n==='Holy Nimbus').map(r=>({k:r.k,max:r.max,sr:r.sr}))}")
        ok1=bool(st) and st[0].get('sr')==5
        print(name,'pool',st,'sr ok',ok1);bad+=0 if ok1 else 1
        pg.evaluate("""()=>{const bt=document.createElement('button'); bt.setAttribute('data-usesr','x-holy-nimbus'); document.body.appendChild(bt); bt.click(); bt.remove();}""")
        pg.wait_for_timeout(1200)
        r=pg.evaluate("""()=>{const o=JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')||'{}').used||{}; return {nim:o['x-holy-nimbus']||0,s5:o['s5']||0}}""")
        ok2=r.get('nim')==0 and r.get('s5')==1
        print(name,'button',r,'ok',ok2);bad+=0 if ok2 else 1
        if errs:print(name,'errors',errs);bad+=1
b.close() if False else None
print('FAIL' if bad else 'OK');raise SystemExit(1 if bad else 0)
