#!/usr/bin/env python3
"""Tome of Heroes: items, species, backgrounds, feats and class options reach the builder lists and the sheet.
  python3 tests/tp_toh.py [--root DIR]   Exit 0 only when every check passes. 390x844 and 1250x850."""
import asyncio, json, os, sys, socket, threading, functools, http.server
from playwright.async_api import async_playwright
HERE = "/home/claude/ds-palpal/tests"; ROOT = "/home/claude/ds-palpal"
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
 {"n": "Cestus +2", "unarmed": 2},
 {"n": "Medic's Sash", "sp": "Cure Wounds", "ch": 3},
 {"n": "Javelin of Teleportation", "atk": 1, "dmg": 1, "ch": 1},
 {"n": "Ninefold Swarmdagger", "atk": 1, "dmg": 1, "ch": 6},
 {"n": "Axe of Many Strikes", "atk": 1, "dmg": 1},
 {"n": "Momentblade", "atk": 1, "dmg": 1},
 {"n": "Stormheart Bow", "ch": 5},
 {"n": "Victory Banner", "ch": 3},
 {"n": "Argent Mantle", "ch": 1},
 {"n": "Potion Belt"},
 {"n": "Pistol", "atk": 0, "dmg": 0},
 {"n": "Khopesh", "atk": 0, "dmg": 0},
]
JS = """(c)=>{ var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}, {ttoh:true}); b.inv=(b.inv||[]).filter(function(x){return !/Plate|Mail|Leather|Shield|Robe|Armor/.test(x.n)}); b.armor=""; b.shield=false;
  b.inv.push({n:c.n,q:1,eq:true}); var out={};
  try{ var sh=window.__bldSheetFor(b); out.err=0;
   out.acb=(sh.ac.bonus||[]).filter(function(x){return x.s.indexOf(c.n)===0}).reduce(function(t,x){return t+x.v},0);
   out.res=(sh.defenses||[]).filter(function(d){return d.s.indexOf(c.n)===0}).map(function(d){return d.t+":"+d.v});
   out.sv=(Array.isArray(sh.saveBonus)?sh.saveBonus:[]).filter(function(x){return x.s.indexOf(c.n)===0}).reduce(function(t,x){return t+x.v},0);
   out.sp=(sh.spells||[]).map(function(s){return s.n+"|"+(s.src||"")});
   out.atk=(sh.attacks||[]).filter(function(t){return t.n===c.n||t.n==="Unarmed Strike"}).map(function(t){return {n:t.n,m:t.misc,d:t.dmgBonus,rg:t.range,note:t.note,sub:t.sub}});
   out.ab=(sh.abilities||{}); out.abs={};Object.keys(sh.abilities||{}).forEach(function(k){var x=sh.abilities[k];out.abs[k]=x.base+(x.bonus||[]).reduce(function(t,y){return t+y.v},0)});
   out.dv=sh.darkvision; out.spd=sh.speeds||{}; out.acv=sh.ac&&sh.ac.base; out.dx=sh.abilities&&sh.abilities.DEX&&sh.abilities.DEX.base; out.ch=(sh.res||[]).map(function(r){return r.n+"|"+r.max}); out.dc=sh.spellDc!==undefined?sh.spellDc:null;
  }catch(e){ out.err=String(e) }
  return out; }"""

