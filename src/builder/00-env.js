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
/* ---------- stage 2 (D): static rule tables, one narrow accessor each. They return the same objects as the old bare global names
   (CLASSES, SPECIES ... stay declared by the data files, other code and the tests still use them). A lookup by key, or the list a table is. ---------- */
export function classDef(n){return CLASSES[n]}
export function speciesDef(n){return SPECIES[n]}
export function bgDef(n){return BACKGROUNDS[n]}
export function featDef(n){return FEATS[n]}
export function weaponDef(n){return WEAPONS[n]}
export function armorDef(n){return ARMOR[n]}
export function skillAb(n){return SKILLS[n]}
export function allSkillNames(){return ALLSK}
export function subGrantRow(sub){return typeof SUB_GRANT!=="undefined"?SUB_GRANT[sub]:undefined}
export function mcGrantRow(cls){return MC_GRANT[cls]}
export function subFullText(key){return SUB_FULL[key]}
export function cfFullText(key){return CF_FULL[key]}
export function masteryText(m){return MASTERY[m]}
export function maneuverRows(){return MANEUVERS}
export function metamagicRows(){return METAMAGIC}
export function invocationRows(){return INVOCATIONS}
export function invSpellRow(n){return INV_SPELLS[n]}
export function invPickRow(n){return typeof INV_PICK!=="undefined"?INV_PICK[n]:undefined}
export function spellRows(){return SPELLS}
export function spellFullText(n){return SPELL_FULL[n]}
export function itemSpellRow(n){return typeof ITEM_SPELLS!=="undefined"?ITEM_SPELLS[n]:undefined}
export function toolOneName(c){return TOOL_ONE[c]}
export function priceOf(n){return PRICE[n]}
export function actsTable(){return typeof ACTS!=="undefined"?ACTS:undefined}
export function bookPages(){return typeof BOOKPG!=="undefined"?BOOKPG:undefined}
/* test hook: a function called after every toSheet handler (window.__sheetTrace), or a falsy value */
export function sheetTrace(){return typeof window!=="undefined"&&window.__sheetTrace}
/* test hook: window.__sheetStrict = true makes a toSheet handler throw when it reads a state key it did not declare */
export function sheetStrict(){return typeof window!=="undefined"&&!!window.__sheetStrict}
