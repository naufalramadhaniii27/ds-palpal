"""Cut a scene sheet (2x2, 1x2 or 2x1) into panels and upscale them.

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


def gutter(a, axis, n):
    """Return (start, end) of a flat cream band near the middle, or None."""
    s = a.std(axis=axis).mean(1)
    idx = [i for i in range(int(n * .4), int(n * .6)) if s[i] < 6]
    return (idx[0], idx[-1] + 1) if idx else None


def boxes(im):
    a = np.asarray(im).astype(int)
    w, h = im.size
    gx, gy = gutter(a, 0, w), gutter(a, 1, h)
    xs = [(0, gx[0]), (gx[1], w)] if gx else [(0, w)]
    ys = [(0, gy[0]), (gy[1], h)] if gy else [(0, h)]
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
