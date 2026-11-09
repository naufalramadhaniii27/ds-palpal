/* Page environment of the sheet UI (SOLID stage 3, D). The sheet files read and publish page globals ONLY through `env`.
   `env.NAME` is the same property as `window.NAME`: the getter reads it at the moment of use, the setter writes it. The old window names stay,
   so the builder, the fx packs, the Training Ground and the tests see exactly what they saw before. Browser APIs (addEventListener, matchMedia,
   innerWidth, scrollY, fetch, ...) are not shared state and are used directly. No imports on purpose (loads first). */
export const env = {};
function bind(names){ names.forEach((n) =>{ Object.defineProperty(env, n, { get(){ return window[n]; }, set(v){ window[n] = v; }, enumerable: true }); }); }
/* Data tables and registries filled by the data scripts (read only by the sheet) */
bind(["CRIMG", "DECKFIX", "FLUFF", "HBIDX", "HBN", "ITEMFIX", "LANGFIX", "QIMG", "QREFS", "SPREF", "THIRD_SUBS", "WX", "WXF_ALL", "WXI", "WXG", "WXSP", "WXBG", "WXS", "__D", "__GLOSS", "__MANSUM", "__ICO"]);
/* Art helpers published by the art scripts */
bind(["__ART", "__PPIDX", "__artIc", "__artSheet", "__artSub", "__artVig", "__miArtH", "__qimN"]);
/* Builder bridge (the builder bundle publishes these when it loads) */
bind(["__bldArmor", "__bldBack", "__bldCheck", "__bldChoiceList", "__bldDiff", "__bldDot", "__bldEquip", "__bldForSheet", "__bldFxToggle", "__bldGo", "__bldHas", "__bldHpMode", "__bldLevelUp", "__bldMine", "__bldNeed", "__bldNorm", "__bldOpen", "__bldOpenCount", "__bldPactInfo", "__bldSetPact", "__bldOpts", "__bldPendList", "__bldQuickFor", "__bldReload", "__bldRemove", "__bldRename", "__bldSetMw", "__bldSetQty", "__bldSheetBatch", "__bldSheetFor", "__bldSpInfo", "__bldSpSet", "__bldSync", "__bldToast", "__bldToggleEq", "__bldUnpack", "__bldUse"]);
/* Mastery-of-interaction, Training Ground and Learn bridges */
bind(["__MI", "__learnBack", "__learnOpen", "__miBd", "__miEcho", "__miInfo", "__miJournal", "__miLookH", "__miMusicH", "__miOdo", "__miPip", "__miPrefH", "__miRoll", "__miRollKey", "__tgBack", "__tgDuel", "__tgDuelPick", "__tgEst", "__tgOpen"]);
/* Vendor libraries loaded on demand */
bind(["html2canvas", "jspdf"]);
/* Hooks the sheet publishes itself (old window names stay, tests and other code read them) */
bind(["__uiReg", "__actProbe", "__app", "__appLabel", "__appVer", "__ask", "__bcOn", "__bkpCheck", "__bkpMake", "__blendSheet", "__buildPrint", "__cheatOpen", "__coinCp", "__coinList", "__coinPay", "__coinTotal", "__coinsFor", "__coinsGet", "__coinsGp", "__coinsNow", "__coinsPending", "__coinsPut", "__crFor", "__cuNum", "__dTxt", "__deferDone", "__deriveFor", "__dtIcon", "__edm", "__frOpen", "__friends", "__fz", "__gl14", "__hc", "__hdrFit", "__healFind", "__ico", "__icoCls", "__icoItem", "__icoText", "__idNoArt", "__itemMeta", "__lazyReady", "__libAudit", "__libFind", "__libHtml", "__libIdx", "__libIndex", "__libScan", "__libStats", "__linkKnown", "__lsSave", "__lsSet", "__moreSet", "__net", "__noLibIdx", "__noSync", "__numberMap", "__openRest", "__ovState", "__pal", "__pipWin", "__priceTxt", "__publicFresh", "__pwa", "__pwaErr", "__pwaReg", "__qrFrames", "__qrMake", "__qrScanOpen", "__qrSent", "__qrStream", "__rbOpen", "__rbSlow", "__rbStats", "__rcptCheck", "__rcptDiffFor", "__rcptNow", "__rcptPreview", "__rcptRestoreText", "__rcptShow", "__recapData", "__recapOpen", "__recover", "__reportText", "__sheetApply", "__sheetCamp", "__sheetId", "__sheetIdent", "__sheetIdentSet", "__sheetName", "__sheetNew", "__sheetOwnNums", "__sheetPortrait", "__sheetRerender", "__sheetSoft", "__sheetState", "__sit", "__sp14Set", "__spCalc", "__spCompH", "__spRangeH", "__spot", "__syMerge", "__sync", "__syncBanners", "__syncLocal", "__syncRun", "__tm", "__toast", "__topLayer", "__tour", "__undoInfo", "__wake", "__whichDie", "__wxSpRow", "__xl", "__xlDom", "__xlFlush", "__xlQ"]);
/* Browser APIs of the page object (SOLID stage 9, D). Values are read at the moment of use, so a test that replaces window.print or window.addEventListener is still seen.
   Constructors and plain values: read through. Methods that need `this` to be the window: read through and bound. */
bind(["CSS", "CompressionStream", "DecompressionStream", "IntersectionObserver", "MutationObserver", "PerformanceObserver", "ResizeObserver", "BarcodeDetector", "claude", "devicePixelRatio", "documentPictureInPicture", "innerHeight", "innerWidth", "isSecureContext", "launchQueue", "scheduler", "scrollY"]);
function bindFn(names){ names.forEach((n) =>{ Object.defineProperty(env, n, { get(){ const f = window[n]; return typeof f === "function" ? f.bind(window) : f; }, enumerable: true }); }); }
bindFn(["addEventListener", "removeEventListener", "fetch", "focus", "matchMedia", "print", "requestAnimationFrame", "scrollBy", "scrollTo", "showSaveFilePicker"]);
/* list of the bound names (the contract test reads it) */
export const ENV_NAMES = Object.keys(env);
