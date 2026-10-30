import asyncio, json, functools, http.server, socket, threading, collections, sys
from playwright.async_api import async_playwright
ROOT="/tmp/claude-0/main-wt"; SCEN=sys.argv[1] if len(sys.argv)>1 else "tabs"; LS=json.loads(sys.argv[2]) if len(sys.argv)>2 else {}
def serve():
    s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT))
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    return srv,"http://127.0.0.1:%d/index.html"%port
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
INIT="""window.__lf=[];new PerformanceObserver(function(l){l.getEntries().forEach(function(e){window.__lf.push({d:Math.round(e.duration),b:Math.round(e.blockingDuration),sl:Math.round(e.styleAndLayoutStart?e.startTime+e.duration-e.styleAndLayoutStart:0),rs:Math.round(e.renderStart?e.startTime+e.duration-e.renderStart:0),s:(e.scripts||[]).map(function(s){return {inv:(s.invoker||'').slice(0,60),fn:(s.sourceFunctionName||'').slice(0,40),d:Math.round(s.duration),t:s.invokerType,fl:Math.round(s.forcedStyleAndLayoutDuration||0),ch:s.sourceCharPosition}})})})}).observe({type:'long-animation-frame',buffered:true});"""
async def main():
    srv,url=serve()
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page(); pg.set_default_timeout(2000); await pg.add_init_script(INIT)
        await pg.goto(url); await pg.evaluate("([v,ls])=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v);for(var k in ls)localStorage.setItem(k,ls[k]);}",[FIX,LS]); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500)
        await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
        tabs=[t for t in await pg.query_selector_all("#tabs .tab, #bnav button") if await t.is_visible()]
        cdp=await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate",{"rate":4}); await pg.evaluate("()=>{window.__lf=[]}")
        if SCEN=="tabs":
            for t in tabs*2:
                try: await t.click(timeout=1500)
                except Exception: pass
                await pg.wait_for_timeout(250)
        else:
            for _ in range(4):
                await pg.fill("#hpAmt","3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(500); await pg.click("#healBtn"); await pg.wait_for_timeout(500)
        await pg.wait_for_timeout(500); lf=await pg.evaluate("()=>window.__lf"); await b.close()
    srv.shutdown()
    print("scenario",SCEN,LS,"long frames:",len(lf),"total ms",sum(x["d"] for x in lf),"| style+layout ms",sum(x["sl"] for x in lf),"| script ms",sum(sum(s["d"] for s in x["s"]) for x in lf))
    agg=collections.Counter(); cnt=collections.Counter(); forced=collections.Counter()
    for x in lf:
        for s in x["s"]:
            k="%s | %s | %s"%(s["t"],s["inv"],s["fn"]); agg[k]+=s["d"]; cnt[k]+=1; forced[k]+=s["fl"]
    for k,v in agg.most_common(10): print("%5d ms x%-3d forced layout %4d ms  %s"%(v,cnt[k],forced[k],k))
    for x in sorted(lf,key=lambda x:-x["d"])[:4]: print("frame",x["d"],"ms blocking",x["b"],"style+layout",x["sl"],"scripts",[(s["inv"][:30],s["d"]) for s in x["s"]][:4])
asyncio.run(main())
