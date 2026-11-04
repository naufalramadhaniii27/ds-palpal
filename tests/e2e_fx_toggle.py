"""End to end: Aberrant Horror chip on the sheet changes AC through the real hooks (S.fxT, __bldFxToggle). python3 tests/e2e_fx_toggle.py"""
import json,sys,socket,threading,functools,http.server
from playwright.sync_api import sync_playwright
import os
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
g=json.load(open(ROOT+'/tests/golden/builds/fx_G_aberrant_chitinous_off.json'))['build']
s=socket.socket();s.bind(('127.0.0.1',0));port=s.getsockname()[1];s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',port),functools.partial(Q,directory=ROOT));threading.Thread(target=srv.serve_forever,daemon=True).start()
url='http://127.0.0.1:%d/index.html'%port
res=[]
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,w,h in [('390x844',390,844),('1250x850',1250,850)]:
        ctx=b.new_context(viewport={'width':w,'height':h});pg=ctx.new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.set_default_timeout(90000)
        pg.goto(url,wait_until='domcontentloaded',timeout=180000);pg.wait_for_timeout(1500)
        pg.evaluate("window.__bldNeed&&window.__bldNeed()")
        pg.wait_for_function("typeof window.__bldSheetFor==='function'",timeout=180000)
        # save builder state, make the sheet from it
        pg.evaluate("b=>{__store.setItem('phb24-builder-v1',JSON.stringify(b))}",g)
        pg.reload();pg.wait_for_timeout(2000)
        pg.wait_for_function("typeof window.__bldSheetFor==='function'")
        pg.evaluate("b=>{const C=window.__bldSheetFor(b);window.__sheetSoft(C)}",g)
        pg.wait_for_timeout(800)
        pg.evaluate("()=>{var h=document.getElementById('homeV'); if(h) h.style.display='none'}");pg.wait_for_timeout(500)
        chip=pg.query_selector('[data-fxt]')
        res.append((name,'chip visible',bool(chip and chip.is_visible())))
        if chip:
            lab=chip.inner_text()[:40]
            def acv():
                a=pg.evaluate("window.__sheetState().C.ac");return a['base']+sum(x['v'] for x in a['bonus'])
            v0=acv();pg.evaluate("()=>document.querySelector('[data-fxt]').click()");pg.wait_for_timeout(1200)
            v1=acv();on=pg.evaluate("window.__sheetState().fxT")
            res.append((name,'AC off->on',v0,v1,json.dumps(on),lab))
            pg.evaluate("()=>document.querySelector('[data-fxt]').click()");pg.wait_for_timeout(1200)
            res.append((name,'AC back off',acv()))
            pass #'/tmp/claude-0/-home-claude/6717b3a4-237f-5333-9ca8-5177ec02a694/scratchpad/e2e-%s.png'%name)
        res.append((name,'errors',errs))
        ctx.close()
    b.close()
bad=[r for r in res if (r[1]=='chip visible' and not r[2]) or (r[1]=='AC off->on' and not (r[3]>r[2])) or (r[1]=='AC back off' and r[2]!=[x for x in res if x[0]==r[0] and x[1]=='AC off->on'][0][2]) or (r[1]=='errors' and r[2])]
for r in res:print(r)
print('e2e fx toggle', 'FAIL' if bad else 'OK')
sys.exit(1 if bad else 0)
