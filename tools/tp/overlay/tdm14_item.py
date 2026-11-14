# Dark Matter 2014 items. Reuses the own-wording texts of the 2024 book where the 2014 source has the same item, adds 2014-only entries from tdm14_item_x.py and weapon texts from tdm14_item_w.py.
import importlib.util, os, sys
_here = os.path.dirname(os.path.abspath(__file__))
def _load(n):
    _sp = importlib.util.spec_from_file_location(n, os.path.join(_here, n + ".py")); _m = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_m); return _m
_b = _load("tsdm_item"); _x = _load("tdm14_item_x"); _w = _load("tdm14_item_w")
_own = set(i[0] for i in _x.ITEMS)
ITEMS = list(_x.ITEMS) + [i for i in _b.ITEMS if i[0] not in _own and i[0] in _x.REUSE]
SP = dict(_b.SP); SP.update(_x.SP); WPN = dict(_x.WPN); GEAR = [g for g in _b.GEAR if g[0] in _x.REUSE] + list(_x.GEAR)
MASTERY = {}; WDESC = dict(_w.WDESC); WDESC_FN = _w.WDESC_FN; SWITCH_NOTE = ""
