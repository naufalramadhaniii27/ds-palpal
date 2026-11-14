# Own-wording subclasses of Dark Matter, 2014 rules. Merges the per-batch files tdm14_sub_*.py.
SUB = {}
import importlib.util as _u, os as _o
_d = _o.path.dirname(_o.path.abspath(__file__))
for _f in sorted(_x[:-3] for _x in _o.listdir(_d) if _x.startswith("tdm14_sub_") and _x.endswith(".py")):
    _sp = _u.spec_from_file_location(_f, _o.path.join(_d, _f + ".py")); _m = _u.module_from_spec(_sp); _sp.loader.exec_module(_m)
    SUB.update(_m.SUB)
