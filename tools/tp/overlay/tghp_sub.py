# Merges the per-chunk overlays of Grim Hollow Player's Guide (2024). Each tghp_sub_<x>.py defines SUB.
import importlib.util, os, glob
SUB = {}
_here = os.path.dirname(os.path.abspath(__file__))
for _p in sorted(glob.glob(os.path.join(_here, "tghp_sub_*.py"))):
    _sp = importlib.util.spec_from_file_location(os.path.basename(_p)[:-3], _p); _m = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_m)
    SUB.update(_m.SUB)
