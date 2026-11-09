"""2024 long text for the official species traits. python3 tests/long24_sheet.py [OUTDIR]
Orc Fighter built with the 2024 rules and applied to the sheet: the feature Relentless Endurance stores `full` in localStorage and its card shows
the long text. 390x844 and 1250x850. Exit 1 when the text is missing or a page error happens."""
import asyncio, functools, http.server, socket, threading, sys, os
from playwright.async_api import async_playwright
HERE=os.path.dirname(os.path.abspath(__file__)); ROOT=os.path.dirname(HERE); OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(HERE,"out","long24"); os.makedirs(OUT,exist_ok=True); BAD=[]
def serve():
    s=socket.socket(); s.bind(("127.0.0.1",0)); p=s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    srv=http.server.ThreadingHTTPServer(("127.0.0.1",p),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start(); return srv,"http://127.0.0.1:%d/index.html"%p
BUILD="""()=>{ const L=window.__bldLists('2024'); const r=window.__bldFuzz({cls:'Fighter',sub:'',lv:1,sp:'Orc',bg:'Soldier',arr:L.arr,b2:0,b1:0,src:L.src}); window.__c14=r.c; return 1; }"""
async def run(b,url,W,H):
    ctx=await b.new_context(viewport={"width":W,"height":H},has_touch=W<600); pg=await ctx.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)[:150]))
    await pg.goto(url); await pg.evaluate("()=>localStorage.clear()"); await pg.reload()
    await pg.wait_for_function("()=>!!window.__bldFuzz&&!!window.__sheetApply",timeout=120000); await pg.evaluate("()=>window.__bldNeed().then(()=>1)")
    await pg.evaluate("()=>document.querySelector('[data-hnew]').click()"); await pg.wait_for_selector("#qbCls",state="attached",timeout=60000); await pg.wait_for_timeout(800)
    await pg.select_option("#qbCls","Fighter"); await pg.evaluate("()=>document.querySelector('[data-qb]').click()"); await pg.wait_for_timeout(1800)
    await pg.evaluate("()=>document.getElementById('b-toSheet').click()"); await pg.wait_for_timeout(1500)
    await pg.evaluate("()=>document.getElementById('b-close').click()"); await pg.wait_for_selector("#dmgBtn",state="visible",timeout=60000)
    await pg.wait_for_function("()=>!!window.__bldFuzz",timeout=60000); await pg.evaluate("()=>window.__bldNeed().then(()=>1)"); await pg.evaluate(BUILD)
    await pg.evaluate("()=>window.__sheetApply(window.__c14,'')"); await pg.wait_for_timeout(1500)
    stored=await pg.evaluate("()=>{for(let i=0;i<localStorage.length;i++){const v=localStorage.getItem(localStorage.key(i))||''; const m=/\"n\":\"Relentless Endurance\"[^}]*?\"full\":\"([^\"]{0,60})/.exec(v); if(m) return m[1];} return null;}")
    await pg.evaluate("()=>document.querySelector(\"[data-tab='p-fea'],[data-tab='p-feat'],[data-tab='p-features']\")&&document.querySelector(\"[data-tab='p-fea'],[data-tab='p-feat'],[data-tab='p-features']\").click()"); await pg.wait_for_timeout(800)
    ok=await pg.evaluate("""()=>{ const e=[...document.querySelectorAll('[data-info^=\"f:\"]')].filter(x=>/Relentless Endurance/.test(x.textContent))[0]; if(!e) return 'no card'; e.click(); return 'clicked'; }""")
    await pg.wait_for_timeout(1000)
    txt=await pg.evaluate("()=>document.body.innerText")
    seen="drop to 1 Hit Point instead. You can do this once, then again after a Long Rest" in txt
    print(W,"stored full:",stored,"| card:",ok,"| long text visible:",seen,"| errors:",errs)
    if not stored or ok!="clicked" or not seen or errs: BAD.append(W)
    await pg.screenshot(path="%s/sheet-%d.png"%(OUT,W)); await ctx.close()
async def main():
    srv,url=serve()
    async with async_playwright() as pw:
        b=await pw.chromium.launch()
        for W,H in ((390,844),(1250,850)): await run(b,url,W,H)
        await b.close()
    srv.shutdown()
asyncio.run(main())
print('ok' if not BAD else 'FAIL %s'%BAD); sys.exit(1 if BAD else 0)
