import asyncio, json, functools, http.server, socket, threading, collections, sys
from playwright.async_api import async_playwright
ROOT="/tmp/claude-0/main-wt"; SCEN=sys.argv[1]; LS=json.loads(sys.argv[2]) if len(sys.argv)>2 else {}
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page(); pg.set_default_timeout(2000)
        await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("([v,ls])=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v);for(var k in ls)localStorage.setItem(k,ls[k])}",[FIX,LS]); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
        await pg.evaluate("""()=>{window.__m={};var d=function(e){var s=e.tagName+(e.id?'#'+e.id:'')+(typeof e.className==='string'&&e.className?'.'+e.className.trim().split(/\\s+/).slice(0,2).join('.'):'');return s};
          window.__mo=new MutationObserver(function(l){l.forEach(function(r){var k=(r.type==='attributes'?d(r.target)+' @'+r.attributeName:r.type+' '+d(r.target));window.__m[k]=(window.__m[k]||0)+1})});window.__mo.observe(document.documentElement,{attributes:true,subtree:true,childList:true,characterData:false})}""")
        tabs=[t for t in await pg.query_selector_all("#bnav button") if await t.is_visible()]
        if SCEN=="tabs":
            for t in tabs*2:
                try: await t.click(timeout=1500)
                except Exception: pass
                await pg.wait_for_timeout(300)
        else:
            for _ in range(4):
                await pg.fill("#hpAmt","3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(500); await pg.click("#healBtn"); await pg.wait_for_timeout(500)
        m=await pg.evaluate("()=>window.__m"); await b.close()
    tot=sum(m.values()); print(SCEN,LS,"mutations",tot)
    for k,v in sorted(m.items(),key=lambda x:-x[1])[:16]: print("%5d  %s"%(v,k[:110]))
asyncio.run(main())
