/* Per-hit delivery declarations never write character state. Unknown kinds
   require a declaration; malformed metadata fails closed. No range inference. */
export const ATTACK_KINDS=Object.freeze(["melee","ranged"]);
export function normalizeAttackKinds(raw){
 if(raw===undefined)return [];
 if(raw===null||raw==="")return null;
 const values=Array.isArray(raw)?raw:[raw];
 if(values.some(x=>!ATTACK_KINDS.includes(x)))return null;
 return ATTACK_KINDS.filter(x=>values.includes(x));
}
export function allowedAttackKinds(raw){const known=normalizeAttackKinds(raw);return known===null?[]:known.length?known:ATTACK_KINDS.slice()}
export function resolveAttackKind(raw,declaration){
 const known=normalizeAttackKinds(raw);if(known===null)return "";
 if(declaration==null||declaration==="")return known.length===1?known[0]:"";
 return ATTACK_KINDS.includes(declaration)&&allowedAttackKinds(raw).includes(declaration)?declaration:"";
}
export function attackKindMatches(required,raw,declaration){return ATTACK_KINDS.includes(required)&&resolveAttackKind(raw,declaration)===required}
/* Explicit reviewed table; no classification comes from range or spell names.
   2014-only omissions remain unknown, with player declaration required. */
export const REVIEWED_SPELL_ATTACK_KINDS=Object.freeze({
 "2024":Object.freeze({"Chill Touch":"melee","Eldritch Blast":"ranged","Fire Bolt":"ranged","Poison Spray":"ranged","Produce Flame":"ranged","Ray of Frost":"ranged","Shocking Grasp":"melee","Sorcerous Burst":"ranged","Starry Wisp":"ranged","Thorn Whip":"melee"}),
 "2014":Object.freeze({"Chill Touch":"ranged","Eldritch Blast":"ranged","Fire Bolt":"ranged","Produce Flame":"ranged","Ray of Frost":"ranged","Shocking Grasp":"melee","Thorn Whip":"melee"})
});
export function reviewedSpellAttackKind(name,edition){if(!Object.prototype.hasOwnProperty.call(REVIEWED_SPELL_ATTACK_KINDS,edition))return "";const table=REVIEWED_SPELL_ATTACK_KINDS[edition];return Object.prototype.hasOwnProperty.call(table,name)?table[name]:""}

/* Only reviewed producer labels and canonical standard weapon definitions imply
   a mode. A magic item's base weapon does not prove all its extra attack forms. */
export function attackKindsForRow(row,weapon,edition,baseName){
 if(!row||typeof row!=="object"||Array.isArray(row))return null;
 if(Object.prototype.hasOwnProperty.call(row,"attackKinds"))return normalizeAttackKinds(row.attackKinds);
 if(row.n==="Unarmed Strike")return ["melee"];
 if(typeof row.of==="string"&&row.of&&(row.n==="Pole Strike"||row.n==="Pole Strike ("+row.of+")"))return ["melee"];
 if(row.n==="Psychic Blade"||row.n==="Psychic Blade (Bonus Action)")return ["melee","ranged"];
 if(row.n==="Starry Form: Archer")return ["ranged"];
 if(/^Cantrip(?:$|[ \u2022])/.test(row.sub||"")){const kind=reviewedSpellAttackKind(row.n,edition);return kind?[kind]:[]}
 /* The reviewed thrown-row factory publishes both this exact name suffix and
    an explicit ranged role, including when its magic base name is unknown. */
 if(typeof row.n==="string"&&row.n.endsWith(" (thrown)")&&typeof row.sub==="string"&&row.sub.endsWith(" \u2022 ranged attack"))return ["ranged"];
 if(!weapon||typeof weapon!=="object"||Array.isArray(weapon)||typeof baseName!=="string"||!baseName)return [];
 if(row.n!==baseName)return [];
 if(weapon.k==="R")return ["ranged"];
 if(weapon.k!=="M")return [];
 return /\bThrown\b/.test(weapon.p||"")||/\bThrown\b/.test(row.sub||"")?["melee","ranged"]:["melee"];
}
