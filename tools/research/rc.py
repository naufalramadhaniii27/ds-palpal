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
        r=await pg.evaluate("""()=>{var out={};function t(name,f){var a=[];for(var i=0;i<6;i++){var t0=performance.now();f(i);document.body.offsetHeight;a.push(performance.now()-t0)}a.sort(function(x,y){return x-y});out[name]=a[3].toFixed(1)}
          var h=document.documentElement;
          t('toggle class on html (all elements)',function(i){h.classList.toggle('zz')});
          t('toggle class on #pager (subtree)',function(i){document.getElementById('pager').classList.toggle('zz')});
          t('toggle class on one page p-inv',function(i){document.getElementById('p-inv').classList.toggle('zz')});
          t('toggle class on one button',function(i){document.querySelector('#bnav button').classList.toggle('zz')});
          t('set --x on html',function(i){h.style.setProperty('--x',i)});
          out.elements=document.getElementsByTagName('*').length; out.sheets=document.styleSheets.length;var n=0;for(var s of document.styleSheets){try{n+=s.cssRules.length}catch(e){}}out.rules=n;return out}""")
        print(json.dumps(r,indent=1)); await b.close()
asyncio.run(main())
