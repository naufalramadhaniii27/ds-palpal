import asyncio, json, functools, http.server, socket, threading, sys
from playwright.async_api import async_playwright
ROOT="/home/claude/dnd-sheet"
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
IDS="['p-main','p-skills','p-actions','p-spells','p-inv','p-feat','p-desc','p-notes','p-ext']"
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch()
        for vp in ({"width":390,"height":844},{"width":1250,"height":850}):
            ctx=await b.new_context(viewport=vp,has_touch=vp["width"]<500); pg=await ctx.new_page(); pg.set_default_timeout(5000)
            errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
            await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
            await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
            print(vp, "bi-css:", await pg.evaluate("document.documentElement.classList.contains('bi-css')"))
            if vp["width"]<500:
                for i,t in enumerate(await pg.query_selector_all("#bnav button")):
                    await t.click(); await pg.wait_for_timeout(700)
                    r=await pg.evaluate("()=>{var ids=%s;var v=ids.map(id=>getComputedStyle(document.getElementById(id)).visibility[0]).join('');var ind=document.getElementById('bInd').getBoundingClientRect();var pr=document.getElementById('pager').scrollLeft/document.getElementById('pager').clientWidth;return {v:v,indX:Math.round(ind.left),page:pr}}"%IDS)
                    cur=r['v'][i]
                    print("tab",i,r,"target visible" if cur=='v' else "BLANK")
                    if i in (0,4,8): await pg.screenshot(path="/tmp/claude-0/exp/real_%d_%d.png"%(vp["width"],i))
                # jump far: main -> ext via swipe-like scroll then tap
                await pg.evaluate("document.querySelectorAll('#bnav button')[0].click()"); await pg.wait_for_timeout(600)
                await pg.evaluate("document.getElementById('pager').scrollTo({left:document.getElementById('pager').clientWidth*8,behavior:'auto'})"); await pg.wait_for_timeout(400)
                print("after raw scroll to 8:", await pg.evaluate("()=>%s.map(id=>getComputedStyle(document.getElementById(id)).visibility[0]).join('')"%IDS), "indX", await pg.evaluate("Math.round(document.getElementById('bInd').getBoundingClientRect().left)"))
            else:
                await pg.screenshot(path="/tmp/claude-0/exp/real_1250.png")
            print("errors",errs)
            await ctx.close()
        await b.close()
asyncio.run(main())
