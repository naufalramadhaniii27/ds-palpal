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

def class_record(c, data, O, gap, tag):
    """c: source class. O: overlay dict for it. gap(kind, item, note) records what is missing."""
    n = c["name"]; sp = c.get("startingProficiencies", {})
    sk = {}
    for s in sp.get("skills", []):
        ch = s.get("choose")
        if ch: sk = {"n": ch["count"], "from": [_cap(x) for x in ch["from"]]}
        elif s.get("any"): sk = {"n": s["any"], "from": "all"}
    prim = ""
    for p in c.get("primaryAbility", [])[:1]:
        prim = "/".join(AB[k] for k in p if k in AB)
    rec = {"name": n, "hd": c["hd"]["faces"], "prim": prim, "saves": [AB[k] for k in c["proficiency"]], "sk": sk,
           "armor": _list(sp.get("armor")), "weapons": _list(sp.get("weapons")), "tools": _list([t for t in (sp.get("toolProficiencies") and []) or []]),
           "lbl": tag}
    tl = []
    for t in sp.get("tools", []): tl.append(hb.strip(t))
    rec["tools"] = ", ".join(tl)
    cp = c.get("casterProgression")
    if cp in ("full", "1/2", "half", "1/3", "third", "pact"):
        rec["caster"] = {"1/2": "half", "1/3": "third"}.get(cp, cp)
    if c.get("spellcastingAbility"): rec["cast"] = AB[c["spellcastingAbility"]]
    rec["eq"] = O.get("eq") or []
    if not rec["eq"]: gap("class", n + " starting equipment", "no overlay text")
    # features
    f = []; seen = set()
    texts = O.get("f", {})
    for cf in c.get("classFeatures", []):
        if isinstance(cf, dict): continue
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
        f.append([lv, nm, t])
    for nm in texts:
        if not any(r[1] == nm for r in f): gap("overlay", "%s feature %s" % (n, nm), "overlay text without a source class feature")
    rec["f"] = f
    # table columns
    track = {}
    for g in c.get("classTableGroups", []):
        if g.get("rowsSpellProgression"): continue
        labs = [hb.strip(x) if isinstance(x, str) else (x.get("name") or "") for x in g["colLabels"]]
        for i, lab in enumerate(labs):
            if lab in ("Cantrips", "Prepared Spells") and cp: continue
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
    for k in ("res", "pick", "ua", "fs", "asiX", "resSub", "acSub"):
        if k in O: rec[k] = O[k]
    mc = c.get("multiclassing", {}).get("proficienciesGained", {})
    g = {}
    if mc.get("armor"): g["armor"] = _list(mc["armor"])
    if mc.get("weapons"): g["weapons"] = _list(mc["weapons"])
    if mc.get("tools"): g["tools"] = ", ".join(hb.strip(t) for t in mc["tools"])
    if g: rec["mcg"] = g
    rec["mcreq"] = [[x for x in p if x in AB.values()] for p in [[AB[k] for k in pa] for pa in c.get("primaryAbility", [])]] or [[prim]]
    return rec
