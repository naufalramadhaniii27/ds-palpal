import {typeOk,targetProblems,riderProblems,dieReplaceProblems,selfDamageProblems,spendDiceProblems,repairSpecProblems,divineStrikeMarkerProblems,whenSingleProblems} from "./01-logic-core-helpers.js";
/* ==========================================================================================================================================
   fx engine, SOLID stage 2 (L): ONE schema for an effect entry. Every field an entry may carry and the types it may hold. The same schema applies to
   all registries: the GX.<kind> tables, the class, species and background effect lists, the magic item rows (fx object) and the entries gfx() builds.
   An entry with a field that is not here, or a field of another type, fails tests/solid_contract.py. A new field group = one line here + a handler.
   Type words: see typeOk in 01-logic-core-helpers.js. The last line holds the structural fields the engine adds to a built entry (label, kind ...).
   ========================================================================================================================================== */
export const FX_FIELDS={
 l:"number",
 n:"string",
 "spCls":"string",
 pick:"array",
 init:"array|number|string",
 when:"object",
 divineStrike:"object",
 toggle:"object",
 consume:"object",
 retain:"boolean",
 notSpecies:"array",
 savePE:"object",
 itemState:"string",
 target:"object",
 targetOn:"boolean?",
 acAdd:"array|number|string",
 cond:"string",
 res:"array",
 mv:"object",
 armor:"array",
 acArmAb:"string",
 speedMul:"number",
 condImm:"array",
 defs:"array",
 speedAdd:"number|string",
 imm:"array",
 hpLvl:"number",
 spells:"array",
 objectRepair:"array",
 fsPick:"number",
 saveBonusNp:"string",
 min:"number",
 chkBonus:"array",
 lu:"array|object",
 slotAdd:"array",
 advOn:"array",
 atkAb:"object",
 saveBonus:"number|string",
 weapons:"array",
 weaponGroups:"array",
 classOnly:"string",
 acBase:"array|number",
 unarmed:"object",
 speed:"array",
 skillProf:"array",
 skillExpert:"array",
 shAc:"array",
 initAdv:"boolean",
 size:"string",
 abUp:"array",
 def:"array",
 skillBonus:"array",
 extraAttack:"number",
 initDie:"string",
 tools:"array",
 atkBonus:"array",
 prepAdd:"array|number|string",
 cantAdd:"number",
 spListAdd:"array|object",
 darkNone:"number",
 darkHave:"object",
 skillPE:"array",
 sense:"array",
 wmAdd:"number",
 langs:"array",
 saveBonusAb:"array",
 darkAdd:"number",
 acOver:"boolean",
 chkBonusNp:"array",
 abPick:"object",
 acCap:"number",
 atkDice:"array",
 atkSelfDamage:"array",
 atkSpendDice:"array",
 pickLv:"array",
 abSet:"array",
 toolExpert:"array",
 saveProf:"array",
 speedAddIf:"object",
 hpFlat:"number",
 carryBump:"boolean",
 darkTo:"number",
 acDexAb:"string",
 skillAb:"array",
 dieReplace:"array",
 saveNote:"array",
 resToImm:"array",
 saveFrom:"string",
 senseAdd:"array",
 abCut:"object",
 abUpPick:"object",
 vul:"array",
 attune:"number",
 spAtk:"number",
 spDc:"number",
 abDown:"array",
 luBump:"array",
 offHand:"boolean",
 sizeSet:"string",
 dieStep:"array",
 ac:"array|number",
 _L5:"number",
 acNoDex:"boolean",
 acDexMax:"number",
 noSurprise:"boolean|string",
 reach:"array",
 toolPE:"array",
 attackRow:"array",
 skillProfPlus:"array",
 grantItem:"array",
 dcAdd:"object",
 cdAdd:"number",
 pbAdd:"number",
 exhLock:"number",
 ed:"string",
 hp:"string",
 /* fields of the magic item rows */setsc:"array",atk:"number",dmg:"number",dark:"number",abil:"array",adv:"array",climb:"string",save:"number",swim:"number|string",spellAtk:"number",spellDc:"number",spellCls:"string",
 speedSet:"number",off:"number|boolean?",lv:"number?",lbl:"string",kind:"string",owner:"string?",okey:"string?",pre:"string?",idx:"number?",ocls:"string?",tgOn:"boolean?",fx:"object?"};
export function fxEntryProblems(e){const bad=[];
 if(!e||typeof e!=="object"||Array.isArray(e)){bad.push("entry is not a plain object");return bad}
 Object.keys(e).forEach((k) =>{if(!Object.prototype.hasOwnProperty.call(FX_FIELDS,k)){bad.push("field "+k+" is not in the entry schema");return}
  if(!typeOk(FX_FIELDS[k],e[k]))bad.push("field "+k+" should be "+FX_FIELDS[k]+", is "+(Array.isArray(e[k])?"array":e[k]===null?"null":typeof e[k]))});
 extraEntryProblems(e,bad);
 return bad}

function extraEntryProblems(e,bad){if(Object.prototype.hasOwnProperty.call(e,"divineStrike"))bad.push(...divineStrikeMarkerProblems(e.divineStrike));if(e.when)bad.push(...whenSingleProblems(e.when)); if(e.retain&&(!e.toggle||!e.toggle.id||e.toggle.default!==false))bad.push("retain needs a toggle with default false");
 if(e.consume){
  if(!e.toggle||!e.toggle.id||e.toggle.default!==false)bad.push("consume needs a toggle with default false");
  if(typeof e.consume.duration!=="string"||!e.consume.duration.trim())bad.push("consume needs a duration label");
 }
 if("itemState" in e&&!["wielded","attuned","unattuned"].includes(e.itemState))bad.push("itemState must be wielded, attuned or unattuned");
 if(e.target)bad.push(...targetProblems(e.target));
 (Array.isArray(e.objectRepair)?e.objectRepair:[]).forEach(x=>bad.push(...repairSpecProblems(x)));
 (Array.isArray(e.atkDice)?e.atkDice:[]).forEach((x) =>bad.push(...riderProblems(x)));
 (Array.isArray(e.dieReplace)?e.dieReplace:[]).forEach((x)=>bad.push(...dieReplaceProblems(x)));
 (Array.isArray(e.atkSpendDice)?e.atkSpendDice:[]).forEach((x)=>bad.push(...spendDiceProblems(x)));
 (Array.isArray(e.atkSelfDamage)?e.atkSelfDamage:[]).forEach((x)=>bad.push(...selfDamageProblems(x)));
}
