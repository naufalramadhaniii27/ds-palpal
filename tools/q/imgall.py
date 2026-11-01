#!/usr/bin/env python3
"""Bring every remaining 5etools image of the side categories into data/img (small WebP), so the Library can show all of them.
  python3 tools/q/imgall.py [--check]      lists what would be converted; without --check converts
Source: /home/claude/5etools-mirror-3/5etools-img. Files already in data/img are kept. Bestiary is handled by qimg.py."""
import os, sys
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
IMG = "/home/claude/5etools-mirror-3/5etools-img"; OUT = os.path.join(ROOT, "data", "img")
DIRS = {"backgrounds": 640, "bastions": 640, "charcreationoptions": 640, "classes": 720, "conditionsdiseases": 480, "decks": 480, "deities": 480, "feats": 640, "hazards": 640,
        "items": 640, "languages": 480, "objects": 640, "optionalfeatures": 480, "races": 640, "recipes": 640, "spells": 640, "traps": 640, "variantrules": 640, "vehicles": 720}
def main(write):
    n = tot = 0
    for d, w in DIRS.items():
        base = os.path.join(IMG, d)
        for dp, _, fs in os.walk(base):
            for f in fs:
                if not f.endswith(".webp"): continue
                rel = os.path.relpath(os.path.join(dp, f), IMG); dst = os.path.join(OUT, rel)
                if os.path.exists(dst): continue
                n += 1
                if write:
                    os.makedirs(os.path.dirname(dst), exist_ok=True)
                    im = Image.open(os.path.join(IMG, rel)); im.thumbnail((w, w * 2)); im.save(dst, "WEBP", quality=72, method=4); tot += os.path.getsize(dst)
    print(n, "files", ("converted, %.1f MB" % (tot / 1e6)) if write else "to convert")
main("--check" not in sys.argv)
