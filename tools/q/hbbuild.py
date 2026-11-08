#!/usr/bin/env python3
"""Stage R: homebrew repo (TheGiddyLimit/homebrew) -> data/hb/<id>.json (one file per source, loaded lazily) + src/data/q09-hbindex.js (source list).
Facts only (levels, schools, stats, rarity, names of features). Free text is NOT copied. Sources already built by tools/tp_build.py are skipped.
  python3 tools/q/hbbuild.py [--check]"""
import os, sys, json, glob, re, hashlib
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import qmon
HB = "/home/claude/thegiddylimit/homebrew"
SKIP_DIRS = {"collection", "book", "adventure", "makebrew", "encounterbuilder"}
SCH = {"A": "Abjuration", "C": "Conjuration", "D": "Divination", "E": "Enchantment", "V": "Evocation", "I": "Illusion", "N": "Necromancy", "T": "Transmutation", "P": "Psionic"}
def strip(t): return re.sub(r"\{@\w+ ([^|}]*)[^}]*\}", r"\1", t) if isinstance(t, str) else str(t)
def sid(j): return re.sub(r"[^a-z0-9]+", "-", j.lower()).strip("-")[:60] + "-" + hashlib.md5(j.encode()).hexdigest()[:4]
def spell_row(x):
    t = x.get("time", [{}])[0]; r = x.get("range", {}); d = r.get("distance", {})
    rng = (str(d.get("amount", "")) + " " + d.get("type", "")).strip() if d else r.get("type", "")
    c = x.get("components", {}); comp = ", ".join(k.upper() for k in ("v", "s") if c.get(k)) + ((", M" if (c.get("v") or c.get("s")) else "M") if c.get("m") else "")
    du = x.get("duration", [{}])[0]
    dur = "Instantaneous" if du.get("type") == "instant" else ("%s %s%s" % (du.get("duration", {}).get("amount", ""), du.get("duration", {}).get("type", ""), "s" if du.get("duration", {}).get("amount", 1) != 1 else "") if du.get("type") == "timed" else du.get("type", ""))
    if du.get("concentration"): dur = "Concentration, " + dur
    lv = x.get("level", 0)
    cl = x.get("classes", {}).get("fromClassList", []) if isinstance(x.get("classes"), dict) else []
    return ("Spell • %s %s" % ("Cantrip" if lv == 0 else "Level %d" % lv, SCH.get(x.get("school"), "")),
            [["Casting time", "%s %s" % (t.get("number", ""), t.get("unit", ""))], ["Range", rng], ["Components", comp], ["Duration", dur], ["Classes", ", ".join(c["name"] for c in cl)]], [])
def item_row(x):
    rar = x.get("rarity", ""); att = x.get("reqAttune")
    return ("Item • %s" % (rar if rar and rar != "none" else x.get("type", "gear")),
            [["Type", x.get("type", "")], ["Rarity", rar], ["Attunement", "Required" if att is True else (strip(att) if att else "")], ["Value", "%s cp" % x["value"] if x.get("value") else ""], ["Weight", "%s lb." % x["weight"] if x.get("weight") else ""]], [])
def feat_row(x): return ("Feat", [["Category", x.get("category", "")], ["Prerequisite", "; ".join(", ".join("%s" % (v if not isinstance(v, (dict, list)) else "") for v in p.values()) for p in x.get("prerequisite", []) if isinstance(p, dict)).replace(";", ",")]], [])
def race_row(x):
    ab = x.get("ability", [])
    a = ", ".join("%s %+d" % (k.upper(), v) for k, v in (ab[0].items() if ab and isinstance(ab[0], dict) else []) if isinstance(v, int))
    return ("Race", [["Size", qmon.SZ.get((x.get("size") or ["M"])[0], "")], ["Speed", qmon.spd(x.get("speed"))], ["Ability scores", a]], [])
