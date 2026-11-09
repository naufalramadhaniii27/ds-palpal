#!/usr/bin/env python3
"""Install the Codex pictures of queues Q3 (creatures) and Q4 (icons) that Claude approved.
  python3 tools/art_codex_q.py ART_TASKS_CHECKOUT [--dry]
ART_TASKS_CHECKOUT is a checkout of branch art-tasks (it holds art-tasks/q3, q3-out, q4, q4-out).
Codex files marked "dihapus: ada 5etools" in img/codex-q-src.json are never installed again (their entry shows its 5etools picture).
Only rows of the Status tables that start with "approved by Claude" are used, minus the names listed after "redo:" in the same row.
Q3: art-tasks/q3-out/<slug>.png  -> img/mon/<slug>.avif 256 px and img/hd/mon/<slug>.avif 768 px, manifest key "mon".
Q4: art-tasks/q4-out/S0NNN.png (2x2) -> each cell trimmed to the object with a uniform margin,
    img/icon/<cat>/<slug>.avif 128 px and img/hd/icon/<cat>/<slug>.avif 576 px, manifest key icon.<cat>.
    Names in art-tasks/q4/alias.json get a copy of the icon they point to (2014 copies, later stages).
Updates img/manifest.json and src/fx/23-class-art-data.js (adds names, never removes).
No clash with other work: a file that already exists and was not written by this tool is never touched (art from other pipelines
or sessions wins). Files this tool wrote are listed in img/codex-q.json, only those are replaced when Codex redraws them.
--paths prints the only paths this tool may change, for the release check (git diff must stay inside them plus generated files)."""
import json, os, re, sys
from PIL import Image
AT = os.path.abspath(sys.argv[1]); DRY = "--dry" in sys.argv
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CAT = {"feat": "feat", "species": "species", "background": "background", "optfeat": "opt", "facility": "facility", "language": "language"}
def rows(md):
    out = []
    for m in re.finditer(r"^\| ([BSP]\d{3,4}) \| ([^|]+) \| ([^\n]*)\|\s*$", open(md, encoding="utf-8").read(), re.M):
        st = m.group(3).strip()
        if not st.startswith("approved by Claude"): continue
        names = [n.strip() for n in m.group(2).split(",")]
        redo = st.split("redo:", 1)[1] if "redo:" in st else ""
        out.append((m.group(1), names, redo))
    return out
