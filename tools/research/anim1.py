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
        await pg.evaluate("""()=>{window.__seen={};setInterval(()=>{document.getAnimations().forEach(a=>{var n=a.animationName||(a.effect&&a.effect.getKeyframes&&a.effect.getKeyframes().length?('waapi:'+Object.keys(a.effect.getKeyframes()[0]).filter(k=>!['offset','easing','composite','computedOffset'].includes(k)).join('+')):'?');var t=a.effect&&a.effect.target;var id=t?((t.tagName||'')+'.'+String(t.className&&t.className.baseVal!==undefined?t.className.baseVal:t.className).split(' ')[0]):'?';var k=n+' @ '+id;window.__seen[k]=(window.__seen[k]||0)+1})},16)}""")
        # idle baseline
        await pg.wait_for_timeout(1500); idle=await pg.evaluate("JSON.stringify(window.__seen)"); await pg.evaluate("window.__seen={}")
        for t in await pg.query_selector_all("#bnav button"): await t.click(); await pg.wait_for_timeout(300)
        sw=json.loads(await pg.evaluate("JSON.stringify(window.__seen)"))
        print("IDLE:",idle[:600]); print("SWITCH:")
        for k,v in sorted(sw.items(),key=lambda x:-x[1])[:25]: print(v,k)
        await b.close()
asyncio.run(main())
