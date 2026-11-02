import sys, time, numpy as np, torch, torch.nn as nn, torch.nn.functional as F
from PIL import Image
torch.set_num_threads(2)

class SRVGG(nn.Module):
    def __init__(s, nf=64, nc=16, up=4):
        super().__init__(); s.up = up
        b = [nn.Conv2d(3, nf, 3, 1, 1), nn.PReLU(nf)]
        for _ in range(nc): b += [nn.Conv2d(nf, nf, 3, 1, 1), nn.PReLU(nf)]
        b += [nn.Conv2d(nf, 3 * up * up, 3, 1, 1)]
        s.body = nn.ModuleList(b); s.ps = nn.PixelShuffle(up)
    def forward(s, x):
        o = x
        for m in s.body: o = m(o)
        return s.ps(o) + F.interpolate(x, scale_factor=s.up, mode='nearest')

def load(p):
    m = SRVGG(); sd = torch.load(p, map_location='cpu')
    sd = sd.get('params', sd); m.load_state_dict(sd); return m.eval()

def run(m, im, tile=256, pad=10):
    x = torch.from_numpy(np.asarray(im, np.float32) / 255).permute(2, 0, 1)[None]
    _, _, H, W = x.shape; out = torch.zeros(1, 3, H * 4, W * 4)
    with torch.no_grad():
        for y in range(0, H, tile):
            for xx in range(0, W, tile):
                y0, x0 = max(y - pad, 0), max(xx - pad, 0)
                y1, x1 = min(y + tile + pad, H), min(xx + tile + pad, W)
                r = m(x[:, :, y0:y1, x0:x1])
                ty, tx = (y - y0) * 4, (xx - x0) * 4
                th, tw = (min(y + tile, H) - y) * 4, (min(xx + tile, W) - xx) * 4
                out[:, :, y * 4:y * 4 + th, xx * 4:xx * 4 + tw] = r[:, :, ty:ty + th, tx:tx + tw]
    a = (out[0].clamp(0, 1).permute(1, 2, 0).numpy() * 255 + .5).astype(np.uint8)
    return Image.fromarray(a)

if __name__ == '__main__':
    m = load(sys.argv[1]); src, dst, W, H = sys.argv[2], sys.argv[3], int(sys.argv[4]), int(sys.argv[5])
    t = time.time(); r = run(m, Image.open(src).convert('RGB'))
    r.resize((W, H), Image.LANCZOS).save(dst); print(dst, round(time.time() - t, 1), 's')
