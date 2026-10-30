import asyncio, json, functools, http.server, socket, threading
from playwright.async_api import async_playwright
ROOT="/tmp/claude-0/main-wt"
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page(); pg.set_default_timeout(2000)
        await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("v=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v)}",FIX); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
        cdp=await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate",{"rate":4})
        r=await pg.evaluate("""()=>{var out={};function t(name,el,cls){if(!el){out[name]='missing';return}var a=[];for(var i=0;i<8;i++){var t0=performance.now();el.classList.toggle(cls);document.body.offsetHeight;a.push(performance.now()-t0)}a.sort(function(x,y){return x-y});out[name]=a[4].toFixed(1)+' ms, desc '+el.getElementsByTagName('*').length}
          function ins(name,par){var a=[];for(var i=0;i<8;i++){var e=document.createElement('i');e.className='mi-fx mi-dot';var t0=performance.now();par.appendChild(e);document.body.offsetHeight;a.push(performance.now()-t0);e.remove();document.body.offsetHeight}a.sort(function(x,y){return x-y});out[name]=a[4].toFixed(1)+' ms'}
          function rem(name,par){var a=[];for(var i=0;i<8;i++){var e=document.createElement('i');par.appendChild(e);document.body.offsetHeight;var t0=performance.now();e.remove();document.body.offsetHeight;a.push(performance.now()-t0)}a.sort(function(x,y){return x-y});out[name]=a[4].toFixed(1)+' ms'}
          ins('append <i> to body',document.body); rem('remove <i> from body',document.body);
          ins('append <i> to #fxbox (detached fixed div)',(function(){var d=document.createElement('div');d.style.cssText='position:fixed;inset:0;contain:strict';document.body.appendChild(d);return d})());
          ins('append <i> to #pager',document.getElementById('pager'));
          return out}""")
        print(json.dumps(r,indent=1)); await b.close()
asyncio.run(main())
