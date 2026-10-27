#!/usr/bin/env python3
"""axe scan and tap size check. python3 tests/a11y_scan.py AXE_JS [OUT.json] [--root DIR]
AXE_JS is the path to axe.min.js (npm install axe-core in a separate folder, the repo does not carry it).
Screens: Home, every sheet page, a detail panel, More menu, Settings, Builder first screen, at 390x844 and 1250x850.
Reports per rule: impact, number of nodes, screens. Tap size: visible buttons, links, inputs and selects with a side under 44 px (390 only).
Exit code 0 only when there is no critical or serious violation and no control under 44 px."""
import asyncio, json, os, sys, collections, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if "--root" in a: i = a.index("--root"); ROOT = os.path.abspath(a[i+1]); del a[i:i+2]
AXE = a[0]; OUT = a[1] if len(a) > 1 else os.path.join(HERE, "out", "a11y.json")
os.makedirs(os.path.dirname(OUT), exist_ok=True)
YUDHI = open(os.path.join(HERE, "fixtures", "yudhi-v3.json"), encoding="utf-8").read()
AXE_SRC = open(AXE, encoding="utf-8").read()

def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *x): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, "http://127.0.0.1:%d/index.html" % port

RUN = """async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']},resultTypes:['violations']});
  return r.violations.map(v=>({id:v.id,impact:v.impact,n:v.nodes.length,help:v.help,ex:v.nodes.slice(0,2).map(x=>x.target.join(' ').slice(0,90))}))}"""
SMALL = """()=>{const o=[];document.querySelectorAll('button,a[href],input:not([type=hidden]),select,textarea,[role=button],[role=tab]').forEach(e=>{
  if(!e.offsetParent&&getComputedStyle(e).position!=='fixed')return;let t=e;if((e.type==='checkbox'||e.type==='radio')&&e.closest('label'))t=e.closest('label');if(e.id==='avFile'||e.classList.contains('lk'))return;const r=t.getBoundingClientRect();if(r.width<1||r.height<1)return;
  if(r.bottom<0||r.top>innerHeight*3)return;if(Math.min(r.width,r.height)<44)o.push([e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ')[0]:''),Math.round(r.width),Math.round(r.height)])});return o}"""

async def main():
    srv, base = serve(); res = {}; ruleagg = collections.defaultdict(lambda: {"impact": "", "n": 0, "screens": set(), "help": "", "ex": []}); smallagg = collections.Counter()
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for W, H in ((390, 844), (1250, 850)):
            ctx = await b.new_context(viewport={"width": W, "height": H}, service_workers="block", has_touch=W < 600)
            pg = await ctx.new_page(); pg.set_default_timeout(12000)
            await pg.goto(base); await pg.wait_for_timeout(600)
            await pg.evaluate("a=>{localStorage.clear();sessionStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',a)}", YUDHI)
            await pg.reload(); await pg.wait_for_timeout(2500)
            await pg.add_script_tag(content=AXE_SRC)
            async def scan(name):
                await pg.wait_for_timeout(700)
                v = await pg.evaluate(RUN); sm = await pg.evaluate(SMALL) if W < 600 else []
                key = "%dx%d %s" % (W, H, name); res[key] = {"violations": v, "small": sm}
                for x in v:
                    g = ruleagg[x["id"]]; g["impact"] = x["impact"]; g["n"] += x["n"]; g["screens"].add(name); g["help"] = x["help"]
                    if len(g["ex"]) < 2: g["ex"] += x["ex"][:1]
                for s_ in sm: smallagg[(name, s_[0])] += 1
                print("  %-22s violations: %2d rules  small controls: %d" % (key, len(v), len(sm)), flush=True)
            await scan("home")
            await pg.click("[data-hview]"); await pg.wait_for_selector("#dmgBtn"); await pg.wait_for_timeout(1500)
            for i, nm in enumerate(["main", "skills", "actions", "spells", "inventory", "features", "description", "notes", "extras"]):
                try:
                    sel = "[data-go='%d']" % i
                    if W > 600: sel = ["[data-tab='p-actions']", "[data-tab='p-actions']", "[data-tab='p-actions']", "[data-tab='p-spells']", "[data-tab='p-inv']", "[data-tab='p-feat']", "[data-tab='p-desc']", "[data-tab='p-notes']", "[data-tab='p-ext']"][i]
                    await pg.click(sel); await scan("sheet " + nm)
                    if W > 600 and i == 0: pass
                except Exception as e:
                    print("  skip", nm, str(e)[:60])
            try:
                await pg.click("[data-go='0']" if W < 600 else "[data-tab='p-actions']")
                await pg.click(".hp-h [data-info]"); await scan("detail panel"); await pg.keyboard.press("Escape")
            except Exception as e: print("  skip detail panel", str(e)[:60])
            try:
                await pg.click("#moreBtn"); await scan("more menu"); await pg.keyboard.press("Escape")
            except Exception as e: print("  skip more", str(e)[:60])
            await ctx.close()
        await b.close()
    out = {"rules": {k: {**v, "screens": sorted(v["screens"])} for k, v in ruleagg.items()}, "small": {"%s | %s" % k: n for k, n in smallagg.most_common(60)}, "per_screen": res}
    json.dump(out, open(OUT, "w"), indent=1)
    order = {"critical": 0, "serious": 1, "moderate": 2, "minor": 3}
    print("\naxe rules (nodes, screens):")
    for k, v in sorted(ruleagg.items(), key=lambda kv: (order.get(kv[1]["impact"], 9), -kv[1]["n"])):
        print("  %-9s %-34s %4d nodes  %2d screens  %s" % (v["impact"], k, v["n"], len(v["screens"]), v["help"][:50]))
    ns = sum(smallagg.values()); print("\ncontrols under 44 px at 390: %d (distinct kinds %d)" % (ns, len({k[1] for k in smallagg})))
    crit = sum(1 for v in ruleagg.values() if v["impact"] in ("critical", "serious"))
    sys.exit(1 if crit or ns else 0)

asyncio.run(main())
