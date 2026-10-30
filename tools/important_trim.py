#!/usr/bin/env python3
"""N8: find !important declarations that do not change anything, and remove them from src/css.

  python3 tools/important_trim.py analyse OUT.json      run the screens, list each !important and whether it is needed
  python3 tools/important_trim.py apply OUT.json         remove the ones marked removable from src/css (then build and check with
                                                         tests/style_snapshot.py --variants against a snapshot taken before)

An !important is needed on an element when, without it, it would lose: the element has the property in its inline style
(JS sets it), or another normal declaration of the same property matches the element with higher specificity, or with equal
specificity later in the page, or any other !important declaration of the same property matches it (then the order between the two would change). It is removable only when it matched at least one element on the screens and was needed on none.
Unclear cases stay: rules inside @container, selectors with pseudo-elements, :has(), or any selector the browser cannot query.
Files with print, motion and effect rules (06, 19, 20, 23 to 27, 29) are left alone: the screens do not cover print and motion, and effects set inline styles only while they move. Print rules elsewhere sit in @media print, which does not match on screen, so they stay."""
import asyncio, json, os, re, sys, functools, http.server, socket, threading
from playwright.async_api import async_playwright

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
FIX = open(os.path.join(ROOT, "tests", "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
SKIP = re.compile(r"css/(06|19|20|23|24|25|26|27|29)-")

ANALYSE = r"""()=>{
  var order=0, rules=[];
  var spec=function(sel){ var s=sel.replace(/:where\([^)]*\)/g,'').replace(/::?[a-z-]+\((?:[^()]|\([^()]*\))*\)/gi,function(m){ if(/^:(not|is)\(/i.test(m)){ return ' '+m.slice(m.indexOf('(')+1,-1).split(',')[0]+' '; } return ' :x '; });
    var a=(s.match(/#[\w-]+/g)||[]).length, b=(s.match(/\.[\w-]+|\[[^\]]*\]|:(?!:)[\w-]+/g)||[]).length, c=(s.replace(/#[\w-]+|\.[\w-]+|\[[^\]]*\]|::?[\w-]+/g,' ').match(/(^|[\s>+~])[a-z][\w-]*/gi)||[]).length; return a*10000+b*100+c; };
  var walk=function(list, cond){ for(var i=0;i<list.length;i++){ var r=list[i];
      if(r.type===1){ var parts=r.selectorText.split(/,(?![^()]*\))/).map(function(x){return x.trim()}); var decl=[]; for(var j=0;j<r.style.length;j++){ var p=r.style[j]; decl.push({p:p, imp:r.style.getPropertyPriority(p)==='important', v:r.style.getPropertyValue(p)}); } rules.push({o:order++, parts:parts, decl:decl, cond:cond, sel:r.selectorText}); if(r.cssRules&&r.cssRules.length) walk(r.cssRules, cond); }
      else if(r.cssRules){ var c=cond; if(r.media){ c = cond && matchMedia(r.media.mediaText).matches; } else if(r.conditionText!==undefined && r.constructor.name==='CSSSupportsRule'){ c = cond && CSS.supports(r.conditionText); } else if(r.constructor.name==='CSSContainerRule'){ c = 'unknown'; } walk(r.cssRules, c); } } };
  for(var s=0;s<document.styleSheets.length;s++){ try{ walk(document.styleSheets[s].cssRules, true); }catch(e){} }
  var out={};
  rules.forEach(function(r){ r.decl.forEach(function(d){ if(!d.imp) return; var k=r.sel+' |'+d.p; var o=out[k]||(out[k]={m:0,need:0,why:''});
    if(r.cond!==true){ o.need++; o.why=(r.cond==='unknown'?'container':'condition off here'); return; }
    r.parts.forEach(function(sel){ var sp=spec(sel); if(/::|:has\(/.test(sel)){ o.need++; o.why='pseudo'; return; } var els; try{ els=document.querySelectorAll(sel); }catch(e){ o.need++; o.why='query'; return; }
      els.forEach(function(el){ o.m++;
        if(el.style&&el.style.getPropertyValue(d.p)){ o.need++; o.why='inline'; return; }
        for(var q=0;q<rules.length;q++){ var x=rules[q]; if(x===r||x.cond!==true) continue; var hit=x.decl.filter(function(y){ return y.p===d.p; }); if(!hit.length) continue; var impHit=hit.some(function(y){ return y.imp; });
          for(var z=0;z<x.parts.length;z++){ var ps=x.parts[z]; if(/::/.test(ps)) continue; var m=false; try{ m=el.matches(ps); }catch(e){} if(!m) continue; var s2=spec(ps); if(impHit){ o.need++; o.why='another !important: '+ps; return; } if(s2>sp||(s2===sp&&x.o>r.o)){ o.need++; o.why='beaten by '+ps; return; } } } }); }); }); });
  return out; }"""

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port

async def analyse(path):
    srv, url = serve(); tot = {}
    def merge(r):
        for k, v in r.items():
            t = tot.setdefault(k, {"m": 0, "need": 0, "why": ""}); t["m"] += v["m"]; t["need"] += v["need"]; t["why"] = t["why"] or v["why"]
    runs = [(390, 844, None), (1250, 850, None), (1250, 850, {"skin": "record"}), (1250, 850, {"theme": "light"}), (1250, 850, "hc"), (390, 844, {"skin": "record"})]
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h, var in runs:
            ctx = await b.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce", service_workers="block"); pg = await ctx.new_page()
            await pg.goto(url); await pg.evaluate("v=>{localStorage.clear(); localStorage.setItem('yudhi-kelapa-build-v3', v); localStorage.setItem('mi-fx','off');}", FIX); await pg.reload()
            if var == "hc": await pg.evaluate("()=>localStorage.setItem('cs-ui-hc', JSON.stringify({m:'on'}))"); await pg.reload()
            elif var: await pg.evaluate("o=>{ var k='yudhi-kelapa-sheet-v1', s={}; try{ s=JSON.parse(localStorage.getItem(k)||'{}')||{}; }catch(e){} Object.assign(s,o); localStorage.setItem(k, JSON.stringify(s)); }", var); await pg.reload()
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.wait_for_timeout(2000); merge(await pg.evaluate(ANALYSE))
            await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(1200)
            tabs = await pg.query_selector_all("#tabs .tab") if w > 800 else await pg.query_selector_all("#bnav button")
            for t in tabs[:8]:
                try:
                    if await t.is_visible(): await t.click(timeout=3000); await pg.wait_for_timeout(500); merge(await pg.evaluate(ANALYSE))
                except Exception: pass
            el = await pg.query_selector("[data-info]")
            if el:
                try: await el.click(timeout=3000); await pg.wait_for_timeout(500); merge(await pg.evaluate(ANALYSE))
                except Exception: pass
            await pg.keyboard.press("Escape")
            await pg.evaluate("()=>{ var m=document.getElementById('moreBtn'); if(m) m.click(); }"); await pg.wait_for_timeout(500); merge(await pg.evaluate(ANALYSE)); await pg.keyboard.press("Escape")
            await pg.keyboard.press("l"); await pg.wait_for_timeout(500)
            try: await pg.fill("#libQ", "shield"); await pg.wait_for_timeout(600); merge(await pg.evaluate(ANALYSE))
            except Exception: pass
            await pg.keyboard.press("Escape")
            await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }"); await pg.wait_for_function("()=>typeof window.__bldOpen==='function'", timeout=30000)
            await pg.evaluate("window.__bldOpen()"); await pg.wait_for_timeout(800); merge(await pg.evaluate(ANALYSE))
            await ctx.close()
        await b.close()
    srv.shutdown()
    rem = {k: v for k, v in tot.items() if v["m"] > 0 and v["need"] == 0}
    json.dump({"all": tot, "removable": sorted(rem)}, open(path, "w"), indent=0)
    print("important declarations:", len(tot), "matched on screens:", sum(1 for v in tot.values() if v["m"]), "removable:", len(rem))

def apply(path):
    data = json.load(open(path)); rem = set(data["removable"]); want = {}; allimp = {}
    for k in data["all"]:
        sel, prop = k.rsplit(" |", 1); allimp.setdefault(norm(sel), set()).add(prop)
    for k in rem:
        sel, prop = k.rsplit(" |", 1); want.setdefault(norm(sel), set()).add(prop)
    css = json.load(open(os.path.join(ROOT, "src", "manifest.json")))
    files = [f for e in css["entries"] if e["t"] == "block" and e["open"].startswith("<style") for f in e["files"]]
    n = 0
    for fn in files:
        if SKIP.search(fn): continue
        p = os.path.join(ROOT, "src", fn); t = open(p, encoding="utf-8").read(); out = []; i = 0
        blank = re.sub(r"/\*.*?\*/", lambda c: " " * len(c.group(0)), t, flags=re.S)  # comments become spaces, positions stay
        for m in re.finditer(r"([^{}@/][^{}]*)\{([^{}]*)\}", blank):
            sel = norm(m.group(1)); props = want.get(sel)
            if not props: continue
            body = t[m.start(2):m.end(2)]
            def fix(dm):
                nonlocal n
                name = dm.group(1).strip().lower()
                affected = {x for x in allimp.get(sel, set()) if x == name or x.startswith(name + "-")}
                if affected and affected <= props:
                    n += 1; return dm.group(0).replace("!important", "")
                return dm.group(0)
            nb = re.sub(r"([\w-]+)\s*:[^;{}]*?!important", fix, body)
            if nb != body:
                out.append((m.start(2), m.end(2), nb))
        for a, b2, nb in reversed(out): t = t[:a] + nb + t[b2:]
        open(p, "w", encoding="utf-8").write(t)
    print("removed", n, "!important")

def norm(sel):
    return re.sub(r"\s+", " ", re.sub(r"\s*([>+~,])\s*", r"\1", sel.strip())).replace('"', "'")

if __name__ == "__main__":
    cmd, out = sys.argv[1], sys.argv[2]
    if cmd == "analyse": asyncio.run(analyse(out))
    elif cmd == "apply": apply(out)
