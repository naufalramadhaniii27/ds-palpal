import asyncio, json, functools, http.server, socket, threading, collections
from playwright.async_api import async_playwright
ROOT="/home/claude/dnd-sheet"
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page()
        await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
        cdp=await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate",{"rate":4})
        btns=await pg.query_selector_all("#bnav button")
        await btns[0].click(); await pg.wait_for_timeout(320)
        ev=[]; done=asyncio.Event(); cdp.on("Tracing.dataCollected",lambda p: ev.extend(p["value"])); cdp.on("Tracing.tracingComplete",lambda p: done.set())
        await cdp.send("Tracing.start",{"categories":"devtools.timeline,disabled-by-default-devtools.timeline","transferMode":"ReportEvents"})
        await btns[1].click(); await pg.wait_for_timeout(600)
        await cdp.send("Tracing.end"); await asyncio.wait_for(done.wait(),30)
        top=[e for e in ev if e.get("ph")=="X" and e.get("dur",0)>4000 and e.get("name") not in ("RunTask","ThreadControllerImpl::RunTask","ProxyMain::BeginMainFrame")]
        top.sort(key=lambda e:-e["dur"])
        for e in top[:20]:
            a=e.get("args",{}); d=a.get("data",{}) if isinstance(a,dict) else {}
            print(round(e["dur"]/1000,1),e["name"],json.dumps({k:d[k] for k in list(d)[:4]})[:160])
        await b.close()
asyncio.run(main())
