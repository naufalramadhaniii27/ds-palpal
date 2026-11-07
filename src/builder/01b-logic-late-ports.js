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
export function effWeps(){return P.effWeps()}
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
