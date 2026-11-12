#!/usr/bin/env python3
"""Third party books -> src/data/tp*.js (deferred data blocks).

  python3 tools/tp_build.py            write the data files and reports/tp-gap.md
  python3 tools/tp_build.py --check    write nothing, exit 1 if a file would change or a name collides with the app

Source: TheGiddyLimit/homebrew (set HB_DIR to its collection/ folder). Facts (class, level, spell lists, prerequisites, numbers) come from the
source. All text is own wording and lives in tools/tp/overlay/. A feature without overlay text is a GAP and is listed in reports/tp-gap.md.
Every book is a source that is off until the player turns it on (group "Third Party Books" in Sources). No art."""
import json, os, re, sys, glob, importlib.util
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
  "sub": "tee24_sub", "bg": "tee24_bg", "feat": "tee24_feat", "spell": "tee24_spell", "item": "tee24_item", "species": "tee24_species", "alias": "Eberron"},
 {"id": "tghp", "file": "Ghostfire Gaming; Grim Hollow - Player's Guide - 2024.json", "tag": "GHPG24", "name": "Grim Hollow Player's Guide", "pub": "Ghostfire Gaming", "ed": "2024",
  "sub": "tghp_sub", "bg": "tghp_bg", "feat": "tghp_feat", "spell": "tghp_spell", "item": "tghp_item", "species": "tghp_species", "cls": ["monster hunter"], "clspre": "tghc_", "alias": "Grim Hollow", "trans": "tghp_trans"},
 {"id": "tsgeh", "file": "MonkeyDM; Steinhardt's Guide to the Eldritch Hunt - 2024.json", "tag": "SGEH24", "name": "Steinhardt's Guide to the Eldritch Hunt", "pub": "MonkeyDM", "ed": "2024",
  "sub": "tsgeh_sub", "bg": "tsgeh_bg", "feat": "tsgeh_feat", "spell": "tsgeh_spell", "item": "tsgeh_item", "species": "tsgeh_species", "cls": ["jaeger"], "clspre": "tsgc_", "alias": "Steinhardt"},
 {"id": "tsae", "file": "Spaghetti0; Artificer Expansion Pack - 2024.json", "tag": "AEP24", "name": "Artificer Expansion Pack", "pub": "Spaghetti0", "ed": "2024",
  "sub": "tsae_sub", "spell": "tsae_spell", "alias": "Artificer Expansion"},
 {"id": "tghg", "file": "Ghostfire Gaming; Grim Hollow - Campaign Guide - 2024.json", "tag": "GHCG24", "name": "Grim Hollow Campaign Guide", "pub": "Ghostfire Gaming", "ed": "2024",
  "item": "tghg_item", "alias": "Grim Hollow CG"},
 {"id": "tshl", "file": "Spaghetti0; Healer - 2024.json", "tag": "HLR24", "name": "Healer (Spaghetti0)", "pub": "Spaghetti0", "ed": "2024", "sub": "tshl_sub", "spell": "tshl_spell", "cls": ["healer"], "clspre": "tshc_", "alias": "Healer class"},
 {"id": "tssm", "file": "Spaghetti0; Summoner - 2024.json", "tag": "SUM24", "name": "Summoner (Spaghetti0)", "pub": "Spaghetti0", "ed": "2024", "sub": "tssm_sub", "spell": "tssm_spell", "item": "tssm_item", "cls": ["summoner"], "clspre": "tssc_", "alias": "Summoner class"},
 {"id": "tsdd", "file": "Palaeo Games; Dr Dhrolins Dictionary of Dinosaurs - 2024.json", "tag": "DDD24", "name": "Dr Dhrolin's Dictionary of Dinosaurs", "pub": "Palaeo Games", "ed": "2024", "sub": "tsdd_sub", "species": "tsdd_species", "alias": "Dinosaurs"},
 {"id": "tsgs", "file": "Griffin Macaulay; The Griffon's Saddlebag, Book 1 - 2024.json", "tag": "GSB24", "name": "The Griffon's Saddlebag, Book 1", "pub": "Griffin Macaulay", "ed": "2024", "sub": "tsgs_sub", "item": "tsgs_item", "species": "tsgs_species", "alias": "Saddlebag"},
 {"id": "tsdm", "file": "Mage Hand Press; Dark Matter - 2024.json", "tag": "DM24", "name": "Dark Matter", "pub": "Mage Hand Press", "ed": "2024", "sub": "tsdm_sub", "bg": "tsdm_bg", "feat": "tsdm_feat", "spell": "tsdm_spell", "item": "tsdm_item", "species": "tsdm_species", "cls": ["gadgeteer"], "clspre": "tsdc_", "alias": "Dark Matter"},
 {"id": "tkdm", "file": ["Kobold Press; Deep Magic.json", "Kobold Press; Deep Magic 01 Clockwork Magic.json", "Kobold Press; Deep Magic 03 Void Magic.json", "Kobold Press; Deep Magic 04 Illumination Magic.json", "Kobold Press; Deep Magic 05 Ley Lines.json", "Kobold Press; Deep Magic 07 Chaos Magic.json", "Kobold Press; Deep Magic 08 Battle Magic.json", "Kobold Press; Deep Magic 09 Ring Magic.json", "Kobold Press; Deep Magic 12 Blood and Doom.json", "Kobold Press; Deep Magic 13 Dragon Magic.json", "Kobold Press; Deep Magic 14 Elemental Magic.json", "Kobold Press; Deep Magic 16 Time Magic.json", "Kobold Press; Deep Magic 17 Mythos Magic.json", "Kobold Press; Deep Magic 18 Combat Divination.json"],
  "tag": "KPDM", "name": "Deep Magic", "pub": "Kobold Press", "ed": "2014", "sub": "tkdm_sub", "bg": "tkdm_bg", "feat": "tkdm_feat", "spell": "tkdm_spell", "item": "tkdm_item", "alias": "Deep Magic"},
 {"id": "thhw", "file": ["Hit Point Press; Humblewood Campaign Setting.json", "Hit Point Press; Humblewood Tales.json"],
  "tag": "HWCS", "name": "Humblewood", "pub": "Hit Point Press", "ed": "2014", "sub": "thhw_sub", "bg": "thhw_bg", "feat": "thhw_feat", "spell": "thhw_spell", "item": "thhw_item", "species": "thhw_species", "alias": "Humblewood"},
 {"id": "tvss14", "file": "Mage Hand Press; Valda's Spire of Secrets - 2014.json", "tag": "VSS14", "name": "Valda's Spire of Secrets", "pub": "Mage Hand Press", "ed": "2014",
  "sub": "tvss14_sub", "feat": "tvss14_feat", "cls": ["warden", "alchemist", "captain"], "clspre": "tvc14_", "twin": "Mage Hand Press; Valda's Spire of Secrets - 2024.json", "subsfx": " (2014)",
  "clsmap": {"Alchemist": "Alchemist (2014)", "Captain": "Captain (2014)", "Craftsman": "Craftsman (2014)", "Investigator": "Investigator (2014)", "Martyr": "Martyr (2014)", "Necromancer": "Necromancer (2014)", "Warden": "Warden (2014)", "Warmage": "Warmage (2014)", "Witch": "Witch (2014)"}},
]
LV = {"1": 1, "2": 2}
GAP = []
ONLY = [x for x in os.environ.get("TP_ONLY", "").split(",") if x]      # TP_ONLY=tvss,tvss14: build only these books (needs only their source files). reports/tp-gap.md is then not written

