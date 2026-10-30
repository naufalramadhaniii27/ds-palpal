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
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
        await pg.evaluate("""()=>{window.__c={};window.__a={};new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType==1){var k=n.tagName+'.'+String(n.className&&n.className.baseVal!==undefined?n.className.baseVal:n.className).split(' ').slice(0,2).join('.');window.__c[k]=(window.__c[k]||0)+1+n.querySelectorAll('*').length}}))).observe(document.documentElement,{childList:true,subtree:true});
        setInterval(()=>{document.getAnimations().forEach(a=>{var t=a.effect&&a.effect.target;var n=a.animationName||'waapi';var k=n+' @ '+(t?(t.tagName+'.'+String(t.className&&t.className.baseVal!==undefined?t.className.baseVal:t.className).split(' ')[0]):'?');window.__a[k]=Math.max(window.__a[k]||0,0)+1})},16)}""")
        await pg.fill("#hpAmt","3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(1500)
        c=json.loads(await pg.evaluate("JSON.stringify(window.__c)")); a=json.loads(await pg.evaluate("JSON.stringify(window.__a)"))
        print("ADDED"); [print(v,k) for k,v in sorted(c.items(),key=lambda x:-x[1])[:20]]
        print("ANIMS (ticks)"); [print(v,k) for k,v in sorted(a.items(),key=lambda x:-x[1])[:25]]
        await b.close()
asyncio.run(main())
