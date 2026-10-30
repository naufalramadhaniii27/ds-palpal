#!/usr/bin/env python3
"""Third party books -> src/data/tp*.js (deferred data blocks).

  python3 tools/tp_build.py            write the data files and reports/tp-gap.md
  python3 tools/tp_build.py --check    write nothing, exit 1 if a file would change or a name collides with the app

Source: TheGiddyLimit/homebrew (set HB_DIR to its collection/ folder). Facts (class, level, spell lists, prerequisites, numbers) come from the
source. All text is own wording and lives in tools/tp/overlay/. A feature without overlay text is a GAP and is listed in reports/tp-gap.md.
Every book is a source that is off until the player turns it on (group "Third Party Books" in Sources). No art."""
import json, os, re, sys, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, os.path.join(HERE, "tp"))
from hb import load, flat, strip
import tp_class

BOOKS = [
 {"id": "tdcsr", "file": "Darrington Press; Tal'Dorei Campaign Setting Reborn.json", "tag": "TDCSR", "name": "Tal'Dorei Campaign Setting Reborn",
  "pub": "Darrington Press", "ed": "2014", "sub": "tdcsr_sub", "bg": "tdcsr_bg", "feat": "tdcsr_feat", "item": "tdcsr_item", "spell": "tdcsr_spell"},
 {"id": "tdcg", "file": "Matthew Mercer; TalDorei Campaign Guide.json", "tag": "TDCG", "name": "TalDorei Campaign Guide",
  "pub": "Matthew Mercer", "ed": "2014", "sub": None, "bg": "tdcg_bg", "feat": "tdcg_feat", "species": "tdcg_species", "item": "tdcg_item", "dup": 1},
 {"id": "tvss", "file": "Mage Hand Press; Valda's Spire of Secrets - 2024.json", "tag": "VSS24", "name": "Valda's Spire of Secrets", "pub": "Mage Hand Press", "ed": "2024",
  "sub": "tvss_sub", "feat": "tvss_feat", "spell": "tvss_spell", "item": "tvss_item", "species": "tvss_species",
  "cls": ["alchemist", "captain", "craftsman", "investigator", "martyr", "necromancer", "vagabond", "warden", "warmage", "witch", "dancer"]},
 {"id": "tee24", "file": "Keith Baker; Exploring Eberron - 2024.json", "tag": "EE24", "name": "Exploring Eberron", "pub": "Keith Baker", "ed": "2024",
  "sub": "tee24_sub", "bg": "tee24_bg", "feat": "tee24_feat", "spell": "tee24_spell", "item": "tee24_item", "species": "tee24_species"},
 {"id": "tghp", "file": "Ghostfire Gaming; Grim Hollow - Player's Guide - 2024.json", "tag": "GHPG24", "name": "Grim Hollow Player's Guide", "pub": "Ghostfire Gaming", "ed": "2024",
  "sub": "tghp_sub", "bg": "tghp_bg", "feat": "tghp_feat", "spell": "tghp_spell", "item": "tghp_item", "species": "tghp_species", "cls": ["monster hunter"], "clspre": "tghc_"},
]
LV = {"1": 1, "2": 2}
GAP = []

def ovl(mod):
    p = os.path.join(HERE, "tp", "overlay", mod + ".py")
    sp = importlib.util.spec_from_file_location(mod, p); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m

def title(s):
    s = s.split("|")[0]
    small = {"of", "the", "and", "or", "to", "in", "on", "a"}
    w = s.split(" "); return " ".join(x.capitalize() if (i == 0 or x not in small) else x for i, x in enumerate(w))

