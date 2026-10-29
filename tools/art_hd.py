#!/usr/bin/env python3
"""HD copies of the art that is shown large (watermarks). The small files in img/ stay for lists and chips.
  python3 tools/art_hd.py SRC      SRC is the folder with emblems/ and icons/ (the art batch)
Writes img/hd/emblem/<class>.avif and img/hd/emblem/sub/<id>.avif at 768 px, img/hd/icon/<cat>/<id>.avif at 576 px (alpha kept)."""
import os, sys
from PIL import Image
SRC = sys.argv[1]; ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); OUT = os.path.join(ROOT, "img", "hd")
CAT = {"spells": "spell", "conditions": "condition", "damage-types": "damage", "skills": "skill", "items": "item", "creature-types": "creature",
       "item-categories": "itemcat", "spell-schools": "school", "weapon-mastery": "mastery", "abilities": "ability", "coins": "coin", "feat-categories": "featcat"}
def put(src, dst, px, q):
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im = Image.open(src).convert("RGBA"); im.thumbnail((px, px), Image.LANCZOS); im.save(dst, "AVIF", quality=q, speed=6); return os.path.getsize(dst)
tot = n = 0
for sub, rel, px, q in (("class", "emblem", 768, 62), ("subclass", "emblem/sub", 768, 62)):
    d = os.path.join(SRC, "emblems", sub)
    for f in sorted(os.listdir(d)):
        if f.endswith(".png"): tot += put(os.path.join(d, f), os.path.join(OUT, rel, f[:-4] + ".avif"), px, q); n += 1
for top in sorted(os.listdir(os.path.join(SRC, "icons"))):
    cat = CAT.get(top)
    if not cat: continue
    for dp, _, fs in os.walk(os.path.join(SRC, "icons", top)):
        for f in sorted(fs):
            if f.endswith(".png"): tot += put(os.path.join(dp, f), os.path.join(OUT, "icon", cat, f[:-4] + ".avif"), 576, 58); n += 1
print("%d files, %d KB" % (n, tot // 1024))
