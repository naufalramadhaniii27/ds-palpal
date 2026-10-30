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
        JSM="""async ()=>{ var tabs=[].slice.call(document.querySelectorAll('#tabs .tab, #bnav button')).filter(function(t){return t.offsetParent}); var out=[];
          for(var i=0;i<tabs.length;i++){ var t0=performance.now(); tabs[i].click(); await new Promise(function(r){requestAnimationFrame(function(){requestAnimationFrame(r)})}); out.push(performance.now()-t0); }
          return out.reduce(function(a,b){return a+b},0)/out.length; }"""
        res=[]
        for phase in ("before any damage","after damage+heal x1","after x5","after x20"):
            if phase!="before any damage":
                n={"after damage+heal x1":1,"after x5":4,"after x20":15}[phase]
                for _ in range(n):
                    await pg.fill("#hpAmt","1"); await pg.click("#dmgBtn"); await pg.click("#healBtn"); await pg.wait_for_timeout(200)
            await pg.wait_for_timeout(500)
            v=[await pg.evaluate(JSM) for _ in range(3)]
            print("%-22s avg ms to 2nd frame per tab switch: %s"%(phase,[round(x,1) for x in v]),flush=True)
        await b.close()
    srv.shutdown()
asyncio.run(main())
