import asyncio, json, functools, http.server, socket, threading
from playwright.async_api import async_playwright
ROOT="/tmp/claude-0/main-wt"
exec(open("bench.py").read().split("CFG=json")[0].split("SC=")[1].join(["SC=",""]) if False else "")
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
IOV=open("bench.py").read().split("IOV='''")[1].split("'''")[0]
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page(); pg.set_default_timeout(2000); await pg.add_init_script(IOV)
        await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
        r=await pg.evaluate("""()=>{var p=document.getElementById('pager');var kids=[...p.children].map(c=>c.tagName+'#'+c.id+'.'+c.className.split(' ')[0]+' disp='+getComputedStyle(c).display+' vis='+getComputedStyle(c).visibility);
         var pages=['p-main','p-skills','p-actions','p-spells','p-inv','p-feat','p-desc','p-notes','p-ext'].map(id=>id+':'+getComputedStyle(document.getElementById(id)).visibility+' parent='+document.getElementById(id).parentElement.className.split(' ')[0]);return {kids,pages}}""")
        print(json.dumps(r,indent=1))
        for i,t in enumerate(await pg.query_selector_all("#bnav button")):
            await t.click(); await pg.wait_for_timeout(500)
            v=await pg.evaluate("()=>['p-main','p-skills','p-actions','p-spells','p-inv','p-feat','p-desc','p-notes','p-ext'].map(id=>getComputedStyle(document.getElementById(id)).visibility[0]).join('')")
            print("after tab",i,v)
        await b.close()
asyncio.run(main())
