/* Typed damage packets are opt-in. Advisory riders are never silently rolled. */
import {criticalDice,damageExpression,damageType,riderDamageType} from "../../data/lib/attack-target.js";
export function rolledRiders(a){return (a.xdice||[]).filter((x)=>x&&x.roll===true&&damageExpression(x.d)&&riderDamageType(x,a.type)).map((x)=>Object.assign({expr:damageExpression(x.d),type:riderDamageType(x,a.type),source:x.s||"Extra damage"},criticalDice(x.critD)?{critExpr:criticalDice(x.critD)}:{}))}
function criticalBase(a,expr){const from=criticalDice(a.die),to=criticalDice(a.critDie);if(!from||!to)return null;const re=new RegExp("^"+from+"(?=[+-]|$)","i");return re.test(expr)?expr.replace(re,to):null}
export function attackDamagePackets(a,base){const riders=rolledRiders(a),expr=damageExpression(base);if(!expr)return [];const critical=criticalBase(a,expr);if(!riders.length&&!critical)return [];
 const out=[],parts=[{expr:expr,critExpr:critical,type:damageType(a.type)||a.type||"Unspecified",source:a.dieSrc||a.n}].concat(riders);
 parts.forEach((p)=>{let group=out.find((x)=>x.type.toLowerCase()===p.type.toLowerCase());if(!group){group={expr:"",type:p.type,sources:[],critExpr:""};out.push(group)}group.expr+=(group.expr?"+":"")+p.expr;group.critExpr+=(group.critExpr?"+":"")+(p.critExpr||p.expr);if(!group.sources.includes(p.source))group.sources.push(p.source)});
 out.forEach((p)=>{if(p.critExpr===p.expr)delete p.critExpr});return out}
export function combinedDamage(a,base){const p=attackDamagePackets(a,base);return p.length?p.map(x=>x.expr).join("+"):base}