SP = """(n)=>{var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}, {ttoh:true}); b.cls='Wizard'; b.species=n; b.level=5; var sh=window.__bldSheetFor(b); return {dv:sh.darkvision, def:(sh.defenses||[]).map(function(d){return d.t+':'+d.v}), atk:(sh.attacks||[]).map(function(a){return a.n}), res:(sh.res||[]).map(function(r){return r.n}), spd:sh.speed}}"""
async def extra(pg, tag):
    d = await pg.evaluate("()=>window.__bldData()")
    n = await pg.evaluate("()=>{var s=(window.WX.src||[]).filter(function(q){return q.id==='ttoh'})[0]||{};return {sp:(s.species||[]).length,bg:(s.backgrounds||[]).length}}")
    check(tag + " 44 species, 19 backgrounds", n["sp"] == 44 and n["bg"] == 19, str(n))
    rn = await pg.evaluate("()=>{var r=window.__bldData().feats['Draconic Rune Casting'];return r&&r.pick&&r.pick[0].list.length}")
    check(tag + " 42 draconic runes in the feat pick", rn == 42, str(rn))
    g = await pg.evaluate("()=>{var d=window.__bldData();return [d.feats['Gunfighting']&&d.feats['Gunfighting'].fsAll, d.inv.some(function(x){return x[0]==='Primal Link'}), d.mm.some(function(x){return x[0]==='Hungry Spell'}), d.isp['Earthblood Geyser']]}")
    check(tag + " Gunfighting, invocations, metamagic, invocation spells", g[0] == 1 and g[1] and g[2] and g[3] == "Magma Spray", str(g))
    g14 = await pg.evaluate("()=>{var d=window.__bldData('2014');return [d.inv.some(function(x){return x[0]==='Primal Link'}), d.mm.some(function(x){return x[0]==='Hungry Spell'})]}")
    check(tag + " 2014 rules list ToH invocations and metamagic", g14[0] and g14[1], str(g14))
    for nm, want in [("Satarre", lambda o: any("Necrotic" in x for x in o["def"])), ("Pantheran Catfolk", lambda o: "Cat's Claws" in o["atk"]), ("Minotaur", lambda o: "Horns" in o["atk"]),
                     ("Dwarf Chassis", lambda o: any("Poison" in x for x in o["def"]) and o["spd"] == 25), ("Far-Touched Derro", lambda o: o["dv"] == 120), ("Fireforge Dwarf", lambda o: any("Fire" in x for x in o["def"]) and o["dv"] == 0)]:
        o = await pg.evaluate(SP, nm)
        check(tag + " species " + nm, want(o), str(o)[:200])
    for cls, sub, feat in [("Cleric", "Shadow Domain (ToH)", "Cover of Night"), ("Fighter", "Pugilist (ToH)", "Resilient Fighter"), ("Paladin", "Oath of the Hearth (ToH)", "Aura of the Hearth"), ("Wizard", "Familiar Master (ToH)", "Familiar Savant")]:
        o = await pg.evaluate("""([c,s,f])=>{var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}, {ttoh:true}); b.cls=c; b.level=20; b.sub=s; var sh=window.__bldSheetFor(b); var n=[]; (sh.features||[]).forEach(function(g){(g.items||[]).forEach(function(i){n.push(i.n)})}); return [sh.sub, n.some(function(x){return x.indexOf(f)>=0})]}""", [cls, sub, feat])
        check(tag + " subclass " + sub + " keeps its own features", o[0] == sub and o[1], str(o))
    bgs = await pg.evaluate("()=>{var b=window.__bldTestB(); b.src=Object.assign({}, b.src||{}, {ttoh:true}); var out=[]; ['Parfumier','Occultist','Freebooter'].forEach(function(n){b.bg=n; try{var sh=window.__bldSheetFor(b); out.push(sh.bg===n)}catch(e){out.push(String(e))}}); return out}")
    check(tag + " backgrounds build a sheet", all(x is True for x in bgs), str(bgs))
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
            st = await pg.evaluate("()=>({n:(window.WXI.ttoh||[]).length, g:((window.WXG||{}).ttoh||[]).length})")
            check(tag + " item rows registered", st["n"] >= 50 and st["g"] >= 80, str(st))
            await extra(pg, tag)
            for c in CASES:
                o = await pg.evaluate(JS, c)
                if o.get("err"): check(tag + " " + c["n"], False, o["err"]); continue
                ok = True; why = []
                def need(cond, m):
                    nonlocal ok
                    if not cond: ok = False; why.append(m)
                if "sp" in c: need(any(s.startswith(c["sp"] + "|") for s in o["sp"]), "spell missing: " + str(o["sp"])[:120])
                if "ch" in c: need(any(x.endswith("|%d" % c["ch"]) for x in o["ch"] if c["n"] in x), "tracker " + str([x for x in o["ch"] if c["n"] in x]))
                if "atk" in c: need(any(r["m"] == c["atk"] and r["d"] == c["dmg"] for r in o["atk"] if r["n"] == c["n"]), "attack row " + str(o["atk"])[:160])
                if "unarmed" in c: need(any(r["m"] == c["unarmed"] and r["d"] >= c["unarmed"] for r in o["atk"] if r["n"] == "Unarmed Strike"), "unarmed " + str(o["atk"])[:160])
                check(tag + " " + c["n"], ok, "; ".join(why))
            await ctx.close()
        await br.close()
    check("no page errors", not errs, str(errs[:3]))
    srv.shutdown()
    sys.exit(0 if all(res) else 1)
asyncio.run(main())
