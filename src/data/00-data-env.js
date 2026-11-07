/* Data door (SOLID D, stage 7). The one place in src/data that knows `window`. Data files never write or read window directly: they go through DataEnv.
   Old global names stay alive: every slot is an accessor on window[name], so window.WX, window.QREFS, window.GX ... and the bare names in other modules work as before.
   Use in a data file:  DataEnv.slot.WXI = DataEnv.slot.WXI || {};   or the helpers  DataEnv.reg("WXI", {}),  DataEnv.get(name),  DataEnv.set(name, v),  DataEnv.has(name).
   Open for extension (O): a new data file registers what it adds by calling DataEnv.declare("MY_TABLE") on its first line, then DataEnv.slot.MY_TABLE = ...
   Nothing in this file changes when a data file is added. Shared slots used by several files are declared below (CORE); a slot only one file owns is declared by that file.
   Guard: tests/guard_window.py exempts this file by name (*env.js) and counts every other window use; tests/solid_data_contract.py checks the rest. Runs first in part db1. */
var DataEnv = (function () {
  var W = window, slot = {}, known = {};
  function declare() {
    for (var i = 0; i < arguments.length; i++) (function (n) {
      if (known[n]) return;
      known[n] = 1;
      Object.defineProperty(slot, n, { enumerable: true, get: function () { return W[n]; }, set: function (v) { W[n] = v; } });
    })(arguments[i]);
  }
  /* shared registries written by many data files (sources, items, spells, refs, fx) */
  declare("WX", "WXI", "WXSP", "WXG", "WXBG", "WXW", "WXS", "WXE", "WXWP", "WXC", "QREFS", "QIMG", "GX", "FXO", "DM_SP", "THIRD_SUBS", "AUTO", "LU_X", "__ICO", "__lazyRun", "__lazyOn");
  /* the rule tables the data files define as globals (var in the part that owns them); other modules keep reading them by the bare name */
  declare("CLASSES", "SPECIES", "BACKGROUNDS", "FEATS", "WEAPONS", "ARMOR", "SKILLS", "SPELLS");
  return {
    slot: slot,
    declare: declare,
    get: function (n) { return W[n]; },
    set: function (n, v) { W[n] = v; return v; },
    has: function (n) { return typeof W[n] !== "undefined"; },
    reg: function (n, init) { declare(n); return W[n] = W[n] || init; },
    names: function () { return Object.keys(known); }
  };
})();
