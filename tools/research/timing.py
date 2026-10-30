# Research script (2026-10-30). Run: APP_ROOT=<folder with index.html> python3 FILE.py. Measures only, never changes the app.
import asyncio, json, random, functools, http.server, socket, threading
from playwright.async_api import async_playwright
import os; ROOT=os.environ.get("APP_ROOT",".")
def serve():
    s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT))
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    return srv,"http://127.0.0.1:%d/index.html"%port
JS=r"""(o)=>{ var r=window.__bldFuzz(o); var c=r.c; var n=60, t0=performance.now(); for(var i=0;i<n;i++) window.__deriveFor(c); var t=(performance.now()-t0)/n;
 var t1=performance.now(); var s=JSON.stringify(c); for(var i=0;i<n;i++) JSON.parse(JSON.stringify(c)); var tj=(performance.now()-t1)/n; return {derive:t, clone:tj, size:s.length}; }"""
async def main():
    srv,url=serve(); rng=random.Random(3)
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844}); pg=await ctx.new_page()
        await pg.goto(url); await pg.evaluate("()=>{localStorage.clear()}"); await pg.reload()
        await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone",timeout=60000)
        await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }")
        await pg.wait_for_function("()=>!!window.__bldFuzz&&!!window.__deriveFor",timeout=60000)
        L=await pg.evaluate("()=>window.__bldLists()")
        cdp=await ctx.new_cdp_session(pg)
        for rate in (1,4,6):
            await cdp.send("Emulation.setCPUThrottlingRate",{"rate":rate}); out=[]
            for lv in (1,10,20):
                rr=random.Random(7); ds=[];cs=[]
                for k in range(8):
                    cls=rr.choice(L["cls"]); arr=L["arr"][:]; rr.shuffle(arr); subs=L["subs"].get(cls) or []
                    o={"cls":cls,"sp":rr.choice(L["sp"]),"bg":rr.choice(L["bg"]),"arr":arr,"b2":0,"b1":0,"lv":lv,"sub":rr.choice(subs) if subs else ""}
                    r=await pg.evaluate(JS,o); ds.append(r["derive"]); cs.append(r["clone"])
                ds.sort(); out.append((lv,round(sum(ds)/len(ds),2),round(ds[-1],2),round(sum(cs)/len(cs),3)))
            print("cpu x%d"%rate, "level,avg ms,worst ms,clone ms:", out)
        await b.close()
    srv.shutdown()
asyncio.run(main())
