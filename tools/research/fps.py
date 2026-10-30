# Research script (2026-10-30). APP_ROOT=<folder with index.html>. Frame rate per interaction at CPU 1x and 4x. Measures only.
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
REC="""window.__fr=[];window.__on=false;(function l(t){ if(window.__on) window.__fr.push(t); requestAnimationFrame(l); })(0);"""
def stats(fr):
    d=[fr[i+1]-fr[i] for i in range(len(fr)-1)]
    if not d: return None
    s=sorted(d); n=len(d); tot=(fr[-1]-fr[0])/1000
    return {"fps":round(n/tot,1),"p95ms":round(s[int(n*.95)-1],1),"worst":round(s[-1]),"over16.7%":round(100*sum(x>16.7+1 for x in d)/n),"over33%":round(100*sum(x>33.4+1 for x in d)/n),"frames":n}
async def run(pg,name,act):
    await pg.evaluate("()=>{window.__fr=[];window.__on=true}"); await act(); await pg.evaluate("()=>{window.__on=false}")
    fr=await pg.evaluate("()=>window.__fr"); print("  %-22s %s"%(name,stats(fr)),flush=True)
async def main():
    srv,url=serve()
    async with async_playwright() as pw:
        b=await pw.chromium.launch(args=["--enable-gpu-rasterization"])
        for rate in (1,4):
            ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page(); pg.set_default_timeout(2000)
            await pg.add_init_script(REC)
            await pg.goto(url); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
            await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500)
            cdp=await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate",{"rate":rate})
            print("CPU x%d, 390x844"%rate)
            async def idle_home(): await pg.wait_for_timeout(3000)
            await run(pg,"Home idle 3 s",idle_home)
            await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
            await run(pg,"Sheet idle 3 s",idle_home)
            async def scroll():
                for i in range(30):
                    await pg.mouse.wheel(0,120); await pg.wait_for_timeout(33)
                for i in range(30):
                    await pg.mouse.wheel(0,-120); await pg.wait_for_timeout(33)
            await run(pg,"Scroll sheet",scroll)
            tabs=[t for t in await pg.query_selector_all("#tabs .tab, #bnav button") if await t.is_visible()]
            async def switch():
                for t in tabs*2:
                    try: await t.click(timeout=1500)
                    except Exception: pass
                    await pg.wait_for_timeout(250)
            await run(pg,"Tab switches x18",switch)
            async def hp():
                for _ in range(4):
                    try: await pg.fill("#hpAmt","3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(500); await pg.click("#healBtn"); await pg.wait_for_timeout(500)
                    except Exception: pass
            await run(pg,"Damage and heal x4",hp)
            await ctx.close()
        await b.close()
    srv.shutdown()
asyncio.run(main())
