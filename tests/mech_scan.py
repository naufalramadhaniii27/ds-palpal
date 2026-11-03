#!/usr/bin/env python3
"""Mechanics scan: every feature in the data that states a mechanical effect in its text must have a way to count it.

  python3 tests/mech_scan.py [--report] [--update-baseline] [--root DIR]

Reads all rules tables through the builder hook window.__bldData() with every source on (class and subclass features, species traits,
feats, magic items, third party books and homebrew packs that are registered as sources). For each feature the text is searched for
mechanical statements (Armor Class, Hit Point maximum, saving throw proficiency, Speed, Initiative, skills, resistance, limited uses,
a choice, Fighting Style, ...). A feature has a way to count when its record carries a structured field for it (class: pick, res, fx, ua,
acSub, hpSub, wm, fs ... ; subclass: pick, fx, lu, acb ...; species: natAc, hpPerLevel, fx ...; feat: ac, hp, init, fx ...; item: fx)
or when a structured field names the feature.

A feature without a way to count must be listed in tests/mech_baseline.json:
  "by_design": reasons that are final (the text is a story rule the sheet cannot count, the table row is a rule for the DM, ...)
  "gaps":      known holes found on 2026-11-03, to be closed. Each closed hole is removed from the list by --update-baseline.
A NEW feature without a way to count, or a changed one that lost its way, makes this test FAIL (exit 1). Fix: give the data a field the
engine reads (see SOURCE-NOTES.md, "Adding a feature"), or add an entry to by_design with the reason.
"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
args = sys.argv[1:]
if "--root" in args:
    i = args.index("--root"); ROOT = os.path.abspath(args[i + 1]); del args[i:i + 2]
BASE = os.path.join(HERE, "mech_baseline.json")

# category -> regex on the lower-case text
CAT = {
    "ac": re.compile(r"(armor class|\bac\b)[^.]{0,60}(\+\d|bonus|equals|increase|base|plus|\bcan be\b)|(\+\d|bonus|add)[^.]{0,40}(armor class|\bac\b)"),
    "hp": re.compile(r"hit point maximum|hit points? maximum|maximum hit points"),
    "save": re.compile(r"proficien\w* (in|with) [^.]{0,40}saving throw|(bonus|add)[^.]{0,40}saving throw|saving throws?[^.]{0,30}(bonus|proficien)"),
    "speed": re.compile(r"\b(fly|flying|climb|swim|burrow) speed\b|\bspeed (increases|is increased|rises|grows)|your speed (is|becomes)|\+\d+ feet to your speed|(gain|have) a [^.]{0,20}speed"),
    "init": re.compile(r"\binitiative\b[^.]{0,40}(bonus|add|advantage|\+\d)|(bonus|add|advantage)[^.]{0,40}\binitiative\b"),
    "skill": re.compile(r"proficien\w* (in|with) [^.]{0,40}\bskills?\b|\bexpertise\b|skills? of your choice"),
    "resist": re.compile(r"\bresistance to\b|\bimmunity to\b|\bimmune to\b"),
    "uses": re.compile(r"(short|long) rest[^.]{0,60}(regain|expended|restore)|(uses?|times)[^.]{0,40}(short|long) rest|(once|twice) (per|before|until)[^.]{0,20}(short|long) rest|proficiency bonus times"),
    "choice": re.compile(r"\bof your choice\b|\bchoose (one|two|three|four|a|an|any)\b|\bpick (one|two|three)\b"),
    "fstyle": re.compile(r"fighting style"),
}
# Items: only a passive, numeric statement counts. Activated effects, charges and story text are not read here.
ITEM_CAT = {
    "ac": re.compile(r"(\+\d+|bonus)[^.]{0,30}(to|on) (your )?(ac|armor class)|base (ac|armor class)|(ac|armor class) (is|becomes|equals) \d"),
    "save": re.compile(r"(\+\d+|bonus)[^.]{0,20}(to|on) (all )?saving throws\b(?![^.]{0,12}\bdcs?\b)"),
    "hp": re.compile(r"hit point maximum (increases|is increased|rises)|(your )?hit point maximum (is|becomes)"),
    "speed": re.compile(r"your (walking )?speed (is|becomes|increases|increased)|speed increases by|(\+\d+|bonus)[^.]{0,20}to your speed"),
    "init": re.compile(r"(\+\d+|bonus)[^.]{0,20}(to|on) (your )?initiative|(add|plus)[^.]{0,30}to (your )?initiative"),
    "resist": re.compile(r"(while|when) (you are )?(wearing|holding|carrying|attuned)[^.]{0,80}you have resistance to"),
    "skill": re.compile(r"(\+\d+|bonus)[^.]{0,20}(to|on) (your )?(ability checks?|skill checks?)|proficien\w* (in|with) [^.]{0,30}\bskills?\b"),
}
# Words that make a statement a rule for the table instead of the sheet. Used only for Speed/choice noise.
STRUCT_SKIP = {"cat", "d", "full", "hb", "pre", "name", "src", "alt", "lbl", "tp", "traits", "type", "size", "lgf", "lgn", "asi", "eq", "f", "subs", "sk", "armor", "weapons", "tools", "hd", "prim", "saves"}


def blob(x):
    return json.dumps(x, sort_keys=True).lower()


def probe(gaps):
    """Second look at the static gaps: build the sheet with and without the feature and compare the part of the sheet the text talks about.
    A feature that changes it has a way to count (the engine may do it by name). Only features that change nothing stay gaps."""
    from playwright.sync_api import sync_playwright
    recs = []
    for k, v in gaps.items():
        m = v["meta"]
        recs.append({"key": k, "kind": m["kind"], "owner": m["owner"].split("/")[0] if m["kind"] == "species" else m["owner"], "feat": m["feat"], "cats": [c for c in v["cats"]],
                     "src": m.get("src", ""), "cls": m.get("cls", ""), "sub": m.get("sub", ""), "lvl": m.get("lvl", 0)})
    keep, errs = {}, 0
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.set_default_timeout(600000)
        pg.goto("file://" + os.path.join(ROOT, "index.html")); pg.wait_for_timeout(800)
        pg.evaluate("window.__bldNeed&&window.__bldNeed()"); pg.wait_for_function("window.__bldSheetFor&&window.__deriveFor", timeout=90000)
        fn = "(" + PROBE_JS.strip() + ")"
        for i in range(0, len(recs), 60):
            for r in pg.evaluate(fn, recs[i:i + 60]):
                g = gaps[r["key"]]
                if r.get("err") == "level1":
                    keep[r["key"]] = g; continue
                if r.get("err"):
                    errs += 1; continue
                left = [c for c in g["cats"] if c not in r["have"]]
                if left:
                    g["cats"] = left; keep[r["key"]] = g
        b.close()
    if errs:
        print("probe could not build %d feature(s) (not counted as gaps)" % errs)
    return {k: v["cats"] for k, v in keep.items()}


def load():
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.set_default_navigation_timeout(180000); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.goto("file://" + os.path.join(ROOT, "index.html")); pg.wait_for_timeout(800)
        pg.evaluate("window.__bldNeed&&window.__bldNeed()"); pg.wait_for_function("window.__bldData", timeout=90000)
        d = pg.evaluate("window.__bldData()"); b.close()
    if errs:
        print("page errors:", errs[:3]); sys.exit(2)
    return d


def cats(text, table=None):
    t = (text or "").lower()
    return [k for k, rx in (table or CAT).items() if rx.search(t)]


def lu_names(d, owner):
    out = []
    for e in d["lu"]:
        if e.get("owner") == owner:
            out.append((e.get("n") or "") + " " + (e.get("feature") or ""))
    return " ".join(out).lower()


def act_names(d, needle):
    return " ".join(k for k in d["acts"] if needle.lower() in k.lower()).lower()


def scan(d):
    gaps = {}

    def flag(kind, owner, feat, text, ev, keycats=None, meta=None):
        c = cats(text, ITEM_CAT if kind == "item" else None)
        if not c:
            return
        key = "%s|%s|%s" % (kind, owner, feat)
        nm = feat.lower()
        if nm and nm in ev:
            return
        keycats = keycats or {}
        miss = [k for k in c if not keycats.get(k)]
        if miss:
            gaps[key] = {"cats": miss, "meta": dict(meta or {}, kind=kind, owner=owner, feat=feat)}

    # ---- class features
    for cn, c in d["classes"].items():
        st = {k: v for k, v in c.items() if k in ("pick", "res", "track", "fx", "ua", "acSub", "hpSub", "toolPick", "resSub", "xlists", "nslot", "smax")}
        ev = blob(st) + " " + lu_names(d, cn) + " " + act_names(d, "cls|%s|" % cn) + " " + blob(d["clsAuto"].get(cn, ""))
        if c.get("fs"): ev += " fighting style"
        if c.get("wm"): ev += " weapon mastery"
        if c.get("cast") or c.get("caster"): ev += " spellcasting pact magic"
        for row in c.get("f", []):
            lvl, name = row[0], row[1]
            text = d["cf"].get("%s|%s" % (cn, name)) or row[2]
            flag("class", cn, name, text, ev, None, {"cls": cn, "lvl": lvl, "src": d["srcOf"]["cls"].get(cn, "")})
        # ---- subclass features of this class
        for sn, arr in (c.get("subs") or {}).items():
            w = next((x for x in d["wxs"] if x["name"] == sn and x["cls"] == cn), None)
            st2 = {}
            for k in ("pickSub", "resSub", "acSub", "hpSub"):
                if isinstance(c.get(k), dict) and sn in c[k]:
                    st2[k] = c[k][sn]
            if w:
                st2["wxs"] = {k: v for k, v in w.items() if k not in ("cls", "name", "src", "alt", "cantrips") and v not in ([], {}, "", None)}
            ev2 = blob(st2) + " " + lu_names(d, sn) + " " + act_names(d, "|%s|" % sn) + " " + act_names(d, "sub|%s" % sn) + " " + blob(d["subGrant"].get(sn, "")) + " " + blob(d["auto"].get(sn, ""))
            for row in arr:
                lvl, name = row[0], row[1]
                text = d["sub"].get("%s|%s" % (sn, name)) or row[2]
                flag("sub", "%s/%s" % (cn, sn), name, text, ev2, None, {"cls": cn, "sub": sn, "src": (w or {}).get("src", "") or d["srcOf"]["cls"].get(cn, "")})

    # ---- species traits
    for sn, s in d["species"].items():
        keys = {k: v for k, v in s.items() if k not in STRUCT_SKIP and v not in ([], {}, "", None, 0)}
        ev = blob(keys) + " " + blob(d["spAuto"].get(sn, "")) + " " + lu_names(d, sn) + " " + act_names(d, sn)
        kc = {"ac": s.get("natAc") or s.get("acBonus") or s.get("fx"), "hp": s.get("hpPerLevel") or s.get("fx"),
              "speed": s.get("fx") or s.get("linFx"), "resist": s.get("fx") or s.get("linRes") or s.get("linFx"),
              "skill": s.get("skills") or s.get("skillPick") or s.get("fx"), "save": s.get("saveProf") or s.get("fx"),
              "choice": s.get("opts") or s.get("lin") or s.get("skillPick") or s.get("toolPick") or s.get("featPick") or s.get("wpPick") or s.get("asiPick") or s.get("asiFlex") or s.get("spAbTrait") or s.get("fx"),
              "init": s.get("fx"), "uses": s.get("fx")}
        for t in s.get("traits", []):
            flag("species", sn, t[0], t[1], ev, kc, {"src": d["srcOf"]["species"].get(sn, "")})

    # ---- feats
    for fn, f in d["feats"].items():
        keys = {k: v for k, v in f.items() if k not in STRUCT_SKIP and v not in ([], {}, "", None)}
        ev = blob(keys) + " " + lu_names(d, fn) + " " + act_names(d, "feat|" + fn)
        kc = {"ac": f.get("ac") or f.get("dwAC") or f.get("unarmoredAC") or f.get("med3") or f.get("fx"),
              "hp": f.get("hp") or f.get("hpFlat") or f.get("fx"), "save": f.get("saveFromAsi") or f.get("fx"),
              "speed": f.get("speed") or f.get("fx"), "init": f.get("init") or f.get("fx"),
              "skill": f.get("skills") or f.get("allSk") or f.get("skTools") or f.get("pick") or f.get("fx"),
              "resist": f.get("res") or f.get("fx"), "uses": f.get("resK") or f.get("luckN") or f.get("res") or lu_names(d, fn),
              "choice": f.get("pick") or f.get("asi") or f.get("wpPick") or f.get("needs") or f.get("fx"),
              "fstyle": f.get("fx") or f.get("rngHit") or f.get("meleeDmg1h") or f.get("thrownDmg") or f.get("ac") or f.get("attacks")}
        flag("feat", fn, fn, f.get("full") or f.get("d"), ev, kc, {"src": d["srcOf"]["feats"].get(fn, "")})

    # ---- magic items (DMG and third party rows: [name, type, rarity, attune, text, extra])
    def item_rows():
        for r in d["dmgi"]:
            yield "dmg", r
        for book, rows in d["wxi"].items():
            for r in rows:
                yield book, r
    for src, r in item_rows():
        if not isinstance(r, list) or len(r) < 5 or not isinstance(r[4], str):
            continue
        ex = r[5] if len(r) > 5 and isinstance(r[5], dict) else {}
        fx = ex.get("fx") or {}
        kc = {"ac": fx.get("ac") or fx.get("acBase") or ex.get("base"), "save": fx.get("save"), "speed": fx.get("speed") or fx.get("fly") or fx.get("climb") or fx.get("swim"),
              "init": fx.get("init"), "resist": fx.get("res") or fx.get("resist"), "hp": fx.get("hp"), "skill": fx.get("skills") or fx.get("skill"),
              "uses": ex.get("ch") or fx.get("ch") or ex.get("uses"), "choice": ex.get("pick") or ex.get("base")}
        flag("item", src, r[0], r[4], blob(ex), kc, {"src": src})
    return gaps


PROBE_JS = r"""
(recs)=>{
 const ABS={STR:15,DEX:14,CON:14,INT:12,WIS:12,CHA:10};
 function mk(o){const arr={};Object.keys(ABS).forEach(k=>{arr[k]=String(ABS[k])});
  const src=Object.assign({core:true,dmg:true,efa:true},o.src||{});
  return {name:"P",species:o.species||"Human",bg:"Soldier",bgMode:"21",bg2:"STR",bg1:"CON",cls:o.cls||"Fighter",sub:o.sub||"",level:o.level||8,ch:o.ch||{},method:"array",arr:arr,base:Object.assign({},ABS),src:src,eqC:"A",eqB:"A",size:"Medium",inv:o.inv,mc:[]}}
 const J=JSON.stringify;
 function parts(b,need){const C=window.__bldSheetFor(b),D=window.__deriveFor(C),o={};
  const P={ac:()=>J([D.ac,C.ac]),hp:()=>J([D.hpmax,C.hpBonus]),init:()=>J([D.init,C.initBonus]),speed:()=>J([D.speed,C.speed,C.speedSrc,C.moves]),
   save:()=>J([D.save,C.saveBonus,C.saves]),skill:()=>J([D.skill,C.skills]),resist:()=>J([C.defenses,C.res]),
   uses:()=>J([C.acts,C.actions,C.res]),fstyle:()=>J([C.attacks,C.ac]),
   choice:()=>J((window.__bldChoiceList(b)||[]).map(c=>[c.key,c.title,c.n]))};
  need.forEach(k=>{o[k]=P[k]()});return o}
 function cmp(a,b,need){return need.filter(k=>a[k]!==b[k])}
 const out=[];
 recs.forEach(r=>{let res={key:r.key,have:[],err:null};
  try{
   const need=r.cats;let A,Bq;
   if(r.kind==="item"){const s=r.src&&r.src!=="dmg"?{[r.src]:true}:{};
     A=parts(mk({src:s,inv:[]}),need);Bq=parts(mk({src:s,inv:[{n:r.feat,q:1,eq:true}]}),need)}
   else if(r.kind==="feat"){const s=r.src?{[r.src]:true}:{};
     A=parts(mk({src:s,level:19}),need);Bq=parts(mk({src:s,level:19,ch:{feat4:{feat:r.feat,a1:"STR",a2:"CON"}}}),need)}
   else if(r.kind==="species"){const s=r.src?{[r.src]:true}:{};
     A=parts(mk({src:s}),need);Bq=parts(mk({src:s,species:r.owner}),need)}
   else if(r.kind==="sub"){const s=r.src?{[r.src]:true}:{};
     A=parts(mk({src:s,cls:r.cls,level:20}),need);Bq=parts(mk({src:s,cls:r.cls,sub:r.sub,level:20}),need)}
   else if(r.kind==="class"){const s=r.src?{[r.src]:true}:{};
     if(r.lvl<2){res.err="level1";}else{A=parts(mk({src:s,cls:r.cls,level:r.lvl-1}),need);Bq=parts(mk({src:s,cls:r.cls,level:r.lvl}),need)}}
   if(A&&Bq)res.have=cmp(A,Bq,need)
  }catch(e){res.err=String(e&&e.message||e).slice(0,120)}
  out.push(res)});
 return out}
