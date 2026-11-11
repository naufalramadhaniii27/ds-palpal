/* Pure specifications for an optional damage roll that consumes a resource.
   Invalid or unaffordable costs never produce a roll expression. */
import {criticalDice,DAMAGE_TYPES} from "./attack-target.js";
export function spendDiceProblems(x){if(!x||typeof x!=="object"||Array.isArray(x))return ["resource damage entry must be an object"];const out=[],allowed=["n","when","d","type","maxCost","perCost","resource"];
 Object.keys(x).forEach(k=>{if(!allowed.includes(k))out.push("unknown resource damage field "+k)});
 if("n" in x&&(typeof x.n!=="string"||!x.n.trim()))out.push("resource damage name must be nonempty");
 const rows=Array.isArray(x.when)?x.when:[x.when];if(!rows.length||rows.some(n=>typeof n!=="string"||!n.trim()))out.push("resource damage needs matching attack names");
 if(!criticalDice(x.d))out.push("resource damage needs literal dice");
 if(!DAMAGE_TYPES.includes(x.type))out.push("resource damage needs one canonical damage type");
 if(!Number.isSafeInteger(x.maxCost)||x.maxCost<1)out.push("resource damage maximum cost must be a positive safe integer");
 if("perCost" in x&&typeof x.perCost!=="boolean")out.push("resource damage perCost must be boolean");
 const r=x.resource;if(!r||typeof r!=="object"||Array.isArray(r))out.push("resource damage needs a resource binding");
 else if(r.kind==="charges"){if(Object.keys(r).some(k=>k!=="kind"))out.push("charge binding accepts only its kind");}
 else if(r.kind==="use"){if(typeof r.name!=="string"||!r.name.trim())out.push("use binding needs an exact resource name");if(Object.keys(r).some(k=>k!=="kind"&&k!=="name"))out.push("unknown use binding field");}
 else out.push("resource damage binding kind is unknown");
 return out}
export function scaledResourceDice(spec,cost,critical=false){if(spendDiceProblems(spec).length||!Number.isSafeInteger(cost)||cost<1||cost>spec.maxCost||typeof critical!=="boolean")return null;
 const dice=criticalDice(spec.d),parts=dice.split("d"),count=Number(parts[0])*(spec.perCost?cost:1)*(critical?2:1);
 return Number.isSafeInteger(count)&&count>0?count+"d"+parts[1]:null}
