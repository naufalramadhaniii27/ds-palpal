import asyncio, json, functools, http.server, socket, threading, sys
from playwright.async_api import async_playwright
ROOT=sys.argv[1]
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
FIX=open("/home/claude/dnd-sheet/tests/fixtures/yudhi-v3.json").read()
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page()
        await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
        out=[]
        for i,t in enumerate(await pg.query_selector_all("#bnav button")):
            await t.click(); await pg.wait_for_timeout(800)
            r=await pg.evaluate("()=>{var bs=[...document.querySelectorAll('#bnav button')];var i=document.getElementById('bInd').getBoundingClientRect();var a=bs.findIndex(b=>b.classList.contains('on')||b.getAttribute('aria-selected')=='true'||b.classList.contains('act'));var r=bs[%d].getBoundingClientRect();return [Math.round(i.left),Math.round(i.width),Math.round(r.left),Math.round(r.width)]}"%i)
            out.append(r)
        print(out)
        await b.close()
asyncio.run(main())
