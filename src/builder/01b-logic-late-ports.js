/* Late ports (SOLID stage 8, D and I): functions that an earlier file calls but a later file owns (they are called only at run time, never while loading).
   Before this file the early files read them from the open bag __R (builder/00-reg.js); and toSheet() read some of them from the query object QRY.
   Now each one is a named export here, so the import line of a file shows exactly which late functions it needs. The owner file binds its functions once at load:
       bindLate({MCL,TL,...})
   A name outside the list below, a second binding of a name, or a value that is not a function throws. A call before the owner has loaded throws (the same as __R did).
   Files that load after the owner import the function from the owner and do not use this file. No imports on purpose (loads early). */
const P={};
const LATE_NAMES=["MCL","TL","baseOf","ensureInv","itemW","slotsAll","syncPickItems","hpCalc","effArmor","effShield","effWeps",/* owner 14 */
 "enabledPacks","miFeats","spOptFx","subGrant","packSkills",/* owner 13 */
 "fxList","fxListBase","fxCh","fxVal",/* owner 11 */
 "itemType"/* owner 20 */];
export function bindLate(table){
 Object.keys(table).forEach(function(k){
  if(LATE_NAMES.indexOf(k)<0)throw new Error("late ports: unknown name "+k);
  if(typeof table[k]!=="function")throw new Error("late ports: "+k+" must be a function");
  if(Object.prototype.hasOwnProperty.call(P,k))throw new Error("late ports: duplicate binding "+k);
  P[k]=table[k]})}
export function lateNames(){return LATE_NAMES.slice()}
export function MCL(){return P.MCL()}
export function TL(){return P.TL()}
export function baseOf(n){return P.baseOf(n)}
export function ensureInv(){return P.ensureInv()}
export function itemW(n){return P.itemW(n)}
export function slotsAll(){return P.slotsAll()}
export function syncPickItems(){return P.syncPickItems()}
export function hpCalc(){return P.hpCalc()}
export function effArmor(){return P.effArmor()}
export function effShield(){return P.effShield()}
export function effWeps(scores){return P.effWeps(scores)}
export function enabledPacks(){return P.enabledPacks()}
export function miFeats(){return P.miFeats()}
export function spOptFx(){return P.spOptFx()}
export function subGrant(sub){return P.subGrant(sub)}
export function packSkills(){return P.packSkills()}
/* the effect entries of the build (11-logic-derivation.js gfx()): fxList with item entries, fxListBase without */
export function fxList(){return P.fxList()}
export function fxListBase(){return P.fxListBase()}
export function fxCh(key,pre,kind,okey,any){return P.fxCh(key,pre,kind,okey,any)}
export function fxVal(v,e){return P.fxVal(v,e)}
export function itemType(n,x){return P.itemType(n,x)}
/* ---- live ports (SOLID stage 10, D and I) ----
   The rest of the old open bag __R (00-reg.js). Same idea as bindLate, but the owner binds a getter (and a setter) that reads its variable at the moment of use:
       bindLive("NAME", {get: getter, set: setter})
   A read before the owner has bound gives undefined (lateGet), a call before it throws a TypeError, a write before the bind is kept in a plain slot that the bind drops (as defineProperty did).
   A name outside the list, a second binding of a name, or a write to a name without setter throws. */
const LG={}, LS={}, LV={};
const LK={"inventoryWriteGuard":1,"toolFormWriteGuard":1,"B":1,"BASE":1,"SMAP":1,"STEPS":1,"__set_clsTab":1,"__set_openCards":1,"__set_pickCls":1,"__set_pickSp":1,"__set_step":1,"acModeCard":1,"agOn":1,"ask":1,"attN":1,"bCt":1,"bDeco":1,"bInN":1,"bInvOrder":1,"binIn":1,"bldMine":1,"casterParts":1,"choiceList":1,"choicesBuild":1,"choiceStep":1,"clsLv":1,"clsParts":1,"clsTab":1,"commit":1,"copyOf":1,"ctFree":1,"featsOf":1,"go":1,"hbForm":1,"invFind":1,"invList":1,"invLvl":1,"invPicks":1,"issueText":1,"itemDetail":1,"mcChoices":1,"openCards":1,"own":1,"pactList":1,"pickCls":1,"pickSp":1,"pk":1,"preFail":1,"qbBook":1,"qbCard":1,"qbFill":1,"qbMI":1,"qbSpells":1,"quickBuild":1,"render":1,"resKey":1,"ruleIssues":1,"sid":1,"sp14List":1,"spCmpB":1,"spDmgB":1,"spHasFeat":1,"spInfo":1,"spInfoPart":1,"spLists":1,"spRec":1,"spRngB":1,"spellAb":1,"spellCounts":1,"stamp":1,"step":1,"stepBack":1,"subAt":1,"subChoicesFor":1,"toSheet":1,"toSheetApply":1,"unList":1,"unpackAt":1,"withB":1,"wlMc":1,"xl14":1};
export function bindLive(name,acc){
 if(!LK[name])throw new Error("late ports: unknown name "+name);
 if(Object.prototype.hasOwnProperty.call(LG,name))throw new Error("late ports: duplicate binding "+name);
 LG[name]=acc.get;if(acc.set)LS[name]=acc.set;delete LV[name]}
export function lateGet(name){
 if(!LK[name])throw new Error("late ports: unknown name "+name);
 const g=LG[name];return g?g():LV[name]}
