#!/usr/bin/env python3
"""One scale for spacing, radius and type. python3 tests/scale_audit.py
Reads src/css (not 00-fonts). Lists every px value in padding, margin, gap, border-radius and font-size that is outside the scale.
The scale: spacing 0 1 2 4 6 8 10 12 14 16 20 24 28 32 36 40 44 48 56 64 96 (larger values are layout widths and are skipped),
radius 0 1 2 4 6 8 10 12 14 16 20 24 99 999, font 10 11 12 13 14 16 18 20 22 24 28 32 40 56 64 84.
Exit code 1 when a value is off the scale."""
import re, glob, os, sys, collections
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SP = {0,1,2,4,6,8,10,12,14,16,20,24,28,32,36,40,44,48,56,64,96}
RD = {0,1,2,4,6,8,10,12,14,16,20,24,99,999}
FS = {10,11,12,13,14,16,18,20,22,24,28,32,40,56,64,84}
bad = collections.defaultdict(list); n = collections.Counter()
for f in sorted(glob.glob(os.path.join(ROOT, "src", "css", "*.css"))):
    if "00-fonts" in f: continue
    t = open(f, encoding="utf-8").read()
    for key, S, rx, big in (("spacing", SP, r'(?<![-\w])(?:padding|margin)(?:-(?:top|bottom|left|right|block|inline)(?:-\w+)?)?:([^;}{]+)|(?<![-\w])(?:gap|row-gap|column-gap):([^;}{]+)', 100),
                            ("radius", RD, r'border-radius:([^;}{]+)', 10**6), ("font", FS, r'(?<![-\w])font-size:([^;}{]+)', 10**6)):
        for m in re.finditer(rx, t):
            val = " ".join(g for g in m.groups() if g)
            val = re.sub(r"var\([^)]*\)", "", val)  # a var() fallback such as --bandh,66px is a layout size, not a step
            for v in re.findall(r'(?<![\w.#-])(\d+(?:\.\d+)?)px', val):
                x = float(v); n[key] += 1
                if x > big: continue
                if x not in S: bad[key].append((os.path.basename(f), x))
for k in ("spacing", "radius", "font"):
    c = collections.Counter(v for _, v in bad[k])
    print("%-8s %5d values, off the scale: %d %s" % (k, n[k], sum(c.values()), sorted(c.items())[:12]))
sys.exit(1 if any(bad.values()) else 0)
