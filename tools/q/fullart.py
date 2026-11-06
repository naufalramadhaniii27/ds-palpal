#!/usr/bin/env python3
"""Full creature art instead of tokens (owner 2026-11-06: "pake gambar full nya, bukan gambar token nya").
Many creatures were mapped to a round token because the older image mirror had no full picture for them. The 5etools fluff files
name the full picture, often a shared one (Owlbear -> bestiary/XMM/Owlbears). This converts those pictures into data/img and points
the Library rows (src/data/q07-bestiary.js) and window.CRIMG (src/data/q12-crimg.js) at them. 2024 creatures that had 2014 art get
their 2024 art. Run after qbuild.py / crimg.py:
  python3 tools/q/fullart.py <5etools-img checkout> <5etools-src checkout>"""
import json, os, sys, glob, re
from PIL import Image
IMG, SRC = sys.argv[1], sys.argv[2]
full = set()
for dp, _, fs in os.walk(os.path.join(IMG, "bestiary")):
    for f in fs:
        if f.endswith(".webp") and "/tokens" not in dp: full.add(os.path.relpath(os.path.join(dp, f), IMG)[:-5])
F = {}
for p in glob.glob(os.path.join(SRC, "data/bestiary/fluff-bestiary-*.json")):
    for x in json.load(open(p, encoding="utf-8")).get("monsterFluff", []): F[(x["name"], x["source"])] = x
def imgs(x, d=0):
    if x.get("images"): return [i["href"]["path"][:-5] for i in x["images"] if i.get("href", {}).get("type") == "internal" and "/tokens/" not in i["href"]["path"]]
    c = x.get("_copy")
    if c and d < 6:
        y = F.get((c.get("name"), c.get("source")))
        if y: return imgs(y, d + 1)
    return []
def pick(name, src):
    c = [p for p in imgs(F.get((name, src), {})) if p in full]
    if not c and "bestiary/%s/%s" % (src, name) in full: c = ["bestiary/%s/%s" % (src, name)]
    return c[0] if c else None
used = set()
def conv(rel):
    dst = os.path.join("data/img", rel + ".webp")
    if not os.path.exists(dst):
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        im = Image.open(os.path.join(IMG, rel + ".webp")); im.thumbnail((480, 960)); im.save(dst, "WEBP", quality=70, method=4)
    used.add(rel)
# Library rows
p = "src/data/q07-bestiary.js"; s = open(p, encoding="utf-8").read(); i = s.index("var ROWS=") + 9; j = s.index("];", i) + 1; rows = json.loads(s[i:j]); n1 = 0
for r in rows:
    im = r.get("im") or ""
    if "/tokens/" in im:
        f = pick(r["n"], im.split("/")[2])
        if f: conv(f); r["im"] = f; n1 += 1
open(p, "w", encoding="utf-8").write(s[:i] + json.dumps(rows, ensure_ascii=False, separators=(",", ":")) + s[j:])
# CRIMG
p = "src/data/q12-crimg.js"; s = open(p, encoding="utf-8").read(); a = s.index("{"); b = s.rindex("}") + 1; cr = json.loads(s[a:b]); n2 = 0
for k, v in cr.items():
    if "/tokens/" in v or v.startswith("bestiary/MM/"):
        f = pick(k, "XMM") or ("/tokens/" in v and pick(k, v.split("/")[2]))
        if f: conv(f); cr[k] = f; n2 += 1
open(p, "w", encoding="utf-8").write(s[:a] + json.dumps(cr, ensure_ascii=False, separators=(",", ":")) + s[b:])
print(n1, "Library rows and", n2, "creature pictures now use full art,", len(used), "pictures")
