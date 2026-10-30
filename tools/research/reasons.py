import asyncio, json, functools, http.server, socket, threading, collections, sys
from playwright.async_api import async_playwright
ROOT="/tmp/claude-0/main-wt"; FX=sys.argv[1] if len(sys.argv)>1 else "full"
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page(); pg.set_default_timeout(2000)
        await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v);localStorage.setItem('mi-fx','%s')}"%FX,FIX); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
        cdp=await ctx.new_cdp_session(pg); layers=[]
        cdp.on("LayerTree.layerTreeDidChange",lambda p: layers.append(p.get("layers") or []))
        await cdp.send("DOM.enable"); await cdp.send("LayerTree.enable")
        await pg.fill("#hpAmt","3"); await pg.wait_for_timeout(800)   # force a tree update
        await pg.evaluate("()=>{document.body.style.setProperty('--zz','1')}"); await pg.wait_for_timeout(500)
        L=layers[-1] if layers else []
        print("layers",len(L))
        reasons=collections.Counter(); names=collections.defaultdict(collections.Counter)
        for l in L:
            try: r=(await cdp.send("LayerTree.compositingReasons",{"layerId":l["layerId"]}))["compositingReasonIds"]
            except Exception: r=["?"]
            nid=l.get("backendNodeId"); nm="?"
            try:
                d=await cdp.send("DOM.describeNode",{"backendNodeId":nid}) if nid else None
                n=d["node"]; at=n.get("attributes",[]); a=dict(zip(at[::2],at[1::2])); nm=n["nodeName"]+("."+a["class"].split(" ")[0] if a.get("class") else "")
            except Exception: pass
            key=",".join(r) if r else "(none)"; reasons[key]+=1; names[key][nm]+=1
        for k,v in reasons.most_common(12): print("%3d  %-60s %s"%(v,k[:60],dict(names[k].most_common(4))))
        await b.close()
asyncio.run(main())
