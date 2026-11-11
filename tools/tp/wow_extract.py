"""Collect every World of Warcraft (source WoW) entity of the 5etools-src data into one file in the homebrew collection layout.
Usage: python3 tools/tp/wow_extract.py [5etools-src dir] [out dir]. Output: <out>/5etools; World of Warcraft - 2024.json
Subclasses without own features (renamed copies of Player's Handbook subclasses) are left out: the renamed classes get the subclasses of their parent class in tools/tp_wow.py."""
import json, glob, os, sys, collections
SRC = sys.argv[1] if len(sys.argv) > 1 else "/home/claude/5etools-mirror-3/5etools-src"
OUT = sys.argv[2] if len(sys.argv) > 2 else os.environ.get("HB_DIR", "/home/claude/src-data/hb/collection")
NAME = "5etools; World of Warcraft - 2024.json"
out = collections.defaultdict(list)
for f in sorted(glob.glob(os.path.join(SRC, "data", "**", "*.json"), recursive=True)):
    rel = os.path.relpath(f, os.path.join(SRC, "data"))
    if rel.startswith(("generated", "adventure" + os.sep, "book" + os.sep)): continue
    try: d = json.load(open(f, encoding="utf-8"))
    except Exception: continue
    if not isinstance(d, dict): continue
    for k, v in d.items():
        if not isinstance(v, list): continue
        for x in v:
            if isinstance(x, dict) and x.get("source") == "WoW": out[k].append(x)
feat = collections.Counter((x["className"], x["subclassShortName"]) for x in out["subclassFeature"])
_seen = set(); _sub = []
for s in out["subclass"]:
    k = (s["className"], s["shortName"])
    if feat.get(k) and k not in _seen: _seen.add(k); _sub.append(s)          # one row per class and short name (a few are listed once per parent class)
out["subclass"] = _sub
_ff = set(); _fl = []
for x in out["subclassFeature"]:
    k = (x["className"], x["subclassShortName"], x["name"], x["level"])
    if k not in _ff: _ff.add(k); _fl.append(x)
out["subclassFeature"] = _fl
# spell class lists come from the generated lookup. Renamed classes (Priest, Mage, Hunter, Warrior) are the Player's Handbook classes of the same spells, so only the new classes are added
_lk = json.load(open(os.path.join(SRC, "data", "generated", "gendata-spell-source-lookup.json"), encoding="utf-8")).get("wow", {})
_NEW = ("Death Knight", "Demon Hunter", "Shaman", "Evoker")
for sp in out["spell"]:
    cl = (_lk.get(sp["name"].lower(), {}).get("class") or {})
    names = set()
    for src_, cs in cl.items():
        for c in cs:
            if src_ == "XPHB" or c in _NEW: names.add(c)
    sp["classes"] = {"fromClassList": [{"name": n, "source": "XPHB"} for n in sorted(names)]}
os.makedirs(OUT, exist_ok=True)
json.dump(out, open(os.path.join(OUT, NAME), "w", encoding="utf-8"), ensure_ascii=False, indent=0)
print({k: len(v) for k, v in sorted(out.items())})
