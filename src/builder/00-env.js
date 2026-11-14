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
/* long text of a species trait or background feature, set by 25-logic-hooks-for-the-sheet.js (the data lives in 06b, a handler may not import it) */
export function full14(rs,g,n){const f=genv.__bldFull14;return f?f(rs,g,n):{}}
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
/* ---------- stage 5 (D): the tables the pack appliers rebuild (13b-logic-pack-handlers.js). They are the same objects as the bare global names; the appliers change them in place ---------- */
export function packTables(){return {SPECIES:SPECIES,BACKGROUNDS:BACKGROUNDS,FEATS:FEATS,CLASSES:CLASSES,PRICE:PRICE,AUTO:AUTO,DMGI:DMGI,CF_FULL:CF_FULL}}
/* test hook: window.__packStrict = true makes a pack step throw when it reads a table or a service it did not declare, or leaves a table with the wrong type */
export function packStrict(){return typeof window!=="undefined"&&!!window.__packStrict}
/* helpers for the tests and the sheet, on window under their old names (v38 p13, v65, v75). dmap is the magic item table of 03 (a module variable, not a global), setSrc turns a source on or off */
export function exposeSourceHelpers(dmap,setSrc){
 expose("__setSrc",setSrc);expose("__hasItem",function(n){return !!dmap[n]});expose("__hasSp",function(n){return !!SPECIES[n]});expose("__hasBg",function(n){return !!BACKGROUNDS[n]});
 expose("__hasGear",function(n){return GEAR.some((g) =>{return g[0]===n})});expose("__spellNames",function(){return SPELLS.map((x) =>{return x[0]})});
 expose("__hasAny",function(n){return !!(dmap[n]||ARMOR[n]||WEAPONS[n]||GEAR.some((g) =>{return g[0]===n})||POTIONS.some((q) =>{return q[0]===n}))})}
/* ---------- stage 8 (D): page globals the builder reads or publishes. genv.NAME is the same property as window.NAME: the getter reads it at the moment of use, the setter writes it.
   The old window names stay (the sheet, the fx packs and the tests use them). Browser methods are returned bound to window, so genv.matchMedia(q) behaves like window.matchMedia(q). ---------- */
