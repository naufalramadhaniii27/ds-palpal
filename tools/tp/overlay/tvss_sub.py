# Merges the per-class overlays of Valda's Spire of Secrets (2024). Each tvss_sub_<class>[_x].py defines SUB in the shape of tdcsr_sub.py.
import importlib.util, os, glob
SUB = {}
_here = os.path.dirname(os.path.abspath(__file__))
for _p in sorted(glob.glob(os.path.join(_here, "tvss_sub_*.py"))):
    _n = os.path.basename(_p)[:-3]
    _sp = importlib.util.spec_from_file_location(_n, _p); _m = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_m)
    SUB.update(_m.SUB)
