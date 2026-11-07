/* Page environment of the Training Ground block (SOLID stage 9, D). The files of this block read and publish page globals ONLY through `env`.
   `env.NAME` is the same property as `window.NAME`: the getter reads at the moment of use, the setter writes it. The old window names stay,
   so the sheet, the tests and the other blocks see what they saw before. No imports on purpose (loads first). */
export const env = {};
["CLASSES", "CSS", "CompressionStream", "TGE", "__MI", "__app", "__bldNeed", "__bldSheetFor", "__dice3d", "__tgBack", "__tgDraw", "__tgDrawStats", "__tgDuel", "__tgDuelPick", "__tgEst", "__tgOpen", "__tgState", "__tgWake", "devicePixelRatio"].forEach((n) =>{ Object.defineProperty(env, n, { get(){ return window[n]; }, set(v){ window[n] = v; }, enumerable: true }); });
