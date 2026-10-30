# Merges the per-class overlays of Valda's Spire of Secrets (2024). Each tvss_sub_<class>.py defines SUB in the shape of tdcsr_sub.py.
import importlib.util, os
SUB = {}
_here = os.path.dirname(os.path.abspath(__file__))
for _n in ("cleric", "wizard", "bard", "barbarian"):
    _p = os.path.join(_here, "tvss_sub_%s.py" % _n)
    if os.path.exists(_p):
        _sp = importlib.util.spec_from_file_location("tvss_sub_" + _n, _p); _m = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_m)
        SUB.update(_m.SUB)
