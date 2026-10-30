# Research script (2026-10-30). Run: APP_ROOT=<folder with index.html> python3 FILE.py. Measures only, never changes the app.
import asyncio, json, functools, http.server, socket, threading, collections
from playwright.async_api import async_playwright
import os; ROOT=os.environ.get("APP_ROOT",".")
def serve():
    s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT))
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    return srv,"http://127.0.0.1:%d/index.html"%port
async def main():
    srv,url=serve()
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844}); pg=await ctx.new_page()
        cdp=await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate",{"rate":4})
        await b.start_tracing(page=pg,path="/tmp/trace.json",categories=["devtools.timeline","v8","disabled-by-default-devtools.timeline"])
        await pg.goto(url,wait_until="load"); await pg.wait_for_timeout(2500)
        await b.stop_tracing(); await b.close()
    srv.shutdown()
    ev=json.load(open("/tmp/trace.json")); ev=ev["traceEvents"] if isinstance(ev,dict) else ev
    agg=collections.Counter(); cnt=collections.Counter()
    for e in ev:
        if e.get("ph")=="X" and e.get("dur") and e.get("name") in ("EvaluateScript","v8.compile","v8.compileModule","ParseHTML","UpdateLayoutTree","Layout","FunctionCall","Paint","ParseAuthorStyleSheet","RunTask","HitTest","v8.run","CompileCode","MinorGC","MajorGC","V8.GC_MC_BACKGROUND_MARKING","EventDispatch","TimerFire","FireAnimationFrame","RunMicrotasks"):
            agg[e["name"]]+=e["dur"]/1000; cnt[e["name"]]+=1
    for k,v in agg.most_common(): print("%-24s %8.0f ms  x%d"%(k,v,cnt[k]))
asyncio.run(main())
