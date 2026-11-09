#!/usr/bin/env python3
"""Zero miss, targeted effect tests (reports/zero-miss-1.md).

  python3 tests/zero_miss_fx.py [--root DIR] [--only NAME] [--base DIR]

Each case builds a minimal character through the builder hooks (window.__bldTestB, window.__bldSheetFor), once WITH the feature and once
WITHOUT it (the `drop` choices removed or replaced). Two checks per case:
  1. the values in `expect` (JS expressions over C, the sheet of the build with the feature) equal the expected value;
  2. every flattened path of C that differs between the two builds matches one of the `allow` regexes. Nothing else may change.
  3. with --base DIR (a checkout of origin/main): the same build on the old code may differ only in `base_allow` (or `allow`) paths.
Cases without `drop` (magic items) are checked by 1 and 3 only. Exit 1 on any failure. One browser page for all cases (about 30 s)."""
import json, os, re, sys, socket, threading, functools, http.server

HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
if "--root" in sys.argv: ROOT = os.path.abspath(sys.argv[sys.argv.index("--root") + 1])
ONLY = sys.argv[sys.argv.index("--only") + 1] if "--only" in sys.argv else None
BASE = os.path.abspath(sys.argv[sys.argv.index("--base") + 1]) if "--base" in sys.argv else None  # another checkout (origin/main) to diff against

WL = {"STR": 10, "DEX": 12, "CON": 14, "INT": 10, "WIS": 10, "CHA": 18}
BLADE24 = ["Pact of the Blade", "Lifedrinker", "Thirsting Blade", "Eldritch Smite", "Devouring Blade"]
LS = [{"n": "Longsword", "q": 1, "eq": True}]
ATK = r"^attacks\.1\."  # the Longsword row (row 0 is the Unarmed Strike)