def ovl(mod):
    p = os.path.join(HERE, "tp", "overlay", mod + ".py")
    sp = importlib.util.spec_from_file_location(mod, p); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m

_CORE = []; _SEEN = {}      # _SEEN: names already used by an earlier third party book, so two books never share a name
def alias(bk, n):
    """A book with an "alias" label renames entries whose name already exists in the app, so they never replace or switch off the core entry."""
    if not bk.get("alias"):
        _SEEN.setdefault(n, bk["id"]); return n
    if not _CORE:
        t = ""
        for f in glob.glob(os.path.join(ROOT, "src", "data", "*.js")) + glob.glob(os.path.join(ROOT, "src", "builder", "*.js")):
            if re.match(r"tp\d\d-", os.path.basename(f)): continue
            t += open(f, encoding="utf-8").read()
        _CORE.append(t)
    r = "%s (%s)" % (n, bk["alias"]) if (('"%s"' % n) in _CORE[0] or _SEEN.get(n, bk["id"]) != bk["id"]) else n
    _SEEN.setdefault(r, bk["id"]); return r

_SPN = {}
def spell_name(s):
    """An always-prepared spell takes the app's spelling of it ("Protection from Evil and Good", "Speak with Dead"), so the sheet finds it"""
    if not _SPN:
        for f in ("spells-spell-list.js", "spfull-spell-text.js"):
            fp = os.path.join(ROOT, "src", "data", f)
            if os.path.exists(fp):
                for n in re.findall(r'"([A-Z][^"]{2,45})"', open(fp, encoding="utf-8").read()): _SPN.setdefault(n.lower(), n)
    s = re.sub(r"^(\S+) \1 ", r"\1 ", s.split("|")[0])   # a doubled first word in the source ("Tasha's Tasha's Hideous Laughter")
    return _SPN.get(s.lower(), title(s))