export const genv={};
function bindG(names){ names.forEach((n) =>{ Object.defineProperty(genv, n, { get(){ return window[n]; }, set(v){ window[n] = v; }, enumerable: true }); }); }
function bindM(names){ names.forEach((n) =>{ Object.defineProperty(genv, n, { get(){ const f = /** @type {any} */ (window[n]); return typeof f === "function" ? f.bind(window) : f; }, enumerable: true }); }); }
/* data tables the data files fill (read when a step needs them) */
bindG(["DM_LIST", "DM_SP", "EFA_CLS", "EFA_NAMES", "EFA_PLANS", "EFA_READY", "HBIDX", "QLIVE", "QREFS", "WX", "WXBG", "WXC", "WXE", "WXF_ALL", "WXG", "WXI", "WXO", "WXS", "WXSP", "WXW", "WXWP"]);
/* hooks and bridges: the sheet, the art scripts and the builder itself publish these on window */
bindG(["__bldStoredSpellInfo", "__bldStoredSpellCapture", "__bldStoredSpellTokenCurrent", "__bldStoredSpellAcceptReceipt", "__bldStoredSpellAdopt", "__bldStoredSpellReview", "__bldStoredSpellSplit", "__bldStoredSpellResync", "__bldStoredSpellRestore", "__bldStoredSpellLoad", "__bldStoredSpellRelease", "__bldStoredSpellSelectReserve", "__bldStoredSpellFound", "__bldStoredSpellRemove", "__bldStoredSpellReviewStats", "__bldStoredSpellInventoryOwner", "__storedNativePaymentCurrent", "__storedNativePaymentPlan", "__storedPrepareReleaseState", "__storedSpellSave"]);
bindG(["__bldGemTokenCurrent", "__bldGemResync", "__gemPrepareReleaseState", "__spellGemCatalogForRuleset", "__bldGemInfo", "__bldGemCapture", "__bldGemAdopt", "__bldGemReview", "__bldGemSplit", "__bldGemDawn", "__bldGemAcceptReceipt", "__bldGemRelease", "__bldGemImbue", "__gemNativePaymentCurrent", "__gemNativePaymentCanCast", "__gemNativePaymentPlan", "__spellGemSave"]);
bindG(["__spellCatalogForRuleset", "__bldTattooInfo", "__bldAdoptTattoos", "__bldConfigureTattoo", "__bldSplitTattoo", "__bldApplyTattoo", "__bldAcceptTattooReceipt", "__spellwroughtTattooSave"]);
bindG(["__GLOSS", "__MANSUM", "__ICO", "__appVer", "__bldArmor", "__bldSetAttuned", "__bldFormInfo", "__bldSetForm", "__bldRefreshWield", "__bldToolFormInfo", "__bldBorrowedCantripInfo", "__bldAdoptBorrowedCantrips", "__bldSplitBorrowedCantrip", "__bldReviewBorrowedCantrip", "__bldPrepareTemporaryRefresh", "__bldRefreshTemporaryCantrips", "__bldTemporaryCantripChoices", "__temporaryCantripOpen", "__temporaryCantripSave", "__bldSetToolForm", "__bldVehicleInfo", "__bldRiddenVehicleInfo", "__bldSetRiddenVehicle", "__bldSplitRiddenVehicle", "__riddenVehicleOpen", "__bldSetVehicle", "__bldSplitVehicle", "__bldArt", "__bldAsk", "__bldAuto", "__bldBack", "__bldBanner", "__bldBusyOff", "__bldCards", "__bldCheck", "__bldChoiceList", "__bldData", "__bldDiff", "__bldDot", "__bldEquip", "__bldFeatViol", "__bldFeats", "__bldFillFor", "__bldForSheet", "__bldLong14", "__bldFuzz", "__bldFxToggle", "__bldConsume", "__bldGo", "__bldHas", "__bldHasSpell", "__bldPactInfo", "__bldSetPact", "__bldHpMode", "__bldItems", "__bldLevelUp", "__bldLists", "__bldMine", "__bldNorm", "__bldOpen", "__bldOpenCount", "__bldOpts", "__bldQLive", "__bldQuickFor", "__bldRef", "__bldReload", "__bldRemove", "__bldRename", "__bldRound", "__bldRs", "__bldSetMw", "__bldSetQty", "__bldSheetBatch", "__bldSheetFor", "__bldSpCnt", "__bldSpInfo", "__bldSpMsgs", "__bldSpSet", "__bldSpTest", "__bldSpellSlots", "__bldStepDone", "__bldSync", "__bldTestB", "__bldTestGo", "__bldTestItems", "__bldTestSet", "__bldToast", "__bldToggleEq", "__bldUnpack", "__bldUse", "__bldXl", "__coinCp", "__coinList", "__coinPay", "__coinTotal", "__coinsGet", "__coinsGp", "__coinsPending", "__coinsPut", "__dTxt", "__dtIcon", "__fxRegistry", "__gl14", "__ico", "__icoCls", "__icoItem", "__icoText", "__inTS", "__itemMeta", "__lsSave", "__lsSet", "__miSpring", "__miT", "__priceTxt", "__publicFresh", "__rcptPreview", "__recover", "__rl14", "__sheetApply", "__sheetCamp", "__sheetId", "__sheetIdent", "__sheetIdentSet", "__sheetName", "__sheetNew", "__sheetOwnNums", "__sheetPortrait", "__sheetRerender", "__sheetSoft", "__sheetState", "__sp14Set", "__spCalc", "__spCompH", "__spRangeH", "__topLayer", "__xl"]);
bindG(["__sheetSetName"]);
/* browser methods */
bindM(["fetch", "matchMedia", "scrollTo"]);

bindG(["__bldSlotRecoveryInfo", "__bldSlotRecoveryCapture", "__bldSlotRecoveryTokenCurrent", "__bldSlotRecoveryAcceptReceipt", "__bldSlotRecoveryAdopt", "__bldSlotRecoveryReview", "__bldSlotRecoverySplit", "__bldSlotRecoveryResync", "__bldSlotRecoveryRestore", "__bldSlotRecoveryRemove", "__bldSlotRecoveryActivate", "__bldSlotRecoveryReset", "__bldSlotRecoveryInventoryOwner", "__bldSlotRecoveryRestPlan", "__slotRecoveryActionAllowed", "__slotRecoverySave"]);

bindG(["__bldBagTricksInfo", "__bldBagTricksCapture", "__bldBagTricksTokenCurrent", "__bldBagTricksCommand", "__bldBagTricksAcceptReceipt", "__bldBagTricksInventoryOwner", "__bagTricksSave"]);
bindG(["__bldStudyBooksInfo", "__bldStudyBooksCapture", "__bldStudyBooksTokenCurrent", "__bldStudyBooksCommand", "__bldStudyBooksAcceptReceipt", "__bldStudyBooksInventoryOwner", "__studyBooksSave"]);
bindG(["__bldNecronomiconInfo", "__bldNecronomiconCapture", "__bldNecronomiconTokenCurrent", "__bldNecronomiconStudy", "__bldNecronomiconAffliction", "__bldNecronomiconCure", "__bldNecronomiconReviewBase", "__bldNecronomiconAcceptReceipt", "__necronomiconReadingSave"]);
