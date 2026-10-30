import asyncio, json, functools, http.server, socket, threading
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
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(2500)
        r=await pg.evaluate("""()=>['p-main','p-skills','p-actions','p-spells','p-inv','p-feat','p-desc','p-notes','p-ext'].map(id=>{var p=document.getElementById(id);var im=[...p.querySelectorAll('img')];var bg=[...p.querySelectorAll('*')].filter(e=>{var b=getComputedStyle(e).backgroundImage;return b&&b!=='none'&&b.indexOf('url')>=0});
          return {id:id,imgs:im.length,lazy:im.filter(i=>i.loading==='lazy').length,decAsync:im.filter(i=>i.decoding==='async').length,big:im.filter(i=>i.naturalWidth>400).length,maxNat:Math.max(0,...im.map(i=>i.naturalWidth)),bgurl:bg.length,svg:p.querySelectorAll('svg').length,els:p.querySelectorAll('*').length,filters:[...p.querySelectorAll('*')].filter(e=>{var s=getComputedStyle(e);return (s.filter&&s.filter!=='none')||(s.backdropFilter&&s.backdropFilter!=='none')}).length}})""")
        for x in r: print(x)
        await b.close()
asyncio.run(main())
