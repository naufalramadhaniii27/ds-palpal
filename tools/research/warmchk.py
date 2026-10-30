import asyncio, json, functools, http.server, socket, threading
from playwright.async_api import async_playwright
ROOT="/home/claude/dnd-sheet"
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
ST="""()=>{var p=document.getElementById('pager');var bs=[...document.querySelectorAll('#bnav button')];var on=bs.findIndex(b=>b.classList.contains('on'));var i=document.getElementById('bInd').getBoundingClientRect().left;
return {warm:document.documentElement.classList.contains('pg-warm'),page:Math.round(p.scrollLeft/p.clientWidth*100)/100,navOn:on,indX:Math.round(i),opP:getComputedStyle(p).opacity,opN:getComputedStyle(document.querySelector('.bnav')).opacity}}"""
async def run(pw,vp,mode):
    b=await pw.chromium.launch(); ctx=await b.new_context(viewport=vp,has_touch=vp["width"]<500); pg=await ctx.new_page(); errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
    await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
    await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(1500)
    await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible")
    if mode=="tap":
        await pg.wait_for_function("document.documentElement.classList.contains('pg-warm')",timeout=5000); await pg.wait_for_timeout(120); await pg.touchscreen.tap(200,400)
        await pg.wait_for_timeout(600); print(vp["width"],mode,"after tap",await pg.evaluate(ST))
    elif mode=="auto":
        seen=await pg.evaluate("new Promise(r=>{var t=performance.now();(function f(){if(document.documentElement.classList.contains('pg-warm'))return r(Math.round(performance.now()-t));if(performance.now()-t>6000)return r(-1);requestAnimationFrame(f)})()})")
        t0=await pg.evaluate("performance.now()")
        await pg.wait_for_function("!document.documentElement.classList.contains('pg-warm')",timeout=15000)
        await pg.wait_for_timeout(600); print(vp["width"],mode,"warm started after ms",seen,"final",await pg.evaluate(ST))
        # tabs work after warm
        bs=await pg.query_selector_all("#bnav button") if vp["width"]<500 else []
        if bs:
            await bs[4].click(); await pg.wait_for_timeout(700); print("  tab4",await pg.evaluate(ST))
    else:
        await pg.wait_for_timeout(500)
    print("  errors",errs); await b.close()
async def main():
    async with async_playwright() as pw:
        await run(pw,{"width":390,"height":844},"auto")
        await run(pw,{"width":390,"height":844},"tap")
        await run(pw,{"width":1250,"height":850},"auto")
asyncio.run(main())
