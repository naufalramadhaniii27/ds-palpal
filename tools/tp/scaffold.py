#!/usr/bin/env python3
"""Writes the glob loader modules and empty chunk-ready stubs of a new third party book.
  python3 tools/tp/scaffold.py <prefix> sub,spell,feat,item,bg,species [class_prefix_name ...]
Loaders merge every <prefix>_<kind>_*.py in tools/tp/overlay. Authors write only the chunk files."""
import os, sys
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "overlay")
HDR = "import importlib.util, os, glob\n_here = os.path.dirname(os.path.abspath(__file__))\n_mods = []\nfor _p in sorted(glob.glob(os.path.join(_here, \"%s_%s_*.py\"))):\n    _sp = importlib.util.spec_from_file_location(os.path.basename(_p)[:-3], _p); _m = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_m); _mods.append(_m)\n"
BODY = {
 "sub": "SUB = {}\nfor _m in _mods: SUB.update(_m.SUB)\nEXT = []\nfor _m in _mods: EXT += list(getattr(_m, \"EXT\", []))\n",
 "spell": "TEXT = {}\nfor _m in _mods: TEXT.update(_m.TEXT)\n",
 "feat": "FEATS = {}; ALSO = []\nfor _m in _mods:\n    FEATS.update(_m.FEATS); ALSO += list(getattr(_m, \"ALSO\", []))\n",
 "item": "ITEMS = []; SP = {}; WPN = {}; GEAR = []; MASTERY = {}; WDESC = {}; SWITCH_NOTE = \"\"\nfor _m in _mods:\n    ITEMS += list(getattr(_m, \"ITEMS\", [])); SP.update(getattr(_m, \"SP\", {})); WPN.update(getattr(_m, \"WPN\", {})); GEAR += list(getattr(_m, \"GEAR\", []))\n    MASTERY.update(getattr(_m, \"MASTERY\", {})); WDESC.update(getattr(_m, \"WDESC\", {})); SWITCH_NOTE = getattr(_m, \"SWITCH_NOTE\", SWITCH_NOTE)\n",
}
SINGLE = {"bg": "OPTS = []\nALSO = []\nLU = []\nTL = {}\nBG = {}\n", "species": "SPECIES = {}\nLU = []\nACTS = {}\nSP_AUTO = {}\nDEF = {}\n"}
pre = sys.argv[1]
for k in sys.argv[2].split(","):
    path = os.path.join(D, "%s_%s.py" % (pre, k))
    if k in BODY: open(path, "w").write("# Merges the chunk overlays %s_%s_<x>.py.\n" % (pre, k) + HDR % (pre, k) + BODY[k])
    else:
        if not os.path.exists(path) or os.path.getsize(path) < 5: open(path, "w").write(SINGLE[k])
for c in sys.argv[3:]:
    p = os.path.join(D, c + ".py")
    if not os.path.exists(p): open(p, "w").write("CLASS = {}\n")
print("scaffolded", pre)