def bg_row(x): return ("Background", [["Skills", ", ".join(k.title() for k in (x.get("skillProficiencies") or [{}])[0].keys() if k not in ("any", "choose"))]], [])
def class_row(x):
    fe = []
    for f in x.get("classFeatures", []):
        s = f if isinstance(f, str) else f.get("classFeature", "")
        p = s.split("|"); fe.append("%s (level %s)" % (p[0], p[3] if len(p) > 3 and p[3] else "1"))
    return ("Class", [["Hit die", "d%s" % x["hd"]["faces"] if x.get("hd") else ""], ["Saves", ", ".join(k.upper() for k in x.get("proficiency", []))], ["Caster", x.get("casterProgression", "")]], ["**Features.** " + ", ".join(fe)] if fe else [])
def sub_row(x): return ("Subclass • " + x.get("className", ""), [["Class", x.get("className", "")], ["Short name", x.get("shortName", "")]], [])
def opt_row(x): return ("Option • " + ", ".join(x.get("featureType", [])), [["Type", ", ".join(x.get("featureType", []))], ["Prerequisite", ""]], [])
def table_row(x):
    return ("Table", [["Columns", " | ".join(strip(c) if isinstance(c, str) else "" for c in x.get("colLabels", []))]], [" | ".join(strip(c) if isinstance(c, str) else "" for c in r) for r in x.get("rows", [])[:60]])
def monster_row(x, s):
    return None
SIMPLE = {"spell": spell_row, "item": item_row, "baseitem": item_row, "magicvariant": lambda x: ("Item variant", [], []), "feat": feat_row, "race": race_row, "subrace": lambda x: ("Subrace", [["Race", x.get("raceName", "")]], []),
          "background": bg_row, "class": class_row, "subclass": sub_row, "optionalfeature": opt_row, "table": table_row, "variantrule": lambda x: ("Variant rule", [["Type", x.get("ruleType", "")]], []),
          "psionic": lambda x: ("Psionic • " + {"D": "Discipline", "T": "Talent"}.get(x.get("type"), ""), [["Order", x.get("order", "")]], []), "recipe": lambda x: ("Recipe", [["Type", x.get("type", "")], ["Makes", x.get("makes", "")]], []),
          "reward": lambda x: ("Reward • " + x.get("type", ""), [["Type", x.get("type", "")]], []), "deity": lambda x: ("Deity • " + x.get("pantheon", ""), [["Alignment", "".join(x.get("alignment", []))], ["Domains", ", ".join(x.get("domains", []))], ["Title", x.get("title", "")]], []),
          "disease": lambda x: ("Disease", [], []), "action": lambda x: ("Action", [], []), "condition": lambda x: ("Condition", [], []), "language": lambda x: ("Language", [["Type", x.get("type", "")]], []),
          "trap": lambda x: ("Trap", [], []), "hazard": lambda x: ("Hazard", [], []), "vehicle": lambda x: ("Vehicle", [["AC", x.get("ac")], ["HP", x.get("hp")], ["Speed", qmon.spd(x.get("speed"))]], []), "object": lambda x: ("Object", [["AC", x.get("ac")], ["HP", x.get("hp")]], []),
          "deck": lambda x: ("Deck", [], []), "cult": lambda x: ("Cult", [], []), "boon": lambda x: ("Boon", [], []), "charoption": lambda x: ("Character option", [], []), "facility": lambda x: ("Facility", [["Level", x.get("level", "")]], [])}
def integrated():
    """json source ids of files already built by tp_build"""
    import tp_build_books
    return tp_build_books.ids(HB)
