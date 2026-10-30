import asyncio, json, functools, http.server, socket, threading, sys, collections
from playwright.async_api import async_playwright
ROOT="/tmp/claude-0/main-wt"; LS=json.loads(sys.argv[1]) if len(sys.argv)>1 else {}; CSS=sys.argv[2] if len(sys.argv)>2 else ""
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
PATCH='''(function(){var d=Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,"transform");if(!d||!d.set)return;var W=0;
Object.defineProperty(CSSStyleDeclaration.prototype,"transform",{get:d.get,set:function(v){var m=/^translateX\\(([-0-9.]+)%\\)$/.exec(v);
 if(m&&this.parentRule===null){var el=window.__bi||(window.__bi=document.getElementById("bInd"));if(el&&el.style===this){W=W||el.offsetWidth||1;v="translate3d("+(parseFloat(m[1])*W/100)+"px,0,0)"}}
 d.set.call(this,v)},configurable:true})})()'''
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True); pg=await ctx.new_page(); pg.set_default_timeout(2000)
        if 'SCROLL' in sys.argv: await pg.add_init_script('''(function(){var d=Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,"transform");Object.defineProperty(CSSStyleDeclaration.prototype,"transform",{get:d.get,set:function(v){if(this===(window.__bi||(window.__bi=document.getElementById("bInd"))||{}).style)return;d.set.call(this,v)},configurable:true})})()''')
        if 'PATCH' in sys.argv: await pg.add_init_script(PATCH)
        await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("([v,ls])=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v);for(var k in ls)localStorage.setItem(k,ls[k])}",[FIX,LS]); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1000)
        if CSS: await pg.add_style_tag(content=CSS)
        tabs=[t for t in await pg.query_selector_all("#bnav button") if await t.is_visible()]
        cdp=await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate",{"rate":4})
        ev=[]; cdp.on("Tracing.dataCollected",lambda p: ev.extend(p["value"])); done=asyncio.Event(); cdp.on("Tracing.tracingComplete",lambda p: done.set())
        await cdp.send("Tracing.start",{"categories":"devtools.timeline,disabled-by-default-devtools.timeline,cc,gpu,viz,benchmark","transferMode":"ReportEvents"})
        for t in tabs*2:
            try: await t.click(timeout=1500)
            except Exception: pass
            await pg.wait_for_timeout(300)
        await cdp.send("Tracing.end"); await asyncio.wait_for(done.wait(),30); await b.close()
    agg=collections.Counter(); cnt=collections.Counter(); thr=collections.Counter()
    for e in ev:
        if e.get("ph")=="X" and "dur" in e: agg[(e["name"])]+=e["dur"]/1000; cnt[e["name"]]+=1
    keys=["UpdateLayoutTree","Layout","PrePaint","Paint","Layerize","Commit","RasterTask","ImageDecodeTask","CompositeLayers","FunctionCall","EvaluateScript","FireAnimationFrame","EventDispatch","HitTest","ScheduleStyleRecalculation","UpdateLayer","Animation::Update","GPUTask","DrawFrame","ThreadControllerImpl::RunTask","TimerFire","MajorGC","MinorGC"]
    for k in keys:
        if k in agg: print("%-32s %8.1f ms  x%d"%(k,agg[k],cnt[k]))
    top=[x for x in agg.most_common(40) if x[0] not in ("RunTask","ThreadControllerImpl::RunTask","ThreadControllerImpl::DoWork")][:14]
    print("--top"); [print("%-40s %8.1f ms x%d"%(k,v,cnt[k])) for k,v in top]
asyncio.run(main())
