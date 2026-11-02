"""Cut a 2x2 scene sheet into panels and upscale them.

Usage: python3 tools/art/sheet_cut.py SHEET.png WEIGHTS.pth OUTDIR name1 name2 name3 name4 [WxH]
Order: top-left, top-right, bottom-left, bottom-right. Default size 2400x1344.
Weights: realesr-animevideov3.pth from github.com/xinntao/Real-ESRGAN releases v0.2.5.0.
Needs torch, numpy, Pillow.
Result per panel = 70% Real-ESRGAN + 30% Lanczos, so lines stay crisp and the
dry-brush texture is kept.
"""
import os, sys
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from esr_up import load, run

MIX = 0.7


def gutters(a, axis, lo, hi):
    s = a.std(axis=axis).mean(1)
    idx = [i for i in range(lo, hi) if s[i] < 6]
    if not idx:
        raise SystemExit('no gutter found')
    return idx[0], idx[-1] + 1


def main():
    sheet, wts, out, *rest = sys.argv[1:]
    names, size = rest[:4], (rest[4] if len(rest) > 4 else '2400x1344')
    W, H = map(int, size.split('x'))
    im = Image.open(sheet).convert('RGB')
    a = np.asarray(im).astype(int)
    sw, sh = im.size
    gx0, gx1 = gutters(a, 0, int(sw * .4), int(sw * .6))
    gy0, gy1 = gutters(a, 1, int(sh * .4), int(sh * .6))
    boxes = [(0, 0, gx0, gy0), (gx1, 0, sw, gy0), (0, gy1, gx0, sh), (gx1, gy1, sw, sh)]
    m = load(wts)
    os.makedirs(out, exist_ok=True)
    for n, b in zip(names, boxes):
        p = im.crop(b)
        pw, ph = p.size
        if pw / ph > W / H:
            tw = round(ph * W / H); l = (pw - tw) // 2; p = p.crop((l, 0, l + tw, ph))
        else:
            th = round(pw * H / W); t = (ph - th) // 2; p = p.crop((0, t, pw, t + th))
        e = run(m, p).resize((W, H), Image.LANCZOS)
        l = p.resize((W, H), Image.LANCZOS)
        Image.blend(l, e, MIX).save(os.path.join(out, n + '.png'))
        print(n, b, '->', (W, H))


if __name__ == '__main__':
    main()
