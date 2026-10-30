#!/usr/bin/env python3
"""Check the overlay of one class of Valda's Spire of Secrets 2024 without writing any file.
  python3 tools/tp/gapcheck.py Warden"""
import sys, os, re, glob, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, "tools")); sys.path.insert(0, HERE)
import tp_build, hb
cn = sys.argv[1]
tp_build.GAP.clear()
tp_build.build()
rows = [g for g in tp_build.GAP if cn.lower() in " ".join(g[1:]).lower() or g[1] in ("subclass", "subclass feature", "overlay") and False]
data = hb.load("Mage Hand Press; Valda's Spire of Secrets - 2024.json")
subs = [s["name"] for s in data["subclass"] if s["className"] == cn]
rows = [g for g in tp_build.GAP if (cn in g[3] or cn in g[2] or any(g[2].startswith(s + " |") or g[2] == s for s in subs)) and g[1] != "engine"]
print("GAP rows for %s: %d" % (cn, len(rows)))
for g in rows[:80]: print("  ", " | ".join(g[1:]))
# style check on every overlay file that mentions the class
bad = 0
def texts(o):
    if isinstance(o, str): yield o
    elif isinstance(o, dict):
        for v in o.values(): yield from texts(v)
    elif isinstance(o, (list, tuple)):
        for v in o: yield from texts(v)
for p in glob.glob(os.path.join(HERE, "overlay", "tvs*_*.py")) + glob.glob(os.path.join(HERE, "overlay", "tvsc_*.py")):
    b = os.path.basename(p)
    if cn.lower() not in b.lower(): continue
    sp = importlib.util.spec_from_file_location(b[:-3], p); m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m)
    for name in ("CLASS", "SUB"):
        for t in texts(getattr(m, name, {})):
            for pat, why in ((r"[—–]", "em/en dash"), (r";", "semicolon"), (r"\{@", "source tag"), (r"\s{2,}", "double space")):
                if re.search(pat, t): bad += 1; print("STYLE", b, why, "->", t[:90])
print("style problems:", bad)
