import asyncio, json, functools, http.server, socket, threading, collections, sys
from playwright.async_api import async_playwright
ROOT=sys.argv[1] if len(sys.argv)>1 else "/tmp/claude-0/main-wt"; SCEN=sys.argv[2] if len(sys.argv)>2 else "tabs"
def serve():
    s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT))
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    return srv,"http://127.0.0.1:%d/index.html"%port
FIX=open("/tmp/claude-0/main-wt/tests/fixtures/yudhi-v3.json").read()
async def main():
    srv,url=serve()
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page(); pg.set_default_timeout(2000)
        await pg.goto(url);
        await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500)
        await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
        tabs=[t for t in await pg.query_selector_all("#tabs .tab, #bnav button") if await t.is_visible()]
        cdp=await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate",{"rate":4})
        await cdp.send("Profiler.enable"); await cdp.send("Profiler.setSamplingInterval",{"interval":200}); await cdp.send("Profiler.start")
        if SCEN=="tabs":
            for t in tabs*2:
                try: await t.click(timeout=1500)
                except Exception: pass
                await pg.wait_for_timeout(250)
        else:
            for _ in range(4):
                await pg.fill("#hpAmt","3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(500); await pg.click("#healBtn"); await pg.wait_for_timeout(500)
        prof=(await cdp.send("Profiler.stop"))["profile"]; await b.close()
    srv.shutdown()
    nodes={n["id"]:n for n in prof["nodes"]}; self_t=collections.Counter(); dt=prof["timeDeltas"]; samples=prof["samples"]
    for s,d in zip(samples,dt): self_t[s]+=d
    # inclusive time
    par={}
    for n in prof["nodes"]:
        for c in n.get("children",[]): par[c]=n["id"]
    inc=collections.Counter(); tot0=sum(self_t.values())
    for nid,t in self_t.items():
        seen=set(); cur=nid
        while cur is not None:
            cf=nodes[cur]["callFrame"]; key="%s:%d:%d"%(cf["functionName"] or "(anon)",cf["lineNumber"],cf["columnNumber"])
            if key not in seen: inc[key]+=t; seen.add(key)
            cur=par.get(cur)
    print("INCLUSIVE (ms, % of sampled)")
    for k,t in inc.most_common(45):
        if k.startswith("(root)") or k.startswith("(program)") or k.startswith("(idle)"): continue
        print("%6.0f ms %5.1f%%  %s"%(t/1000,100*t/tot0,k))
    byfn=collections.Counter(); tot=sum(self_t.values())
    for nid,t in self_t.items():
        cf=nodes[nid]["callFrame"]; key="%s:%s:%d"%(cf["functionName"] or "(anon)",cf["url"].split("/")[-1] or "inline",cf["lineNumber"]); byfn[key]+=t
    print("scenario",SCEN,"total sampled ms",round(tot/1000))
    for k,t in byfn.most_common(14): print("%6.0f ms  %5.1f%%  %s"%(t/1000,100*t/tot,k))
asyncio.run(main())