def sub_records(bk, data, M):
    out = []
    feats = data["subclassFeature"]
    cnt = {}
    for f in feats: cnt[(f["className"], f.get("subclassShortName"))] = cnt.get((f["className"], f.get("subclassShortName")), 0) + 1
    byname = {}
    for s in data["subclass"]: byname.setdefault(s["name"], []).append(s)
    for s in data["subclass"]:
        name = s["name"]; O = M.SUB.get(name)
        twins = byname[name]
        if len(twins) > 1:
            home = max(twins, key=lambda t: (cnt.get((t["className"], t["shortName"]), 0), t["className"] == "Captain"))
            if s is not home: continue          # cross-compatible subclass listed under two classes: built once under its home class
        alt = [t["className"] for t in twins if t is not s]
        if s["className"] == "Gunslinger" and not O:
            GAP.append((bk["tag"], "subclass", name + " (Gunslinger)", "the class Gunslinger is in the 2014 edition books (Valda 2014 and others). Built with the 2014 book path, then these subclasses join it")); continue
        if not O:
            GAP.append((bk["tag"], "subclass", name, "no overlay text, subclass not built")); continue
        fl = [f for f in feats if f.get("subclassShortName") == s["shortName"] and f["className"] == s["className"]]
        arr = []; full = {}
        head = fl[0]["name"] if fl and fl[0]["name"] == name else None
        for f in fl:
            if f["name"] == name: continue          # the description entry of the subclass itself
            lvl = max(3, int(f["level"]))
            t = O["f"].get(f["name"])
            if t is None:
                GAP.append((bk["tag"], "subclass feature", name + " | " + f["name"], "no overlay text")); continue
            arr.append([lvl, f["name"], t]); full[name + "|" + f["name"]] = t
        unused = set(O["f"]) - {a[1] for a in arr}
        for u in sorted(unused): GAP.append((bk["tag"], "overlay", name + " | " + u, "overlay text without a source feature"))
        arr.sort(key=lambda a: a[0])
        auto = []
        for blk in s.get("additionalSpells", []):
            for key in ("prepared", "known"):
                for lv, sp in (blk.get(key) or {}).items():
                    if not isinstance(sp, list): continue          # "daily" and similar blocks hold free casts, not always-prepared lists
                    L = max(3, int(lv)); names = [title(x) for x in sp if isinstance(x, str)]
                    ex = [a for a in auto if a[0] == L]
                    if ex: ex[0][1] = ex[0][1] + "," + ",".join(names)
                    else: auto.append([L, ",".join(names)])
        auto.sort(key=lambda a: a[0])
        lu = []
        for l in O.get("lu", []):
            e = {"src": "sub", "owner": name, "feature": l["feature"], "n": l.get("n", l["feature"]), "lvl": max(3, l["lvl"]), "max": l["max"], "reset": l["reset"], "tag": l.get("tag", "")}
            lu.append(e)
        acts = {}
        for ft, kind in O.get("acts", {}).items():
            k = "sub|%s|%s" % (name, ft)
            acts[k] = [["other", "", ft]] if kind == "other" else [[kind, ""]]
        if alt and arr: arr[0][2] = arr[0][2] + " Cross-compatible with %s: your GM decides whether it may be used." % " and ".join(alt)
        for a_ in alt: full[name + "|" + arr[0][1]] = arr[0][2] if arr else ""
        rec = {"alt": alt, "cls": s["className"], "name": name, "src": bk["id"], "arr": arr, "full": full, "auto": auto, "lu": lu, "acts": acts,
               "cantrips": [], "pick": O.get("pick", []), "fx": O.get("fx", []), "spab": O.get("spab", "")}
        if O.get("grant"): rec["grant"] = O["grant"]
        if O.get("acb"): rec["acb"] = O["acb"]
        out.append(rec)
    return out

HEAD = "/* Generated by tools/tp_build.py from %s (%s, %s). Own wording. Source %s is off until the player turns it on. Do not edit by hand: change tools/tp/overlay/ and run the build. */\n"

