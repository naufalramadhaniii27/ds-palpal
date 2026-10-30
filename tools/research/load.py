# Research script (2026-10-30). Run: APP_ROOT=<folder with index.html> python3 FILE.py. Measures only, never changes the app.
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
INIT="""window.__lt=[];new PerformanceObserver(l=>{l.getEntries().forEach(e=>window.__lt.push([Math.round(e.startTime),Math.round(e.duration)]))}).observe({type:'longtask',buffered:true});"""
async def main():
    srv,url=serve()
    async with async_playwright() as pw:
        b=await pw.chromium.launch()
        for rate in (1,4):
            rows=[]
            for run in range(3):
                ctx=await b.new_context(viewport={"width":390,"height":844}); pg=await ctx.new_page(); await pg.add_init_script(INIT)
                cdp=await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate",{"rate":rate})
                await pg.goto(url,wait_until="load"); await pg.wait_for_timeout(2500)
                m=await pg.evaluate("""()=>{var n=performance.getEntriesByType('navigation')[0];var fcp=(performance.getEntriesByName('first-contentful-paint')[0]||{}).startTime;
                  var lt=window.__lt;var tbt=lt.reduce((a,x)=>a+Math.max(0,x[1]-50),0);
                  return {dcl:Math.round(n.domContentLoadedEventEnd),load:Math.round(n.loadEventEnd),fcp:Math.round(fcp||0),tasks:lt.length,tbt:Math.round(tbt),longest:Math.max(0,...lt.map(x=>x[1])),heapMB:Math.round((performance.memory||{}).usedJSHeapSize/1e5)/10}}""")
                rows.append(m); await ctx.close()
            rows.sort(key=lambda r:r["load"])
            print("cpu x%d median run:"%rate, rows[1], "| all load:", [r["load"] for r in rows])
        await b.close()
    srv.shutdown()
asyncio.run(main())
