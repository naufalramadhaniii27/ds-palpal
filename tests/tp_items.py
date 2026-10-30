#!/usr/bin/env python3
"""Third party items (TDCSR): rows exist while the book is on, effects reach the sheet.
  python3 tests/tp_items.py [--root DIR]   Exit 0 only when every check passes. 390x844 and 1250x850."""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if "--root" in a:
    i = a.index("--root"); ROOT = os.path.abspath(a[i + 1]); del a[i:i + 2]
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
# item -> expectations on the sheet. ac = armor bonus seen in AC bonus list, ab = [ability, final score delta], atk/dmg = weapon row misc/dmgBonus, res, sp = spells, ch = tracked max
CASES = [
 {"n": "+2 Studded Leather Armor of Acid Resistance", "ac": 2, "res": "Acid"},
 {"n": "Armor of the Valiant Soul (Awakened)", "ac": 2, "res": "Acid", "sp": "Command"},
 {"n": "Armor of the Valiant Soul (Exalted)", "ac": 3, "imm": "Acid"},
 {"n": "Plate of the Dawnmartyr (Exalted)", "ac": 3, "res": "Fire"},
 {"n": "Honor's Last Stand (Awakened)", "ac": 4},
 {"n": "Coat of the Crest", "ac": 1, "ch": 3},
 {"n": "Kiss of the Changebringer (Exalted)", "save": 3, "sp": "Blink"},
 {"n": "Fenthras (Exalted)", "atk": 3, "dmg": 3, "ch": 3},
 {"n": "Pyremaul (Awakened)", "atk": 2, "dmg": 0, "sp": "Burning Hands"},
 {"n": "Mythcarver (Dormant)", "atk": 1, "dmg": 1, "range": "Finesse"},
 {"n": "Inescapable Lash", "atk": 1, "dmg": 1, "reach": "20 ft"},
 {"n": "Condemner (Exalted)", "atk": 3, "dmg": 3, "sp": "Blight", "ch": 4},
 {"n": "Spire of Conflux (Exalted)", "sdc": 2, "sp": "Chain Lightning", "ch": 20},
 {"n": "Summer's Dance", "atk": 1, "dmg": 1, "sp": "Misty Step", "ch": 3},
 {"n": "Wraps of Dyamak (Awakened)", "unarmed": 2, "sp": "Misty Step"},
 {"n": "Titanstone Knuckles (Awakened)", "str": 24, "sp": "Enlarge/Reduce"},
 {"n": "Circlet of Barbed Vision (Dormant)", "cha": -2},
 {"n": "Circlet of Wisdom", "wis": 2},
 {"n": "Flamefriend Lantern", "sp": "Produce Flame"},
 {"n": "Boots of Haste", "sp": "Haste", "ch": 1},
 {"n": "+2 Ring of Protection", "ac": 2, "save": 2},
]
JS = """(c)=>{ var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}, {tdcsr:true}); b.inv=(b.inv||[]).filter(function(x){return !/Plate|Mail|Leather|Shield|Robe|Armor/.test(x.n)}); b.armor=""; b.shield=false;
  b.inv.push({n:c.n,q:1,eq:true}); var out={};
  try{ var sh=window.__bldSheetFor(b); out.err=0;
   out.acb=(sh.ac.bonus||[]).filter(function(x){return x.s.indexOf(c.n)===0}).reduce(function(t,x){return t+x.v},0);
   out.res=(sh.defenses||[]).filter(function(d){return d.s.indexOf(c.n)===0}).map(function(d){return d.t+":"+d.v});
   out.sv=(Array.isArray(sh.saveBonus)?sh.saveBonus:[]).filter(function(x){return x.s.indexOf(c.n)===0}).reduce(function(t,x){return t+x.v},0);
   out.sp=(sh.spells||[]).map(function(s){return s.n+"|"+(s.src||"")});
   out.atk=(sh.attacks||[]).filter(function(t){return t.n===c.n||t.n==="Unarmed Strike"}).map(function(t){return {n:t.n,m:t.misc,d:t.dmgBonus,rg:t.range,note:t.note,sub:t.sub}});
   out.ab=(sh.abilities||{}); out.abs={};Object.keys(sh.abilities||{}).forEach(function(k){var x=sh.abilities[k];out.abs[k]=x.base+(x.bonus||[]).reduce(function(t,y){return t+y.v},0)});
   out.ch=(sh.res||[]).map(function(r){return r.n+"|"+r.max}); out.dc=sh.spellDc!==undefined?sh.spellDc:null;
  }catch(e){ out.err=String(e) }
  return out; }"""
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
            await pg.wait_for_function("()=>!!window.__bldSheetFor&&!!window.WXI", timeout=60000)
            st = await pg.evaluate("()=>({n:(window.WXI.tdcsr||[]).length, g:((window.WXG||{}).tdcsr||[]).length, src:(window.WX.src.filter(function(q){return q.id==='tdcsr'})[0]||{}).items})")
            check(tag + " item rows registered", st["n"] >= 70 and st["g"] >= 14, str(st["n"]) + " " + str(st["g"]))
            for c in CASES:
                o = await pg.evaluate(JS, c)
                if o.get("err"): check(tag + " " + c["n"], False, o["err"]); continue
                ok = True; why = []
                def need(cond, m):
                    nonlocal ok
                    if not cond: ok = False; why.append(m)
                if "ac" in c: need(o["acb"] == c["ac"], "ac bonus %s" % o["acb"])
                if "res" in c: need(("Resistance:" + c["res"]) in o["res"], "resist missing in %s" % o["res"])
                if "imm" in c: need(("Immunity:" + c["imm"]) in o["res"], "immunity missing in %s" % o["res"])
                if "save" in c: need(o["sv"] == c["save"], "save bonus %s" % o["sv"])
                if "sp" in c: need(any(s.startswith(c["sp"] + "|") for s in o["sp"]), "spell missing: " + str(o["sp"])[:120])
                if "ch" in c: need(any(x.endswith("|%d" % c["ch"]) for x in o["ch"] if c["n"] in x), "tracker " + str([x for x in o["ch"] if c["n"] in x]))
                if "atk" in c: need(any(r["m"] == c["atk"] and r["d"] == c["dmg"] for r in o["atk"] if r["n"] == c["n"]), "attack row " + str(o["atk"])[:160])
                if "range" in c: need(any(c["range"] in (r.get("sub") or "") for r in o["atk"] if r["n"] == c["n"]), "properties " + str(o["atk"])[:160])
                if "reach" in c: need(any(c["reach"] in (r.get("rg") or "") for r in o["atk"] if r["n"] == c["n"]), "reach " + str(o["atk"])[:200])
                if "unarmed" in c: need(any(r["m"] == c["unarmed"] and r["d"] >= c["unarmed"] for r in o["atk"] if r["n"] == "Unarmed Strike"), "unarmed " + str(o["atk"])[:160])
                if "str" in c: need(o["abs"]["STR"] == c["str"] or o["abs"]["STR"] >= c["str"], "STR %s" % o["abs"]["STR"])
                check(tag + " " + c["n"], ok, "; ".join(why))
            sp = await pg.evaluate("""()=>{var o={};[true,false].forEach(function(on){var b=window.__bldTestB();b.cls='Druid';b.sub='';b.level=9;b.src=Object.assign({},b.src||{},{tdcsr:on});window.__bldTestSet(b);o[on]=['Freedom of the Waves','Freedom of the Winds'].map(function(n){return window.__bldHasSpell(n)});window.__bldTestSet(null)});return o}""")
            check(tag + " TDCSR spells offered only while the book is on", sp.get("true") == [True, True] and sp.get("false") == [False, False], str(sp))
            # ability penalty: Circlet lowers Charisma
            base = await pg.evaluate("()=>{var b=window.__bldTestB();var s=window.__bldSheetFor(b);return s.abilities.CHA.base+(s.abilities.CHA.bonus||[]).reduce(function(t,y){return t+y.v},0)}")
            cir = await pg.evaluate(JS, CASES[16])
            check(tag + " Circlet lowers Charisma by 2", cir["abs"]["CHA"] == base - 2 or cir["abs"]["CHA"] == max(1, base - 2), "%s -> %s" % (base, cir["abs"]["CHA"]))
            wis = await pg.evaluate(JS, CASES[17]); wb = await pg.evaluate("()=>{var b=window.__bldTestB();var s=window.__bldSheetFor(b);return s.abilities.WIS.base+(s.abilities.WIS.bonus||[]).reduce(function(t,y){return t+y.v},0)}")
            check(tag + " Circlet of Wisdom raises Wisdom", wis["abs"]["WIS"] == min(20, wb + 2) or wis["abs"]["WIS"] > wb, "%s -> %s" % (wb, wis["abs"]["WIS"]))
            await ctx.close()
        await br.close()
    check("no page errors", not errs, str(errs[:3]))
    srv.shutdown()
    sys.exit(0 if all(res) else 1)
asyncio.run(main())
