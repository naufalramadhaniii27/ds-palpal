import asyncio, json, functools, http.server, socket, threading, sys, statistics
from playwright.async_api import async_playwright
import os
ROOT=os.environ.get("ROOT","/tmp/claude-0/main-wt")
s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT)); threading.Thread(target=srv.serve_forever,daemon=True).start()
FIX=open(ROOT+"/tests/fixtures/yudhi-v3.json").read()
SC="body{timeline-scope:--pg}#pager{scroll-timeline:--pg x}@keyframes bs{from{transform:translateX(0)}to{transform:translateX(800%)}}.bnav-ind{animation:bs linear both!important;animation-timeline:--pg!important}"
IOV='''(function(){function go(){var p=document.getElementById("pager");if(!p||!window.IntersectionObserver){return setTimeout(go,50)}
var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target.style.visibility=e.isIntersecting?"":"hidden"})},{root:p,rootMargin:"0px 100% 0px 100%"});
Array.prototype.forEach.call(p.children,function(c){io.observe(c)})}go()})()'''
IOV2='''(function(){var IDS=["p-main","p-skills","p-actions","p-spells","p-inv","p-feat","p-desc","p-notes","p-ext"];function go(){var p=document.getElementById("pager");var ok=IDS.every(function(i){return document.getElementById(i)});if(!p||!ok||!window.IntersectionObserver){return setTimeout(go,50)}
var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target.style.visibility=e.isIntersecting?"":"hidden"})},{root:p,rootMargin:"0px 100% 0px 100%"});
IDS.forEach(function(i){io.observe(document.getElementById(i))})}go()})()'''
CFG=json.load(open(sys.argv[1])); N=int(sys.argv[2]); SCEN=sys.argv[3].split(",")
INIT={"IOV":IOV,"IOV2":IOV2}
async def one(pw,cfg,scen):
    global port
    b=await pw.chromium.launch(); ctx=await b.new_context(viewport={"width":390,"height":844},has_touch=True,bypass_csp=bool(cfg.get("bypass"))); pg=await ctx.new_page(); pg.set_default_timeout(2000)
    for k in cfg.get("init",[]): await pg.add_init_script(INIT.get(k,k))
    await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("([v,ls])=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v);for(var k in ls)localStorage.setItem(k,ls[k])}",[FIX,cfg.get("ls",{})]); await pg.reload()
    await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1500)
    css=(SC if cfg.get("sc") else "")+cfg.get("css","")
    if css: await pg.add_style_tag(content=css)
    tabs=[t for t in await pg.query_selector_all("#bnav button") if await t.is_visible()]
    cdp=await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate",{"rate":float(os.environ.get("RATE","4"))})
    ev=[]; cdp.on("Tracing.dataCollected",lambda p: ev.extend(p["value"])); done=asyncio.Event(); cdp.on("Tracing.tracingComplete",lambda p: done.set())
    await cdp.send("Tracing.start",{"categories":"devtools.timeline,disabled-by-default-devtools.timeline,cc","transferMode":"ReportEvents"})
    if scen=="tabs":
        for t in tabs*2:
            try: await t.click(timeout=1500)
            except Exception: pass
            await pg.wait_for_timeout(300)
    else:
        for _ in range(4):
            try: await pg.fill("#hpAmt","3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(500); await pg.click("#healBtn"); await pg.wait_for_timeout(500)
            except Exception: pass
    await cdp.send("Tracing.end"); await asyncio.wait_for(done.wait(),30); await b.close()
    bm=sorted(e["dur"]/1000 for e in ev if e.get("ph")=="X" and e.get("name")=="ProxyMain::BeginMainFrame")
    lay=sum(e["dur"] for e in ev if e.get("ph")=="X" and e.get("name")=="Layerize")/1000
    st=sum(e["dur"] for e in ev if e.get("ph")=="X" and e.get("name")=="UpdateLayoutTree")/1000
    return (100*sum(x>16.7 for x in bm)/len(bm), sum(bm)/len(bm), bm[int(len(bm)*.95)-1], lay, st)
async def main():
    res={}
    async with async_playwright() as pw:
        for r in range(N):
            for name,cfg in CFG.items():
                for sc in SCEN:
                    try: res.setdefault((name,sc),[]).append(await one(pw,cfg,sc))
                    except Exception as ex: print("ERR",name,sc,str(ex)[:80],flush=True)
            print("round",r+1,"done",flush=True)
    print("%-34s %-6s %5s %-22s %-22s %s"%("config","scen","n","over16.7% med (min-max)","mean ms med","layerize/style ms med"))
    for (name,sc),v in res.items():
        f=lambda i:statistics.median(x[i] for x in v)
        print("%-34s %-6s %5d %5.1f (%4.1f-%4.1f)        %5.1f                  %5.0f / %5.0f"%(name,sc,len(v),f(0),min(x[0] for x in v),max(x[0] for x in v),f(1),f(3),f(4)),flush=True)
asyncio.run(main())
