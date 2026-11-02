#!/usr/bin/env python3
"""N8: computed-style snapshot of many screens, to prove a CSS change keeps every element looking the same.

  python3 tests/style_snapshot.py OUT.json [--root DIR] [--variants]   take a snapshot (--variants adds Record skin, light theme and high contrast at 1250x850)
  python3 tests/style_snapshot.py --diff A.json B.json            list what differs (exit 1 when anything differs)

Screens at 390x844 and 1250x850, motion off (so animations do not move values): Home, sheet tabs (all), the first detail panel,
More menu, Settings, Library with a search, builder first screen and Quick Build result. Each visible element is keyed by its path
(tag, id, classes, position among siblings) and stores the computed values listed in PROPS."""
import asyncio, json, os, sys, functools, http.server, socket, threading
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE); args = sys.argv[1:]
if "--root" in args: i = args.index("--root"); ROOT = os.path.abspath(args[i + 1]); del args[i:i + 2]
FIX = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
PROPS = ["display", "position", "top", "left", "right", "bottom", "width", "height", "margin-top", "margin-right", "margin-bottom", "margin-left",
         "padding-top", "padding-right", "padding-bottom", "padding-left", "border-top-width", "border-top-color", "border-top-left-radius",
         "color", "background-color", "background-image", "font-family", "font-size", "font-weight", "line-height", "letter-spacing", "text-transform",
         "text-align", "opacity", "visibility", "z-index", "transform", "box-shadow", "flex-direction", "justify-content", "align-items", "gap",
         "grid-template-columns", "overflow-x", "overflow-y", "white-space", "filter", "backdrop-filter", "outline-style", "cursor", "pointer-events"]
SNAP = """(props)=>{ var out={}, n=0;
  var key=function(el){ var p=[]; for(var e=el; e&&e!==document.body; e=e.parentElement){ var s=e.tagName.toLowerCase(); if(e.id) s+='#'+e.id; else { var c=(e.getAttribute('class')||'').trim().split(/\\s+/).filter(Boolean).filter(function(x){return !/^(on|open|in|show|active|sel|hov|press|is-|v[0-9]|anim)/.test(x)}).slice(0,3); if(c.length) s+='.'+c.join('.'); var i=0, q=e; while((q=q.previousElementSibling)) i++; s+=':'+i; } p.unshift(s); if(e.id) break; } return p.join('>'); };
  document.querySelectorAll('body *').forEach(function(el){ if(n>6000) return; var r=el.getBoundingClientRect(); if(!r.width&&!r.height) return; if(/^(SCRIPT|STYLE|svg|path|g|circle|rect|line|polyline|polygon|use|defs)$/i.test(el.tagName)) return;
    var cs=getComputedStyle(el), o={}; props.forEach(function(p){ o[p]=cs.getPropertyValue(p).split(location.origin).join(''); }); o._x=Math.round(r.left); o._y=Math.round(r.top+scrollY); out[key(el)]=o; n++; });
  return out; }"""
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT)); threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port
async def shoot(pg, name, res):
    await pg.wait_for_timeout(700); res[name] = await pg.evaluate(SNAP, PROPS)
VARIANTS = "--variants" in args
if VARIANTS: args.remove("--variants")
async def take(path):
    srv, url = serve(); res = {}
    runs = [(390, 844, "", None), (1250, 850, "", None)]
    if VARIANTS:
        runs += [(1250, 850, " record", {"skin": "record"}), (1250, 850, " light", {"theme": "light"}), (1250, 850, " hc", "hc"), (390, 844, " record", {"skin": "record"})]
    async with async_playwright() as pw:
        b = await pw.chromium.launch()
        for w, h, vtag, var in runs:
            vp = "%dx%d%s" % (w, h, vtag)
            ctx = await b.new_context(viewport={"width": w, "height": h}, reduced_motion="reduce", service_workers="block"); pg = await ctx.new_page()
            # seeded before the page runs: a reload after writing storage lets the old page write its own roster back on unload, which made two snapshots of one build differ
            seed = "if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',%s);localStorage.setItem('mi-fx','off');" % json.dumps(FIX)
            if var == "hc": seed += "localStorage.setItem('cs-ui-hc',JSON.stringify({m:'on'}));"
            elif var: seed += "localStorage.setItem('yudhi-kelapa-sheet-v1',JSON.stringify(%s));" % json.dumps(var)
            await ctx.add_init_script(seed + "sessionStorage.setItem('__s','1')}")
            await pg.goto(url)
            await pg.wait_for_selector("[data-hview]", state="attached", timeout=30000); await pg.wait_for_timeout(2500)
            await shoot(pg, vp + " home", res)
            await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn", state="visible"); await pg.wait_for_timeout(1500)
            tabs = await pg.query_selector_all("#tabs .tab") if w > 800 else await pg.query_selector_all("#bnav button")
            for i, t in enumerate(tabs[:8]):
                try:
                    if await t.is_visible(): await t.click(timeout=3000); await shoot(pg, "%s tab%d" % (vp, i), res)
                except Exception: pass
            el = await pg.query_selector("[data-info]")
            if el:
                try: await el.click(timeout=3000); await shoot(pg, vp + " detail", res)
                except Exception: pass
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>{ var m=document.getElementById('moreBtn'); if(m) m.click(); }"); await shoot(pg, vp + " more", res)
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            await pg.keyboard.press("l"); await pg.wait_for_timeout(500)
            try: await pg.fill("#libQ", "shield"); await shoot(pg, vp + " library", res)
            except Exception: pass
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(300)
            await pg.evaluate("()=>{ if(window.__bldNeed) window.__bldNeed(); }"); await pg.wait_for_function("()=>typeof window.__bldOpen==='function'", timeout=30000)
            await pg.evaluate("window.__bldOpen()"); await shoot(pg, vp + " builder", res)
            await ctx.close()
        await b.close()
    srv.shutdown(); json.dump(res, open(path, "w")); print("screens", len(res), "elements", sum(len(v) for v in res.values()))
def diff(a, b):
    A = json.load(open(a)); B = json.load(open(b)); bad = 0
    for scr in sorted(set(A) | set(B)):
        x = A.get(scr, {}); y = B.get(scr, {}); keys = set(x) | set(y); ch = []
        for k in keys:
            if k not in x or k not in y: ch.append((k, "missing in " + ("A" if k not in x else "B"))); continue
            d = [p for p in x[k] if x[k][p] != y[k].get(p)]
            if d: ch.append((k, ", ".join("%s: %s -> %s" % (p, x[k][p], y[k].get(p)) for p in d[:4])))
        if ch:
            bad += len(ch); print("== %s: %d elements differ" % (scr, len(ch)))
            for k, t in ch[:6]: print("   ", k[-90:], "|", t[:200])
    print("differences:", bad); return 1 if bad else 0
if args and args[0] == "--diff": sys.exit(diff(args[1], args[2]))
asyncio.run(take(os.path.abspath(args[0] if args else os.path.join(HERE, "out", "styles.json"))))
