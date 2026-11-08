#!/usr/bin/env python3
"""Installs the Codex grid icons that are not UI icons. python3 tools/art_grid3.py GRID_DIR HD_CHANGED.txt [--dry]
GRID_DIR is art-tasks (checkout with grid-cut/). HD_CHANGED.txt lists img/icon files that art-hd redrew at 576 px: those keep the art-hd file (newer, sharper), the 256 px grid file is skipped.
Destination by source path:
  icons/species/x        img/icon/species/x           icons/library/x      img/icon/cat/<x with bg=background, opt=option, sub=subclass>
  icons/items/**/x       img/icon/item/x              icons/features/**/x  img/icon/feature/x (first file of a name wins, repeats are listed)
  icons/rules/**/x       img/icon/<rule|opt|optfeat|language>/x (by name, see RULES)       icons/spells/**/x  img/icon/spell/x
  icons/objects/x        img/icon/object/x            icons/vehicles/x     img/icon/vehicle/x
  emblems/background/x   img/emblem/background/x      emblems/species/x    img/emblem/species/x      emblems/subclass/extra/x  img/emblem/sub/<class>-<x>
Small file 128 px, twin in img/hd/icon/<same path> at the source size (256). Emblems 256 px. Updates img/manifest.json (icon.<cat>, ebg, esp, esub) and src/fx/23-class-art-data.js."""
import json, os, sys
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
G = sys.argv[1]; CH = {l.strip() for l in open(sys.argv[2])}; DRY = "--dry" in sys.argv; GC = os.path.join(G, "grid-cut")
MAN = os.path.join(ROOT, "img", "manifest.json"); man = json.load(open(MAN)); man.setdefault("icon", {})
LIBMAP = {"bg": "background", "opt": "option", "sub": "subclass"}
KNOWN = {"pencak-silat": "fighter", "warrior-of-aerobics": "monk", "warrior-of-the-mystic-arts": "monk", "the-celestial": "warlock", "the-fathomless": "warlock", "the-leyak-queen": "warlock", "wild-magic": "sorcerer"}  # class read from the app data (subclass tables)
def CL(s): return KNOWN.get(s) or ("sorcerer" if s in ("aberrant-mind", "clockwork-soul", "draconic-bloodline", "clockwork-sorcery") else "fighter" if s == "arcane-archer" else "druid" if s.startswith("circle-of-") else "bard" if s.startswith("college-of-") else "paladin" if s.startswith("oath-of-") else "barbarian" if s.startswith("path-of-") else "monk" if s.startswith("way-of-") else "cleric" if s.endswith("-domain") else "rogue" if s in ("cartographer", "swashbuckler", "scout", "inquisitive", "mastermind", "phantom", "soulknife", "thief", "assassin", "arcane-trickster") else "wizard" if s.startswith("school-of-") or s.startswith("order-of-") else None)
def rule_cat(s):
    if s.startswith("language-"): return "language", s[9:]
    if s.startswith("weapon-") and s.endswith("-property"): return "rule", s
    if s.startswith("battle-master-maneuver-"): return "opt", s[len("battle-master-maneuver-"):]
    return "rule", s
rows = []; tot = 0
def put(src, rel, kind):
    """rel: path under img/ without extension. kind icon or emblem. returns status"""
    global tot
    p = "img/%s.avif" % rel
    if kind == "icon" and p in CH: return "kept art-hd"
    new = not os.path.exists(os.path.join(ROOT, p))
    if DRY: return "new" if new else "replace"
    im = Image.open(src).convert("RGBA")
    for sub, px in ((("icon" if kind == "icon" else "emblem"), 128 if kind == "icon" else 256), ("hd/icon" if kind == "icon" else None, 256)):
        if not sub: continue
        o = im.copy(); o.thumbnail((px, px), Image.LANCZOS); dst = os.path.join(ROOT, "img", sub, rel.split("/", 1)[1] + ".avif") if kind == "icon" else os.path.join(ROOT, p)
        os.makedirs(os.path.dirname(dst), exist_ok=True); o.save(dst, "AVIF", quality=62, speed=6); tot += os.path.getsize(dst)
    return "new" if new else "replace"
seen_feat = set(); res = {"icon": {}, "ebg": [], "esp": [], "esub": []}
for dp, _, fs in sorted(os.walk(GC)):
    rd = os.path.relpath(dp, GC).replace(os.sep, "/")
    for f in sorted(fs):
        if not f.endswith(".png"): continue
        s = f[:-4]; src = os.path.join(dp, f); parts = rd.split("/")
        if rd == "icons/ui": continue
        st = None; dest = None
        if parts[0] == "icons":
            top = parts[1]
            if top == "species": cat, name = "species", s
            elif top == "library": cat, name = "cat", LIBMAP.get(s, s)
            elif top == "items": cat, name = "item", s
            elif top == "features":
                cat, name = "feature", s
                if s in seen_feat: rows.append((rd + "/" + f, "-", "skipped: feature name already used")); continue
                seen_feat.add(s)
            elif top == "rules": cat, name = rule_cat(s)
            elif top == "spells": cat, name = "spell", s
            elif top == "objects": cat, name = "object", s
            elif top == "vehicles": cat, name = "vehicle", s
            else: rows.append((rd + "/" + f, "-", "unmapped")); continue
            dest = "icon/%s/%s" % (cat, name); st = put(src, dest, "icon")
            if st != "kept art-hd": res["icon"].setdefault(cat, set()).add(name)
        elif parts[0] == "emblems":
            top = parts[1]
            if top == "background": dest = "emblem/background/" + s; st = put(src, dest, "emblem"); res["ebg"].append(s)
            elif top == "species": dest = "emblem/species/" + s; st = put(src, dest, "emblem"); res["esp"].append(s)
            elif top == "subclass":
                c = CL(s)
                if not c: rows.append((rd + "/" + f, "-", "unmapped: no class for subclass")); continue
                dest = "emblem/sub/%s-%s" % (c, s); st = put(src, dest, "emblem"); res["esub"].append("%s-%s" % (c, s))
        rows.append((rd + "/" + f, dest, st))
from collections import Counter
print(Counter(r[2] for r in rows))
for r in rows:
    if r[2] not in ("new", "replace", "kept art-hd"): print(r)
if not DRY:
    for cat, names in res["icon"].items(): man["icon"][cat] = sorted(set(man["icon"].get(cat, [])) | names)
    man["ebg"] = sorted(set(man.get("ebg", [])) | set(res["ebg"])); man["esp"] = sorted(set(man.get("esp", [])) | set(res["esp"])); man["esub"] = sorted(set(man.get("esub", [])) | set(res["esub"]))
    json.dump(man, open(MAN, "w"), indent=1, sort_keys=True)
    open(os.path.join(ROOT, "src", "fx", "23-class-art-data.js"), "w").write("/* generated by tools/art_pipeline.py. Do not edit by hand */\nvar __ART=" + json.dumps(man, sort_keys=True, separators=(",", ":")) + ";\n")
    print(tot // 1024, "KB written")
json.dump(rows, open("/tmp/grid3-rows.json", "w"), indent=0)