REG = '''window.WXS=(window.WXS||[]).concat(D);
D.forEach(function(s){[s.cls].concat(s.alt||[]).forEach(function(cn){var c=CLASSES[cn];if(c){c.subs=c.subs||{};c.subs[s.name]=s.arr;
 c.pickSub=c.pickSub||{};if(s.pick.length)c.pickSub[s.name]=s.pick}SUBLABEL[cn]=SUBLABEL[cn]||(cn+" Subclass")});
 Object.keys(s.full).forEach(function(k){SUB_FULL[k]=s.full[k]});
 if(s.auto.length)AUTO[s.name]=s.auto;
 if(s.grant)SUB_GRANT[s.name]=s.grant;
 s.lu.forEach(function(e){LU_X.push(e)});
 Object.keys(s.acts).forEach(function(k){ACTS[k]=s.acts[k]});
 (s.sn||[]).forEach(function(r){SAVE_NOTES.push(r)})});
window.WX=window.WX||{src:[]};
if(!window.WX.src.some(function(x){return x.id===SRC.id}))window.WX.src.push(SRC);
'''

def bg_records(bk, data, M):
    """name -> record. Names come from the source and every one must have overlay text (else GAP)."""
    out = {}
    names = [b["name"] for b in data.get("background", []) if "_copy" not in b]
    for n in names:
        r = M.BG.get(n)
        if not r: GAP.append((bk["tag"], "background", n, "no overlay text, background not built")); continue
        rec = dict(r); rec.setdefault("featOpts", M.OPTS); rec["hb"] = bk["tag"]; rec["leg"] = 1 if bk["ed"] == "2014" else 0
        if not rec["leg"]: del rec["leg"]
        out[n] = rec
    for n in M.BG:
        if n not in names and n not in getattr(M, "ALSO", ()): GAP.append((bk["tag"], "overlay", "background " + n, "overlay text without a source background"))
    for b in data.get("background", []):
        if "_copy" in b: GAP.append((bk["tag"], "background variant", b["name"], "carried as a story variant on " + b["_copy"]["name"]))
    return out

REGBG = '''window.WXBG=window.WXBG||{};window.WXBG[SRC.id]=Object.assign(window.WXBG[SRC.id]||{},BG);
Object.keys(TL).forEach(function(k){TOOLS[k]=TL[k].list;TOOL_CAT[k]=TL[k].cat;TOOL_ONE[k]=TL[k].one});
SRC.backgrounds=Object.keys(BG);
'''

def feat_records(bk, data, M):
    """name -> (record, lu list, acts)."""
    out = {}; lus = []; acts = {}
    names = [f["name"] for f in data.get("feat", [])]
    for n in names + [x for x in getattr(M, "ALSO", []) if x not in names]:
        r = M.FEATS.get(n)
        if not r: GAP.append((bk["tag"], "feat", n, "no overlay text, feat not built")); continue
        rec = {"cat": "G", "hb": bk["tag"], "d": r["d"], "full": r["full"]}
        for k in ("pre", "asi", "fx", "pick", "needs"):
            if k in r: rec[k] = r[k]
        out[n] = rec
        if r.get("dm"): FDM[n] = r["dm"]
        if r.get("lu"):
            l = r["lu"]; lus.append({"src": "feat", "owner": n, "feature": n, "n": l["n"], "lvl": 1, "max": l["max"], "reset": l["reset"], "tag": l.get("tag", "")})
        if r.get("act"): acts["feat|" + n] = [[r["act"], n, n]]
    for n in M.FEATS:
        if n not in names and n not in getattr(M, "ALSO", ()): GAP.append((bk["tag"], "overlay", "feat " + n, "overlay text without a source feat"))
    return out, lus, acts

REGFT = '''window.DM_SP=window.DM_SP||{};Object.keys(FDM).forEach(function(k){window.DM_SP[k]=FDM[k]});
Object.keys(FT).forEach(function(n){FEATS[n]=FT[n]});FTLU.forEach(function(e){LU_X.push(e)});Object.keys(FTA).forEach(function(k){ACTS[k]=FTA[k]});
SRC.feats=Object.keys(FT);
'''

