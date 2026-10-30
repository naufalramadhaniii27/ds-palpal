# Research script (2026-10-30). APP_ROOT=<folder with index.html> python3 truth2.py 60. Checks that the number breakdown (B) explains every number that changes when an ability rises. Measures only.
import asyncio, json, re, random, functools, http.server, socket, threading, collections, sys
from playwright.async_api import async_playwright
import os; ROOT=os.environ.get("APP_ROOT","."); N=int(sys.argv[1]) if len(sys.argv)>1 else 60
def serve():
    s=socket.socket(); s.bind(("127.0.0.1",0)); port=s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    srv=http.server.ThreadingHTTPServer(("127.0.0.1",port),functools.partial(Q,directory=ROOT))
    threading.Thread(target=srv.serve_forever,daemon=True).start()
    return srv,"http://127.0.0.1:%d/index.html"%port
AB=["STR","DEX","CON","INT","WIS","CHA"]
JS=r"""(o)=>{ var AB=['STR','DEX','CON','INT','WIS','CHA']; var r=window.__bldFuzz(o); if(!r||r.err) return {err:'builder'}; var c=r.c; window.__sheetApply(c);
 var d1=window.__deriveFor(c); if(!d1||d1.err) return {err:'derive'};
 var keys=['ac','init','hp','dc']; AB.forEach(function(k){keys.push('save-'+k)}); for(var i=0;i<25;i++) keys.push('sk-'+i); for(var i=0;i<14;i++){ keys.push('ah-'+i); keys.push('ad-'+i); }
 var B1={}; keys.forEach(function(k){ var v=window.__miBd(k); if(v) B1[k]=v; });
 var flat=function(d){ var o={ac:d.ac,init:d.init,hp:d.hpmax,dc:d.dc}; AB.forEach(function(k){ o['save-'+k]=d.save[k]; }); Object.keys(d.skill||{}).forEach(function(i){ o['sk-'+i]=d.skill[i]; }); (d.atk||[]).forEach(function(a,i){ o['ah-'+i]=a.hit; o['ad-'+i]=a.dmg; }); return o; };
 var f1=flat(d1), res={};
 AB.forEach(function(a){ var c2=JSON.parse(JSON.stringify(c)); c2.abilities[a].base+=2; var d2=window.__deriveFor(c2); var f2=flat(d2); var ch=[]; Object.keys(f1).forEach(function(k){ if(JSON.stringify(f1[k])!==JSON.stringify(f2[k])) ch.push(k); }); res[a]=ch; });
 return {B:B1,changed:res}; }"""
NM={"Strength":"STR","Dexterity":"DEX","Constitution":"CON","Intelligence":"INT","Wisdom":"WIS","Charisma":"CHA"}
async def main():
    srv,url=serve(); rng=random.Random(9); tot=0; ok=0; unexpl=[]; extra=[]; errs=0
    async with async_playwright() as pw:
        b=await pw.chromium.launch(); pg=await b.new_page(viewport={"width":1250,"height":850})
        await pg.goto(url); await pg.evaluate("()=>{localStorage.clear()}"); await pg.reload()
        await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone",timeout=60000)
        await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }")
        await pg.wait_for_function("()=>!!window.__bldFuzz&&!!window.__deriveFor&&!!window.__sheetApply",timeout=60000)
        L=await pg.evaluate("()=>window.__bldLists()")
        for i in range(N):
            cls=rng.choice(L["cls"]); arr=L["arr"][:]; rng.shuffle(arr); lv=rng.randint(1,20); subs=L["subs"].get(cls) or []
            o={"cls":cls,"sp":rng.choice(L["sp"]),"bg":rng.choice(L["bg"]),"arr":arr,"b2":rng.randrange(3),"b1":rng.randrange(2),"lv":lv,"sub":rng.choice(subs) if subs else ""}
            try: r=await pg.evaluate(JS,o)
            except Exception as e: errs+=1; continue
            if r.get("err"): errs+=1; continue
            pred=collections.defaultdict(set)
            for k,v in r["B"].items():
                for p in v.get("parts",[]):
                    t=p.get("l","")+" "+p.get("note","")
                    for nm,a in NM.items():
                        if re.search(r'\b'+nm+r'\b',t) or re.search(r'\b'+a.title()+r'\b',t) or re.search(r'\b'+a+r'\b',t): pred[a].add(k)
            for a in AB:
                act=set(r["changed"][a]); pr=pred[a]; tot+=len(act); ok+=len(act&pr)
                for k in sorted(act-pr): unexpl.append((o["cls"],o["lv"],a,k))
                for k in sorted(pr-act): extra.append((o["cls"],o["lv"],a,k))
        await b.close()
    srv.shutdown()
    print("characters",N-errs,"(errors",errs,"); numbers that changed when an ability rose by 2:",tot,"; explained by the breakdown:",ok)
    print("changed but NOT explained:",len(unexpl),unexpl[:8]); print("explained but did NOT change (can be a cap or max):",len(extra),extra[:8])
asyncio.run(main())
