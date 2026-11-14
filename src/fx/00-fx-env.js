/* Page environment of the effect packs (SOLID stage 8, D). The fx files read and publish page globals ONLY through FXENV.
   FXENV.NAME is the same property as window.NAME: the getter reads it at the moment of use, the setter writes it. The old window names stay
   (the sheet, the builder and the tests use them). Browser methods come back bound to window, so FXENV.matchMedia(q) behaves like window.matchMedia(q);
   browser classes and objects (IntersectionObserver, CSS, crypto, ...) come back as they are. This file loads first in the fx block (no imports, classic script). */
const FXENV={};
(function(){
 function bindG(names){ names.forEach(function(n){ Object.defineProperty(FXENV, n, { get:function(){ return window[n]; }, set:function(v){ window[n]=v; }, enumerable:true }); }); }
 function bindM(names){ names.forEach(function(n){ Object.defineProperty(FXENV, n, { get:function(){ var f=window[n]; return typeof f==="function"?f.bind(window):f; }, enumerable:true }); }); }
 /* browser classes and objects */
 bindG(["AudioContext", "CSS", "DeviceOrientationEvent", "Element", "IntersectionObserver", "MutationObserver", "console", "crypto", "devicePixelRatio", "webkitAudioContext"]);
 /* hooks published by the sheet, the art scripts, the builder and the other fx packs */
 bindG(["__ART", "__fxBridge", "__MI", "__artIc", "__artSheet", "__artSub", "__artVig", "__bldArt", "__bldBanner", "__bldBusyOff", "__bldCards", "__bldOpen", "__blendSheet", "__bslug", "__clsArt", "__dice3d", "__miAmb", "__miArtH", "__miBd", "__miDice", "__moreSet", "__miBell", "__miBurst", "__miCascade", "__miEcho", "__miFloat", "__miFlyBackN", "__miFlyIn", "__miFlyN", "__miFlyOut", "__miIcon", "__miInfo", "__miJournal", "__miLevel", "__miLookH", "__miMusicH", "__miNF", "__miOdo", "__miOdoVal", "__miPip", "__miPrefH", "__miQ", "__miRing", "__miRoll", "__miRollKey", "__miSky", "__miSmoke", "__miSnd", "__miToast", "__miWow", "__nbDraw", "__recapOpen", "__scnFind", "__sheetState", "__spellSourceGuard", "__temporaryAttackGuard", "__defenderAttackSpec"]);
 /* browser methods */
 bindM(["addEventListener", "matchMedia", "requestAnimationFrame", "requestIdleCallback"]);
})();