def item_records(bk, data, M):
    """rows, ITEM_SPELLS, weapon names, gear. Names must exist in the source (else GAP)."""
    src_names = set(i["name"] for i in data.get("item", [])) | set(i["name"] for i in data.get("magicvariant", []))
    rows = []; wpn = []
    for (n, typ, rar, att, text, o) in M.ITEMS:
        if n not in src_names: GAP.append((bk["tag"], "overlay", "item " + n, "overlay text without a source item"))
        op = {}
        for k in ("by", "ch", "fx", "base", "xd"):
            if k in o: op[k] = o[k]
        if n in M.WPN: op["wp"] = M.WPN[n]; op.setdefault("base", [n]); wpn.append(n)
        rows.append([n, typ, rar, att, text, op])
    have = set(r[0] for r in rows) | set(g[0] for g in M.GEAR) | set(getattr(M, "SUPERSEDED", ()))
    for n in getattr(M, "SUPERSEDED", ()):
        if n in src_names: GAP.append((bk["tag"], "item", n, "older version of the Reborn entry of the same name. Use the TDCSR book"))
    for n in sorted(src_names - have):
        GAP.append((bk["tag"], "item", n, "no overlay text, item not built"))
    for k, lab in (("monster", "monsters (stat blocks)"), ("deity", "deities"), ("variantrule", "variant rules"), ("reward", "rewards (boons and blessings)")):
        if data.get(k): GAP.append((bk["tag"], "reference only", "%d %s" % (len(data[k]), lab), "not in the builder or sheet. Planned for the Library as own-wording entries"))
    for k in ("itemGroup",):
        if data.get(k): GAP.append((bk["tag"], "reference only", "%d %s" % (len(data[k]), k), "grouping of items already listed one by one"))
    return rows, M.SP, wpn, M.GEAR

DMGT = {"B": "Bludgeoning", "P": "Piercing", "S": "Slashing", "N": "Necrotic", "R": "Radiant", "O": "Force", "F": "Fire", "L": "Lightning", "I": "Poison", "Y": "Psychic", "T": "Thunder", "A": "Acid", "C": "Cold"}
PROP = {"A": "Ammunition", "F": "Finesse", "H": "Heavy", "L": "Light", "LD": "Loading", "R": "Reach", "T": "Thrown", "2H": "Two-Handed", "V": "Versatile", "RLD": "Reload", "Alc:D": "Destructible", "GC:VSS-B": "Blaster", "GC:VSS-C": "Cooldown", "Craft:R": "Reload", "HC": "High Caliber", "AP": "Armor-Piercing", "BP": "Blackpowder", "CS": "Cumbersome", "D": "Double", "Dam": "Damage", "Haft": "Hafted", "Mag": "Magazine", "Mom": "Momentum", "Rep": "Repeater"}
WEAP = {}; MAST = {}

def weapon_records(bk, data, M):
    """Weapons from the source baseitems (stats from the source, text from the overlay). Switch weapons become one entry per form."""
    WEAP.clear(); MAST.clear()
    base = json.load(open(os.path.join(ROOT, "tools", "tp", "base_weapons.json"), encoding="utf-8"))
    desc = getattr(M, "WDESC", {}); MAST.update(getattr(M, "MASTERY", {}))
    seen = set()
    for it in data.get("baseitem", []):
        n = it["name"]; ty = (it.get("type") or "").split("|")[0]
        if ty not in ("M", "R", "SW") or n in seen: continue
        seen.add(n); price = round((it.get("value") or 0) / 100.0, 2)
        if ty == "SW":
            forms = [f.strip() for f in re.findall(r"\{@item ([^|}]+)", it["customProperties"]["baseitems"])]
            for f in forms:
                if f not in base: GAP.append((bk["tag"], "item", n, "switch form %s is not a base weapon of the app" % f)); continue
                o = dict(base[f]); o["tp"] = bk["id"]; o["w"] = it.get("weight") or o.get("w", 0)
                WEAP["%s (%s form)" % (n, f)] = {"o": o, "c": price, "t": getattr(M, "SWITCH_NOTE", "")}
            continue
        props = []
        for c in it.get("property", []) or []:
            k = c.split("|")[0]
            if k in PROP: props.append(PROP[k] + (" (%s)" % it["dmg2"] if k == "V" and it.get("dmg2") else ""))
        mast = ((it.get("mastery") or [""])[0]).split("|")[0]
        o = {"d": it.get("dmg1", "1"), "t": DMGT.get(it.get("dmgType"), "Piercing"), "cat": "S" if it.get("weaponCategory") == "simple" else "M", "k": "M" if ty == "M" else "R", "p": ", ".join(props), "m": mast, "w": it.get("weight") or 0, "tp": bk["id"]}
        if it.get("range"): o["r"] = it["range"]
        if mast and mast not in base_mastery() and mast not in MAST: GAP.append((bk["tag"], "item", n, "mastery %s has no overlay text" % mast))
        WEAP[n] = {"o": o, "c": price, "t": desc.get(n, "")}
    return WEAP, MAST