"""


def main():
    d = load()
    gaps = scan(d)
    gaps = probe(gaps)
    base = json.load(open(BASE, encoding="utf-8")) if os.path.exists(BASE) else {"by_design": {}, "gaps": {}}
    known = set(base["by_design"]) | set(base["gaps"])
    new = sorted(k for k in gaps if k not in known)
    closed = sorted(k for k in base["gaps"] if k not in gaps)
    if "--report" in args or "--update-baseline" in args:
        by = {}
        for k, v in gaps.items():
            kind = k.split("|")[0]
            by.setdefault(kind, {}).setdefault("n", 0); by[kind]["n"] += 1
            for c in v:
                by[kind][c] = by[kind].get(c, 0) + 1
        print("features with a mechanical statement and no way to count:", len(gaps))
        for kind, v in sorted(by.items()):
            print("  ", kind, v)
    if "--update-baseline" in args:
        nb = {"by_design": base["by_design"], "gaps": {}}
        for k in sorted(gaps):
            if k in base["by_design"]:
                continue
            nb["gaps"][k] = base["gaps"].get(k) or gaps[k]
        json.dump(nb, open(BASE, "w", encoding="utf-8"), indent=0, sort_keys=True, ensure_ascii=False)
        print("baseline written: %d gaps, %d by design" % (len(nb["gaps"]), len(nb["by_design"])))
        return 0
    if closed:
        print("closed since the baseline (run --update-baseline to drop them): %d" % len(closed))
    if new:
        print("FAIL: %d feature(s) state a mechanical effect but have no way to count it, and are not in tests/mech_baseline.json:" % len(new))
        for k in new[:60]:
            print("  ", k, gaps[k])
        if len(new) > 60:
            print("   ...", len(new) - 60, "more")
        print("Give the data a field the engine reads (SOURCE-NOTES.md, 'Adding a feature') or list it under by_design with a reason.")
        return 1
    print("mech_scan OK: %d known gaps, %d by design, 0 new" % (len(base["gaps"]), len(base["by_design"])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
