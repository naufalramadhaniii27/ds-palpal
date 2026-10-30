#!/usr/bin/env python3
"""Print source text of Valda's Spire of Secrets 2024 as plain text for rewriting (read only).
  python3 tools/tp/dump.py class Alchemist          class table columns, features of the class
  python3 tools/tp/dump.py sub Alchemist [Name ...] subclasses of a class (all, or only those named) with level and features
  python3 tools/tp/dump.py opt BF [Name ...]        optional features of a feature type (BF, DO, T, WC, GH, S, AInit, MP, MV:V, MV:C, MV:HK, MV:MS, MV:GW, DO)
"""
import sys, os, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import hb

def walk(e):
    if isinstance(e, str): return hb.strip(e)
    if isinstance(e, list): return " ".join(walk(x) for x in e)
    if isinstance(e, dict):
        t = e.get("type")
        if t in ("entries", "inset", "insetReadaloud", "section", "quote"):
            return ("[" + e["name"] + "] " if e.get("name") else "") + " ".join(walk(x) for x in e.get("entries", []))
        if t == "list": return " | ".join(walk(x) for x in e["items"])
        if t == "item": return e.get("name", "") + ": " + walk(e.get("entry") or e.get("entries") or "")
        if t == "table": return "TABLE %s: " % hb.strip(e.get("caption", "")) + " / ".join(" , ".join(walk(c) for c in r) for r in e["rows"])
        if t == "refSubclassFeature": return "(see feature %s)" % e.get("subclassFeature")
        return json.dumps(e)[:400]
    return str(e)

d = hb.load("Mage Hand Press; Valda's Spire of Secrets - 2024.json")
a = sys.argv[1:]
if len(a) < 2: print(__doc__); sys.exit(1)
if a[0] == "class":
    c = [x for x in d["class"] if x["name"].lower() == a[1].lower()][0]
    print("CLASS", c["name"], "hit die d%d" % c["hd"]["faces"], "saves", c["proficiency"], "spell ability", c.get("spellcastingAbility"))
    for g in c.get("classTableGroups", []):
        if g.get("rowsSpellProgression"): continue
        labs = [hb.strip(x) if isinstance(x, str) else x.get("name") for x in g["colLabels"]]
        print("TABLE columns:", labs)
        for i, r in enumerate(g["rows"]): print("  L%d" % (i + 1), [hb.strip(str(x)) if not isinstance(x, dict) else walk(x) for x in r])
    for f in sorted([f for f in d["classFeature"] if f["className"] == c["name"]], key=lambda f: f["level"]):
        print("\n## L%d %s\n%s" % (f["level"], f["name"], walk(f["entries"])))
elif a[0] == "sub":
    names = a[2:]
    for s in d["subclass"]:
        if s["className"].lower() != a[1].lower() or (names and s["name"] not in names): continue
        print("\n==== SUBCLASS", s["name"], "(", s["className"], ")")
        if s.get("additionalSpells"): print("additionalSpells:", json.dumps(s["additionalSpells"])[:600])
        for f in sorted([f for f in d["subclassFeature"] if f.get("subclassShortName") == s["shortName"] and f["className"] == s["className"]], key=lambda f: f["level"]):
            print("\n## L%d %s\n%s" % (f["level"], f["name"], walk(f["entries"])))
elif a[0] == "opt":
    names = a[2:]
    for o in d["optionalfeature"]:
        if a[1] in o["featureType"] and (not names or o["name"] in names):
            print("\n## %s  prerequisite: %s%s\n%s" % (o["name"], walk(o.get("prerequisite", "")) if o.get("prerequisite") else "none", ("  extra: " + json.dumps({k: o[k] for k in ("resist", "additionalSpells", "skillProficiencies") if k in o})[:300]) if any(k in o for k in ("resist", "additionalSpells", "skillProficiencies")) else "", walk(o["entries"])))
