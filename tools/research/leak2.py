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
        cdp=await ctx.new_cdp_session(pg); await cdp.send("Performance.enable"); pg.set_default_timeout(1500)
        await pg.goto(url); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(1500)
        await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(800)
        tabs=[t for t in await pg.query_selector_all("#tabs .tab, #bnav button") if await t.is_visible()]
        print("tabs",len(tabs))
        import time
        async def one():
            t0=time.time(); ct=[]
            for t in tabs:
                c0=time.time()
                try: await t.click(timeout=3000)
                except Exception: pass
                ct.append(time.time()-c0)
            try:
                await pg.fill("#hpAmt","1"); await pg.click("#dmgBtn"); await pg.click("#healBtn")
            except Exception: pass
            return time.time()-t0, sum(ct)/len(ct)
        for i in range(10):
            tot,avg=await one()
            m=await cdp.send("Performance.getMetrics"); d={x["name"]:x["value"] for x in m["metrics"]}
            print("round",i+1,"total s",round(tot,2),"avg tab click s",round(avg,3),"nodes",int(d["Nodes"]),"listeners",int(d["JSEventListeners"]),"heapMB",round(d["JSHeapUsedSize"]/1e6,1),flush=True)
        await b.close()
    srv.shutdown()
asyncio.run(main())
