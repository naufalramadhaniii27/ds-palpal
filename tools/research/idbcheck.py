# Research script (2026-10-30). APP_ROOT=<folder with index.html>. Truncates the localStorage mirror and reads IndexedDB afterwards. Measures only.
import asyncio, json, functools, http.server, socket, threading
from playwright.async_api import async_playwright
import os; ROOT=os.environ.get("APP_ROOT",".")
def serve():
    s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT))
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    return srv,"http://127.0.0.1:%d/index.html"%port
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
IDBGET="""()=>new Promise(function(res){ var r=indexedDB.open('dnd-sheet'); r.onerror=function(){res('no db')}; r.onsuccess=function(){ var db=r.result; try{ var g=db.transaction(['kv'],'readonly').objectStore('kv').get('yudhi-kelapa-build-v3'); g.onsuccess=function(){ var v=g.result; var ok=false,nm=''; try{ var p=JSON.parse(v); ok=!!(p&&p.v===3); nm=p&&p.name; }catch(e){} res({len:(v||'').length,validJSON:ok,name:nm}); }; g.onerror=function(){res('get err')}; }catch(e){res('tx err '+e)} } })"""
async def main():
    srv,url=serve()
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844}); pg=await ctx.new_page()
        await pg.goto(url); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload(); await pg.wait_for_timeout(2500)
        print("1 after good boot, IndexedDB:",await pg.evaluate(IDBGET))
        await pg.evaluate("v=>{localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX[:len(FIX)//2])
        await pg.reload(); await pg.wait_for_timeout(3000)
        t=await pg.evaluate("()=>document.body.innerText.slice(0,40).replace(/\\s+/g,' ')")
        print("2 after truncated mirror, screen shows:",t)
        print("2 IndexedDB now:",await pg.evaluate(IDBGET))
        print("2 localStorage now length:",await pg.evaluate("()=>(localStorage.getItem('yudhi-kelapa-build-v3')||'').length"))
        # make an edit: damage 1 HP then wait for save
        try:
            await pg.click("[data-hview]",timeout=1500)
        except Exception: pass
        await pg.wait_for_timeout(500)
        try:
            await pg.fill("#hpAmt","1",timeout=1500); await pg.click("#dmgBtn",timeout=1500)
        except Exception as e: print("no hp ui:",str(e)[:50])
        await pg.wait_for_timeout(2500)
        print("3 after an edit, IndexedDB:",await pg.evaluate(IDBGET))
        await b.close()
    srv.shutdown()
asyncio.run(main())
