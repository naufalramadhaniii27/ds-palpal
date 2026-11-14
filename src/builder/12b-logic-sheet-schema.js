import {typeOk} from "./01-logic-core-helpers.js";
/* ==========================================================================================================================================
   toSheet() state schema, SOLID stage 2 (L). ONE table says which keys the sheet C and the locals l may hold and what type each value has.
   A handler patch ({C:{...}, l:{...}}, see 12a-logic-sheet-registry.js) is valid when every key is in this table and every value has its type.
   Type words: "string" "number" "boolean" "array" "object" "any". A trailing "?" also allows undefined (and null). "a|b" is either type.
   tests/solid_contract.py runs every handler on real states and fails a patch that breaks this table. Add a key here before a handler writes it.
   ========================================================================================================================================== */
export const SHEET_C={v:"number",bv:"number",name:"string",species:"string",cls:"string",sub:"string",bg:"string",size:"string",office:"string",camp:"string",cardNo:"string",level:"number",hitDie:"number",
 hpPerLevel:"array",abilities:"object",rolledNote:"string",saves:"object",skills:"array",initBonus:"array",hpBonus:"array",grappler:"boolean",lang:"array",ac:"object",saveBonus:"array",attMax:"number",
 speed:"number",speedSrc:"string",rs:"string",darkvision:"number",darkSrc:"string",profs:"object",profSrc:"object",attacks:"array",inv:"array",inventoryFormV:"any",allPurposeSources:"any",tattooSources:"any",spellGemSources:"any",slotRecoverySources:"any",necronomiconReading:"object",birdToken:"any",defender:"any",defenderSources:"any",defenderBindings:"any",hornValhalla:"any",bagTricks:"any",studyBooks:"any",studyBookSources:"any",pluvennGrappleclaws:"object",gp:"number",equipNote:"string",res:"array",actions:"array",
 features:"array",defenses:"array",itemAdv:"array",speeds:"object",senses:"array",moves:"array",xdmg:"array",saveNotes:"array",wsForms:"array",companion:"string",spells:"array",objectRepairSources:"array",spellcasting:"object",castingSources:"object",itemSpellDamageFeatures:"object",divineStrike:"object",discipleOfLife:"object",supremeHealing:"object",divineSpark:"object",divineIntervention:"object",ordersWrath:"object",
 carryBump:"boolean",toolExp:"array",toolCheckRules:"array",exhMin:"number",acts:"array",pasBon:"array",dcAb:"string",dcSrc:"string",clsLabel:"string",clsInh:"object?",pbAdd:"number",fxToggles:"array",fxTargets:"array"};
export const SHEET_L={};
/* register the locals of a handler file (called at load by the handler file that owns them) */
export function defineLocals(o){Object.keys(o).forEach((k) =>{if(Object.prototype.hasOwnProperty.call(SHEET_L,k)&&SHEET_L[k]!==o[k])throw new Error("sheet schema: local "+k+" is defined twice");SHEET_L[k]=o[k]})}
/* problems of a patch (empty list = valid). `writes` is the handler's own list */
export function patchProblems(h,p){const bad=[];
 if(p===null||p===undefined)return bad;
 if(typeof p!=="object"||Array.isArray(p)){bad.push("patch is not a plain object");return bad}
 Object.keys(p).forEach((ns) =>{if(ns!=="C"&&ns!=="l"){bad.push("patch key "+ns+" (only C and l)");return}
  const o=p[ns],T=ns==="C"?SHEET_C:SHEET_L;if(!o||typeof o!=="object"||Array.isArray(o)){bad.push("patch."+ns+" is not an object");return}
  Object.keys(o).forEach((k) =>{if(!h._w[ns+"."+k])bad.push(ns+"."+k+" is not in writes");if(!Object.prototype.hasOwnProperty.call(T,k)){bad.push(ns+"."+k+" is not in the state schema");return}
   if(o[k]!==undefined&&!typeOk(T[k],o[k]))bad.push(ns+"."+k+" should be "+T[k]+", is "+(Array.isArray(o[k])?"array":typeof o[k]))})});
 return bad}