_BM = []
def base_mastery():
    if not _BM: _BM.extend(["Cleave", "Graze", "Nick", "Push", "Sap", "Slow", "Topple", "Vex"])
    return _BM

REGIT = '''window.WXI=window.WXI||{};window.WXI[SRC.id]=IT;
window.WXWP=(window.WXWP||[]).concat(WPN);
Object.keys(ISP).forEach(function(k){if(typeof ITEM_SPELLS!=="undefined")ITEM_SPELLS[k]=ISP[k]});
SRC.items=IT.map(function(r){return r[0]});
if(GR.length){window.WXG=window.WXG||{};window.WXG[SRC.id]=GR}
if(Object.keys(WPW).length){window.WXW=window.WXW||{};window.WXW[SRC.id]={w:WPW,a:{}};if(typeof MASTERY!=="undefined")Object.assign(MASTERY,MST)}
'''

SCH = {"A": "Abjuration", "C": "Conjuration", "D": "Divination", "E": "Enchantment", "V": "Evocation", "I": "Illusion", "N": "Necromancy", "T": "Transmutation"}
UNIT = {"action": "Action", "bonus": "Bonus Action", "reaction": "Reaction"}

def _dist(r):
    d = r.get("distance", {}); t = d.get("type")
    if r.get("type") == "point":
        if t == "self": return "Self"
        if t == "touch": return "Touch"
        if t == "sight": return "Sight"
        if t == "unlimited": return "Unlimited"
        return "%s %s" % (d.get("amount"), "ft" if t == "feet" else "mile" if d.get("amount") == 1 else "miles")
    if r.get("type") in ("emanation", "line", "cone", "sphere", "cube", "cylinder", "radius", "hemisphere"):
        return "Self (%s %s %s)" % (d.get("amount"), "ft" if t == "feet" else t, r["type"])
    return "Self"

def spell_meta(s):
    """Row prefix [name..save] from the source fields. The summary goes after it, from the overlay."""
    t = s["time"][0]; cast = UNIT.get(t["unit"]) or "%s %s%s" % (t["number"], t["unit"], "" if t["number"] == 1 else "s")
    c = s.get("components", {}); comp = ", ".join(x.upper() for x in ("v", "s", "m") if c.get(x))
    du = s["duration"][0]; conc = 1 if du.get("concentration") else 0
    if du["type"] == "instant": dur = "Instantaneous"
    elif du["type"] == "permanent": dur = "Until dispelled"
    elif du["type"] == "special": dur = "Special"
    else:
        q = du["duration"]; u = q["type"]; n = q["amount"]; dur = "%s%d %s%s" % ("Up to " if conc else "", n, u, "" if n == 1 else "s")
    cl = [x["name"] for x in (s.get("classes") or {}).get("fromClassList", [])]
    sv = (s.get("savingThrow") or [""])[0]
    AB = {"strength": "STR", "dexterity": "DEX", "constitution": "CON", "intelligence": "INT", "wisdom": "WIS", "charisma": "CHA"}
    rit = 1 if (s.get("meta") or {}).get("ritual") else 0
    return [s["name"], s["level"], SCH[s["school"]], sorted(set(cl)), cast, _dist(s["range"]), comp, dur, conc, rit, AB.get(sv, "")]

