/* N32: record which deferred part makes which global, which registry keys each part adds, and which screen reads which global.
   Installed as an init script by tests/trace_screens.py. The loader (src/boot/deferred-loader.js) calls window.__deferHook(0|1, partName) around each part. */
(function () {
  var T = window.__trace = { parts: {}, reads: {}, screen: "boot", order: [] };
  var REGS = ["SPECIES", "CLASSES", "FEATS", "BACKGROUNDS", "DMGI", "SPELLS", "SPELL_FULL", "SUB_FULL", "AUTO", "SUBCLASSES", "ITEMS", "MAGIC"];
  var names = function () { var k = {}; Object.getOwnPropertyNames(window).forEach(function (n) { k[n] = 1; }); return k; };
  var regs = function () { var o = {}; REGS.forEach(function (r) { var v; try { v = window[r]; } catch (e) {} if (v && typeof v === "object") { try { o[r] = Array.isArray(v) ? v.length : Object.keys(v).length; } catch (e) {} } }); return o; };
  var before, rb;
  window.__deferHook = function (ph, n) {
    if (ph === 0) { before = names(); rb = regs(); return; }
    var after = names(), g = [], ra = regs(), rd = {};
    for (var k in after) if (!before[k]) g.push(k);
    for (var r in ra) if (ra[r] !== (rb[r] || 0)) rd[r] = ra[r] - (rb[r] || 0);
    T.parts[n] = { globals: g, regDelta: rd }; T.order.push(n);
    g.forEach(function (k) {
      var d = Object.getOwnPropertyDescriptor(window, k); if (!d || !("value" in d) || !d.configurable) return;
      var v = d.value, w = d.writable;
      try { Object.defineProperty(window, k, { configurable: true, enumerable: d.enumerable,
        get: function () { var o = T.reads[k] || (T.reads[k] = {}); o[T.screen] = (o[T.screen] || 0) + 1; return v; },
        set: function (x) { v = x; } }); } catch (e) {}
    });
  };
  window.__traceMark = function (s) { T.screen = s; };
  var wrap = function () {
    Object.keys(T.parts).forEach(function (n) {
      T.parts[n].globals.forEach(function (g) {
        var v = window[g]; if (!v || (typeof v !== "object" && typeof v !== "function")) return;
        try { window[g] = new Proxy(v, { get: function (t, p, r) { var o = T.reads[g] || (T.reads[g] = {}); o[T.screen] = (o[T.screen] || 0) + 1; return Reflect.get(t, p, r); },
          has: function (t, p) { var o = T.reads[g] || (T.reads[g] = {}); o[T.screen] = (o[T.screen] || 0) + 1; return Reflect.has(t, p); } }); } catch (e) {}
      });
    });
  };
  /* reads are counted by getters installed at part load (see __deferHook) */
})();
