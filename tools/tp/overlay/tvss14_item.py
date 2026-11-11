# Merges the chunk overlays tvss14_item_<x>.py (own wording, Valda's Spire of Secrets 2014 rules).
import importlib.util, os, glob
_here = os.path.dirname(os.path.abspath(__file__))
ITEMS = []; SP = {}; WPN = {}; GEAR = []; MASTERY = {}; WDESC = {}; WDESC_FN = None; SWITCH_NOTE = ""; SUPERSEDED = []
for _p in sorted(glob.glob(os.path.join(_here, "tvss14_item_*.py"))):
    _sp = importlib.util.spec_from_file_location(os.path.basename(_p)[:-3], _p); _m = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_m)
    ITEMS += list(getattr(_m, "ITEMS", [])); SP.update(getattr(_m, "SP", {})); WPN.update(getattr(_m, "WPN", {})); GEAR += list(getattr(_m, "GEAR", []))
    WDESC.update(getattr(_m, "WDESC", {})); WDESC_FN = getattr(_m, "WDESC_FN", WDESC_FN)
