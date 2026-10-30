# Research script (2026-10-30). APP_ROOT=<folder with index.html>. Measures only.
import asyncio, json, functools, http.server, socket, threading
from playwright.async_api import async_playwright
import os; ROOT=os.environ.get("APP_ROOT",".")
def serve():
    s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT))
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    return srv,"http://127.0.0.1:%d/index.html"%port
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
CASES={
 "truncated half":lambda v:v[:len(v)//2],
 "empty string":lambda v:"",
 "valid JSON, wrong shape (array)":lambda v:"[1,2,3]",
 "valid JSON, level as text":lambda v:v.replace('"level": 4','"level": "four"').replace('"level":4','"level":"four"'),
 "null":lambda v:"null",
 "flipped one byte mid-string":lambda v:v[:len(v)//2]+"\u0000"+v[len(v)//2+1:],
}
async def main():
    srv,url=serve()
    async with async_playwright() as pw:
        b=await pw.chromium.launch()
        for name,fn in CASES.items():
            ctx=await b.new_context(viewport={"width":390,"height":844}); pg=await ctx.new_page(); errs=[]
            pg.on("pageerror",lambda e:errs.append(str(e)[:80]))
            await pg.goto(url)
            await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload(); await pg.wait_for_timeout(1500)
            await pg.evaluate("v=>{localStorage.setItem('yudhi-kelapa-build-v3',v)}",fn(FIX))
            await pg.reload(); await pg.wait_for_timeout(2500)
            r=await pg.evaluate("""()=>{var t=document.body.innerText; return {hasHome:!!document.querySelector('[data-hview]'), blank:t.trim().length<40, mentionsName:/Yudhi|Retron/.test(t), ls:(localStorage.getItem('yudhi-kelapa-build-v3')||'').length}}""")
            t=await pg.evaluate("()=>document.body.innerText.replace(/\\s+/g,\" \").slice(0,150)"); print("%-30s %s | %s"%(name,r["hasHome"],t))
            await ctx.close()
        await b.close()
    srv.shutdown()
asyncio.run(main())