def main(write):
    skip = set()
    sys.path.insert(0, os.path.join(ROOT, "tools"))
    try:
        import tp_build
        files = []
        for b in tp_build.BOOKS: files += b["file"] if isinstance(b["file"], list) else [b["file"]]
        for f in files:
            for p in glob.glob(os.path.join(HB, "collection", f)) + glob.glob(os.path.join(HB, "*", f)):
                for s in json.load(open(p, encoding="utf-8")).get("_meta", {}).get("sources", []): skip.add(s["json"])
    except Exception as e: print("tp_build books not read:", e)
    meta = {}; rows = {}; allm = {}; nskip = 0
    for d in sorted(os.listdir(HB)):
        if not os.path.isdir(os.path.join(HB, d)) or d.startswith("_") or d in SKIP_DIRS: continue
        for f in sorted(glob.glob(os.path.join(HB, d, "*.json"))):
            try: j = json.load(open(f, encoding="utf-8"))
            except Exception: continue
            for s in j.get("_meta", {}).get("sources", []): meta.setdefault(s["json"], s)
            for k, v in j.items():
                if not isinstance(v, list) or k.startswith("_"): continue
                for x in v:
                    if not isinstance(x, dict) or "name" not in x or "source" not in x: continue
                    src = x["source"]
                    if src in skip: nskip += 1; continue
                    if k == "monster":
                        allm[(x["name"], src)] = x; continue
                    fn = SIMPLE.get(k)
                    if not fn: continue
                    try: sub, tl, p = fn(x)
                    except Exception: continue
                    rows.setdefault(src, []).append((k, x, sub, tl, p))
    # monsters (resolve copies inside the same source or any homebrew source)
    mons = {}
    for (n, src), x in allm.items():
        if src in skip: continue
        r = qmon.resolve(x, allm) if x.get("_copy") else x
        if r is None or not r.get("ac") or not r.get("hp"): continue
        mons.setdefault(src, []).append(r)
    out = {}; idx = []
    for src in sorted(set(rows) | set(mons)):
        m = meta.get(src, {}); abbr = m.get("abbreviation") or src[:6]; name = m.get("full") or src; auth = ", ".join(m.get("authors", []))
        rs = []
        for k, x, sub, tl, p in rows.get(src, []):
            n = "%s [%s]" % (x["name"], abbr)
            rs.append({"n": n, "s": sid(src), "sub": sub + " • " + abbr, "tl": [t for t in tl if t[1] not in ("", None)], "p": p, "tx": (x["name"] + " " + sub + " " + name).lower()})
        for x in mons.get(src, []):
            r = qmon.row(x, sid(src)); r["n"] = "%s [%s]" % (x["name"], abbr); r["sub"] += " • " + abbr; rs.append(r)
        if not rs: continue
        seen = {}
        for r in rs:
            if r["n"] in seen: seen[r["n"]] += 1; r["n"] = "%s #%d" % (r["n"], seen[r["n"]])
            else: seen[r["n"]] = 1
        out[sid(src)] = rs; idx.append({"id": sid(src), "tag": abbr[:8], "name": name, "desc": ("by " + auth) if auth else "Homebrew", "n": len(rs), "hb": 1})
    print("sources", len(idx), "rows", sum(len(v) for v in out.values()), "skipped (already integrated)", nskip)
    if write:
        dst = os.path.join(ROOT, "data", "hb"); os.makedirs(dst, exist_ok=True)
        for f in glob.glob(dst + "/*.json"): os.remove(f)
        tot = 0
        for k, v in out.items():
            s = json.dumps(v, ensure_ascii=False, separators=(",", ":")); tot += len(s); open(os.path.join(dst, k + ".json"), "w", encoding="utf-8").write(s)
        print("bytes", tot)
        L = [{"id": i["id"], "tag": i["tag"], "name": i["name"], "desc": i["desc"] + " (%d entries)" % i["n"], "feats": [], "spells": [], "rows": [], "hb": 1, "tp": 1, "legacy": 0} for i in idx]
        open(os.path.join(ROOT, "src", "data", "q09-hbindex.js"), "w", encoding="utf-8").write("DataEnv.declare(\"HBIDX\");\n/* Generated by tools/q/hbbuild.py. Homebrew sources, rows load from data/hb/<id>.json when the source is on. */\n(function(){var L=" + json.dumps(L, ensure_ascii=False, separators=(",", ":")) + ";DataEnv.slot.WX=DataEnv.slot.WX||{src:[]};DataEnv.slot.HBIDX=L;L.forEach(function(s){if(!DataEnv.slot.WX.src.some(function(x){return x.id===s.id}))DataEnv.slot.WX.src.push(s)})})();\n")
if __name__ == "__main__": main("--check" not in sys.argv)
