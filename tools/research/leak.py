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
    return srv,"http://127.0.0.1:%d/index.html"%port
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
async def snap(pg,cdp):
    await cdp.send("HeapProfiler.collectGarbage"); await pg.wait_for_timeout(300)
    m=await cdp.send("Performance.getMetrics"); d={x["name"]:x["value"] for x in m["metrics"]}
    return {"heapMB":round(d["JSHeapUsedSize"]/1e6,2),"nodes":int(d["Nodes"]),"listeners":int(d["JSEventListeners"]),"docs":int(d["Documents"])}
async def main():
    srv,url=serve()
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844}); pg=await ctx.new_page()
        cdp=await ctx.new_cdp_session(pg); await cdp.send("Performance.enable")
        await pg.goto(url); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(1500)
        await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(800)
        tabs=[t for t in await pg.query_selector_all("#tabs .tab, #bnav button") if await t.is_visible()]
        print("tabs",len(tabs))
        async def round_(n):
            for i in range(n):
                for t in tabs:
                    try: await t.click(timeout=1500)
                    except Exception: pass
                try:
                    await pg.fill("#hpAmt","1"); await pg.click("#dmgBtn"); await pg.click("#healBtn")
                except Exception: pass
                for el in (await pg.query_selector_all("[data-info]"))[:2]:
                    try:
                        if await el.is_visible(): await el.click(timeout=800); await pg.keyboard.press("Escape")
                    except Exception: pass
        await round_(2); a=await snap(pg,cdp)
        await round_(25); c=await snap(pg,cdp)
        await round_(25); d=await snap(pg,cdp)
        print("warm:",a); print("after 25 rounds:",c); print("after 50 rounds:",d)
        await b.close()
    srv.shutdown()
asyncio.run(main())
