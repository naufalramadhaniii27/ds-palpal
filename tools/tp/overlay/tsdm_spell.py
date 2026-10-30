# Merges the chunk overlays tsdm_spell_<x>.py.
import importlib.util, os, glob
_here = os.path.dirname(os.path.abspath(__file__))
_mods = []
for _p in sorted(glob.glob(os.path.join(_here, "tsdm_spell_*.py"))):
    _sp = importlib.util.spec_from_file_location(os.path.basename(_p)[:-3], _p); _m = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_m); _mods.append(_m)
TEXT = {}
for _m in _mods: TEXT.update(_m.TEXT)
