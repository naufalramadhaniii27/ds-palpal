"""End to end: Font of Magic (Sorcerer 5) trades a slot for points and points for a made slot that a Long Rest removes; Font of Inspiration (Bard 5) trades a slot for a Bardic Inspiration use. python3 tests/e2e_font_convert.py"""
import json,socket,threading,functools,http.server,os
from playwright.sync_api import sync_playwright
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
g=json.load(open(ROOT+'/tests/golden/builds/fx_L1_paladin_radiant_strikes.json'))['build']
s=socket.socket();s.bind(('127.0.0.1',0));port=s.getsockname()[1];s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a):pass
srv=http.server.ThreadingHTTPServer(('127.0.0.1',port),functools.partial(Q,directory=ROOT));threading.Thread(target=srv.serve_forever,daemon=True).start()
url='http://127.0.0.1:%d/index.html'%port
bad=0
CLICK="spec=>{const b=document.createElement('button');b.setAttribute('data-conv',spec);document.body.appendChild(b);b.click();b.remove()}"
ST="()=>{const D=window.__sheetState().C;return JSON.parse(__store.getItem('yudhi-kelapa-sheet-v1')||'{}')}"
def chk(name,label,cond):
    global bad
    print(name,label,'ok' if cond else 'FAIL')
    if not cond: bad+=1
with sync_playwright() as p:
    br=p.chromium.launch()
    for name,w,hh in [('390x844',390,844),('1250x850',1250,850)]:
        pg=br.new_context(viewport={'width':w,'height':hh}).new_page();errs=[];pg.on('pageerror',lambda e:errs.append(str(e)));pg.set_default_timeout(90000)
        pg.goto(url,wait_until='domcontentloaded',timeout=180000);pg.wait_for_timeout(1500)
        pg.evaluate("window.__bldNeed&&window.__bldNeed()");pg.wait_for_function("typeof window.__bldSheetFor==='function'",timeout=180000)
        a=dict(g);a['cls']='Sorcerer';a['sub']='';a['level']=5
        pg.evaluate("b=>{const C=window.__bldSheetFor(b);window.__sheetSoft(C)}",a);pg.wait_for_timeout(800)
        cv=pg.evaluate("()=>(window.__sheetState().C.res||[]).filter(r=>r.cv).map(r=>r.cv)")
        chk(name,'sorcerer has the conversion flag',cv==['sp:5'])
        # make a level 4 slot with 6 points, then check the rows
        pg.evaluate(CLICK,"sp|m|4");pg.wait_for_timeout(700)
        chk(name,'level 4 slot refused (6 points, only 5 held)',not pg.evaluate(ST).get('xs'))
        pg.evaluate(CLICK,"sp|m|2");pg.wait_for_timeout(700)
        st=pg.evaluate(ST);u=st.get('used',{});xs=st.get('xs',{})
        chk(name,'made a level 2 slot: 3 points spent',u.get('r-sorcery-points')==3 and xs.get('2')==1)
        # spend a level 1 slot for points: points must come back (used drops by 1)
        pg.evaluate(CLICK,"sp|g|1");pg.wait_for_timeout(700)
        s2=pg.evaluate(ST);chk(name,'slot 1 spent, points regained',s2['used'].get('s1')==1 and s2['used'].get('r-sorcery-points')==2)
        # a Long Rest removes the made slot
        pg.evaluate("()=>{const b=[...document.querySelectorAll('button')].find(x=>/Long Rest/.test(x.textContent||''));}")
        r2=pg.evaluate("()=>window.__sheetRes().filter(r=>r.k==='s2').map(r=>r.max)")
        chk(name,'level 2 slots: 3 plus the made one',r2==[4])
        pg.evaluate("()=>window.__sheetRest('long')");pg.wait_for_timeout(700)
        r3=pg.evaluate("()=>window.__sheetRes().filter(r=>r.k==='s2').map(r=>r.max)");st=pg.evaluate(ST)
        print(name,'after rest',r3,st.get('xs'),st['used'])
        chk(name,'Long Rest removes the made slot and resets the counters',r3==[3] and not st.get('xs') and not st['used'].get('s1'))
        # Bard
        b2=dict(g);b2['cls']='Bard';b2['sub']='';b2['level']=5
        pg.evaluate("b=>{const C=window.__bldSheetFor(b);window.__sheetSoft(C)}",b2);pg.wait_for_timeout(800)
        cv=pg.evaluate("()=>(window.__sheetState().C.res||[]).filter(r=>r.cv).map(r=>r.cv)")
        chk(name,'bard has the conversion flag',cv==['bi:5'])
        pg.evaluate("()=>{const b=document.createElement('button');b.setAttribute('data-usef','r-bardic-inspiration|-1');document.body.appendChild(b);b.click();b.remove()}");pg.wait_for_timeout(500)
        u0=pg.evaluate(ST)['used'].get('r-bardic-inspiration')
        pg.evaluate(CLICK,"bi|g|1");pg.wait_for_timeout(700)
        u1=pg.evaluate(ST)['used']
        chk(name,'bard: a slot buys back the used Bardic Inspiration',u0==1 and u1.get('r-bardic-inspiration')==0 and u1.get('s1')==1)
        if errs:print(name,'errors',errs);bad+=1
print('FAIL' if bad else 'OK');raise SystemExit(1 if bad else 0)
