#!/usr/bin/env python3
"""Read only. Print source entries of any third party book as plain text.
  python3 tools/tp/dump2.py "Exploring Eberron - 2024" list                 kinds and counts
  python3 tools/tp/dump2.py "Exploring Eberron - 2024" race [Name]          also: background feat spell item itemGroup magicvariant reward
  python3 tools/tp/dump2.py "Exploring Eberron - 2024" sub [Class] [Name]   subclasses with their features
"""
import sys, os, json, glob
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
f = [x for x in glob.glob(os.path.join(os.path.dirname(hb.__file__), "..", "..", "..", "thegiddylimit", "homebrew", "collection", "*")) if sys.argv[1] in x] or [x for x in glob.glob("/home/claude/thegiddylimit/homebrew/collection/*") if sys.argv[1] in x]
d = json.load(open(f[0])); a = sys.argv[2:]
if not a or a[0] == "list":
    print({k: len(v) for k, v in d.items() if isinstance(v, list)}); sys.exit()
if a[0] == "sub":
    cl = a[1] if len(a) > 1 else None; nm = a[2] if len(a) > 2 else None
    for s in d["subclass"]:
        if (cl and s["className"].lower() != cl.lower()) or (nm and s["name"] != nm): continue
        print("\n==== SUBCLASS", s["name"], "(", s["className"], ")")
        if s.get("additionalSpells"): print("additionalSpells:", json.dumps(s["additionalSpells"])[:600])
        for x in sorted([x for x in d["subclassFeature"] if x.get("subclassShortName") == s["shortName"] and x["className"] == s["className"]], key=lambda x: x["level"]):
            print("\n## L%d %s\n%s" % (x["level"], x["name"], walk(x["entries"])))
else:
    for o in d[a[0]]:
        if len(a) > 1 and o["name"] != a[1]: continue
        meta = {k: v for k, v in o.items() if k not in ("entries", "name", "source", "page", "fluff", "hasFluff", "hasFluffImages", "_copy")}
        print("\n## %s\n%s\n%s" % (o["name"], json.dumps(meta)[:700], walk(o.get("entries", ""))))
