# Research script (2026-10-30). Run: APP_ROOT=<folder with index.html> python3 FILE.py. Measures only, never changes the app.
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
 var r=window.__bldFuzz(o); if(!r||r.err) return {err:'builder '+(r&&r.err)};
 var c=r.c, J=JSON.stringify, cl=function(x){return JSON.parse(J(x));}, D=function(x){var d=window.__deriveFor(x); return d;};
 var base=D(c); if(!base||base.err) return {err:'derive '+(base&&base.err)};
 var bad=[], AB=['STR','DEX','CON','INT','WIS','CHA'];
 // M1 monotone in each ability
 AB.forEach(function(k){ var c2=cl(c); c2.abilities[k].base+=2; var d2=D(c2); if(!d2||d2.err){bad.push('M1 derive err '+k);return;}
   if(d2.mod[k]<base.mod[k]) bad.push('M1 mod drops '+k);
   if(d2.mod[k]-base.mod[k]!==1 && base.score[k]+2<=30) bad.push('M1 mod step '+k+' '+base.score[k]+'->'+d2.score[k]+' mod '+base.mod[k]+'->'+d2.mod[k]);
   if(d2.score[k]-base.score[k]!==2) bad.push('M1 score step '+k+' '+base.score[k]+'->'+d2.score[k]);
   AB.forEach(function(j){ if(j!==k && d2.mod[j]!==base.mod[j]) bad.push('M1 leak '+k+' changes mod '+j); });
   if(d2.save&&base.save){ ['STR','DEX','CON','INT','WIS','CHA'].forEach(function(j){ if(j!==k&&d2.save[j]!==base.save[j]) bad.push('M1 leak save '+j); }); }
   if(k==='CON' && d2.hpmax<base.hpmax) bad.push('M1 hp drops with CON');
   if(k==='DEX' && d2.ac<base.ac) bad.push('M1 ac drops with DEX '+base.ac+'->'+d2.ac);
   if(k!=='CON' && d2.hpmax!==base.hpmax) bad.push('M1 hp leaks from '+k);
 });
 // M2 proficiency toggle adds exactly pb
 var sk=c.skills||[]; var cand=null; for(var i=0;i<sk.length;i++){ if(!sk[i].p){cand=i;break;} }
 if(cand!==null){ var c3=cl(c); c3.skills[cand].p=1; var d3=D(c3);
   if(d3.skill[cand]-base.skill[cand]!==base.pb) bad.push('M2 prof adds '+(d3.skill[cand]-base.skill[cand])+' pb '+base.pb);
   for(var q=0;q<sk.length;q++){ if(q!==cand && d3.skill[q]!==base.skill[q]) bad.push('M2 leak to skill '+sk[q].n); } }
 var pro=null; for(var i2=0;i2<sk.length;i2++){ if(sk[i2].p===1){pro=i2;break;} }
 if(pro!==null){ var c6=cl(c); c6.skills[pro].p=2; var d6=D(c6); var dd=d6.skill[pro]-base.skill[pro]; if(dd!==base.pb) bad.push('M2b expertise adds '+dd+' pb '+base.pb); }
 // M3 order independence
 var c4=cl(c); c4.skills.reverse(); AB.forEach(function(k){ c4.abilities[k].bonus.reverse(); }); var d4=D(c4), n=sk.length;
 if(J(d4.mod)!==J(base.mod)||J(d4.score)!==J(base.score)||d4.ac!==base.ac||d4.hpmax!==base.hpmax||d4.dc!==base.dc) bad.push('M3 order changes result');
 for(var z=0;z<n;z++){ if(d4.skill[n-1-z]!==base.skill[z]) { bad.push('M3 skill order changes '+sk[z].n); break; } }
 // M4 original not mutated by derive
 var c5=cl(c), before=J(c5); D(c5); if(J(c5)!==before) bad.push('M4 derive mutates input');
 // M5 score ceiling 20 for builder output (except known features)
 AB.forEach(function(k){ if(base.score[k]>20) bad.push('M5 score '+k+'='+base.score[k]+' at lv '+o.lv+' '+o.cls); });
 return {bad:bad, lv:o.lv, cls:o.cls};
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
            cls=rng.choice(L["cls"]); arr=L["arr"][:]; rng.shuffle(arr); lv=rng.randint(1,20); subs=L["subs"].get(cls) or []
            o={"cls":cls,"sp":rng.choice(L["sp"]),"bg":rng.choice(L["bg"]),"arr":arr,"b2":rng.randrange(3),"b1":rng.randrange(2),"lv":lv,"sub":rng.choice(subs) if subs else ""}
            r=await pg.evaluate(JS,o); r["o"]=o; res.append(r)
        await b.close()
    srv.shutdown()
    kinds={}
    for r in res:
        for x in (r.get("bad") or []): k=x.split(' ')[0]+' '+(x.split(' ')[1] if len(x.split(' '))>1 else ''); kinds.setdefault(x[:60],[]).append(r["o"])
        if r.get("err"): kinds.setdefault("ERR "+r["err"][:60],[]).append(r["o"])
    print(N,"characters;",sum(1 for r in res if r.get("bad") or r.get("err")),"with findings;",len(errs),"page errors")
    for k,v in sorted(kinds.items(),key=lambda x:-len(x[1]))[:25]: print(len(v),k,"| e.g.",json.dumps({a:v[0][a] for a in ('cls','sp','bg','lv','sub')}))
    json.dump({"kinds":{k:v[:3] for k,v in kinds.items()}},open("meta-out.json","w"),indent=1)
asyncio.run(main())
