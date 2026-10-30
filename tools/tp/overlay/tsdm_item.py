# Merges the chunk overlays tsdm_item_<x>.py.
import importlib.util, os, glob
_here = os.path.dirname(os.path.abspath(__file__))
_mods = []
for _p in sorted(glob.glob(os.path.join(_here, "tsdm_item_*.py"))):
    _sp = importlib.util.spec_from_file_location(os.path.basename(_p)[:-3], _p); _m = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_m); _mods.append(_m)
ITEMS = []; SP = {}; WPN = {}; GEAR = []; MASTERY = {}; WDESC = {}; SWITCH_NOTE = ""
for _m in _mods:
    ITEMS += list(getattr(_m, "ITEMS", [])); SP.update(getattr(_m, "SP", {})); WPN.update(getattr(_m, "WPN", {})); GEAR += list(getattr(_m, "GEAR", []))
    MASTERY.update(getattr(_m, "MASTERY", {})); WDESC.update(getattr(_m, "WDESC", {})); SWITCH_NOTE = getattr(_m, "SWITCH_NOTE", SWITCH_NOTE)
