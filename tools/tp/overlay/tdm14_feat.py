# Merges the chunk overlays tdm14_feat_<x>.py (own wording, Dark Matter 2014 rules).
import importlib.util, os, glob
_here = os.path.dirname(os.path.abspath(__file__))
FEATS = {}; ALSO = []
for _p in sorted(glob.glob(os.path.join(_here, "tdm14_feat_*.py"))):
    _sp = importlib.util.spec_from_file_location(os.path.basename(_p)[:-3], _p); _m = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_m)
    FEATS.update(_m.FEATS); ALSO += list(getattr(_m, "ALSO", []))
