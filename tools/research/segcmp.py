import asyncio, json, functools, http.server, socket, threading, sys
from playwright.async_api import async_playwright
def serve(root):
    s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=root)); threading.Thread(target=srv.serve_forever,daemon=True).start(); return port
FIX=open("/home/claude/dnd-sheet/tests/fixtures/yudhi-v3.json").read()
async def run(pw,root,vp):
    port=serve(root); b=await pw.chromium.launch(); ctx=await b.new_context(viewport=vp,has_touch=vp["width"]<500); pg=await ctx.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
    await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
    sel="#bnav button" if vp["width"]<500 else "#tabs .tab"
    out=[]
    for rd in range(2):
        for t in await pg.query_selector_all(sel):
            if await t.is_visible():
                await t.click(); await pg.wait_for_timeout(700)
                out.append(await pg.evaluate("[...document.querySelectorAll('.ifil')].filter(e=>e.getClientRects().length).map(e=>[(e.closest('[id]')||{}).id,e.className.replace(/\\s+/g,' ').trim(),Math.round(e.scrollLeft)])"))
    await b.close(); return out,errs
async def main():
    async with async_playwright() as pw:
        for vp in ({"width":390,"height":844},{"width":1250,"height":850}):
            a,ea=await run(pw,"/tmp/claude-0/main-wt",vp); n,en=await run(pw,"/home/claude/dnd-sheet",vp)
            diffs=[(i,x,y) for i,(x,y) in enumerate(zip(a,n)) if x!=y]
            print(vp["width"],"steps",len(a),len(n),"diff steps",len(diffs),"errors",ea,en)
            for d in diffs[:3]: print(json.dumps(d)[:600])
asyncio.run(main())
