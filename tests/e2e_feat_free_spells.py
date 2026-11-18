"""End to end: feats that always prepare a spell and let you cast it once per Long Rest put that spell on the sheet (a Wizard 5 with the feat), so the clause gate may count the spell sentences of these feats as covered."""
import json,socket,threading,functools,http.server,os,sys
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
g=json.load(open(ROOT+'/tests/golden/builds/fx_L1_paladin_radiant_strikes.json'))['build']
s=socket.socket();s.bind(('127.0.0.1',0));port=s.getsockname()[1];s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',port),functools.partial(Q,directory=ROOT));threading.Thread(target=srv.serve_forever,daemon=True).start()
feats=json.load(open(os.path.join(ROOT,'tests','feat_free_spells.json')))
bad=0
with sync_playwright() as p:
    br=p.chromium.launch();pg=br.new_context(viewport={'width':390,'height':844}).new_page();pg.set_default_timeout(90000)
    pg.goto('http://127.0.0.1:%d/index.html'%port,wait_until='domcontentloaded',timeout=180000);pg.wait_for_timeout(1500)
    pg.evaluate("window.__bldNeed&&window.__bldNeed()");pg.wait_for_function("typeof window.__bldSheetFor==='function'",timeout=180000)
    for f,names in feats.items():
        a=dict(g);a['cls']='Wizard';a['sub']='';a['level']=5;a['ch']={'feat4':{'feat':f}}
        pg.evaluate("b=>{const C=window.__bldSheetFor(b);window.__sheetSoft(C)}",a);pg.wait_for_timeout(700)
        sp=pg.evaluate("()=>(window.__sheetState().C.spells||[]).map(s=>s.n)")
        miss=[n for n in names if n and not n.startswith('level') and n.lower() not in [x.lower() for x in sp]]
        print(f,'missing' if miss else 'ok',miss)
        if miss: bad+=1

print('FAIL' if bad else 'OK');raise SystemExit(1 if bad else 0)