CASES = [
    # ---------------- Warlock, Pact of the Blade (2024, PHB p. 155-156)
    dict(name="2024 pact damage type Radiant", b=dict(cls="Warlock", level=12, ch={"invocation": BLADE24, "pactWep": ["Longsword"], "pactDmg": ["Radiant"]}, inv=LS, base=WL),
         drop={"pactDmg": None},
         expect=[("C.attacks[1].type", "Radiant"), ("C.attacks[1].ab", "CHA"), ("/Spellcasting Focus/.test(C.attacks[1].note)", True)],
         allow=[ATK + r"(type|note)$"], base_allow=[ATK + r"(note|type)$", r"^xdmg\.\d+\.note$", r"^actions\.0\.d$"]),
    dict(name="2024 pact weapon without a type pick keeps the weapon type", b=dict(cls="Warlock", level=3, ch={"invocation": ["Pact of the Blade"], "pactWep": ["Longsword"]}, inv=LS, base=WL),
         drop={"invocation": [], "pactWep": None},
         expect=[("C.attacks[1].type", "Slashing"), ("C.attacks[1].sub", "Versatile (1d10) • Pact Weapon")],
         allow=[ATK, r"^features\.", r"^profs\.weapons", r"^profSrc\.weapons", r"^acts", r"^actions\.", r"^xdmg", r"^inv\.0\.html$"], base_allow=[ATK + r"(note|type)$", r"^xdmg\.\d+\.note$", r"^actions\.0\.d$"]),
    dict(name="2024 Eldritch Smite 6d8 at Warlock 12 (slot level 5)", b=dict(cls="Warlock", level=12, ch={"invocation": BLADE24, "pactWep": ["Longsword"]}, inv=LS, base=WL),
         drop={"invocation": ["Pact of the Blade", "Lifedrinker", "Thirsting Blade", "Devouring Blade"]},
         expect=[("C.xdmg.find(x=>x.n==='Eldritch Smite').dmg", "6d8"), ("C.xdmg.find(x=>x.n==='Eldritch Smite').type", "Force")],
         allow=[r"^xdmg\.", r"^features\."], base_allow=[ATK + r"(note|type)$", r"^xdmg\.\d+\.note$", r"^actions\.0\.d$"]),
    dict(name="2024 Lifedrinker 1d6 and the Hit Point Die heal 1d8+2", b=dict(cls="Warlock", level=12, ch={"invocation": BLADE24, "pactWep": ["Longsword"]}, inv=LS, base=WL),
         drop={"invocation": ["Pact of the Blade", "Eldritch Smite", "Thirsting Blade", "Devouring Blade"]},
         expect=[("C.xdmg.find(x=>x.n==='Lifedrinker').dmg", "1d6"), ("/regain 1d8\\+2 Hit Points/.test(C.xdmg.find(x=>x.n==='Lifedrinker').note)", True)],
         allow=[r"^xdmg\.", r"^features\."], base_allow=[ATK + r"(note|type)$", r"^xdmg\.\d+\.note$", r"^actions\.0\.d$"]),
    dict(name="2024 Devouring Blade: Attack action says three attacks, once", b=dict(cls="Warlock", level=12, ch={"invocation": BLADE24, "pactWep": ["Longsword"]}, inv=LS, base=WL),
         drop={"invocation": ["Pact of the Blade", "Lifedrinker", "Eldritch Smite"]},
         expect=[("C.actions[0].d.indexOf('Make three attacks')", 0), ("(C.actions[0].d.match(/Make one attack/g)||[]).length", 0)],
         allow=[r"^actions\.0\.d$", r"^features\."], base_allow=[ATK + r"(note|type)$", r"^xdmg\.\d+\.note$", r"^actions\.0\.d$"]),
    # ---------------- Warlock 2014 (PHB 2014 p. 107-108, XGE p. 56-57)
    dict(name="2014 pact weapon uses Strength, no Charisma without Hex Warrior", b=dict(rs="2014", cls="Warlock", level=12, ch={"p3invocation": ["Pact of the Blade"], "pactWep": ["Longsword"]}, inv=LS, base=dict(WL, STR=16)),
         drop={"p3invocation": []},
         expect=[("C.attacks[1].ab", "STR"), ("/Necrotic/.test(C.attacks[1].note)", False)],
         allow=[ATK, r"^features\.", r"^profs\.weapons", r"^profSrc\.weapons", r"^acts", r"^actions\.", r"^inv\.0\.html$"], base_allow=[ATK + r"(ab|note|misc|miscSrc|dmgBonus)$", r"^inv\.0\.html$", r"^xdmg"]),
    dict(name="2014 Hexblade: Hex Warrior lets the pact weapon use Charisma", b=dict(rs="2014", cls="Warlock", sub="The Hexblade", level=12, ch={"p3invocation": ["Pact of the Blade"], "pactWep": ["Longsword"]}, inv=LS, base=dict(WL, STR=16)),
         expect=[("C.attacks[1].ab", "CHA"), ("/Hex Warrior/.test(C.attacks[1].note)", True)],
         base_allow=[ATK + r"note$"]),
    dict(name="2014 Improved Pact Weapon +1 to hit and damage", b=dict(rs="2014", cls="Warlock", level=12, ch={"p3invocation": ["Pact of the Blade"], "p2invocation": ["Improved Pact Weapon"], "pactWep": ["Longsword"]}, inv=LS, base=WL),
         drop={"p2invocation": []},
         expect=[("C.attacks[1].misc", 1), ("C.attacks[1].dmgBonus", 1)],
         allow=[ATK + r"(misc|miscSrc|dmgBonus|note)$", r"^features\.", r"^inv\.0\.html$"], base_allow=[ATK + r"(ab|note|misc|miscSrc|dmgBonus)$", r"^inv\.0\.html$", r"^xdmg"]),
    dict(name="2014 Lifedrinker = Charisma modifier Necrotic", b=dict(rs="2014", cls="Warlock", level=12, ch={"p3invocation": ["Pact of the Blade"], "p12invocation": ["Lifedrinker"], "pactWep": ["Longsword"]}, inv=LS, base=WL),
         drop={"p12invocation": []},
         expect=[("C.xdmg.find(x=>x.n==='Lifedrinker').dmg", "4"), ("C.xdmg.find(x=>x.n==='Lifedrinker').type", "Necrotic")],
         allow=[r"^xdmg", r"^features\."], base_allow=[ATK + r"(ab|note|misc|miscSrc|dmgBonus)$", r"^inv\.0\.html$", r"^xdmg"]),
    # ---------------- negative examples (a similar sentence or build that must NOT be covered)
    dict(name="NEG a second weapon next to the pact weapon keeps its own type and no pact note", b=dict(cls="Warlock", level=12, ch={"invocation": BLADE24, "pactWep": ["Longsword"], "pactDmg": ["Radiant"]}, inv=LS + [{"n": "Dagger", "q": 1, "eq": True}], base=WL),
         expect=[("C.attacks.find(a=>a.n==='Dagger').type", "Piercing"), ("/Pact of the Blade/.test(C.attacks.find(a=>a.n==='Dagger').note)", False), ("C.attacks.find(a=>a.n==='Longsword').type", "Radiant")],
         base_allow=[r"^attacks\.\d+\.(note|type)$", r"^xdmg\.\d+\.note$", r"^actions\.0\.d$"]),
    dict(name="NEG 2014 Lifedrinker change does not touch a 2024 Lifedrinker", b=dict(cls="Warlock", level=9, ch={"invocation": ["Pact of the Blade", "Lifedrinker"], "pactWep": ["Longsword"]}, inv=LS, base=WL),
         expect=[("C.xdmg.find(x=>x.n==='Lifedrinker').dmg", "1d6")],
         base_allow=[ATK + r"note$", r"^xdmg\.\d+\.note$"]),
    dict(name="NEG a plain magic weapon (Longsword, +1) gets no DMG rider note", b=dict(cls="Fighter", level=5, ch={}, inv=[{"n": "Longsword, +1", "q": 1, "eq": True}], base=WL),
         expect=[("/Extra damage/.test(C.attacks[1].note||'')", False)], base_allow=[]),
    dict(name="NEG Dwarven Thrower not attuned (not a Dwarf): no note", b=dict(cls="Fighter", level=5, ch={}, inv=[{"n": "Dwarven Thrower", "q": 1, "eq": True}], base=WL),
         expect=[("C.attacks.some(a=>/Force on a ranged hit/.test(a.note||''))", False)], base_allow=[]),
    # ---------------- property: item variants x a feature that names the item (Pact of the Blade first)
    dict(name="VAR pact weapon Longsword, +1: pact row, Radiant, +1 kept", b=dict(cls="Warlock", level=5, ch={"invocation": ["Pact of the Blade"], "pactWep": ["Longsword, +1"], "pactDmg": ["Radiant"]}, inv=[{"n": "Longsword, +1", "q": 1, "eq": True}], base=WL),
         expect=[("C.attacks[1].type", "Radiant"), ("C.attacks[1].misc", 1), ("C.attacks[1].dmgBonus", 1), ("/Pact Weapon/.test(C.attacks[1].sub)", True)],
         base_allow=[ATK + r"(note|type)$"]),
    dict(name="VAR pact weapon Longsword, Masterwork: attack bonus only, pact row", b=dict(cls="Warlock", level=5, ch={"invocation": ["Pact of the Blade"], "pactWep": ["Longsword, Masterwork"]}, inv=[{"n": "Longsword, Masterwork", "q": 1, "eq": True}], base=WL),
         expect=[("/Pact Weapon/.test(C.attacks[1].sub)", True), ("C.attacks[1].ab", "CHA")],
         base_allow=[ATK + r"(note|type)$"]),
    dict(name="VAR pact weapon Flame Tongue (Longsword): pact row and the item rider together", b=dict(cls="Warlock", level=5, ch={"invocation": ["Pact of the Blade"], "pactWep": ["Flame Tongue (Longsword)"], "pactDmg": ["Psychic"]}, inv=[{"n": "Flame Tongue (Longsword)", "q": 1, "eq": True}], base=WL),
         expect=[("C.attacks[1].type", "Psychic"), ("/\\+2d6 Fire while the weapon is burning/.test(C.attacks[1].note)", True)],
         base_allow=[ATK + r"(note|type|xdice\.)"]),
    dict(name="VAR 2014 Improved Pact Weapon adds nothing to a +1 weapon", b=dict(rs="2014", cls="Warlock", level=5, ch={"p3invocation": ["Pact of the Blade"], "p2invocation": ["Improved Pact Weapon"], "pactWep": ["Longsword, +1"]}, inv=[{"n": "Longsword, +1", "q": 1, "eq": True}], base=WL),
         expect=[("C.attacks[1].misc", 1), ("C.attacks[1].dmgBonus", 1)],
         base_allow=[ATK + r"(ab|note)$", r"^inv\.0\.html$"]),
    # ---------------- DMG 2024 weapons: on-hit extra damage notes (src/data/fx-Z1.js)
    dict(name="Holy Avenger: 2d10 Radiant against a Fiend or an Undead", b=dict(cls="Paladin", level=5, ch={}, inv=[{"n": "Holy Avenger", "q": 1, "eq": True}], base=WL),
         expect=[("/Extra damage: \\+2d10 Radiant against a Fiend or an Undead/.test(C.attacks.find(a=>/Holy Avenger/.test(a.n)).note)", True)],
         base_allow=[r"^attacks\.1\.(note|xdice\.)"]),
    dict(name="Flame Tongue variant row (Rapier) gets the 2d6 Fire note", b=dict(cls="Fighter", level=5, ch={}, inv=[{"n": "Flame Tongue (Rapier)", "q": 1, "eq": True}], base=WL),
         expect=[("/\\+2d6 Fire while the weapon is burning/.test(C.attacks.find(a=>/Flame Tongue/.test(a.n)).note)", True)],
         base_allow=[r"^attacks\.1\.(note|xdice\.)"]),
    dict(name="Sun Blade: 1d8 Radiant against an Undead, Radiant and Finesse kept", b=dict(cls="Fighter", level=5, ch={}, inv=[{"n": "Sun Blade", "q": 1, "eq": True}], base=WL),
         expect=[("/\\+1d8 Radiant against an Undead/.test(C.attacks[1].note)", True), ("C.attacks[1].type", "Radiant")],
         base_allow=[r"^attacks\.1\.(note|xdice\.)"]),
    dict(name="Dwarven Thrower: both rows (melee and thrown) get the ranged note", b=dict(cls="Fighter", level=5, ch={}, extra={"species": "Dwarf"}, inv=[{"n": "Dwarven Thrower", "q": 1, "eq": True}], base=WL),
         expect=[("C.attacks.filter(a=>/Dwarven Thrower/.test(a.n)&&/Force on a ranged hit/.test(a.note)).length>=1", True)],
         base_allow=[r"^attacks\.\d+\.(note|xdice\.)"]),
]

