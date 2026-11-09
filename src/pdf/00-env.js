/* Page environment of the PDFX block (SOLID, D). The files of this block read and publish page globals ONLY through `env`.
   `env.NAME` is the same property as `window.NAME`. No imports on purpose (loads first). */
export const env = {};
["PDFX"].forEach((n) =>{ Object.defineProperty(env, n, { get(){ return window[n]; }, set(v){ window[n] = v; }, enumerable: true }); });
