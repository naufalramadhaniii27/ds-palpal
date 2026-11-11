/* Typed damage packets are opt-in. A legacy note-only rider is never silently
   added to a roll, since it may still require a charge, save or per-turn choice. */
import {damageExpression,damageType,riderDamageType} from "../../data/lib/attack-target.js";
export function rolledRiders(a){return (a.xdice||[]).filter((x) =>x&&x.roll===true&&damageExpression(x.d)&&riderDamageType(x,a.type)).map((x) =>({expr:damageExpression(x.d),type:riderDamageType(x,a.type),source:x.s||"Extra damage"}))}
export function attackDamagePackets(a,base){const riders=rolledRiders(a),expr=damageExpression(base);if(!riders.length||!expr)return [];
 const out=[],parts=[{expr:expr,type:damageType(a.type)||a.type||"Unspecified",source:a.dieSrc||a.n}].concat(riders);
 parts.forEach((p) =>{let group=out.find((x) =>x.type.toLowerCase()===p.type.toLowerCase());if(!group){group={expr:"",type:p.type,sources:[]};out.push(group)}group.expr+=(group.expr?"+":"")+p.expr;if(!group.sources.includes(p.source))group.sources.push(p.source)});
 return out}
export function combinedDamage(a,base){const p=attackDamagePackets(a,base);return p.length?p.map((x) =>x.expr).join("+"):base}
