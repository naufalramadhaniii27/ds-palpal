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
INIT="""window.__mk={}; var chk=function(){ var q={home:'[data-hview]',hp:'#dmgBtn'}; for(var k in q){ if(!window.__mk[k]){ var e=document.querySelector(q[k]); if(e&&e.offsetParent!==null) window.__mk[k]=Math.round(performance.now()); } } }; new MutationObserver(chk).observe(document,{subtree:true,childList:true,attributes:true}); setInterval(chk,20);"""
async def main():
    srv,url=serve()
    async with async_playwright() as pw:
        b=await pw.chromium.launch()
        for rate in (1,4):
            runs=[]
            for r in range(3):
                ctx=await b.new_context(viewport={"width":390,"height":844}); pg=await ctx.new_page(); await pg.add_init_script(INIT)
                await pg.goto(url); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX)
                cdp=await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate",{"rate":rate})
                await pg.reload(); await pg.wait_for_timeout(6000 if rate>1 else 3000)
                runs.append(await pg.evaluate("()=>window.__mk")); await ctx.close()
            print("cpu x%d (ms since navigation, 3 runs, Home visible / HP panel visible):"%rate,[(x.get("home"),x.get("hp")) for x in runs])
        await b.close()
    srv.shutdown()
asyncio.run(main())
