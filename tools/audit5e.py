#!/usr/bin/env python3
"""Q0 audit: every 5e.tools data category and every book against the built app.
  python3 tools/audit5e.py [DATA_DIR] [--md reports/q0-audit.md]
Match: an entry counts as present when its exact name appears as a quoted string in index.html (upper bound).
Edition: 2024 sources = XPHB XDMG XMM XSAC XScreen ABH FRAiF FRHoF NF LFL EFA RHW."""
import json, os, re, sys, glob
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = next((a for a in sys.argv[1:] if os.path.isdir(a)), "/home/claude/work/q0")
MD = sys.argv[sys.argv.index("--md") + 1] if "--md" in sys.argv else None
HTML = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
Y24 = {"XPHB", "XDMG", "XMM", "XSAC", "XScreen", "ABH", "FRAiF", "FRHoF", "NF", "LFL", "EFA", "RHW", "XScreenRHW"}
def has(n):
    return ('"%s"' % n) in HTML or ("'%s'" % n) in HTML or ('"%s"' % n.replace("'", "\\'")) in HTML or ('"%s"' % n.replace('"', '\\"')) in HTML
def load(f): return json.load(open(os.path.join(D, f)))
CATS = [("deity", "deities.json", "deity"), ("reward", "rewards.json", "reward"), ("recipe", "recipes.json", "recipe"),
        ("charoption", "charcreationoptions.json", "charoption"), ("condition", "conditionsdiseases.json", "condition"),
        ("disease", "conditionsdiseases.json", "disease"), ("status", "conditionsdiseases.json", "status"),
        ("cult", "cultsboons.json", "cult"), ("boon", "cultsboons.json", "boon"), ("trap", "trapshazards.json", "trap"),
        ("hazard", "trapshazards.json", "hazard"), ("vehicle", "vehicles.json", "vehicle"), ("vehicleUpgrade", "vehicles.json", "vehicleUpgrade"),
        ("object", "objects.json", "object"), ("deck", "decks.json", "deck"), ("card", "decks.json", "card"), ("table", "tables.json", "table"),
        ("psionic", "psionics.json", "psionic"), ("action", "actions.json", "action"), ("language", "languages.json", "language"),
        ("languageScript", "languages.json", "languageScript"), ("facility", "bastions.json", "facility"), ("variantrule", "variantrules.json", "variantrule"),
        ("lifeClass", "life.json", "lifeClass"), ("lifeBackground", "life.json", "lifeBackground"), ("lifeTrinket", "life.json", "lifeTrinket")]
rows = []; total = {}
for cat, f, k in CATS:
    items = load(f).get(k, [])
    t = [((x.get("name") or x.get("title") or "", x.get("source", "")) if isinstance(x, dict) else (str(x), "")) for x in items]
    y = [x for x in t if x[1] in Y24]
    rows.append((cat, len(t), sum(1 for n, s in t if n and has(n)), len(y), sum(1 for n, s in y if n and has(n))))
mons = []
for fp in sorted(glob.glob(os.path.join(D, "bestiary", "bestiary-*.json"))):
    try: mons += [(m["name"], m.get("source", "")) for m in json.load(open(fp)).get("monster", [])]
    except Exception: pass
if mons:
    y = [m for m in mons if m[1] in Y24]
    rows.append(("monster", len(mons), sum(1 for n, s in mons if has(n)), len(y), sum(1 for n, s in y if has(n))))
books = load("books.json")["book"]
out = ["# Q0: audit kategori 5e.tools lawan app", "", "Metode: nama entri sebagai string berkutip di index.html. Angka \"ada\" adalah batas atas.", "",
       "| Kategori | Total | Ada di app | Total 2024 | 2024 ada |", "|---|---|---|---|---|"]
for r in rows: out.append("| %s | %d | %d | %d | %d |" % r)
out += ["", "## Buku", "", "| Id | Buku | Grup | Nama buku di app |", "|---|---|---|---|"]
for b in books: out.append("| %s | %s | %s | %s |" % (b["id"], b["name"], b.get("group", ""), "ya" if b["name"] in HTML else "tidak"))
print("\n".join(out))
if MD: open(os.path.join(ROOT, MD), "w", encoding="utf-8").write("\n".join(out) + "\n")
