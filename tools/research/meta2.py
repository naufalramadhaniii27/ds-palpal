# Research script (2026-10-30). APP_ROOT=<folder with index.html> python3 meta2.py 400 21. Level-step and bonus relations on the builder and derive. Measures only.
import asyncio, json, sys, random, functools, http.server, socket, threading, time
from playwright.async_api import async_playwright
import os; ROOT=os.environ.get("APP_ROOT","."); N=int(sys.argv[1]) if len(sys.argv)>1 else 300; SEED=int(sys.argv[2]) if len(sys.argv)>2 else 11
def serve():
    s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT))
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    return srv,"http://127.0.0.1:%d/index.html"%port
JS=r"""(o)=>{
 var J=JSON.stringify, bad=[];
 var o2=JSON.parse(J(o)); o2.lv=o.lv+1;
 var r1=window.__bldFuzz(o), r2=window.__bldFuzz(o2); if(!r1||r1.err||!r2||r2.err) return {err:'builder '+((r1&&r1.err)||(r2&&r2.err))};
 var d1=window.__deriveFor(r1.c), d2=window.__deriveFor(r2.c); if(!d1||d1.err||!d2||d2.err) return {err:'derive'};
 var cnt=function(c){ var n=0; (c.features||[]).forEach(function(g){ n+=(g.items||[]).length; }); return n; };
 var names=function(c){ var m={}; (c.features||[]).forEach(function(g){ (g.items||[]).forEach(function(it){ m[it.n]=1; }); }); return m; };
 if(!(d2.hpmax>d1.hpmax)) bad.push('L1 hp does not grow '+d1.hpmax+'->'+d2.hpmax);
 if(d2.pb<d1.pb) bad.push('L1 pb drops');
 if(d2.level!==d1.level+1) bad.push('L1 level step');
 if(cnt(r2.c)<cnt(r1.c)) bad.push('L2 features shrink '+cnt(r1.c)+'->'+cnt(r2.c));
 var n1=names(r1.c), n2=names(r2.c), lost=Object.keys(n1).filter(function(k){return !n2[k];});
 if(lost.length) bad.push('L3 feature lost at level '+(o.lv+1)+': '+lost.slice(0,3).join(' / '));
 var sp=function(c){ var x=c.spellcasting||c.spells; return x?J(x).length:0; };
 // AC bonus and hp bonus linear, no leakage
 var c3=JSON.parse(J(r1.c)); c3.ac.bonus=(c3.ac.bonus||[]).concat([{s:'t',v:1}]); c3.initBonus=(c3.initBonus||[]).concat([{s:'t',v:2}]); c3.hpBonus=(c3.hpBonus||[]).concat([{s:'t',v:5}]);
 var d3=window.__deriveFor(c3);
 if(d3.ac-d1.ac!==1) bad.push('A1 ac bonus adds '+(d3.ac-d1.ac)); if(d3.init-d1.init!==2) bad.push('A1 init bonus adds '+(d3.init-d1.init)); if(d3.hpmax-d1.hpmax!==5) bad.push('A1 hp bonus adds '+(d3.hpmax-d1.hpmax));
 if(d3.dc!==d1.dc) bad.push('A1 leak to dc');
 return {bad:bad, st:{g:cnt(r2.c)>cnt(r1.c)?1:0, hp:d2.hpmax-d1.hpmax, lv:o.lv}};
}"""
async def main():
    srv,url=serve(); rng=random.Random(SEED); res=[]
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); pg=await b.new_page(viewport={"width":1250,"height":850})
        errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
        await pg.goto(url); await pg.evaluate("()=>{localStorage.clear()}"); await pg.reload()
        await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone",timeout=60000)
        await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }")
        await pg.wait_for_function("()=>!!window.__bldFuzz&&!!window.__deriveFor",timeout=60000)
        L=await pg.evaluate("()=>window.__bldLists()")
        for i in range(N):
            cls=rng.choice(L["cls"]); arr=L["arr"][:]; rng.shuffle(arr); lv=rng.randint(1,19); subs=L["subs"].get(cls) or []
            o={"cls":cls,"sp":rng.choice(L["sp"]),"bg":rng.choice(L["bg"]),"arr":arr,"b2":rng.randrange(3),"b1":rng.randrange(2),"lv":lv,"sub":rng.choice(subs) if subs else ""}
            r=await pg.evaluate(JS,o); r["o"]=o; res.append(r)
        await b.close()
    srv.shutdown()
    kinds={}
    for r in res:
        for x in (r.get("bad") or []): k=x.split(' ')[0]+' '+(x.split(' ')[1] if len(x.split(' '))>1 else ''); kinds.setdefault(x[:60],[]).append(r["o"])
        if r.get("err"): kinds.setdefault("ERR "+r["err"][:60],[]).append(r["o"])
    st=[r["st"] for r in res if r.get("st")]
    print("canary: features grew in",sum(x["g"] for x in st),"of",len(st),"level steps; hp gain min/avg/max",min(x["hp"] for x in st),round(sum(x["hp"] for x in st)/len(st),1),max(x["hp"] for x in st))
    print(N,"characters;",sum(1 for r in res if r.get("bad") or r.get("err")),"with findings;",len(errs),"page errors")
    for k,v in sorted(kinds.items(),key=lambda x:-len(x[1]))[:25]: print(len(v),k,"| e.g.",json.dumps({a:v[0][a] for a in ('cls','sp','bg','lv','sub')}))
    json.dump({"kinds":{k:v[:3] for k,v in kinds.items()}},open("meta-out.json","w"),indent=1)
asyncio.run(main())
