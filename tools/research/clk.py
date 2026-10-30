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
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(1500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(5000)
        cdp=await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate",{"rate":3})
        ev=[]; done=asyncio.Event(); cdp.on("Tracing.dataCollected",lambda p: ev.extend(p["value"])); cdp.on("Tracing.tracingComplete",lambda p: done.set())
        await cdp.send("Tracing.start",{"categories":"devtools.timeline,disabled-by-default-devtools.timeline","transferMode":"ReportEvents"})
        btns=await pg.query_selector_all("#bnav button"); clicks=[]
        for r in range(2):
            for t in btns:
                clicks.append(await pg.evaluate("performance.timeOrigin+performance.now()")); await t.click(); await pg.wait_for_timeout(320)
        await cdp.send("Tracing.end"); await asyncio.wait_for(done.wait(),30)
        # trace ts is in microseconds from an arbitrary origin; align using first EventDispatch click vs clicks
        ed=sorted(e["ts"] for e in ev if e.get("name")=="EventDispatch" and (e.get("args",{}).get("data",{}) or {}).get("type")=="click")
        frames=[e for e in ev if e.get("ph")=="X" and e.get("name")=="ProxyMain::BeginMainFrame" and e["dur"]>16700]
        off=collections.Counter(); kinds=collections.defaultdict(float)
        for f in frames:
            prev=[c for c in ed if c<=f["ts"]]
            if not prev: continue
            d=(f["ts"]-prev[-1])/1000; bucket=int(d//50)*50; off[bucket]+=1
            inside=[e for e in ev if e.get("ph")=="X" and e["ts"]>=f["ts"] and e["ts"]+e["dur"]<=f["ts"]+f["dur"] and e.get("name") in ("UpdateLayoutTree","Layout","PrePaint","Paint","Layerize","Commit","FunctionCall","EventDispatch","HitTest","TimerFire","FireAnimationFrame")]
            for e in inside: kinds[(bucket,e["name"])]+=e["dur"]/1000
        print("late frames",len(frames),"by ms after click:",sorted(off.items()))
        for k,v in sorted(kinds.items(),key=lambda x:-x[1])[:16]: print(k,round(v))
        await b.close()
asyncio.run(main())
