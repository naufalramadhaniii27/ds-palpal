import asyncio, json, functools, http.server, socket, threading, collections
from playwright.async_api import async_playwright
ROOT="/tmp/claude-0/main-wt"
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
async def run(ls):
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page(); pg.set_default_timeout(2000)
        await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("([v,ls])=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v);for(var k in ls)localStorage.setItem(k,ls[k])}",[FIX,ls]); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
        r=await pg.evaluate("""()=>{var o={};document.querySelectorAll('body *').forEach(function(e){var cs=getComputedStyle(e);var f=[];if(cs.willChange!=='auto')f.push('wc:'+cs.willChange);if(cs.backdropFilter!=='none')f.push('bf');if(cs.filter!=='none')f.push('filter');if(cs.mixBlendMode!=='normal')f.push('blend');if(cs.position==='fixed')f.push('fixed');if(e.tagName==='CANVAS')f.push('canvas');if(cs.transform!=='none')f.push('transform');if(parseFloat(cs.opacity)<1&&e.offsetParent)f.push('opacity');if(cs.maskImage!=='none'&&cs.maskImage)f.push('mask');if(!f.length)return;var k=e.tagName+'.'+(typeof e.className==='string'?e.className.split(' ').slice(0,2).join('.'):'')+' ['+f.join(',')+']';o[k]=(o[k]||0)+1});return o}""")
        await b.close(); return r
async def main():
    full=await run({}); off=await run({"mi-fx":"off"})
    keys=sorted(set(full)|set(off),key=lambda k:-(full.get(k,0)-off.get(k,0)))
    print("rows: fx full vs off (count)")
    for k in keys[:30]: print("%3d %3d  %s"%(full.get(k,0),off.get(k,0),k[:100]))
    print("total flagged full",sum(full.values()),"off",sum(off.values()))
asyncio.run(main())
