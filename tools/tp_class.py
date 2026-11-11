"""Classes of third party books: source class data + own-wording overlay -> one class record the builder injects (window.WXC).
Used by tools/tp_build.py. Overlay shape (tools/tp/overlay/tvsc_<class>.py, CLASS = {...}):
  eq    ["Option A text", "Option B text"]        starting equipment, own words
  f     {"Feature name": "text"}                  one text per source class feature name (ASI, Epic Boon, subclass gain rows are skipped)
  res   [{"n","tag","reset":"short|long|short1","max": int | "pb" | "mod:INT" | [20 numbers]}]   limited-use trackers
  lu    [{"feature","lvl","max","reset","tag"}]   extra tracker rows in LU_X shape (src "class")
  acts  {"Feature": "action|bonus|reaction|free|other"}
  pick  [{"l","k":"opts","n","key","feature","title","list":[[name,text]]}]
  track {"Column": [20 strings]}                  only when the source table cannot be read
  ua / fs / asiX / extra: copied as given
"""
import re, json, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "tp"))
import hb

AB = {"str": "STR", "dex": "DEX", "con": "CON", "int": "INT", "wis": "WIS", "cha": "CHA"}
SKN = {"animal handling": "Animal Handling", "sleight of hand": "Sleight of Hand"}

def _short(t):
    t = t.replace("**", "")
    m = re.match(r"(.{40,170}?[.!?])(\s|$)", t)
    return (m.group(1) if m else t[:170]).strip()

def _cap(s): return SKN.get(s, s.title())

def _list(xs):
    out = []
    for x in xs or []:
        if isinstance(x, str):
            t = hb.strip(x).strip()
            t = {"light": "Light", "medium": "Medium", "heavy": "Heavy", "shield": "Shields", "simple": "Simple", "martial": "Martial"}.get(t, t)
            out.append(t)
    return ", ".join(out)

def _row_val(v):
    if isinstance(v, (int, float)): return str(v)
    if isinstance(v, str): return hb.strip(v)
    if isinstance(v, dict):
        if v.get("type") == "bonus": return "+%s" % v.get("value")
        if v.get("type") == "dice": return "".join("%sd%s" % (d.get("number"), d.get("faces")) for d in v.get("toRoll", []))
    return json.dumps(v)