JS = r"""async (cases)=>{ if(window.__bldNeed) await window.__bldNeed();
 const flat=(o,p,out)=>{ if(o&&typeof o==='object'){ const ks=Object.keys(o); if(!ks.length) out[p]=JSON.stringify(o); ks.forEach(k=>flat(o[k],p?p+'.'+k:k,out)) } else out[p]=o; return out };
 const mk=(s,drop)=>{ const b=window.__bldTestB(); if(s.rs==='2014'){ b.rs='2014'; b.species='Human (2014)'; b.bg='Acolyte (2014)' }
   b.cls=s.cls; b.sub=s.sub||''; b.level=s.level; b.name='ZM'; b.ch=Object.assign({},s.ch); if(drop) for(const k in drop){ if(drop[k]===null) delete b.ch[k]; else b.ch[k]=drop[k] }
   b.inv=JSON.parse(JSON.stringify(s.inv||[])); b.weps=(s.inv||[]).map(x=>x.n); b.base=Object.assign({},b.base||{},s.base||{}); if(s.extra) Object.assign(b,s.extra); return b };
 const res=[];
 for(const c of cases){ const r={name:c.name,fail:[]};
  try{ const C=window.__bldSheetFor(mk(c.b)), C0=c.drop?window.__bldSheetFor(mk(c.b,c.drop)):null;
   for(const [ex,want] of c.expect){ let got; try{ got=(new Function('C','return ('+ex+')'))(C) }catch(e){ got='ERR '+e.message } if(JSON.stringify(got)!==JSON.stringify(want)) r.fail.push(ex+' = '+JSON.stringify(got)+', want '+JSON.stringify(want)) }
   r.flat=flat(C,'',{}); if(!c.drop){ res.push(r); continue }
   const A=r.flat, Z=flat(C0,'',{}), rx=c.allow.map(s=>new RegExp(s)); const ch=[...new Set([...Object.keys(A),...Object.keys(Z)])].filter(k=>A[k]!==Z[k]);
   r.changed=ch.length; ch.filter(k=>!rx.some(x=>x.test(k))).slice(0,8).forEach(k=>r.fail.push('path changed outside allow: '+k+' '+JSON.stringify(Z[k])+' -> '+JSON.stringify(A[k])));
  }catch(e){ r.fail.push('ERR '+String(e.stack||e).slice(0,300)) }
  res.push(r) }
 return res }"""