def title(s):
    s = s.split("|")[0]
    small = {"of", "the", "and", "or", "to", "in", "on", "a"}
    w = s.split(" "); return " ".join(x.capitalize() if (i == 0 or x not in small) else x for i, x in enumerate(w))

_SEENSUB = {}
def sub_records(bk, data, M):
    out = []
    feats = data["subclassFeature"]
    cnt = {}
    for f in feats: cnt[(f["className"], f.get("subclassShortName"))] = cnt.get((f["className"], f.get("subclassShortName")), 0) + 1
    byname = {}
    for s in data["subclass"]: byname.setdefault(s["name"], []).append(s)
    cm = bk.get("clsmap", {})
    sfxn = set(x["name"] for x in load(bk["twin"]).get("subclass", [])) if bk.get("twin") else set()      # names the 2024 book of the same title also has
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
        key_ = (s["className"], name)
        if key_ in _SEENSUB and _SEENSUB[key_] != bk["id"] and bk.get("alias"):
            nm = "%s (%s)" % (name, bk["alias"])          # same subclass name as an earlier book: renamed so neither replaces the other
        else: nm = name
        if bk.get("subsfx") and name in sfxn: nm = name + bk["subsfx"]          # same name as a subclass of the 2024 book: kept apart, so no table is shared
        _SEENSUB.setdefault(key_, bk["id"])
        fl = [f for f in feats if f.get("subclassShortName") == s["shortName"] and f["className"] == s["className"]]
        arr = []; full = {}
        head = fl[0]["name"] if fl and fl[0]["name"] == name else None
        for f in fl:
            if f["name"] == name: continue          # the description entry of the subclass itself
            lvl = max(3, int(f["level"]))
            t = O["f"].get(f["name"])
            if t is None:
                GAP.append((bk["tag"], "subclass feature", name + " | " + f["name"], "no overlay text")); continue
            arr.append([lvl, f["name"], t]); full[nm + "|" + f["name"]] = t
        unused = set(O["f"]) - {a[1] for a in arr}
        for u in sorted(unused): GAP.append((bk["tag"], "overlay", name + " | " + u, "overlay text without a source feature"))
        arr.sort(key=lambda a: a[0])
        auto = []
        for blk in s.get("additionalSpells", []):
            for key in ("prepared", "known"):
                for lv, sp in (blk.get(key) or {}).items():
                    if not isinstance(sp, list): continue          # "daily" and similar blocks hold free casts, not always-prepared lists
                    L = max(3, int(lv)); names = [spell_name(x) for x in sp if isinstance(x, str)]
                    ex = [a for a in auto if a[0] == L]
                    if ex: ex[0][1] = ex[0][1] + "," + ",".join(names)
                    else: auto.append([L, ",".join(names)])
        auto.sort(key=lambda a: a[0])
        lu = []
        for l in O.get("lu", []):
            e = {"src": "sub", "owner": nm, "feature": l["feature"], "n": l.get("n", l["feature"]), "lvl": max(3, l["lvl"]), "max": l["max"], "reset": l["reset"], "tag": l.get("tag", "")}
            lu.append(e)
        acts = {}
        for ft, kind in O.get("acts", {}).items():
            k = "sub|%s|%s" % (nm, ft)
            acts[k] = [["other", "", ft]] if kind == "other" else [[kind, ""]]
        if alt and arr: arr[0][2] = arr[0][2] + " Cross-compatible with %s: your GM decides whether it may be used." % " and ".join(alt)
        for a_ in alt: full[nm + "|" + arr[0][1]] = arr[0][2] if arr else ""
        rec = {"alt": [cm.get(a, a) for a in alt], "cls": cm.get(s["className"], s["className"]), "name": nm, "src": bk["id"], "arr": arr, "full": full, "auto": auto, "lu": lu, "acts": acts,
               "cantrips": [], "pick": O.get("pick", []), "fx": O.get("fx", []), "spab": O.get("spab", "")}
        if O.get("grant"): rec["grant"] = O["grant"]
        if O.get("third"): rec["third"] = O["third"]
        if O.get("gx"): rec["gx"] = O["gx"]
        if O.get("acb"): rec["acb"] = O["acb"]
        out.append(rec)
    return out

