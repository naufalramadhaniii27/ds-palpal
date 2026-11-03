#!/usr/bin/env python3
"""N42: the accessibility tree of the 74 screens of style_snapshot.py (interactive roles only: role, name, states, in page order).
  python3 tests/a11y_tree.py            compare with tests/a11y/tree.json. Fails on a button, link or field without a name that is new, and on any change not in the file.
  python3 tests/a11y_tree.py --update   write the file (say why in the commit message)
Unnamed controls that exist today are listed in tests/a11y/unnamed.json as a ratchet: the count may fall, never rise."""
import asyncio, json, os, sys
HERE = os.path.dirname(os.path.abspath(__file__)); A = sys.argv[1:]; UPDATE = "--update" in A; sys.argv = [sys.argv[0]]
__file__ = os.path.join(HERE, "style_snapshot.py"); src = open(__file__).read(); exec(src.split("def diff(")[0])
AX = {}
TREE = os.path.join(HERE, "a11y", "tree.json"); UNN = os.path.join(HERE, "a11y", "unnamed.json")
def key(screen, i, e): return "%s #%d %s" % (screen, i, e[0])
async def main():
    global VARIANTS
    VARIANTS = True
    await take(os.path.join(HERE, "out", "a11y-snap.json"))
    cur = {k: v for k, v in AX.items()}
    unnamed = sorted("%s | %s" % (scr, e[0]) for scr, L in cur.items() for e in L if not e[1].strip())
    os.makedirs(os.path.dirname(TREE), exist_ok=True)
    if UPDATE:
        json.dump(cur, open(TREE, "w"), ensure_ascii=False, separators=(",", ":")); json.dump(unnamed, open(UNN, "w"), indent=0)
        print("wrote %d screens, %d controls, %d without a name" % (len(cur), sum(len(v) for v in cur.values()), len(unnamed))); return 0
    old = json.load(open(TREE)); oldun = json.load(open(UNN)); bad = []
    from collections import Counter
    nu, ou = Counter(unnamed), Counter(oldun)
    for k in nu:
        if nu[k] > ou.get(k, 0): bad.append("new control without a name: %s (x%d, was %d)" % (k, nu[k], ou.get(k, 0)))
    for scr in sorted(set(old) | set(cur)):
        if scr not in cur or scr not in old: bad.append("screen %s %s" % (scr, "missing now" if scr not in cur else "is new")); continue
        o = [json.dumps(e, ensure_ascii=False) for e in old[scr]]; c = [json.dumps(e, ensure_ascii=False) for e in cur[scr]]
        if o != c:
            gone = [x for x in o if x not in c][:3]; new = [x for x in c if x not in o][:3]
            bad.append("%s: %d -> %d controls. gone %s. new %s" % (scr, len(o), len(c), gone, new))
    print("a11y_tree: %d screens, %d controls, %d without a name (file has %d)" % (len(cur), sum(len(v) for v in cur.values()), len(unnamed), len(oldun)))
    for x in bad[:40]: print("FAIL", x[:300])
    print("a11y_tree:", "ok" if not bad else "%d problems" % len(bad)); return 1 if bad else 0
sys.exit(asyncio.run(main()))
