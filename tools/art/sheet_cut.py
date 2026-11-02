"""Cut a scene sheet (any rows x columns with cream gutters) into panels and upscale them.

Usage: python3 tools/art/sheet_cut.py SHEET.png WEIGHTS.pth OUTDIR name1 [name2 ...] [WxH]
Panels are read row by row: left to right, then top to bottom.
Default size 2400x1344. Pass 1088x1920 for phone panels.
Weights: realesr-animevideov3.pth from github.com/xinntao/Real-ESRGAN releases v0.2.5.0.
Needs torch, numpy, Pillow.
Result per panel = 70% Real-ESRGAN + 30% Lanczos, so lines stay crisp and the
dry-brush texture is kept.
"""
import os, re, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from esr_up import load, run

MIX = 0.7


def runs(a, axis, n):
    """Flat cream bands between 3% and 97% of the side (gutters)."""
    s = a.std(axis=axis).mean(1)
    flat = [s[i] < 6 for i in range(n)]
    out, i = [], int(n * .03)
    while i < int(n * .97):
        if flat[i]:
            j = i
            while j < n and flat[j]:
                j += 1
            if j - i >= 4:
                out.append((i, j))
            i = j
        else:
            i += 1
    return out


def spans(g, n):
    edges, x = [], 0
    for a, b in g:
        edges.append((x, a)); x = b
    edges.append((x, n))
    return [e for e in edges if e[1] - e[0] > n * .1]


def boxes(im):
    a = np.asarray(im).astype(int)
    w, h = im.size
    xs, ys = spans(runs(a, 0, w), w), spans(runs(a, 1, h), h)
    return [(x0, y0, x1, y1) for (y0, y1) in ys for (x0, x1) in xs]


def fit(p, W, H):
    pw, ph = p.size
    if pw / ph > W / H:
        tw = round(ph * W / H); l = (pw - tw) // 2
        return p.crop((l, 0, l + tw, ph))
    th = round(pw * H / W); t = (ph - th) // 2
    return p.crop((0, t, pw, t + th))


def main():
    sheet, wts, out, *rest = sys.argv[1:]
    size = rest.pop() if rest and re.fullmatch(r'\d+x\d+', rest[-1]) else '2400x1344'
    W, H = map(int, size.split('x'))
    im = Image.open(sheet).convert('RGB')
    bx = boxes(im)
    if len(bx) > len(rest):
        bx = bx[:len(rest)]  # trailing cells left empty on purpose
    if len(bx) != len(rest):
        raise SystemExit(f'{sheet}: found {len(bx)} panels, got {len(rest)} names')
    m = load(wts)
    os.makedirs(out, exist_ok=True)
    for n, b in zip(rest, bx):
        p = fit(im.crop(b), W, H)
        e = run(m, p).resize((W, H), Image.LANCZOS)
        Image.blend(p.resize((W, H), Image.LANCZOS), e, MIX).save(os.path.join(out, n + '.png'))
        print(n, b, '->', (W, H))


if __name__ == '__main__':
    main()
