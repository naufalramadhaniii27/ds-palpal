# Merges the per-chunk overlays of the Grim Hollow Transformations. Each tghp_trans_<x>.py defines TRANS = {name: {intro, stages, opt}}, and one of them also GIFTS, GIFT_D, GIFT_INTRO.
import importlib.util, os, glob
TRANS = {}; GIFTS = {}; GIFT_D = ""; GIFT_INTRO = ""
_here = os.path.dirname(os.path.abspath(__file__))
for _p in sorted(glob.glob(os.path.join(_here, "tghp_trans_*.py"))):
    _sp = importlib.util.spec_from_file_location(os.path.basename(_p)[:-3], _p); _m = importlib.util.module_from_spec(_sp); _sp.loader.exec_module(_m)
    TRANS.update(_m.TRANS); GIFTS.update(getattr(_m, "GIFTS", {}))
    GIFT_D = getattr(_m, "GIFT_D", GIFT_D); GIFT_INTRO = getattr(_m, "GIFT_INTRO", GIFT_INTRO)
