import asyncio, json, functools, http.server, socket, threading, sys
from playwright.async_api import async_playwright
ROOT="/tmp/claude-0/main-wt"
def serve():
    s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT))
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    return srv,"http://127.0.0.1:%d/index.html"%port
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
REC="""window.__fr=[];window.__on=false;(function l(t){ if(window.__on) window.__fr.push(t); requestAnimationFrame(l); })(0);"""
def st(fr):
    d=[fr[i+1]-fr[i] for i in range(len(fr)-1)]; s=sorted(d); n=len(d); tot=(fr[-1]-fr[0])/1000
    return "%5.1f fps  p95 %5.1f ms  slow>16.7: %2d%%  >33: %2d%%  worst %3d ms"%(n/tot,s[int(n*.95)-1],round(100*sum(x>17.7 for x in d)/n),round(100*sum(x>34.4 for x in d)/n),s[-1])
NOANIM="*,*::before,*::after{animation:none!important;transition:none!important}"
PG="#pager>*"
CV=PG+"{content-visibility:auto;contain-intrinsic-size:auto 390px auto 1400px}"
CT=PG+"{contain:layout paint style}"
CASES={
 "N: contain on pages":{"css":CT},
 "N: content-visibility on pages":{"css":CV},
 "N: fx off+noanim+contain":{"ls":{"mi-fx":"off"},"css":NOANIM+CT},
 "N: fx off+noanim+cv":{"ls":{"mi-fx":"off"},"css":NOANIM+CV},

 "fx off + no animation/transition":{"ls":{"mi-fx":"off"},"css":NOANIM},
 "fx off + no anim + no View Transitions":{"ls":{"mi-fx":"off"},"css":NOANIM,"novt":True},
 "no View Transitions only":{"novt":True},
 "baseline (mi-fx default)":{},
 "mi-fx = lite":{"ls":{"mi-fx":"lite"}},
 "mi-fx = off":{"ls":{"mi-fx":"off"}},
 "css: no animation/transition":{"css":"*,*::before,*::after{animation:none!important;transition:none!important}"},
 "css: no backdrop-filter, shadow, filter":{"css":"*,*::before,*::after{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-shadow:none!important;filter:none!important;text-shadow:none!important}"},
 "css: no fx canvas/layers":{"css":"canvas,.mi-layer,[class*=mi-amb],[id*=mi-amb]{display:none!important}"},
}
async def main():
    only=sys.argv[1:] 
    srv,url=serve()
    async with async_playwright() as pw:
        b=await pw.chromium.launch()
        for name,cfg in CASES.items():
            if only and not any(o in name for o in only): continue
            ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page(); pg.set_default_timeout(2000); await pg.add_init_script(REC)
            if cfg.get('novt'): await pg.add_init_script('Document.prototype.startViewTransition=undefined;')
            await pg.goto(url); await pg.evaluate("([v,ls])=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v);for(var k in ls)localStorage.setItem(k,ls[k]);}",[FIX,cfg.get("ls",{})]); await pg.reload()
            await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500)
            await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1000)
            if cfg.get("css"): await pg.add_style_tag(content=cfg["css"]); await pg.wait_for_timeout(500)
            mode=await pg.evaluate("()=>{try{return localStorage.getItem('mi-fx')}catch(e){return null}}")
            cdp=await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate",{"rate":4})
            tabs=[t for t in await pg.query_selector_all("#tabs .tab, #bnav button") if await t.is_visible()]
            await pg.evaluate("()=>{window.__fr=[];window.__on=true}")
            for t in tabs*2:
                try: await t.click(timeout=1500)
                except Exception: pass
                await pg.wait_for_timeout(250)
            await pg.evaluate("()=>{window.__on=false}"); a=st(await pg.evaluate("()=>window.__fr"))
            await pg.evaluate("()=>{window.__fr=[];window.__on=true}")
            for _ in range(4):
                try: await pg.fill("#hpAmt","3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(500); await pg.click("#healBtn"); await pg.wait_for_timeout(500)
                except Exception: pass
            await pg.evaluate("()=>{window.__on=false}"); h=st(await pg.evaluate("()=>window.__fr"))
            print("%-40s\n   tabs   %s\n   damage %s"%(name,a,h),flush=True)
            await ctx.close()
        await b.close()
    srv.shutdown()
asyncio.run(main())
