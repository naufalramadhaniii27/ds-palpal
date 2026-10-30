#!/usr/bin/env python3
"""Cross links: names of spells, creatures and magic items in rule text open their detail, in the sheet and in the builder.
  python3 tests/xlinks.py"""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
res = []
def check(n, ok, info=""):
    res.append(ok); print("ok  " if ok else "FAIL", n, "" if ok else info)
TXT = """()=>{ var t="It can turn into an Elephant for no more than 24 hours. Giant Goat or Nightmare. You can cast Fireball and carry a Bag of Holding. Oath of the Gamma Knight. Light is bright. Treat it as Difficult Terrain in Chain Mail. You gain the Savage Attacker feat. Choose a feat such as Alert.";
  var h=__xl.xlink(t); var l=[].map.call(new DOMParser().parseFromString("<div>"+h+"</div>","text/html").querySelectorAll("button.xl"),function(b){return b.getAttribute("data-info")});
  var fig=DMGI.filter(function(r){return r[0]==="Figurine of Wondrous Power"})[0]; var fh=__xl.info("mi:Figurine of Wondrous Power").h; var d=new DOMParser().parseFromString("<div>"+fh+"</div>","text/html");
  var fl=[].map.call(d.querySelectorAll("button.xl"),function(b){return b.getAttribute("data-info")});
  var dl=__xl.info("lib:rule|Difficult Terrain"), df=__xl.info("lib:feat|Savage Attacker"), dg=__xl.info("lib:gear|Chain Mail");
  return {l:l, fl:fl, many:Object.keys(__xl.idx()).length, rule:String(dl.h).length, feat:String(df.h).length, gear:String(dg.h).length, rt:dl.t, ft:df.t}; }"""
BLD = """()=>{ var last=function(){ var e=document.querySelectorAll(".exp"); return e[e.length-1]; }; var o={};
  __bldRef("mi","Figurine of Wondrous Power"); var w=last(), a=w.querySelector(".expb"); o.miLinks=[].map.call(a.querySelectorAll("button.lnk"),function(b){return b.dataset.lnk}); o.leak=a.querySelectorAll("button[data-info]").length; w.remove();
  __bldRef("lib","rule|Difficult Terrain"); w=last(); o.rule=w.querySelector(".expb").innerText.slice(0,30); w.remove();
  __bldRef("cr","Elephant"); w=last(); o.cr=w.querySelector(".expb").innerText.slice(0,40); w.remove(); return o; }"""
async def main():
    srv, url = serve(); errs = []
    async with async_playwright() as p:
        br = await p.chromium.launch()
        for vp in [(390, 844), (1250, 850)]:
            tag = "%dx%d" % vp
            ctx = await br.new_context(viewport={"width": vp[0], "height": vp[1]}); pg = await ctx.new_page()
            pg.on("pageerror", lambda e: errs.append(str(e)))
            await pg.add_init_script("if(!localStorage.getItem('yudhi-kelapa-build-v3')) localStorage.setItem('yudhi-kelapa-build-v3', %s)" % json.dumps(FIX))
            await pg.goto(url); await pg.wait_for_function("()=>window.__bldNeed||window.__deferDone", timeout=60000)
            await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }")
            await pg.wait_for_function("()=>!!window.__bldRef&&!!window.__xl", timeout=60000)
            r = await pg.evaluate(TXT)
            for want in ("cr:Elephant", "cr:Giant Goat", "cr:Nightmare", "spn:Fireball", "mi:Bag of Holding"):
                check("%s text links %s" % (tag, want), want in r["l"], str(r["l"]))
            for want in ("lib:rule|Difficult Terrain", "lib:gear|Chain Mail", "lib:feat|Savage Attacker"):
                check("%s text links %s" % (tag, want), want in r["l"], str(r["l"]))
            check(tag + " single-word feat Alert links only after the word feat", "lib:feat|Alert" in r["l"], str(r["l"]))
            check(tag + " rule, feat and gear details open", r["rule"] > 40 and r["feat"] > 40 and r["gear"] > 40 and r["rt"] == "Difficult Terrain" and r["ft"] == "Savage Attacker", str([r["rule"], r["feat"], r["gear"], r["rt"], r["ft"]]))
            check(tag + " part of a longer name stays plain (Gamma Knight)", "cr:Knight" not in r["l"], str(r["l"]))
            check(tag + " Figurine text links its creatures", "cr:Elephant" in r["fl"] and "cr:Giant Goat" in r["fl"] and "cr:Nightmare" in r["fl"], str(r["fl"][:8]))
            check(tag + " an item text does not link to itself", "mi:Figurine of Wondrous Power" not in r["fl"], str(r["fl"][:8]))
            b = await pg.evaluate(BLD)
            check(tag + " builder reference links creatures", "cr|Elephant" in b["miLinks"] and "cr|Nightmare" in b["miLinks"], str(b["miLinks"][:6]))
            check(tag + " builder reference has no sheet-only links", b["leak"] == 0, str(b["leak"]))
            check(tag + " builder reference opens a rule", b["rule"].startswith("Difficult Terrain"), b["rule"])
            check(tag + " builder reference opens a creature", b["cr"].startswith("Elephant"), b["cr"])
            await ctx.close()
        await br.close()
    check("no page errors", not errs, str(errs[:3]))
    print("%d checks, %d failed" % (len(res), res.count(False))); sys.exit(0 if all(res) else 1)
asyncio.run(main())