def run(root, cases, errs):
    from playwright.sync_api import sync_playwright
    s = socket.socket(); s.bind(("127.0.0.1", 0)); port = s.getsockname()[1]; s.close()

    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Q, directory=root))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_context(service_workers="block").new_page(); pg.set_default_timeout(180000)
        pg.on("pageerror", lambda e: errs.append(str(e)[:200]))
        pg.goto("http://127.0.0.1:%d/index.html" % port); pg.wait_for_function("()=>!!window.__deferDone"); pg.wait_for_timeout(2000)
        res = pg.evaluate(JS, cases); b.close()
    srv.shutdown()
    return res


def main():
    cases = [c for c in CASES if not ONLY or ONLY in c["name"]]
    errs = []
    res = run(ROOT, cases, errs)
    if BASE:  # same build on the base checkout: only the paths in base_allow (or allow) may differ
        old = run(BASE, cases, [])
        for c, r, o in zip(cases, res, old):
            rx = [re.compile(x) for x in (c.get("base_allow") or c.get("allow") or [])]
            A, Z = r.get("flat") or {}, o.get("flat") or {}
            ch = [k for k in set(A) | set(Z) if A.get(k) != Z.get(k)]
            r["vsBase"] = len(ch)
            for k in sorted(ch):
                if not any(x.search(k) for x in rx):
                    r["fail"].append("vs base, path changed outside allow: %s %r -> %r" % (k, Z.get(k), A.get(k)))
                    if len(r["fail"]) > 8: break
    bad = 0
    for r in res:
        print(("ok  " if not r["fail"] else "FAIL"), r["name"], "(%s paths changed without the feature%s)" % (r.get("changed", "-"), ", %d vs base" % r["vsBase"] if "vsBase" in r else ""))
        for f in r["fail"]:
            print("      ", f)
        bad += bool(r["fail"])
    if errs:
        print("page errors:", errs[:3])
    print("%d cases, %d failed" % (len(res), bad))
    return 1 if bad or errs else 0


if __name__ == "__main__":
    sys.exit(main())
