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
        if 'IOV' in sys.argv: await pg.add_init_script('''(function(){function go(){var p=document.getElementById("pager");if(!p||!window.IntersectionObserver){return setTimeout(go,50)}
var io=new IntersectionObserver(function(es){es.forEach(function(e){e.target.style.visibility=e.isIntersecting?"":"hidden"})},{root:p,rootMargin:"0px 100% 0px 100%"});
Array.prototype.forEach.call(p.children,function(c){io.observe(c)})}go()})()''')
        if 'IDEM' in sys.argv: await pg.add_init_script('''(function(){var P=DOMTokenList.prototype,a=P.add,r=P.remove,t=P.toggle;
P.add=function(){var s=this,c=arguments,ch=false;for(var i=0;i<c.length;i++)if(!s.contains(c[i]))ch=true;if(ch)return a.apply(s,c)};
P.remove=function(){var s=this,c=arguments,ch=false;for(var i=0;i<c.length;i++)if(s.contains(c[i]))ch=true;if(ch)return r.apply(s,c)};
P.toggle=function(k,f){var h=this.contains(k);if(f===undefined)return t.call(this,k);if(!!f===h)return h;return t.call(this,k,f)};
var S=CSSStyleDeclaration.prototype,sp=S.setProperty;S.setProperty=function(n,v,p){if(this.getPropertyValue(n)===String(v)&&(this.getPropertyPriority(n)||"")===(p||""))return;return sp.call(this,n,v,p)};})()''')
        if 'NOPCUR' in sys.argv: await pg.add_init_script('''(function(){var t=DOMTokenList.prototype.toggle;DOMTokenList.prototype.toggle=function(k,f){if(k==="pcur")return false;return t.apply(this,arguments)}})()''')
        if 'PATCH' in sys.argv: await pg.add_init_script(PATCH)
        await pg.goto("http://127.0.0.1:%d/index.html"%port); await pg.evaluate("([v,ls])=>{localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',v);for(var k in ls)localStorage.setItem(k,ls[k])}",[FIX,LS]); await pg.reload()
        await pg.wait_for_selector("[data-hview]",state="attached",timeout=30000); await pg.wait_for_timeout(2500); await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn",state="visible"); await pg.wait_for_timeout(1000)
        if CSS: await pg.add_style_tag(content=CSS)
        tabs=[t for t in await pg.query_selector_all("#bnav button") if await t.is_visible()]
        cdp=await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate",{"rate":4})
        ev=[]; cdp.on("Tracing.dataCollected",lambda p: ev.extend(p["value"])); done=asyncio.Event(); cdp.on("Tracing.tracingComplete",lambda p: done.set())
        await cdp.send("Tracing.start",{"categories":"devtools.timeline,disabled-by-default-devtools.timeline,disabled-by-default-devtools.timeline.invalidationTracking,cc,benchmark","transferMode":"ReportEvents"})
        for _ in range(4):
            try: await pg.fill("#hpAmt","3"); await pg.click("#dmgBtn"); await pg.wait_for_timeout(500); await pg.click("#healBtn"); await pg.wait_for_timeout(500)
            except Exception: pass
        await cdp.send("Tracing.end"); await asyncio.wait_for(done.wait(),30); await b.close()
    agg=collections.Counter(); cnt=collections.Counter(); thr=collections.Counter()
    for e in ev:
        if e.get("ph")=="X" and "dur" in e: agg[(e["name"])]+=e["dur"]/1000; cnt[e["name"]]+=1
    bm=sorted(e["dur"]/1000 for e in ev if e.get("ph")=="X" and e.get("name")=="ProxyMain::BeginMainFrame")
    if bm: print("BeginMainFrame n=%d mean %.1f p50 %.1f p95 %.1f max %.1f  over16.7: %d%%"%(len(bm),sum(bm)/len(bm),bm[len(bm)//2],bm[int(len(bm)*.95)-1],bm[-1],round(100*sum(x>16.7 for x in bm)/len(bm))))
    ul=sorted([e for e in ev if e.get("ph")=="X" and e.get("name")=="UpdateLayoutTree"],key=lambda e:-e["dur"])
    print("top UpdateLayoutTree: dur ms, elementCount")
    for e in ul[:10]: print("   %.1f ms  count %s"%(e["dur"]/1000,(e.get("args") or {}).get("elementCount")))
    ec=[(e.get("args") or {}).get("elementCount",0) for e in ul]; print("events",len(ul),"with count>1000:",sum(1 for c in ec if c>1000),"sum dur of those",round(sum(e["dur"] for e in ul if (e.get("args") or {}).get("elementCount",0)>1000)/1000))
    bms=[e for e in ev if e.get("ph")=="X" and e.get("name")=="ProxyMain::BeginMainFrame" and e["dur"]>16700]
    main=bms[0]["tid"] if bms else None
    acc=collections.Counter()
    names=("UpdateLayoutTree","Layout","PrePaint","Paint","Layerize","Commit","FireAnimationFrame","FunctionCall","EventDispatch","HitTest","UpdateLayer","ScheduleStyleRecalculation","RunTask")
    for b in bms:
        t0,t1=b["ts"],b["ts"]+b["dur"]
        for e in ev:
            if e.get("ph")=="X" and e.get("tid")==b["tid"] and e["name"] in names and e["ts"]>=t0 and e["ts"]+e["dur"]<=t1 and e is not b: acc[e["name"]]+=e["dur"]/1000
    print("over-budget BeginMainFrame frames:",len(bms),"total ms",round(sum(b["dur"] for b in bms)/1000)); [print("   %-22s %7.1f ms"%(k,v)) for k,v in acc.most_common(9)]
    inv=collections.Counter(); ex={}
    for e in ev:
        if e.get("name")=="StyleRecalcInvalidationTracking":
            a=(e.get("args") or {}).get("data") or {}; k="%s | %s | %s"%(a.get("reason"),(a.get("extraData") or "")[:50],(a.get("nodeName") or "")[:50]); inv[k]+=1
    print("invalidations",sum(inv.values())); [print("  %5d  %s"%(v,k)) for k,v in inv.most_common(14)]
    big=[e for e in ev if e.get("ph")=="X" and e.get("name")=="UpdateLayoutTree" and e["dur"]>8000]
    invs=[e for e in ev if e.get("name")=="StyleRecalcInvalidationTracking"]
    print("big recalcs",len(big),"sum ms",round(sum(e["dur"] for e in big)/1000))
    agg=collections.Counter()
    for b in big:
        for i in invs:
            if i.get("tid")==b["tid"] and b["ts"]-60000<=i["ts"]<=b["ts"]+b["dur"]:
                a=(i.get("args") or {}).get("data") or {}; agg["%s | %s | %s"%(a.get("reason"),(a.get("extraData") or "")[:40],(a.get("nodeName") or "")[:60])]+=1
    [print("   %4d %s"%(v,k)) for k,v in agg.most_common(16)]
    keys=["UpdateLayoutTree","Layout","PrePaint","Paint","Layerize","Commit","RasterTask","ImageDecodeTask","CompositeLayers","FunctionCall","EvaluateScript","FireAnimationFrame","EventDispatch","HitTest","ScheduleStyleRecalculation","UpdateLayer","Animation::Update","GPUTask","DrawFrame","ThreadControllerImpl::RunTask","TimerFire","MajorGC","MinorGC"]
    for k in keys:
        if k in agg: print("%-32s %8.1f ms  x%d"%(k,agg[k],cnt[k]))
    top=[x for x in agg.most_common(40) if x[0] not in ("RunTask","ThreadControllerImpl::RunTask","ThreadControllerImpl::DoWork")][:14]
    print("--top"); [print("%-40s %8.1f ms x%d"%(k,v,cnt[k])) for k,v in top]
asyncio.run(main())
