#!/usr/bin/env python3
"""Step 4 scenes. python3 tools/art_scenes2.py SCENES_OUT APPNAMES.json [--dry]
SCENES_OUT = art/scenes-out of the art-scenes branch (species, backgrounds, classes, portraits, subclasses, webp).
APPNAMES.json = {"species":[[cat,name,..]],"bg":[...],"sub":[...],"cls":[...]} (library rows of the app, names as shown).
Matches each file name to the app slug (exact, unique prefix, accent folded). Never guesses: the rest goes to the mismatch list."""
import json, os, re, sys, unicodedata
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC, NAMES = sys.argv[1], json.load(open(sys.argv[2])); DRY = "--dry" in sys.argv
MAN = os.path.join(ROOT, "img", "manifest.json"); man = json.load(open(MAN))
CORE = ["barbarian","bard","cleric","druid","fighter","monk","paladin","ranger","rogue","sorcerer","warlock","wizard","artificer"]
TP = ["alchemist","captain","craftsman","dancer","gadgeteer","healer","investigator","jaeger","martyr","monster-hunter","necromancer","summoner","vagabond","warden","warmage","witch"]
def bslug(n): return re.sub(r"^-|-$", "", re.sub(r"[^a-z0-9]+", "-", re.sub(r"['’]", "", str(n).lower())))
def fold(n): return bslug(unicodedata.normalize("NFKD", n).encode("ascii", "ignore").decode())
def avg(im): return "#%02x%02x%02x" % im.convert("RGB").resize((1, 1), Image.LANCZOS).getpixel((0, 0))
def resolve(base, apps):
    """app name list -> (slug, how) or (None, reason)"""
    sl = {bslug(a): a for a in apps}
    if base in sl: return base, "exact"
    fs = {}
    for a in apps: fs.setdefault(fold(a), []).append(a)
    if base in fs and len(fs[base]) == 1: return bslug(fs[base][0]), "accent"
    pre = sorted({bslug(a) for a in apps if bslug(a).startswith(base + "-")})
    if len(pre) == 1: return pre[0], "prefix"
    if len(pre) > 1: return None, "ambiguous: " + ", ".join(pre)
    return None, "no app entry"
tot = 0; rep = {}; mism = {}
def put(im, dst, w, q):
    global tot
    if DRY: return
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    im = im.convert("RGB"); 
    if im.width != w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(dst, "AVIF", quality=q, speed=6); tot += os.path.getsize(dst)
def pair(kind, folder, apps, out, mkey):
    d = os.path.join(SRC, folder); bases = sorted({f.rsplit("-", 1)[0] for f in os.listdir(d) if f.endswith("-pc.webp")}); n = 0; skip = 0; mm = []
    ent = man["scn"].setdefault(mkey, {}) if mkey else {}
    for b in bases:
        if not os.path.exists(os.path.join(d, b + "-phone.webp")): mm.append((b, "phone file missing")); continue
        s, how = resolve(b, apps)
        if not s: mm.append((b, how)); continue
        if how != "exact": mm.append((b, how + " -> " + s))
        if s in ent: skip += 1; continue
        pc = Image.open(os.path.join(d, b + "-pc.webp")); ph = Image.open(os.path.join(d, b + "-phone.webp"))
        put(pc, os.path.join(ROOT, out, s + "-pc.avif"), 2400, 54); put(ph, os.path.join(ROOT, out, s + "-phone.avif"), 1088, 54)
        ent[s] = {"c": avg(pc), "pc": out + "/" + s + "-pc.avif", "phone": out + "/" + s + "-phone.avif"}; n += 1
    rep[kind] = {"files": len(bases), "installed": n, "already": skip}; mism[kind] = mm
pair("species", "species", [r[1] for r in NAMES["species"]], "img/scn/species", "species")
pair("backgrounds", "backgrounds", [r[1] for r in NAMES["bg"]], "img/scn/background", "background")
# classes: third party, next to the core scenes
d = os.path.join(SRC, "classes"); n = 0; mm = []
for b in sorted({f.rsplit("-", 1)[0] for f in os.listdir(d) if f.endswith("-pc.webp")}):
    if b not in TP: mm.append((b, "not a known third-party class")); continue
    if b in man["scene"]: continue
    pc = Image.open(os.path.join(d, b + "-pc.webp")); ph = Image.open(os.path.join(d, b + "-phone.webp"))
    put(pc, os.path.join(ROOT, "img/scene", b + "-pc.avif"), 2400, 54); put(ph, os.path.join(ROOT, "img/scene", b + "-phone.avif"), 1088, 54)
    ref = man["scene"]["artificer"]
    man["scene"][b] = {"c": avg(pc), "o": dict(ref["o"]), "pc": {"h": 1344, "p": "img/scene/%s-pc.avif" % b, "w": 2400}, "phone": {"h": 1920, "p": "img/scene/%s-phone.avif" % b, "w": 1088}}; n += 1
rep["classes"] = {"files": 16, "installed": n}; mism["classes"] = mm
# portraits
d = os.path.join(SRC, "portraits"); have = set(man.get("portrait", [])); new = []
for f in sorted(os.listdir(d)):
    k = f[:-5]
    if k in have: continue
    im = Image.open(os.path.join(d, f)).convert("RGB"); im.thumbnail((384, 480), Image.LANCZOS)
    if not DRY:
        os.makedirs(os.path.join(ROOT, "img/portrait"), exist_ok=True); dst = os.path.join(ROOT, "img/portrait", k + ".avif"); im.save(dst, "AVIF", quality=60, speed=6); tot += os.path.getsize(dst)
    new.append(k)
man["portrait"] = sorted(have | set(new)); rep["portraits"] = {"files": len(os.listdir(d)), "installed": len(new)}
# subclass cards: class-sub, key = class slug + app sub slug (same id as the emblems)
d = os.path.join(SRC, "subclasses"); subs = [r[1] for r in NAMES["sub"]]; have = set(man.get("scard", [])); n = 0; mm = []
for f in sorted(os.listdir(d)):
    b = f[:-5]; c = next((x for x in sorted(CORE + TP, key=len, reverse=True) if b.startswith(x + "-")), None)
    if not c: mm.append((b, "class prefix unknown")); continue
    s, how = resolve(b[len(c) + 1:], subs)
    if not s: mm.append((b, how)); continue
    if how != "exact": mm.append((b, how + " -> " + c + "-" + s))
    k = c + "-" + s
    if k in have: continue
    put(Image.open(os.path.join(d, f)), os.path.join(ROOT, "img/scard", k + ".avif"), 512, 50); have.add(k); n += 1
man["scard"] = sorted(have); rep["subclass cards"] = {"files": len(os.listdir(d)), "installed": n}; mism["subclass cards"] = mm
if not DRY:
    json.dump(man, open(MAN, "w"), separators=(",", ":"), sort_keys=True)
    open(os.path.join(ROOT, "src", "fx", "23-class-art-data.js"), "w").write("/* generated by tools/art_pipeline.py. Do not edit by hand */\nwindow.__ART=" + json.dumps(man, sort_keys=True, separators=(",", ":")) + ";\n")
print(json.dumps(rep, indent=1)); print("MB added: %.1f" % (tot / 1048576))
for k, v in mism.items():
    print("==", k, len(v))
    for a, b in v: print("  ", a, "|", b)