HEAD = "/* Generated by tools/tp_build.py from %s (%s, %s). Own wording. Source %s is off until the player turns it on. Do not edit by hand: change tools/tp/overlay/ and run the build. */\n"

REG = '''DataEnv.slot.WXS=(DataEnv.slot.WXS||[]).concat(D);
D.forEach(function(s){[s.cls].concat(s.alt||[]).forEach(function(cn){var c=CLASSES[cn];if(c){c.subs=c.subs||{};c.subs[s.name]=s.arr;
 c.pickSub=c.pickSub||{};if(s.pick.length)c.pickSub[s.name]=s.pick}SUBLABEL[cn]=SUBLABEL[cn]||(cn+" Subclass")});
 Object.keys(s.full).forEach(function(k){SUB_FULL[k]=s.full[k]});
 if(s.auto.length)AUTO[s.name]=s.auto;
 if(s.grant)SUB_GRANT[s.name]=s.grant;
 if(s.gx){DataEnv.slot.GX=DataEnv.slot.GX||{};DataEnv.slot.GX.sub=DataEnv.slot.GX.sub||{};DataEnv.slot.GX.sub[s.name]=(DataEnv.slot.GX.sub[s.name]||[]).concat(s.gx)}
 if(s.third){DataEnv.slot.THIRD_SUBS=DataEnv.slot.THIRD_SUBS||{};DataEnv.slot.THIRD_SUBS[s.name]=s.third}
 s.lu.forEach(function(e){LU_X.push(e)});
 Object.keys(s.acts).forEach(function(k){ACTS[k]=s.acts[k]});
 (s.sn||[]).forEach(function(r){SAVE_NOTES.push(r)})});
DataEnv.slot.WXE=(DataEnv.slot.WXE||[]).concat(EX);
DataEnv.slot.WX=DataEnv.slot.WX||{src:[]};
if(!DataEnv.slot.WX.src.some(function(x){return x.id===SRC.id}))DataEnv.slot.WX.src.push(SRC);
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
        if bk.get("alias"):
            if rec.get("feat"): rec["feat"] = _featname(bk, rec["feat"], M)
            rec["featOpts"] = [_featname(bk, x, M) for x in rec["featOpts"]]
        out[alias(bk, n)] = rec
    for n in M.BG:
        if n not in names and n not in getattr(M, "ALSO", ()): GAP.append((bk["tag"], "overlay", "background " + n, "overlay text without a source background"))
    for b in data.get("background", []):
        if "_copy" in b: GAP.append((bk["tag"], "background variant", b["name"], "carried as a story variant on " + b["_copy"]["name"]))
    return out

REGBG = '''DataEnv.slot.WXBG=DataEnv.slot.WXBG||{};DataEnv.slot.WXBG[SRC.id]=Object.assign(DataEnv.slot.WXBG[SRC.id]||{},BG);
Object.keys(TL).forEach(function(k){TOOLS[k]=TL[k].list;TOOL_CAT[k]=TL[k].cat;TOOL_ONE[k]=TL[k].one});
SRC.backgrounds=Object.keys(BG);
'''

def _featname(bk, n, M=None):
    """Name of a feat as the app knows it: the book's own feats may be renamed, the core feats never are."""
    own = getattr(bk.get("_featmod"), "FEATS", {})
    return alias(bk, n) if n in own else n

def trans_records(bk, data, M2):
    """Transformations of Grim Hollow: one feat per stage (pick the stage Boons, the Flaws are listed). T = {name: {intro, stages: {n: {rule, take, fixed}}, opt: {optname: text}}}, GIFTS = {name: text}."""
    T = M2.TRANS; out = {}; acts = {}
    by = {}                                   # transformation name -> stage -> {"B": [...], "F": [...]}
    for o in data.get("optionalfeature", []):
        ft = [t for t in o["featureType"] if t.endswith(":TB") or t.endswith(":TF")]
        if not ft: continue
        txt = json.dumps(o.get("prerequisite", ""))
        m = re.search(r"Stage (\d+) of the \{@charoption ([^|}]+)", txt)
        if not m: GAP.append((bk["tag"], "transformation", o["name"], "no stage in the prerequisite")); continue
        by.setdefault(m.group(2), {}).setdefault(int(m.group(1)), {"B": [], "F": []})["B" if ft[0].endswith("TB") else "F"].append(o["name"])
    for nm in sorted(by):
        t = T.get(nm)
        if not t: GAP.append((bk["tag"], "transformation", nm, "no overlay text, transformation not built")); continue
        for st in sorted(by[nm]):
            sd = by[nm][st]; rule = t["stages"].get(st) or t["stages"].get(str(st))
            if not rule: GAP.append((bk["tag"], "transformation", "%s stage %d" % (nm, st), "no stage rule in the overlay")); continue
            for n in sd["B"] + sd["F"]:
                if n not in t["opt"]: GAP.append((bk["tag"], "transformation", "%s | %s" % (nm, n), "no overlay text"))
            fixed = [n for n in rule.get("fixed", []) if n in sd["B"]]
            rest = [n for n in sd["B"] if n not in fixed]
            full = ""
            if st == 1 and t.get("intro"): full += t["intro"] + "\n"
            full += "**Stage %d.** %s" % (st, rule["rule"])
            for n in fixed: full += "\n**%s (Boon).** %s" % (n, t["opt"].get(n, ""))
            for n in sd["F"]: full += "\n**%s (Flaw).** %s" % (n, t["opt"].get(n, ""))
            rec = {"cat": "G", "hb": bk["tag"], "d": rule.get("d") or ("%s Transformation, stage %d. %s" % (nm, st, rule["rule"]))[:170], "full": full}
            if st > 1: rec["pre"] = "Stage %d of the %s Transformation" % (st - 1, nm)
            else: rec["pre"] = "Your GM allows the %s Transformation" % nm
            if rest and rule.get("take", 0) > 0:
                rec["pick"] = [{"k": "tr%s%d" % (re.sub("[^A-Za-z]", "", nm), st), "t": "multi", "n": rule["take"], "title": "%s stage %d Boons" % (nm, st),
                                "list": [[n, t["opt"].get(n, "")] for n in rest]}]
            elif rest: 
                for n in rest: rec["full"] += "\n**%s (Boon).** %s" % (n, t["opt"].get(n, ""))
            out["%s Transformation: Stage %d" % (nm, st)] = rec
    gods = [o["name"] for o in data.get("optionalfeature", []) if "GoD" in o["featureType"]]
    G = getattr(M2, "GIFTS", {})
    for n in gods:
        if n not in G: GAP.append((bk["tag"], "optional feature", "Gift of Dread | " + n, "no overlay text"))
    if gods:
        out["Gift of Dread"] = {"cat": "G", "hb": bk["tag"], "d": getattr(M2, "GIFT_D", "Pick one Gift of Dread."), "full": getattr(M2, "GIFT_INTRO", "Pick one Gift of Dread."),
                                "pick": [{"k": "god", "t": "multi", "n": 1, "title": "Gift of Dread", "list": [[n, G.get(n, "")] for n in gods]}]}
    return out, acts

def feat_records(bk, data, M):
    """name -> (record, lu list, acts)."""
    out = {}; lus = []; acts = {}
    names = [f["name"] for f in data.get("feat", [])]
    for n in names + [x for x in getattr(M, "ALSO", []) if x not in names]:
        r = M.FEATS.get(n)
        if not r: GAP.append((bk["tag"], "feat", n, "no overlay text, feat not built")); continue
        rec = {"cat": r.get("cat", "G"), "hb": bk["tag"], "d": r["d"], "full": r["full"]}
        for k in ("pre", "asi", "fx", "pick", "needs"):
            if k in r: rec[k] = r[k]
        n0 = n; n = alias(bk, n); out[n] = rec
        if r.get("dm"): FDM[n] = r["dm"]
        if r.get("lu"):
            l = r["lu"]; lus.append({"src": "feat", "owner": n, "feature": n, "n": l["n"], "lvl": 1, "max": l["max"], "reset": l["reset"], "tag": l.get("tag", "")})
        if r.get("act"): acts["feat|" + n] = [[r["act"], n, n]]
    for n in M.FEATS:
        if n not in names and n not in getattr(M, "ALSO", ()): GAP.append((bk["tag"], "overlay", "feat " + n, "overlay text without a source feat"))
    return out, lus, acts

REGFT = '''DataEnv.slot.DM_SP=DataEnv.slot.DM_SP||{};Object.keys(FDM).forEach(function(k){DataEnv.slot.DM_SP[k]=FDM[k]});
Object.keys(FT).forEach(function(n){FEATS[n]=FT[n]});FTLU.forEach(function(e){LU_X.push(e)});Object.keys(FTA).forEach(function(k){ACTS[k]=FTA[k]});
SRC.feats=Object.keys(FT);
'''

def item_records(bk, data, M):
    """rows, ITEM_SPELLS, weapon names, gear. Names must exist in the source (else GAP)."""
    src_names = set(" ".join(i["name"].split()) for i in data.get("item", [])) | set(" ".join(i["name"].split()) for i in data.get("magicvariant", []))   # source names may hold a double space
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
PROP = {"A": "Ammunition", "F": "Finesse", "H": "Heavy", "L": "Light", "LD": "Loading", "R": "Reach", "T": "Thrown", "2H": "Two-Handed", "V": "Versatile", "RLD": "Reload", "Alc:D": "Destructible", "GC:VSS-B": "Blaster", "GC:VSS-C": "Cooldown", "Craft:R": "Reload", "HC": "High Caliber", "AP": "Armor-Piercing", "BP": "Blackpowder", "CS": "Cumbersome", "D": "Double", "Dam": "Damage", "Haft": "Hafted", "Mag": "Magazine", "Mom": "Momentum", "Rep": "Repeater", "SGttEH:Art": "Artillery", "SGttEH:Bar": "Barrel", "SGttEH:Bla": "Blaring", "SGttEH:Boo": "Booming", "SGttEH:FnFr": "Fan Fire", "SGttEH:Sdy": "Steady", "SGttEH:SpFr": "Spread Fire", "SGttEH:TwBar": "Twinned Barrel", "TK": "Trick Weapon", "DM-B": "Blaster", "DM-C": "Cooldown", "DM-D": "Destructible", "DM-F": "Firearm", "DM-R": "Recoil"}
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

REGIT = '''DataEnv.slot.WXI=DataEnv.slot.WXI||{};DataEnv.slot.WXI[SRC.id]=IT;
DataEnv.slot.WXWP=(DataEnv.slot.WXWP||[]).concat(WPN);
Object.keys(ISP).forEach(function(k){if(typeof ITEM_SPELLS!=="undefined")ITEM_SPELLS[k]=ISP[k]});
SRC.items=IT.map(function(r){return r[0]});
if(GR.length){DataEnv.slot.WXG=DataEnv.slot.WXG||{};DataEnv.slot.WXG[SRC.id]=GR}
if(Object.keys(WPW).length){DataEnv.slot.WXW=DataEnv.slot.WXW||{};DataEnv.slot.WXW[SRC.id]={w:WPW,a:{}};if(typeof MASTERY!=="undefined")Object.assign(MASTERY,MST)}
'''

SCH = {"A": "Abjuration", "C": "Conjuration", "D": "Divination", "E": "Enchantment", "V": "Evocation", "I": "Illusion", "N": "Necromancy", "T": "Transmutation", "CLOCK": "Clockwork", "VOID": "Void"}
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
        tx = T[n]
        if isinstance(tx, str):
            import re as _re
            m_ = _re.match(r"(.{40,200}?[.!?])(\s|$)", tx.replace("**", "")); tx = [(m_.group(1) if m_ else tx[:200]).strip(), tx]
        r = spell_meta(src[n]); r[0] = alias(bk, n); r.append(tx[0]); r += [bk["tag"], list(r[3])]; rows.append(r); full[r[0]] = tx[1]
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
        rec = dict(r); rec["hb"] = bk["tag"]; out[alias(bk, n)] = rec
    for l in getattr(M, "LU", []): SPLU.append(l)
    for k, v in getattr(M, "ACTS", {}).items(): SPACTS[k] = v
    for k, v in getattr(M, "SP_AUTO", {}).items(): SPAUTO[k] = v
    return out, M.DEF

SPLU = []; SPACTS = {}; SPAUTO = {}
FDM = {}
REGCLS = '''DataEnv.slot.WXC=DataEnv.slot.WXC||{};
Object.keys(CL).forEach(function(n){var k=CL[n],r=k.rec;DataEnv.slot.WXC[n]={book:SRC.id,rec:r,ed:SRC.ed,tw:k.tw};
 SUBLABEL[n]=k.sub||n+" Subclass";if(r.cant)CANT[n]=r.cant;if(r.prep)PREP[n]=r.prep;if(r.mcg)MC_GRANT[n]=r.mcg;MC_REQ[n]=r.mcreq;if(k.auto)CLS_AUTO[n]=k.auto;
 Object.keys(k.cf).forEach(function(x){CF_FULL[n+"|"+x]=k.cf[x]});
 k.lu.forEach(function(e){LU_X.push(e)});Object.assign(ACTS,k.acts);if(k.quick)QUICK[n]=k.quick});