export function lateSet(name,v){
 if(!LK[name])throw new Error("late ports: unknown name "+name);
 if(!Object.prototype.hasOwnProperty.call(LG,name)){LV[name]=v;return v}
 const s=LS[name];if(!s)throw new TypeError("late ports: no setter for "+name);
 s(v);return v}
export function liveNames(){return Object.keys(LK)}
/* functions: the call goes to the owner's function as it is at that moment */
export function __set_clsTab(){return LG.__set_clsTab().apply(void 0,arguments)}
export function __set_openCards(){return LG.__set_openCards().apply(void 0,arguments)}
export function __set_pickCls(){return LG.__set_pickCls().apply(void 0,arguments)}
export function __set_pickSp(){return LG.__set_pickSp().apply(void 0,arguments)}
export function __set_step(){return LG.__set_step().apply(void 0,arguments)}
export function acModeCard(){return LG.acModeCard().apply(void 0,arguments)}
export function agOn(){return LG.agOn().apply(void 0,arguments)}
export function ask(){return LG.ask().apply(void 0,arguments)}
export function attN(){return LG.attN().apply(void 0,arguments)}
export function bCt(){return LG.bCt().apply(void 0,arguments)}
export function bDeco(){return LG.bDeco().apply(void 0,arguments)}
export function bInN(){return LG.bInN().apply(void 0,arguments)}
export function bInvOrder(){return LG.bInvOrder().apply(void 0,arguments)}
export function binIn(){return LG.binIn().apply(void 0,arguments)}
export function bldMine(){return LG.bldMine().apply(void 0,arguments)}
export function casterParts(){return LG.casterParts().apply(void 0,arguments)}
export function choicesBuild(){return LG.choicesBuild().apply(void 0,arguments)}
export function choiceList(){return LG.choiceList().apply(void 0,arguments)}
export function choiceStep(){return LG.choiceStep().apply(void 0,arguments)}
export function clsLv(){return LG.clsLv().apply(void 0,arguments)}
export function clsParts(){return LG.clsParts().apply(void 0,arguments)}
export function commit(){return LG.commit().apply(void 0,arguments)}
export function copyOf(){return LG.copyOf().apply(void 0,arguments)}
export function ctFree(){return LG.ctFree().apply(void 0,arguments)}
export function featsOf(){return LG.featsOf().apply(void 0,arguments)}
export function go(){return LG.go().apply(void 0,arguments)}
export function hbForm(){return LG.hbForm().apply(void 0,arguments)}
export function invFind(){return LG.invFind().apply(void 0,arguments)}
export function invList(){return LG.invList().apply(void 0,arguments)}
export function invLvl(){return LG.invLvl().apply(void 0,arguments)}
export function invPicks(){return LG.invPicks().apply(void 0,arguments)}
export function issueText(){return LG.issueText().apply(void 0,arguments)}
export function itemDetail(){return LG.itemDetail().apply(void 0,arguments)}
export function mcChoices(){return LG.mcChoices().apply(void 0,arguments)}
export function own(){return LG.own().apply(void 0,arguments)}
export function pactList(){return LG.pactList().apply(void 0,arguments)}
export function pk(){return LG.pk().apply(void 0,arguments)}
export function preFail(){return LG.preFail().apply(void 0,arguments)}
export function qbBook(){return LG.qbBook().apply(void 0,arguments)}
export function qbCard(){return LG.qbCard().apply(void 0,arguments)}
export function qbFill(){return LG.qbFill().apply(void 0,arguments)}
export function qbMI(){return LG.qbMI().apply(void 0,arguments)}
export function qbSpells(){return LG.qbSpells().apply(void 0,arguments)}
export function quickBuild(){return LG.quickBuild().apply(void 0,arguments)}
export function render(){return LG.render().apply(void 0,arguments)}
export function resKey(){return LG.resKey().apply(void 0,arguments)}
export function ruleIssues(){return LG.ruleIssues().apply(void 0,arguments)}
export function sid(){return LG.sid().apply(void 0,arguments)}
export function sp14List(){return LG.sp14List().apply(void 0,arguments)}
export function spCmpB(){return LG.spCmpB().apply(void 0,arguments)}
export function spDmgB(){return LG.spDmgB().apply(void 0,arguments)}
export function spHasFeat(){return LG.spHasFeat().apply(void 0,arguments)}
export function spInfo(){return LG.spInfo().apply(void 0,arguments)}
export function spInfoPart(){return LG.spInfoPart().apply(void 0,arguments)}
export function spLists(){return LG.spLists().apply(void 0,arguments)}
export function spRec(){return LG.spRec().apply(void 0,arguments)}
export function spRngB(){return LG.spRngB().apply(void 0,arguments)}
export function spellAb(){return LG.spellAb().apply(void 0,arguments)}
export function spellCounts(){return LG.spellCounts().apply(void 0,arguments)}
export function stamp(){return LG.stamp().apply(void 0,arguments)}
export function stepBack(){return LG.stepBack().apply(void 0,arguments)}
export function subAt(){return LG.subAt().apply(void 0,arguments)}
export function subChoicesFor(){return LG.subChoicesFor().apply(void 0,arguments)}
export function toSheet(){return LG.toSheet().apply(void 0,arguments)}
export function toSheetApply(){return LG.toSheetApply().apply(void 0,arguments)}
export function unList(){return LG.unList().apply(void 0,arguments)}
export function unpackAt(){return LG.unpackAt().apply(void 0,arguments)}
export function withB(){return LG.withB().apply(void 0,arguments)}
export function wlMc(){return LG.wlMc().apply(void 0,arguments)}
export function xl14(){return LG.xl14().apply(void 0,arguments)}
