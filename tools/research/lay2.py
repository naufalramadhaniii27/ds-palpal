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
        await cdp.send("DOM.enable"); await cdp.send("LayerTree.enable"); await pg.wait_for_timeout(800)
        # frames per second idle
        r=await pg.evaluate("""()=>new Promise(res=>{var n=0,t0=performance.now();(function l(){n++;if(performance.now()-t0<2000)requestAnimationFrame(l);else res(n/2)})()})""")
        L=layers[-1] if layers else []
        out=[]
        for l in L:
            nid=l.get("backendNodeId")
            try:
                d=await cdp.send("DOM.describeNode",{"backendNodeId":nid}) if nid else None
                n=d["node"]; at=n.get("attributes",[]); a=dict(zip(at[::2],at[1::2])); nm=n["nodeName"]+"#"+a.get("id","")+"."+a.get("class","")[:30]
            except Exception: nm="?"
            out.append((l["width"]*l["height"],nm,l["width"],l["height"],l.get("drawsContent")))
        out.sort(reverse=True)
        for o in out[:22]: print(" layer",o[1],o[2],"x",o[3],"draws",o[4])
        print("layers",len(L),"idle rAF/s",r)
        # count rAF callbacks sources: elements with active animations
        a=await pg.evaluate("()=>document.getAnimations().map(a=>{var t=a.effect&&a.effect.target;return (a.constructor.name)+':'+(a.animationName||a.transitionProperty||a.id||'')+':'+(t?(t.tagName+'.'+(t.className&&t.className.baseVal===undefined?t.className:'')).slice(0,40):'')+':'+a.playState})")
        c=collections.Counter(a); print("active animations",len(a)); [print(" ",k,v) for k,v in c.most_common(12)]
        await b.close()
asyncio.run(main())
