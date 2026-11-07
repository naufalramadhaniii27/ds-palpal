/* Page environment of the boot scripts (SOLID stage 9, D). The boot scripts read and publish page globals ONLY through BootEnv.
   BootEnv.NAME is the same property as window.NAME (the getter reads at the moment of use, the setter writes), so the old window names stay and every other script sees what it saw before.
   A top-level const of a classic script is shared by the later scripts of the page without becoming a window property. No imports on purpose (loads first). */
const BootEnv = {};
(function(){
  function bind(names){ names.forEach(function(n){ Object.defineProperty(BootEnv, n, { get: function(){ return window[n]; }, set: function(v){ window[n] = v; }, enumerable: true }); }); }
  function bindFn(names){ names.forEach(function(n){ Object.defineProperty(BootEnv, n, { get: function(){ const f = window[n]; return typeof f === "function" ? f.bind(window) : f; }, enumerable: true }); }); }
  /* hooks and flags the boot scripts publish for each other, the app and the tests */
  bind(["__appLabel", "__bldBusyOff", "__bldNeed", "__deferDone", "__deferHook", "__errReport", "__gateAll", "__gateDone", "__gateRun", "__lazyOn", "__lazyReady", "__lazyRun", "__miReload", "__store", "__storeHold", "__ttLoader", "__ttLog"]);
  /* browser APIs */
  bind(["ReportingObserver", "indexedDB", "localStorage", "scheduler", "trustedTypes"]);
  bindFn(["addEventListener", "dispatchEvent", "requestAnimationFrame"]);
  BootEnv.isWindow = function(t){ return t === window; };
})();
