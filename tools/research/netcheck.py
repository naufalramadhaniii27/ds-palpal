# Research script (2026-10-30). APP_ROOT=<folder with index.html>. Measures only.
import asyncio, json, functools, http.server, socket, threading
from playwright.async_api import async_playwright
import os; ROOT=os.environ.get("APP_ROOT",".")
def serve():
    s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT))
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    return srv,port
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
async def main():
    srv,port=serve(); url="http://127.0.0.1:%d/index.html"%port
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844}); pg=await ctx.new_page()
        ext=[]; own=[0]; kinds={}
        def onreq(r):
            u=r.url
            if u.startswith("http://127.0.0.1:%d/"%port): own[0]+=1; k=u.split("/")[-1].split(".")[-1].split("?")[0][:5]; kinds[k]=kinds.get(k,0)+1
            elif not u.startswith("data:") and not u.startswith("blob:"): ext.append(u[:100])
        pg.on("request",onreq)
        await pg.goto(url); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(1500)
        for t in await pg.query_selector_all("#tabs .tab, #bnav button"):
            try:
                if await t.is_visible(): await t.click(timeout=2000); await pg.wait_for_timeout(250)
            except Exception: pass
        await pg.keyboard.press("l"); await pg.wait_for_timeout(800); await pg.keyboard.press("Escape")
        # roll a die (loads 3D dice) via breakdown if possible
        await pg.wait_for_timeout(1500)
        print("same-origin requests:",own[0],kinds)
        print("external requests:",len(ext),ext[:5])
        await b.close()
    srv.shutdown()
asyncio.run(main())