def spell_records(bk, data, M):
    src = {x["name"]: x for x in data.get("spell", [])}
    rows = []
    T = getattr(M, "TEXT", None)
    if T is None:
        names = set(src)
        for r in M.ROWS:
            if r[0] not in names: GAP.append((bk["tag"], "overlay", "spell " + r[0], "overlay text without a source spell"))
            rows.append(list(r) + [bk["tag"], list(r[3])])
        for n in sorted(names - set(r[0] for r in rows)): GAP.append((bk["tag"], "spell", n, "no overlay text, spell not built"))
        return rows, M.FULL
    full = {}
    for n in sorted(T):
        if n not in src: GAP.append((bk["tag"], "overlay", "spell " + n, "overlay text without a source spell")); continue
        r = spell_meta(src[n]); r.append(T[n][0]); r += [bk["tag"], list(r[3])]; rows.append(r); full[n] = T[n][1]
    for n in sorted(set(src) - set(T)): GAP.append((bk["tag"], "spell", n, "no overlay text, spell not built"))
    return rows, full

REGSP = '''SRC.rows=SPR;Object.keys(SPF).forEach(function(k){SPELL_FULL[k]=SPF[k]});
'''

def species_records(bk, data, M):
    names = set(x["name"] for x in data.get("race", []))
    for n in M.SPECIES:
        if n not in names: GAP.append((bk["tag"], "overlay", "species " + n, "overlay text without a source species"))
    for n in sorted(names - set(M.SPECIES)): GAP.append((bk["tag"], "species", n, "no overlay text, species not built"))
    out = {}
    for n, r in M.SPECIES.items():
        rec = dict(r); rec["hb"] = bk["tag"]; out[n] = rec
    for l in getattr(M, "LU", []): SPLU.append(l)
    for k, v in getattr(M, "ACTS", {}).items(): SPACTS[k] = v
    for k, v in getattr(M, "SP_AUTO", {}).items(): SPAUTO[k] = v
    return out, M.DEF

SPLU = []; SPACTS = {}; SPAUTO = {}
FDM = {}
REGCLS = '''window.WXC=window.WXC||{};
Object.keys(CL).forEach(function(n){var k=CL[n],r=k.rec;window.WXC[n]={book:SRC.id,rec:r};
 SUBLABEL[n]=n+" Subclass";if(r.cant)CANT[n]=r.cant;if(r.prep)PREP[n]=r.prep;if(r.mcg)MC_GRANT[n]=r.mcg;MC_REQ[n]=r.mcreq;if(k.auto)CLS_AUTO[n]=k.auto;
 Object.keys(k.cf).forEach(function(x){CF_FULL[n+"|"+x]=k.cf[x]});
 k.lu.forEach(function(e){LU_X.push(e)});Object.assign(ACTS,k.acts);if(k.quick)QUICK[n]=k.quick});
'''

REGSPC = '''window.WXSP=window.WXSP||{};window.WXSP[SRC.id]=Object.assign(window.WXSP[SRC.id]||{},SPC);Object.assign(DEF_SP,DFS);SPL.forEach(function(e){LU_X.push(e)});Object.assign(ACTS,SPA);Object.assign(SP_AUTO,SPS);
SRC.species=Object.keys(SPC);
'''

