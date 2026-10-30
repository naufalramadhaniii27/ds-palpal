import asyncio, json, functools, http.server, socket, threading
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
        await pg.evaluate("""()=>{window.__l=[];new PerformanceObserver(l=>l.getEntries().forEach(e=>window.__l.push([Math.round(e.startTime),Math.round(e.duration)]))).observe({type:'longtask'});window.__m=[]}""")
        btns=await pg.query_selector_all("#bnav button")
        for r in range(2):
            for i,t in enumerate(btns):
                t0=await pg.evaluate("performance.now()"); await pg.evaluate("window.__l=[]")
                await t.click(); await pg.wait_for_timeout(400)
                l=await pg.evaluate("window.__l")
                print("round",r+1,"tab",i,"longtasks",[x[1] for x in l])
        await b.close()
asyncio.run(main())
