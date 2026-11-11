#!/usr/bin/env python3
"""Valda 2014: every species and subrace builds on a sheet, each source trait shows, fixed ability bonuses match the source, no page errors.
python3 tests/valda14_species.py"""
import asyncio, os, sys, json, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SRC = json.load(open(os.environ.get("VSS14", "/home/claude/src-data/hb/collection/Mage Hand Press; Valda's Spire of Secrets - 2014.json")))
AB = {"str": "STR", "dex": "DEX", "con": "CON", "int": "INT", "wis": "WIS", "cha": "CHA"}
def traits(e):
    return [x["name"] for x in e if isinstance(x, dict) and x.get("name") and x["name"] not in ("Age", "Alignment", "Size", "Speed")]
CASES = []   # (species name, trait names, fixed ability bonus)
for r in SRC["race"]:
    subs = [s for s in SRC["subrace"] if s["raceName"] == r["name"]]
    base_ab = {AB[k]: v for k, v in (r.get("ability") or [{}])[0].items() if k in AB}
    if not subs:
        CASES.append((r["name"], traits(r["entries"]), base_ab)); continue
    for s in subs:
        sab = {AB[k]: v for k, v in (s.get("ability") or [{}])[0].items() if k in AB}
        ab = dict(base_ab)
        for k, v in sab.items(): ab[k] = ab.get(k, 0) + v
        nm = s["name"] if r["name"] == "Mousefolk" else s["name"] + " " + r["name"]
        CASES.append((nm, traits(r["entries"]) + traits(s["entries"]), ab))
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start(); return srv, "http://127.0.0.1:%d/index.html" % port
JS = """(sp)=>{const b=window.__bldTestB();
 Object.assign(b,{name:"T",rs:"2014",cls:"Fighter",sub:"Champion",level:5,species:sp,bg:"Soldier (2014)",bgMode:"111",method:"point",base:{STR:15,DEX:10,CON:14,INT:12,WIS:14,CHA:10},arr:{},src:{core:true,dmg:true,phb14:true,dmg14:true,tvss14:true},ch:{clsk:["Perception","Athletics"]},inv:[]});
 let c; try{c=window.__bldSheetFor(b)}catch(e){return {err:String(e).slice(0,200)}}
 if(!c) return {err:"no sheet"};
 const names=[]; (c.features||[]).forEach(g=>(g.items||[]).forEach(f=>names.push(f.n)));
 const ab={}; Object.keys(c.abilities||{}).forEach(k=>{ab[k]=(c.abilities[k].bonus||[]).reduce((s,x)=>s+x.v,0)});
 return {names:names,ab:ab}}"""
async def main():
    srv, url = serve(); bad = []; errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1250, "height": 850})).new_page()
        pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        await pg.goto(url); await pg.evaluate("()=>localStorage.clear()"); await pg.reload()
        await pg.wait_for_function("()=>!!window.__bldFuzz&&!!window.__sheetApply", timeout=120000); await pg.evaluate("()=>window.__bldNeed().then(()=>1)")
        for nm, tr, ab in CASES:
            r = await pg.evaluate(JS, nm)
            if r.get("err"): bad.append(nm + ": " + r["err"]); continue
            miss = [t for t in tr if t not in r["names"] and not any(t.startswith(n) or n.startswith(t) for n in r["names"])]
            if miss: bad.append("%s missing traits: %s" % (nm, miss))
            for k, v in ab.items():
                if r["ab"].get(k, 0) != v: bad.append("%s %s bonus %s, source %s" % (nm, k, r["ab"].get(k, 0), v))
            print("ok" if not miss else "BAD", nm, len(r["names"]))
        await b.close()
    if errs: bad.append("page errors: %s" % errs[:3])
    print("FAIL" if bad else "OK Valda 2014 species"); [print(" ", x) for x in bad]; sys.exit(1 if bad else 0)
asyncio.run(main())