'''

REGSPC = '''DataEnv.slot.WXSP=DataEnv.slot.WXSP||{};DataEnv.slot.WXSP[SRC.id]=Object.assign(DataEnv.slot.WXSP[SRC.id]||{},SPC);Object.assign(DEF_SP,DFS);SPL.forEach(function(e){LU_X.push(e)});Object.assign(ACTS,SPA);Object.assign(SP_AUTO,SPS);
SRC.species=Object.keys(SPC);
'''

def build():
    files = {}
    for i, bk in enumerate(BOOKS, 1):
        if ONLY and bk["id"] not in ONLY: continue
        FDM.clear(); del SPLU[:]; SPACTS.clear(); SPAUTO.clear()
        data = load(bk["file"]); M = ovl(bk["sub"]) if bk.get("sub") else None
        recs = sub_records(bk, data, M) if M else []
        if not M:
            for x in data.get("subclass", []): GAP.append((bk["tag"], "subclass", x["name"], ("older version of the Reborn subclass of the same name. Use the TDCSR book" if bk.get("dup") else "not built yet (plan P3b, P4)")))
        bk["_featmod"] = ovl(bk["feat"]) if bk.get("feat") else None
        bgs = bg_records(bk, data, ovl(bk["bg"])) if bk.get("bg") else {}
        ft, ftlu, fta = feat_records(bk, data, ovl(bk["feat"])) if bk.get("feat") else ({}, [], {})
        if bk.get("trans"):
            tf, _ta = trans_records(bk, data, ovl(bk["trans"])); ft.update(tf)
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
            kn = bk.get("clsmap", {}).get(sc[0]["name"], sc[0]["name"])
            rc, ex = tp_class.class_record(sc[0], data, ovl(cmod).CLASS, lambda k, i, nt, _t=bk["tag"]: GAP.append((_t, k, i, nt)), bk["id"], name=kn)
            ex["rec"] = rc
            if kn != sc[0]["name"]: ex["tw"] = sc[0]["name"]
            cl[kn] = ex
        spr, spf = spell_records(bk, data, ovl(bk["spell"])) if bk.get("spell") else ([], {})
        it, isp, wpn, gr = item_records(bk, data, ovl(bk["item"])) if bk.get("item") else ([], {}, [], [])
        wpw, mst = weapon_records(bk, data, ovl(bk["item"])) if bk.get("item") and hasattr(ovl(bk["item"]), "MASTERY") else ({}, {})
        src = {"id": bk["id"], "tag": bk["tag"], "name": bk["name"] + (" (2014 rules)" if bk["ed"] == "2014" else ""),
               "desc": ", ".join(x for x in ["%d subclasses" % len(recs) if recs else "", "%d backgrounds" % len(bgs) if bgs else "", "%d feats" % len(ft) if ft else "", "%d items" % (len(it) + len(gr) + len(wpw)) if (it or gr or wpw) else "", "%d spells" % len(spr) if spr else "", "%d species" % len(spc) if spc else "", "%d classes" % len(cl) if cl else ""] if x) + ".", "feats": [], "spells": [], "rows": [], "subs": [r["name"] for r in recs],
               "tp": 1, "pub": bk["pub"], "ed": bk["ed"], "classes": list(cl)}
        if bk["ed"] == "2014": src["legacy"] = 0
        body = HEAD % (bk["file"] if isinstance(bk["file"], str) else " + ".join(bk["file"]), bk["pub"], bk["ed"] + " rules", bk["id"]) + "(function(){\nvar SRC=" + json.dumps(src, ensure_ascii=False, separators=(",", ":")) + ";\nvar D=" + json.dumps(recs, ensure_ascii=False, separators=(",", ":")) + ";\nvar EX=" + json.dumps([dict(e, src=bk["id"]) for e in getattr(M, "EXT", [])], ensure_ascii=False, separators=(",", ":")) + ";\nvar BG=" + json.dumps(bgs, ensure_ascii=False, separators=(",", ":")) + ";\nvar TL=" + json.dumps(tl, ensure_ascii=False, separators=(",", ":")) + ";\nvar FT=" + json.dumps(ft, ensure_ascii=False, separators=(",", ":")) + ";\nvar FTLU=" + json.dumps(ftlu, ensure_ascii=False, separators=(",", ":")) + ";\nvar FTA=" + json.dumps(fta, ensure_ascii=False, separators=(",", ":")) + ";\nvar FDM=" + json.dumps(FDM, ensure_ascii=False, separators=(",", ":")) + ";\nvar SPL=" + json.dumps(SPLU, ensure_ascii=False, separators=(",", ":")) + ";\nvar SPA=" + json.dumps(SPACTS, ensure_ascii=False, separators=(",", ":")) + ";\nvar SPS=" + json.dumps(SPAUTO, ensure_ascii=False, separators=(",", ":")) + ";\nvar SPC=" + json.dumps(spc, ensure_ascii=False, separators=(",", ":")) + ";\nvar DFS=" + json.dumps(dfs, ensure_ascii=False, separators=(",", ":")) + ";\nvar SPR=" + json.dumps(spr, ensure_ascii=False, separators=(",", ":")) + ";\nvar SPF=" + json.dumps(spf, ensure_ascii=False, separators=(",", ":")) + ";\nvar IT=" + json.dumps(it, ensure_ascii=False, separators=(",", ":")) + ";\nvar ISP=" + json.dumps(isp, ensure_ascii=False, separators=(",", ":")) + ";\nvar WPN=" + json.dumps(wpn, ensure_ascii=False) + ";\nvar GR=" + json.dumps(gr, ensure_ascii=False, separators=(",", ":")) + ";\nvar WPW=" + json.dumps(wpw, ensure_ascii=False, separators=(",", ":")) + ";\nvar MST=" + json.dumps(mst, ensure_ascii=False, separators=(",", ":")) + ";\nvar CL=" + json.dumps(cl, ensure_ascii=False, separators=(",", ":")) + ";\n" + (REGBG if bgs else "") + (REGFT if ft else "") + (REGIT if (it or gr or wpw) else "") + (REGSP if spr else "") + (REGCLS if cl else "") + (REGSPC if spc else "") + REG + "})();\n"
        files["src/data/tp%02d-%s.js" % (i, bk["id"])] = body
    for g in (("AEP24", "assumption", "how many Subclass Upgrades (SU) you gain and when", "the data lists no counts, so one upgrade at each of levels 3, 6 and 17 is assumed. Change _picks in tsae_sub.py if the book says otherwise"),
              ("GHPG24", "engine", "Transformations (12) are four feats each (one per stage). Boon prerequisites, Boon effects on AC, speed, senses, resistance and uses, and Boon choices inside a Boon", "text only. The stage feats list the Boons to pick and the Flaws"),
              ("GHPG24", "optional feature", "Trapper Gadgets and Monster-Hide Armor modifications (TG:*), 11 Devourer mutations (DG:M), the Unstable Form table", "chosen at play time, text sits inside the class and subclass features"),
              ("GHPG24", "engine", "Heritage Traits taken twice, fixed skill or resistance or tool picks from a species trait, trait limited uses", "the species option list carries text, Darkvision, Speed, Climb and Swim only"),
              ("GHPG24", "engine", "Buckler, Tower Shield and Retractable Shield AC, Hunter's Armor on any worn armor, Momentum and Magazine values, Occultist spell slots", "text only"),
              ("All", "engine", "extra damage riders (Pyremaul fire, Agony mark, Condemner poison)", "shown on the weapon row note as xd, not added to a damage roll"),
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
    if not ONLY: files["reports/tp-gap.md"] = "\n".join(gap) + "\n"
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
