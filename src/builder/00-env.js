/* Engine environment (SOLID stage 1, D). The effect engine and the builder derivation read the page globals ONLY through this file.
   Each accessor does the same read the old inline code did. The window.* names stay as they were (other code and tests use them):
   this file is the one place that knows them, so the engine files depend on these functions and not on window. No imports on purpose (loads first). */
/* registries filled by the data files: GX.<kind>[name] = effect entries, FXO[item] = override of a magic item row */
export function gx(){return (typeof window!=="undefined"&&window.GX)||{}}
export function fxo(){return typeof window!=="undefined"&&window.FXO}
/* the open sheet state (saved toggles S.fxT, previous sheet C), or a falsy value when no sheet is open */
export function sheetState(){return typeof window!=="undefined"&&window.__sheetState&&window.__sheetState()}
/* window.THIRD_SUBS[sub]={list,ab,cant} makes a subclass a third caster */
export function thirdSubs(){return typeof window!=="undefined"&&window.THIRD_SUBS}
/* __inTS: 1 while toSheet() runs (the old global name stays, hook code reads it) */
export function inTS(){return window.__inTS}
export function setInTS(v){window.__inTS=v}
export function appVer(){return window.__appVer||0}
/* extra skills registry {name:{ab,d}} */
export function xsk(){return window.XSK||{}}
/* Eberron source: class object and name lists, set by its data file */
export function efaCls(){return window.EFA_CLS}
export function efaNames(){return window.EFA_NAMES}
/* glossary hook of the 2014 switch */
export function gl14(on){return window.__gl14&&window.__gl14(on)}
/* publish a function on window under its old name (hooks for the sheet and the tests) */
export function expose(name,fn){window[name]=fn;return fn}