def fit(im, px, margin=.06):
    im = im.convert("RGBA"); bb = im.split()[3].point(lambda a: 255 if a > 16 else 0).getbbox()
    if not bb: return None
    im = im.crop(bb); side = int(max(im.size) / (1 - 2 * margin))
    c = Image.new("RGBA", (side, side), (0, 0, 0, 0)); c.paste(im, ((side - im.width) // 2, (side - im.height) // 2)); return c.resize((px, px), Image.LANCZOS)
def save(im, rel, q):
    dst = os.path.join(ROOT, rel)
    if DRY: return
    os.makedirs(os.path.dirname(dst), exist_ok=True); im.save(dst, "AVIF", quality=q, speed=6); led.add(rel)
    if rel in PEND: SRCH[rel] = PEND[rel]
REMOVED = "dihapus: ada 5etools"    # img/codex-q-src.json marks Codex files the owner dropped because the entry has a 5etools picture (2026-11-09)
def newer(src, rel):
    dst = os.path.join(ROOT, rel)
    if SRCH.get(rel) == REMOVED or SRCH.get(rel.replace("img/icon/", "img/hd/icon/").replace("img/mon/", "img/hd/mon/")) == REMOVED: return False   # never install again
    if not os.path.exists(dst): PEND[rel] = SHA(src); return True
    if rel not in led: return False            # someone else's art: never overwrite
    h = SHA(src); PEND[rel] = h                 # redraws are found by the source content, not by file times (checkouts reset the times)
    return SRCH.get(rel) != h
ALLOWED = ["img/mon/", "img/hd/mon/", "img/icon/", "img/hd/icon/", "img/portrait/", "img/manifest.json", "img/codex-q.json", "img/codex-q-src.json", "src/fx/23-class-art-data.js", "index.html", "sw.js"]
if "--paths" in sys.argv: print("\n".join(ALLOWED)); sys.exit(0)
led_p = os.path.join(ROOT, "img", "codex-q.json")
led = set(json.load(open(led_p))) if os.path.exists(led_p) else set()
import hashlib
srch_p = os.path.join(ROOT, "img", "codex-q-src.json")
SRCH = json.load(open(srch_p)) if os.path.exists(srch_p) else {}
PEND = {}; _sh = {}
def SHA(path):
    if path not in _sh: _sh[path] = hashlib.sha1(open(path, "rb").read()).hexdigest()[:16]
    return _sh[path]
man_p = os.path.join(ROOT, "img", "manifest.json"); man = json.load(open(man_p, encoding="utf-8"))
n3 = n4 = 0
# Q3 creatures
for b, names, redo in rows(os.path.join(AT, "art-tasks/q3/Q3.md")):
    for s in names:
        src = os.path.join(AT, "art-tasks/q3-out", s + ".png")
        if s in redo or not os.path.exists(src) or not newer(src, "img/hd/mon/%s.avif" % s): continue
        im = Image.open(src)
        big = fit(im, 768, .04)
        if big is None: continue
        save(big, "img/hd/mon/%s.avif" % s, 60); save(big.resize((256, 256), Image.LANCZOS), "img/mon/%s.avif" % s, 62)
        if s not in man["mon"]: man["mon"].append(s)
        n3 += 1
# Q4 icons
alias = {}
ap = os.path.join(AT, "art-tasks/q4/alias.json")
if os.path.exists(ap):
    for a, t in json.load(open(ap)): alias.setdefault(t, []).append(a)
for sh, names, redo in rows(os.path.join(AT, "art-tasks/q4/Q4.md")):
    src = os.path.join(AT, "art-tasks/q4-out", sh + ".png")
    if not os.path.exists(src): continue
    im = Image.open(src).convert("RGBA"); w, h = im.size
    for i, path in enumerate(names):
        if "cell %d" % (i + 1) in redo or "cells" in redo and re.search(r"\b%d\b" % (i + 1), redo.split("(")[0]): continue
        cat, slug = path.split("/", 1); c = CAT[cat]
        if not newer(src, "img/hd/icon/%s/%s.avif" % (c, slug)): continue
        cell = im.crop(((i % 2) * w // 2, (i // 2) * h // 2, (i % 2 + 1) * w // 2, (i // 2 + 1) * h // 2))
        big = fit(cell, 576)
        if big is None: continue
        for s in [slug] + [a.split("/", 1)[1] for a in alias.get(path, [])]:
            if not newer(src, "img/hd/icon/%s/%s.avif" % (c, s)): continue
            save(big, "img/hd/icon/%s/%s.avif" % (c, s), 58); save(big.resize((128, 128), Image.LANCZOS), "img/icon/%s/%s.avif" % (c, s), 60)
            man["icon"].setdefault(c, [])
            if s not in man["icon"][c]: man["icon"][c].append(s)
        n4 += 1
# Q5 portraits: art-tasks/q5-out/P0NNN.png (1024x1536, 2x2 cards of 512x768) -> 4:5 crop of each card,
# img/portrait/<id>.avif 384x480 and img/portrait/t/<id>.avif 128x160 thumb, index img/portrait/index.js (search data)
n5 = 0
q5md = os.path.join(AT, "art-tasks/q5/Q5.md")
if os.path.exists(q5md):
    for sh, names, redo in rows(q5md):
        src = os.path.join(AT, "art-tasks/q5-out", sh + ".png")
        if not os.path.exists(src): continue
        im = Image.open(src).convert("RGB"); w, h = im.size
        for i, pid in enumerate(names):
            if "cell %d" % (i + 1) in redo or ("cells" in redo and re.search(r"\b%d\b" % (i + 1), redo.split("(")[0])): continue
            if not newer(src, "img/portrait/%s.avif" % pid): continue
            x0, y0, x1, y1 = (i % 2) * w // 2, (i // 2) * h // 2, (i % 2 + 1) * w // 2, (i // 2 + 1) * h // 2
            cw, chh = x1 - x0, y1 - y0; tw = cw; th = int(tw * 5 / 4)
            if th > chh: th = chh; tw = int(th * 4 / 5)
            cx = x0 + (cw - tw) // 2; cy = y0 + max(0, int((chh - th) * .35))
            card = im.crop((cx, cy, cx + tw, cy + th))
            save(card.resize((384, 480), Image.LANCZOS), "img/portrait/%s.avif" % pid, 60)
            if pid not in man["portrait"]: man["portrait"].append(pid)
            n5 += 1
# thumbnails for every portrait (old and new) and the search index
meta = {}
mp = os.path.join(AT, "art-tasks/q5/meta.json")
if os.path.exists(mp): meta = {x["id"]: x for x in json.load(open(mp))}
idx = []
for pid in man["portrait"]:
    t = "img/portrait/t/%s.avif" % pid
    full = os.path.join(ROOT, "img/portrait/%s.avif" % pid)
    if os.path.exists(full) and (not os.path.exists(os.path.join(ROOT, t)) or (t in led and os.path.getmtime(full) > os.path.getmtime(os.path.join(ROOT, t)))):
        save(Image.open(full).convert("RGB").resize((128, 160), Image.LANCZOS), t, 55)
    m = meta.get(pid, {})
    idx.append([pid, m.get("sp") or re.sub(r"-[ab]$|-\d+$", "", pid), m.get("cls", ""), m.get("g", ""), m.get("age", "")])
if not DRY:
    open(os.path.join(ROOT, "img/portrait/index.js"), "w").write("/* generated by tools/art_codex_q.py: portrait search index [id, species, role, gender, age] */\nwindow.__PPIDX=" + json.dumps(idx, separators=(",", ":")) + ";\n")
for k in man["icon"]: man["icon"][k] = sorted(man["icon"][k])
man["mon"] = sorted(man["mon"])
man["portrait"] = sorted(man["portrait"])
if not DRY:
    open(led_p, "w").write(json.dumps(sorted(led), indent=0) + "\n")
    open(srch_p, "w").write(json.dumps(SRCH, sort_keys=True, indent=0) + "\n")
    open(man_p, "w", encoding="utf-8").write(json.dumps(man, indent=1, ensure_ascii=False) + "\n")
    open(os.path.join(ROOT, "src", "fx", "23-class-art-data.js"), "w").write("/* generated by tools/art_pipeline.py. Do not edit by hand */\nvar __ART=" + json.dumps(man, sort_keys=True, separators=(",", ":")) + ";\n")
print("Q3 creatures installed:", n3, " Q4 icons installed:", n4, " Q5 portraits installed:", n5, " (dry run)" if DRY else "")
