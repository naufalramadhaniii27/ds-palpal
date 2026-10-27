#!/usr/bin/env python3
"""Art pipeline. python3 tools/art_pipeline.py SRC_DIR [--only emblems,scenes]
SRC_DIR is art/batch from the Codex branch (a checkout, never copied into this repo).
Writes small AVIF files to img/ and img/manifest.json (id to path, size, average colour).
  emblems/class/<id>.png   to img/emblem/<id>.avif   384 px, alpha kept
  scenes/class/<id>-pc     to img/scene/<id>-pc.avif    1600 px wide
  scenes/class/<id>-phone  to img/scene/<id>-phone.avif  720 px wide
  scenes/tab|builder|screen|species|background  to img/scn/<group>/<id>-pc|phone.avif
  vignettes/empty|moment|state  to img/vig/<group>/<id>.avif 512 px
  emblems/subclass  to img/emblem/sub/<id>.avif 256 px
Only images listed in the Codex notes as complete are used; names must match the app ids (lower case)."""
import json, os, sys
from PIL import Image
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
a = sys.argv[1:]
if not a: sys.exit(__doc__)
SRC = a[0]; ONLY = (a[a.index("--only") + 1].split(",") if "--only" in a else ["emblems", "scenes", "icons", "scenes2", "vignettes", "subclass"])
OUT = os.path.join(ROOT, "img"); os.makedirs(os.path.join(OUT, "emblem"), exist_ok=True); os.makedirs(os.path.join(OUT, "scene"), exist_ok=True)
MAN = os.path.join(OUT, "manifest.json")
man = json.load(open(MAN)) if os.path.exists(MAN) else {"emblem": {}, "scene": {}}
def avg(im):
    t = im.convert("RGB").resize((1, 1), Image.LANCZOS).getpixel((0, 0)); return "#%02x%02x%02x" % t
def save(im, dst, q, w):
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(dst, "AVIF", quality=q, speed=6); return im
tot = 0
if "emblems" in ONLY:
    d = os.path.join(SRC, "emblems", "class")
    for f in sorted(os.listdir(d)):
        if not f.endswith(".png"): continue
        k = f[:-4]; im = Image.open(os.path.join(d, f)).convert("RGBA"); dst = os.path.join(OUT, "emblem", k + ".avif")
        im = save(im, dst, 62, 384); man["emblem"][k] = {"p": "img/emblem/%s.avif" % k, "w": im.width, "h": im.height, "c": avg(im)}; tot += os.path.getsize(dst)
if "scenes" in ONLY:
    d = os.path.join(SRC, "scenes", "class")
    for f in sorted(os.listdir(d)):
        if not f.endswith(".png"): continue
        k = f[:-4]; kind = "pc" if k.endswith("-pc") else "phone" if k.endswith("-phone") else None
        if not kind: continue
        cid = k.rsplit("-", 1)[0]; im = Image.open(os.path.join(d, f)).convert("RGB"); dst = os.path.join(OUT, "scene", k + ".avif")
        im = save(im, dst, 48, 1600 if kind == "pc" else 720)
        e = man["scene"].setdefault(cid, {}); e[kind] = {"p": "img/scene/%s.avif" % k, "w": im.width, "h": im.height}; e["c"] = avg(im); tot += os.path.getsize(dst)
if "scenes2" in ONLY:
    man["scn"] = {}
    for grp in ("tab", "builder", "screen", "species", "background"):
        d = os.path.join(SRC, "scenes", grp)
        if not os.path.isdir(d): continue
        os.makedirs(os.path.join(OUT, "scn", grp), exist_ok=True)
        for f in sorted(os.listdir(d)):
            if not f.endswith(".png"): continue
            k = f[:-4]; kind = "pc" if k.endswith("-pc") else "phone" if k.endswith("-phone") else None
            if not kind: continue
            cid = k.rsplit("-", 1)[0]; im = Image.open(os.path.join(d, f)).convert("RGB"); dst = os.path.join(OUT, "scn", grp, k + ".avif")
            im = save(im, dst, 48, 1600 if kind == "pc" else 720)
            e = man["scn"].setdefault(grp, {}).setdefault(cid, {}); e[kind] = "img/scn/%s/%s.avif" % (grp, k); e["c"] = avg(im); tot += os.path.getsize(dst)
if "vignettes" in ONLY:
    man["vig"] = {}
    for grp in ("empty", "moment", "state"):
        d = os.path.join(SRC, "vignettes", grp)
        if not os.path.isdir(d): continue
        os.makedirs(os.path.join(OUT, "vig", grp), exist_ok=True)
        for f in sorted(os.listdir(d)):
            if not f.endswith(".png"): continue
            dst = os.path.join(OUT, "vig", grp, f[:-4] + ".avif"); im = Image.open(os.path.join(d, f)).convert("RGBA"); im.thumbnail((512, 512), Image.LANCZOS); im.save(dst, "AVIF", quality=58, speed=6)
            man["vig"].setdefault(grp, []).append(f[:-4]); tot += os.path.getsize(dst)
if "subclass" in ONLY:
    d = os.path.join(SRC, "emblems", "subclass"); os.makedirs(os.path.join(OUT, "emblem", "sub"), exist_ok=True); ls_ = []
    for f in sorted(os.listdir(d)):
        if not f.endswith(".png"): continue
        dst = os.path.join(OUT, "emblem", "sub", f[:-4] + ".avif"); im = Image.open(os.path.join(d, f)).convert("RGBA"); im.thumbnail((256, 256), Image.LANCZOS); im.save(dst, "AVIF", quality=60, speed=6); ls_.append(f[:-4]); tot += os.path.getsize(dst)
    man["esub"] = ls_
if "icons" in ONLY:
    CAT = {"spells": "spell", "conditions": "condition", "damage-types": "damage", "skills": "skill", "items": "item", "creature-types": "creature",
           "item-categories": "itemcat", "spell-schools": "school", "weapon-mastery": "mastery", "abilities": "ability", "coins": "coin", "feat-categories": "featcat"}
    ic = {}
    for top in sorted(os.listdir(os.path.join(SRC, "icons"))):
        cat = CAT.get(top)
        if not cat: continue
        for dp, _, fs in os.walk(os.path.join(SRC, "icons", top)):
            for f in sorted(fs):
                if not f.endswith(".png"): continue
                os.makedirs(os.path.join(OUT, "icon", cat), exist_ok=True); dst = os.path.join(OUT, "icon", cat, f[:-4] + ".avif")
                im = Image.open(os.path.join(dp, f)).convert("RGBA"); im.thumbnail((128, 128), Image.LANCZOS); im.save(dst, "AVIF", quality=60, speed=6)
                ic.setdefault(cat, []).append(f[:-4]); tot += os.path.getsize(dst)
    man["icon"] = {k: sorted(set(v)) for k, v in ic.items()}
json.dump(man, open(MAN, "w"), indent=1, sort_keys=True)
open(os.path.join(ROOT, "src", "fx", "23-class-art-data.js"), "w").write("/* generated by tools/art_pipeline.py. Do not edit by hand */\nwindow.__ART=" + json.dumps(man, sort_keys=True, separators=(",", ":")) + ";\n")
print("wrote %d KB of images, manifest %s" % (tot // 1024, MAN))
