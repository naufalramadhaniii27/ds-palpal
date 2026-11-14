"""World of Warcraft classes: a class that is a reskin of a Player's Handbook class (source field reskinOf) is built from the app's own record of the parent class.
Used by tools/tp_build.py. Overlay shape (tools/tp/overlay/twow_<class>.py, CLASS = {...}):
  parent  "Paladin"                              the Player's Handbook class the record is copied from
  f       {"Feature": "own wording text"}        one text per feature the WoW class list names with source WoW
  s       {"Feature": "short text"}              optional short line (else the first sentence of the text)
  add     [[level, "Feature", "text"]]           features added when the source class has no feature list of its own
  drop    ["Feature"]                            parent features that the class does not have
  res_drop ["Tracker name"]  res [...]  lu [...]  acts {...}  auto [[level, "Spell,Spell"]]  caster "half"  cast "CHA"  eq [...]   as in tools/tp_class.py
Parent features that the WoW list keeps keep their short line, and their full text is read from the parent at run time (field cfa).
"""
import json, os, re, subprocess, copy
HERE = os.path.dirname(os.path.abspath(__file__))
_PHB = {}

def phb():
    if not _PHB:
        out = "/tmp/phb-classes.json"
        subprocess.check_call(["node", os.path.join(HERE, "tp", "dump_phb_classes.js"), os.path.dirname(HERE), out])
        _PHB.update(json.load(open(out)))
    return _PHB

def _short(t):
    t = t.replace("**", "")
    m = re.match(r"(.{40,170}?[.!?])(\s|$)", t)
    return (m.group(1) if m else t[:170]).strip()

def reskin_record(n, wowc, O, tag, gap):
    """n: new class name. wowc: source class (its classFeatures list). O: overlay. Returns (rec, ex) like tp_class.class_record."""
    P = phb(); par = O["parent"]; base = P["CLASSES"][par]
    rec = copy.deepcopy(base); rec["name"] = n; rec["lbl"] = tag; rec["tp"] = tag; rec["inh"] = par
    for k in ("subs", "pickSub"): rec[k] = {}
    pf = {}
    for r in base["f"]: pf.setdefault(r[1], []).append(r)
    texts = O.get("f", {}); f = []; cfa = {}; full = {}; seen = set()
    lst = wowc.get("classFeatures") if wowc else None
    if lst:
        for cf in lst:
            if isinstance(cf, dict): cf = cf["classFeature"]
            nm, cn, src, lv = (cf.split("|") + ["", "", "", ""])[:4]; lv = int(lv or 1)
            if nm in ("Ability Score Improvement", "Subclass Feature") or nm in O.get("drop", []): continue
            if (nm, lv) in seen: continue
            seen.add((nm, lv))
            if nm.endswith(" Subclass"): f.append([lv, n + " Subclass", "Choose a %s subclass." % n]); continue
            if src == "WoW":
                t = texts.get(nm)
                if not t: gap("class feature", "%s L%d %s" % (n, lv, nm), "no overlay text"); t = ""
                f.append([lv, nm, O.get("s", {}).get(nm) or _short(t)])
                if t: full[nm] = t
            else:
                row = [r for r in pf.get(nm, []) if r[0] == lv] or pf.get(nm, [])
                if not row: gap("class feature", "%s L%d %s" % (n, lv, nm), "not found in parent class %s" % par); continue
                f.append([lv, nm, row[0][2]] + list(row[0][3:])); cfa[nm] = nm
    else:
        for r in base["f"]:
            if r[1] in O.get("drop", []): continue
            if r[1] == par + " Subclass": f.append([r[0], n + " Subclass", "Choose a %s subclass." % n]); continue
            f.append(list(r)); cfa[r[1]] = r[1]
        for lv, nm, t in O.get("add", []):
            f.append([lv, nm, O.get("s", {}).get(nm) or _short(t)]); full[nm] = t
    for nm in texts:
        if nm not in full: gap("overlay", "%s feature %s" % (n, nm), "overlay text without a source class feature")
    f.sort(key=lambda r: r[0]); rec["f"] = f
    rs = [r for r in base.get("res", []) if r["n"] not in O.get("res_drop", [])] + [dict(r) for r in O.get("res", [])]
    if rs: rec["res"] = rs
    elif "res" in rec: del rec["res"]
    for k in ("caster", "cast", "eq"):
        if k in O: rec[k] = O[k]
    for k in ("pick", "fx", "ua", "acSub", "hpSub", "resSub", "fs"):
        if k in O: rec[k] = O[k]
    mcreq = O.get("mcreq")
    ex = {"cf": full, "cfa": cfa, "cfp": par, "inh": par, "lu": [dict({"n": e["feature"]}, **dict(e, src="class", owner=n)) for e in O.get("lu", [])], "acts": {},
          "auto": O.get("auto"), "quick": O.get("quick"), "sub": "%s Subclass" % n}
    for ft, kind in O.get("acts", {}).items():
        ex["acts"]["cls|%s|%s" % (n, ft)] = [["other", ft]] if kind == "other" else [[kind, "", ft]]
    ex["mcreq"] = mcreq
    return rec, ex