def build():
    files = {}
    for i, bk in enumerate(BOOKS, 1):
        FDM.clear(); del SPLU[:]; SPACTS.clear(); SPAUTO.clear()
        data = load(bk["file"]); M = ovl(bk["sub"]) if bk.get("sub") else None
        recs = sub_records(bk, data, M) if M else []
        if not M:
            for x in data.get("subclass", []): GAP.append((bk["tag"], "subclass", x["name"], ("older version of the Reborn subclass of the same name. Use the TDCSR book" if bk.get("dup") else "not built yet (plan P3b, P4)")))
        bgs = bg_records(bk, data, ovl(bk["bg"])) if bk.get("bg") else {}
        ft, ftlu, fta = feat_records(bk, data, ovl(bk["feat"])) if bk.get("feat") else ({}, [], {})
        ftlu = ftlu + (list(getattr(ovl(bk["bg"]), "LU", [])) if bk.get("bg") else [])
        spc, dfs = species_records(bk, data, ovl(bk["species"])) if bk.get("species") else ({}, {})
        tl = getattr(ovl(bk["bg"]), "TL", {}) if bk.get("bg") else {}
        cl = {}
        for cn in bk.get("cls", []):
            sc = [c for c in data["class"] if c["name"].lower() == cn]
            if not sc: continue
            cmod = bk.get("clspre", "tvsc_") + cn.replace(" ", "_")
            mp = os.path.join(HERE, "tp", "overlay", cmod + ".py")
            if not os.path.exists(mp):
                GAP.append((bk["tag"], "class", sc[0]["name"], "no overlay yet, class not built")); continue
            rc, ex = tp_class.class_record(sc[0], data, ovl(cmod).CLASS, lambda k, i, nt, _t=bk["tag"]: GAP.append((_t, k, i, nt)), bk["id"])
            ex["rec"] = rc; cl[sc[0]["name"]] = ex
        spr, spf = spell_records(bk, data, ovl(bk["spell"])) if bk.get("spell") else ([], {})
        it, isp, wpn, gr = item_records(bk, data, ovl(bk["item"])) if bk.get("item") else ([], {}, [], [])
        wpw, mst = weapon_records(bk, data, ovl(bk["item"])) if bk.get("item") and hasattr(ovl(bk["item"]), "MASTERY") else ({}, {})
        src = {"id": bk["id"], "tag": bk["tag"], "name": bk["name"] + (" (2014 rules)" if bk["ed"] == "2014" else ""),
               "desc": ", ".join(x for x in ["%d subclasses" % len(recs) if recs else "", "%d backgrounds" % len(bgs) if bgs else "", "%d feats" % len(ft) if ft else "", "%d items" % (len(it) + len(gr) + len(wpw)) if (it or gr or wpw) else "", "%d spells" % len(spr) if spr else "", "%d species" % len(spc) if spc else "", "%d classes" % len(cl) if cl else ""] if x) + ".", "feats": [], "spells": [], "rows": [], "subs": [r["name"] for r in recs],
               "tp": 1, "pub": bk["pub"], "ed": bk["ed"], "classes": list(cl)}
        if bk["ed"] == "2014": src["legacy"] = 0
        body = HEAD % (bk["file"], bk["pub"], bk["ed"] + " rules", bk["id"]) + "(function(){\nvar SRC=" + json.dumps(src, ensure_ascii=False, separators=(",", ":")) + ";\nvar D=" + json.dumps(recs, ensure_ascii=False, separators=(",", ":")) + ";\nvar BG=" + json.dumps(bgs, ensure_ascii=False, separators=(",", ":")) + ";\nvar TL=" + json.dumps(tl, ensure_ascii=False, separators=(",", ":")) + ";\nvar FT=" + json.dumps(ft, ensure_ascii=False, separators=(",", ":")) + ";\nvar FTLU=" + json.dumps(ftlu, ensure_ascii=False, separators=(",", ":")) + ";\nvar FTA=" + json.dumps(fta, ensure_ascii=False, separators=(",", ":")) + ";\nvar FDM=" + json.dumps(FDM, ensure_ascii=False, separators=(",", ":")) + ";\nvar SPL=" + json.dumps(SPLU, ensure_ascii=False, separators=(",", ":")) + ";\nvar SPA=" + json.dumps(SPACTS, ensure_ascii=False, separators=(",", ":")) + ";\nvar SPS=" + json.dumps(SPAUTO, ensure_ascii=False, separators=(",", ":")) + ";\nvar SPC=" + json.dumps(spc, ensure_ascii=False, separators=(",", ":")) + ";\nvar DFS=" + json.dumps(dfs, ensure_ascii=False, separators=(",", ":")) + ";\nvar SPR=" + json.dumps(spr, ensure_ascii=False, separators=(",", ":")) + ";\nvar SPF=" + json.dumps(spf, ensure_ascii=False, separators=(",", ":")) + ";\nvar IT=" + json.dumps(it, ensure_ascii=False, separators=(",", ":")) + ";\nvar ISP=" + json.dumps(isp, ensure_ascii=False, separators=(",", ":")) + ";\nvar WPN=" + json.dumps(wpn, ensure_ascii=False) + ";\nvar GR=" + json.dumps(gr, ensure_ascii=False, separators=(",", ":")) + ";\nvar WPW=" + json.dumps(wpw, ensure_ascii=False, separators=(",", ":")) + ";\nvar MST=" + json.dumps(mst, ensure_ascii=False, separators=(",", ":")) + ";\nvar CL=" + json.dumps(cl, ensure_ascii=False, separators=(",", ":")) + ";\n" + (REGBG if bgs else "") + (REGFT if ft else "") + (REGIT if (it or gr or wpw) else "") + (REGSP if spr else "") + (REGCLS if cl else "") + (REGSPC if spc else "") + REG + "})();\n"
        files["src/data/tp%02d-%s.js" % (i, bk["id"])] = body
    for g in (("All", "engine", "extra damage riders (Pyremaul fire, Agony mark, Condemner poison)", "shown on the weapon row note as xd, not added to a damage roll"),
              ("All", "engine", "effects that need a state (Star Razor glowing, Titanstone under Enlarge, Wraps ravenous strike)", "Star Razor bonus and resistance apply always. Others are text"),
              ("TDCSR", "assumption", "Deathwalker's Ward", "source data lists a +1 save bonus, the text does not. Not applied"),
              ("TDCSR", "engine", "truesight 60 ft (Circlet of Barbed Vision, Exalted)", "text only, the sheet has no truesight field"),
              ("VSS24", "engine", "restore a use by spending a resource (Battle Dice, Radiant damage, Reagents, Dance uses, spell slot)", "the tracker counts the rest reset only. The other way to restore is in the text"),
              ("VSS24", "engine", "armor, weapon and tool training from a subclass feature that is not a plain grant (Silvered Shield, Martial Training)", "text and note only, no field on the sheet"),
              ("VSS24", "engine", "per-option trackers (Grand Hex uses, Cauldron points, Danse Macabre pool of level + CHA)", "uses are written in the option text, no tracker"),
              ("VSS24", "engine", "Witch Hexes, subclass-granted maneuvers, Kings maneuvers, Thrall stat tables, Archivist spell tables", "text only, no picker or table"),
              ("VSS24", "engine", "Martyr Radiant-damage casting and Max Spell Levels", "the picker limits spell level by the table. The Radiant cost and Spell Uses are text and one tracker"),
              ("VSS24", "engine", "Investigator and Craftsman casting through features", "text and trackers, no spell picker"),
              ("TDCSR", "engine", "conditional AC and rider reactions (Plate of the Dawnmartyr rebuke, Cabal's Ruin absorb)", "text and charge tracker only")):
        GAP.append(g)
    gap = ["# Third party GAP list", "", "Generated by tools/tp_build.py. A GAP is a source feature the app cannot place on the sheet by itself, or text that is missing.", "",
           "| Book | Kind | Item | Note |", "|---|---|---|---|"] + ["| %s | %s | %s | %s |" % g for g in GAP]
    files["reports/tp-gap.md"] = "\n".join(gap) + "\n"
    return files

if __name__ == "__main__":
    files = build(); bad = 0
    for p, t in files.items():
        fp = os.path.join(ROOT, p); old = open(fp, encoding="utf-8").read() if os.path.exists(fp) else None
        if "--check" in sys.argv:
            if old != t: print("would change", p); bad = 1
        else:
            open(fp, "w", encoding="utf-8").write(t); print("wrote", p, len(t))
    print("GAP rows:", len(GAP))
    sys.exit(bad)
