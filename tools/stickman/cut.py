"""Cut the accepted Canva image into animation layers.
Usage: python3 cut.py source.jpg outdir
Regions are given as fractions of width and height so the same cuts work on the thumbnail and on the full-size file."""
import sys, os, json
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
im = Image.open(src).convert("RGB")
W, H = im.size
a = np.array(im).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
mx, mn = a.max(2), a.min(2)

# paper colour: median of the outer border
border = np.concatenate([a[:4].reshape(-1, 3), a[-4:].reshape(-1, 3), a[:, :4].reshape(-1, 3), a[:, -4:].reshape(-1, 3)])
paper = tuple(int(v) for v in np.median(border, 0))

def poly_mask(pts):
    m = Image.new("L", (W, H), 0)
    ImageDraw.Draw(m).polygon([(x * W, y * H) for x, y in pts], fill=255)
    return np.array(m) > 0

# fire: saturated warm pixels, grown to take the ink outline with it
fire_c = (mx - mn > 60) & (r > 110) & (r >= g)
fm = Image.fromarray((fire_c * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(max(3, int(W * 0.012)) | 1))
fire = (np.array(fm) > 0) & poly_mask([(0.03, 0.05), (0.36, 0.05), (0.36, 0.42), (0.03, 0.42)])

REG = {
    "head": [(0.36, 0.10), (0.64, 0.10), (0.64, 0.30), (0.56, 0.345), (0.44, 0.345), (0.36, 0.30)],
    "armL": [(0.34, 0.345), (0.415, 0.345), (0.415, 0.44), (0.385, 0.53), (0.21, 0.53), (0.09, 0.47), (0.09, 0.395), (0.20, 0.395)],
    "armR": [(0.585, 0.345), (0.655, 0.345), (0.655, 0.04), (0.97, 0.04), (0.97, 0.64), (0.70, 0.64), (0.70, 0.52), (0.62, 0.45)],
    "tail": [(0.17, 0.58), (0.345, 0.58), (0.345, 0.76), (0.17, 0.76)],
}
PIV = {"body": (0.5, 0.93), "head": (0.5, 0.345), "armL": (0.37, 0.385), "armR": (0.63, 0.385), "tail": (0.345, 0.70), "fire": (0.20, 0.40)}

masks = {"fire": fire}
taken = fire.copy()
for name, pts in REG.items():
    m = poly_mask(pts) & ~taken
    masks[name] = m
    taken |= m
masks["body"] = ~taken

rgba = np.dstack([a.astype(np.uint8), np.full((H, W), 255, np.uint8)])
meta = {"w": W, "h": H, "paper": paper, "pivots": PIV, "layers": {}}
for name, m in masks.items():
    layer = rgba.copy()
    layer[..., 3] = (m * 255).astype(np.uint8)
    # paper pixels inside a layer stay opaque only where they are close to ink; keep it simple: drop pure paper
    if name != "body":
        near_paper = (np.abs(a - np.array(paper)).sum(2) < 40)
        layer[..., 3][near_paper] = 0
    ys, xs = np.where(layer[..., 3] > 0)
    if len(xs) == 0:
        print("empty layer", name); continue
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    Image.fromarray(layer[y0:y1, x0:x1]).save(os.path.join(out, name + ".png"))
    meta["layers"][name] = {"x": int(x0), "y": int(y0), "w": int(x1 - x0), "h": int(y1 - y0)}
    print(name, x0, y0, x1 - x0, y1 - y0)
# base with the cut regions filled with paper, so moved layers leave no ghost behind
base = a.copy()
# fill the cut regions with a local estimate of the paper (masked blur of paper pixels) plus the paper's own fine noise
from PIL import ImageFilter as IF
paper_mask = ~((mx < 200) | fire)
pm = paper_mask.astype(np.float32)
blur_k = max(31, int(W * 0.08)) | 1
def blur(arr):
    k = blur_k // 2
    pad = np.pad(arr.astype(np.float64), k, mode="edge")
    c = np.cumsum(np.cumsum(pad, 0), 1)
    c = np.pad(c, ((1, 0), (1, 0)))
    n = 2 * k + 1
    out = c[n:, n:] - c[:-n, n:] - c[n:, :-n] + c[:-n, :-n]
    return (out / (n * n)).astype(np.float32)
def masked_mean(k):
    global blur_k
    blur_k = k | 1
    num = np.dstack([blur(a[..., c] * pm) for c in range(3)])
    den = blur(pm)
    return num, den
num1, den1 = masked_mean(max(31, int(W * 0.08)))
num2, den2 = masked_mean(max(61, int(W * 0.3)))
mean = np.where((den1 > 0.25)[..., None], num1 / np.maximum(den1, 1e-3)[..., None], np.where((den2 > 0.05)[..., None], num2 / np.maximum(den2, 1e-3)[..., None], np.array(paper)[None, None, :]))
hf = (a - mean)[paper_mask]
sd = float(hf.std())
rng = np.random.default_rng(3)
fill = np.clip(mean + rng.normal(0, sd * 0.9, size=(H, W, 3)), 0, 255)
base[taken] = fill[taken]
Image.fromarray(base.astype(np.uint8)).save(os.path.join(out, "base.png"))
json.dump(meta, open(os.path.join(out, "meta.json"), "w"))
print("paper", paper)