def class_record(c, data, O, gap, tag, name=None):
    """c: source class. O: overlay dict for it. gap(kind, item, note) records what is missing."""
    n = name or c["name"]; sp = c.get("startingProficiencies", {})
    sk = {}
    for s in sp.get("skills", []):
        ch = s.get("choose")
        if ch: sk = {"n": ch["count"], "from": [_cap(x) for x in ch["from"]]}
        elif s.get("any"): sk = {"n": s["any"], "from": "all"}
    FULL = {"str": "Strength", "dex": "Dexterity", "con": "Constitution", "int": "Intelligence", "wis": "Wisdom", "cha": "Charisma"}
    alts = [[k for k in p if k in AB] for p in c.get("primaryAbility", [])]
    if not alts:            # 2014 books: only the multiclassing requirement is given
        rq = (c.get("multiclassing", {}).get("requirements") or {})
        alts = [[k for k in rq if k in AB]] if any(k in AB for k in rq) else []
    prim = " or ".join(" and ".join(FULL[k] for k in a) for a in alts)
    rec = {"name": n, "hd": c["hd"]["faces"], "prim": prim, "saves": [AB[k] for k in c["proficiency"]], "sk": sk,
           "armor": _list(sp.get("armor")), "weapons": _list(sp.get("weapons")), "tools": _list([t for t in (sp.get("toolProficiencies") and []) or []]),
           "lbl": tag}
    tl = []
    for t in sp.get("tools", []): tl.append(hb.strip(t))
    rec["tools"] = ", ".join(tl)
    cp = c.get("casterProgression")
    rec["tp"] = tag
    if cp in ("full", "1/2", "half", "1/3", "third", "pact"):
        rec["caster"] = {"1/2": "half", "1/3": "third"}.get(cp, cp)
    if c.get("spellcastingAbility"): rec["cast"] = AB[c["spellcastingAbility"]]
    rec["eq"] = O.get("eq") or []
    if not rec["eq"]: gap("class", n + " starting equipment", "no overlay text")
    # features
    f = []; seen = set(); full = {}
    texts = O.get("f", {})
    for cf in c.get("classFeatures", []):
        if isinstance(cf, dict): cf = cf["classFeature"]
        nm, cn, src, lv = (cf.split("|") + ["", "", "", ""])[:4]
        lv = int(lv or 1)
        if nm in ("Ability Score Improvement", "Epic Boon") or nm.endswith("Subclass Feature") or nm == "Subclass Feature": continue
        key = (nm, lv)
        if key in seen: continue
        seen.add(key)
        if nm.endswith(" Subclass"):
            f.append([lv, nm, "Choose a %s subclass." % n]); continue
        t = texts.get(nm)
        if not t: gap("class feature", "%s L%d %s" % (n, lv, nm), "no overlay text"); t = ""
        sh = O.get("s", {}).get(nm) or _short(t)
        f.append([lv, nm, sh])
        if t: full[nm] = t
    for nm in texts:
        if not any(r[1] == nm for r in f): gap("overlay", "%s feature %s" % (n, nm), "overlay text without a source class feature")
    rec["f"] = f
    rec["subs"] = {}; rec["pickSub"] = {}
    # table columns
    track = {}
    for g in c.get("classTableGroups", []):
        if g.get("rowsSpellProgression"): continue
        labs = [hb.strip(x) if isinstance(x, str) else (x.get("name") or "") for x in g["colLabels"]]
        for i, lab in enumerate(labs):
            if lab in ("Cantrips", "Prepared Spells") and (cp or c.get("cantripProgression") or c.get("preparedSpellsProgression")): continue
            if lab in ("Weapon Mastery",):
                try: rec["wm"] = [int(r[i]) for r in g["rows"]]
                except Exception: pass
                continue
            if lab.startswith("Proficiency"): continue
            track[lab] = [_row_val(r[i]) for r in g["rows"]]
    track.update(O.get("track", {}))
    if track: rec["track"] = track
    if c.get("cantripProgression"):
        cl = c["cantripProgression"]; ups = [i + 1 for i in range(1, 20) if cl[i] > cl[i - 1]]
        rec["cant"] = [cl[0]] + ups
        if any(cl[i] - cl[i - 1] > 1 for i in range(1, 20)): gap("engine", n + " cantrips known", "uneven progression, stored as steps of one")
    if c.get("preparedSpellsProgression"): rec["prep"] = c["preparedSpellsProgression"]
    if not rec.get("caster") and c.get("spellcastingAbility") and (c.get("cantripProgression") or c.get("preparedSpellsProgression")):
        rec["nslot"] = 1                       # casts without spell slots: the picker shows spells up to smax
        col = track.get("Max Spell Levels")
        rec["smax"] = [int(float(x)) if re.match(r"^\d+(\.\d+)?$", str(x)) else 0 for x in col] if col else [0] * 20
    # optional feature picks (Formulas, Discoveries, Tricks, ...): the list comes from the source, the text from O["opt"][type][name]
    pk = list(O.get("pick", []))
    for gi, g in enumerate(O.get("opts", [])):
        names = []; tx = {}
        for t in g["types"]:
            for o in data.get("optionalfeature", []):
                if t in o["featureType"] and o["name"] not in names:
                    names.append(o["name"]); tx[o["name"]] = O.get("opt", {}).get(t, {}).get(o["name"])
        for nm in names:
            if not tx[nm]: gap("optional feature", "%s | %s %s" % (n, "/".join(g["types"]), nm), "no overlay text"); tx[nm] = ""
        for nm in O.get("opt", {}).get(g["types"][0], {}):
            if nm not in names: gap("overlay", "%s option %s" % (n, nm), "overlay text without a source option")
        lst = [[nm, tx[nm]] for nm in sorted(names)]
        if g.get("col"):
            cum = [int(float(x)) if str(x).replace(".", "").isdigit() else 0 for x in track.get(g["col"], [])]
            steps = [(i + 1, cum[i] - (cum[i - 1] if i else 0)) for i in range(len(cum)) if cum[i] - (cum[i - 1] if i else 0) > 0]
        elif g.get("cum"):
            prev = 0; steps = []
            for lv in sorted(g["cum"], key=int):
                steps.append((int(lv), g["cum"][lv] - prev)); prev = g["cum"][lv]
        else:
            steps = [(lv, 1) for lv in g["levels"]]
        for lv, k in steps:
            pk.append({"l": lv, "k": "opts", "n": k, "key": "%s%d_%d" % (n.lower().replace(" ", ""), gi, lv), "feature": g["feature"], "title": "%s (%s)" % (g["title"], "level %d" % lv), "list": lst})
    if pk: rec["pick"] = pk
    for k in ("ua", "fs", "asiX", "resSub", "acSub", "fx", "eqg", "fs14"):
        if k in O: rec[k] = O[k]
    rs = []
    for r in O.get("res", []):
        r = dict(r); m = r.get("max")
        if isinstance(m, str) and m.startswith("col:"):
            col = track.get(m[4:])
            if not col: gap("class", n + " resource " + r["n"], "table column %s not found" % m[4:]); continue
            r["max"] = [int(float(x)) if re.match(r"^\d+(\.\d+)?$", str(x)) else 0 for x in col]
        rs.append(r)
    if rs: rec["res"] = rs
    mc = c.get("multiclassing", {}).get("proficienciesGained", {})
    g = {}
    if mc.get("armor"): g["armor"] = _list(mc["armor"])
    if mc.get("weapons"): g["weapons"] = _list(mc["weapons"])
    if mc.get("tools"): g["tools"] = ", ".join(hb.strip(t) for t in mc["tools"])
    if g: rec["mcg"] = g
    if len(alts) == 1: req = [[AB[k]] for k in alts[0]]
    else:
        common = [k for k in alts[0] if all(k in a for a in alts)]
        rest = []
        for a in alts:
            for k in a:
                if k not in common and AB[k] not in rest: rest.append(AB[k])
        req = [[AB[k]] for k in common] + ([rest] if rest else [])
    rec["mcreq"] = req
    ex = {"cf": full, "lu": [dict({"n": e["feature"]}, **dict(e, src="class", owner=n)) for e in O.get("lu", [])], "acts": {},
          "auto": O.get("auto"), "quick": O.get("quick"), "sub": c.get("subclassTitle")}
    for ft, kind in O.get("acts", {}).items():
        ex["acts"]["cls|%s|%s" % (n, ft)] = [["other", ft]] if kind == "other" else [[kind, "", ft]]
    return rec, ex
