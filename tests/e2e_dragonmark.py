"""End to end: the Mark of Detection feat gives its spells and one free-cast counter per spell (level 3 adds See Invisibility). python3 tests/e2e_dragonmark.py"""
import json,socket,threading,functools,http.server,os
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
g=json.load(open(ROOT+'/tests/golden/builds/fx_L1_feat_aquanaut_swim.json'))['build']
g['ch']={'feat4':{'feat':'Mark of Detection'}};g['level']=8
s=socket.socket();s.bind(('127.0.0.1',0));port=s.getsockname()[1];s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',port),functools.partial(Q,directory=ROOT));threading.Thread(target=srv.serve_forever,daemon=True).start()
url='http://127.0.0.1:%d/index.html'%port
bad=0
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,w,hh in [('390x844',390,844),('1250x850',1250,850)]:
        pg=b.new_context(viewport={'width':w,'height':hh}).new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.set_default_timeout(90000)
        pg.goto(url,wait_until='domcontentloaded',timeout=180000);pg.wait_for_timeout(1500)
        pg.evaluate("window.__bldNeed&&window.__bldNeed()");pg.wait_for_function("typeof window.__bldSheetFor==='function'",timeout=180000)
        pg.evaluate("b=>{const C=window.__bldSheetFor(b);window.__sheetSoft(C)}",g);pg.wait_for_timeout(800)
        d=pg.evaluate("()=>{const C=window.__sheetState().C;const n=new Set((C.spells||[]).map(x=>x.n));return {sp:['Detect Magic','Detect Poison and Disease','See Invisibility'].filter(x=>n.has(x)),res:(C.res||[]).filter(r=>/Mark of Detection/.test(r.n)).length}}")
        ok=len(d['sp'])==3 and d['res']>=3
        print(name,d,'ok',ok);bad+=0 if ok else 1
        if errs:print(name,'errors',errs);bad+=1
print('FAIL' if bad else 'OK');raise SystemExit(1 if bad else 0)
