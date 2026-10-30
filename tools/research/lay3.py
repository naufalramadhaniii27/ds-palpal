import asyncio, json, functools, http.server, socket, threading, sys, collections
from playwright.async_api import async_playwright
ROOT="/tmp/claude-0/main-wt"
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page(); pg.set_default_timeout(2000)
        await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("([v,ls])=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v);localStorage.setItem('mi-fx','full')}",[FIX,{}]); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
        cdp=await ctx.new_cdp_session(pg); layers=[]
        cdp.on("LayerTree.layerTreeDidChange",lambda p: layers.append(p.get("layers") or []))
        await cdp.send("DOM.enable"); await cdp.send("LayerTree.enable"); await pg.wait_for_timeout(500)
        base=len(layers[-1]) if layers else 0
        await pg.fill("#hpAmt","3"); await pg.click("#dmgBtn"); mx=0; best=[]
        for _ in range(14):
            await pg.wait_for_timeout(60)
            if layers and len(layers[-1])>mx: mx=len(layers[-1]); best=layers[-1]
        print("layers idle",base,"peak after damage",mx)
        import collections
        c=collections.Counter()
        for l in best:
            nid=l.get("backendNodeId")
            try:
                d=await cdp.send("DOM.describeNode",{"backendNodeId":nid}) if nid else None
                n=d["node"]; at=n.get("attributes",[]); a_=dict(zip(at[::2],at[1::2])); nm=n["nodeName"]+"."+(a_.get("class","").split(" ")[0] if a_.get("class") else "")
            except Exception: nm="?"
            c[nm]+=1
        print(c.most_common(14)); await b.close(); return

asyncio.run(main())
