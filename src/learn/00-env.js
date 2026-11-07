/* Page environment of the Learn block (SOLID stage 9, D). The files of this block read and publish page globals ONLY through `env`.
   `env.NAME` is the same property as `window.NAME`: the getter reads at the moment of use, the setter writes it. The old window names stay,
   so the sheet, the tests and the other blocks see what they saw before. No imports on purpose (loads first). */
export const env = {};
["CSS", "__MI", "__app", "__bldOpen", "__cheatOpen", "__dice3d", "__learnBack", "__learnOpen", "__learnState", "__lrnFlat", "__lrnNoAnchor", "__spot", "__topLayer", "__tour", "__whichDie"].forEach((n) =>{ Object.defineProperty(env, n, { get(){ return window[n]; }, set(v){ window[n] = v; }, enumerable: true }); });
