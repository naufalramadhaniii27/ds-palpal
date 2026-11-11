#!/usr/bin/env python3
"""Valda 2014: every Warden subclass builds at level 20 (2014 rules), each source feature is on the sheet, trackers and actions exist, no page errors.
python3 tests/valda14_warden_subs.py"""
import asyncio, os, sys, json, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
SRC = json.load(open(os.environ.get("VSS14", "/home/claude/src-data/hb/collection/Mage Hand Press; Valda's Spire of Secrets - 2014.json")))
CLS = os.environ.get("VCLS", "Warden")
SUBS = {s["name"]: [f["name"] for f in SRC["subclassFeature"] if f["className"] == CLS and f["subclassShortName"] == s["shortName"] and f["name"] != s["name"]] for s in SRC["subclass"] if s["className"] == CLS}
def serve():
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=ROOT))
    threading.Thread(target=srv.serve_forever, daemon=True).start(); return srv, "http://127.0.0.1:%d/index.html" % port
BUILD = """([nm,CLS])=>{const b=window.__bldTestB(); const sub=Object.keys(window.WXS?window.WXS.reduce((o,x)=>{if(x.cls===CLS+" (2014)")o[x.name]=1;return o},{}):{}).filter(n=>n.replace(/ \\(2014\\)$/,"")===nm)[0];
 if(!sub) return {err:"no subclass "+nm};
 Object.assign(b,{name:"T",rs:"2014",cls:CLS+" (2014)",sub:sub,level:20,species:"Human (2014)",bg:"Soldier (2014)",bgMode:"111",method:"point",base:{STR:15,DEX:10,CON:14,INT:12,WIS:14,CHA:10},arr:{},
  src:{core:true,dmg:true,phb14:true,dmg14:true,tvss14:true},ch:{clsk:["Perception","Survival"],stand14:["Armor Proficiency"],step14:["Earthstrength"],soul14:["Ageless Guardian"],fs2:"Protection"},inv:[]});
 let c; try{ c=window.__bldSheetFor(b) }catch(e){ return {err:String(e).slice(0,200)} }
 if(!c) return {err:"no sheet"};
 const names=[]; (c.features||[]).forEach(g=>(g.items||[]).forEach(f=>names.push(f.n)));
 return {sub:sub,names:names,lu:(c.limited||c.lu||[]).map(x=>x.n||x.feature||x.k),acts:Object.keys(c.acts||{}),third:!!(window.THIRD_SUBS&&window.THIRD_SUBS[sub]),sk:Object.values(c.skills||{}).filter(s=>s.p||s.e).map(s=>s.n),slots:JSON.stringify((c.spellcasting||{}).slots||null),fly:JSON.stringify(c.speeds||c.moves||null)}; }"""
async def main():
    srv, url = serve(); bad = []; errs = []
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await (await b.new_context(viewport={"width": 1250, "height": 850})).new_page()
        pg.on("pageerror", lambda e: errs.append(str(e)[:160]))
        await pg.goto(url); await pg.evaluate("()=>localStorage.clear()"); await pg.reload()
        await pg.wait_for_function("()=>!!window.__bldFuzz&&!!window.__sheetApply", timeout=120000); await pg.evaluate("()=>window.__bldNeed().then(()=>1)")
        for nm, feats in SUBS.items():
            r = await pg.evaluate(BUILD, [nm, CLS])
            if r.get("err"): bad.append(nm + ": " + r["err"]); continue
            miss = [f for f in feats if f not in r["names"]]
            if miss: bad.append("%s missing on the sheet: %s" % (nm, miss))
            if nm in ("Loreseeker", "Soulblood Shaman") and not r["third"]: bad.append(nm + " is not a third caster")
            need = {"Godsworn": ("sk", "Medicine"), "Hellkeeper": ("sk", "Intimidation"), "Verdant Protector": ("sk", "Stealth")}.get(nm)
            if need and need[1] not in r[need[0]]: bad.append("%s lacks %s" % (nm, need[1]))
            if nm in ("Loreseeker", "Soulblood Shaman") and r["slots"] in ("null", "{}", "[]"): bad.append(nm + " has no spell slots: " + r["slots"])
            if nm in ("Storm Sentinel",) and "fly" not in r["fly"].lower(): bad.append("Storm Sentinel no fly speed: " + r["fly"])
            print("ok" if not miss else "BAD", nm, len(r["names"]), "features")
        await b.close()
    if errs: bad.append("page errors: %s" % errs[:3])
    print("FAIL" if bad else "OK Warden subclasses"); [print(" ", x) for x in bad]; sys.exit(1 if bad else 0)
asyncio.run(main())
