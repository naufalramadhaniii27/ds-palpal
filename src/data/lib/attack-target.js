/* Shared, pure attack-target context. App storage migrates optional old state
   through this normalizer. Unknown facts never satisfy a required predicate. */
export const CREATURE_TYPES=["Aberration","Beast","Celestial","Construct","Dragon","Elemental","Fey","Fiend","Giant","Humanoid","Monstrosity","Ooze","Plant","Undead"];
export const TARGET_TYPES=["Creature"].concat(CREATURE_TYPES,["Object","Structure"]);
export const TARGET_ALIGNMENTS=["Good","Neutral","Evil"];
export const DAMAGE_TYPES=["Acid","Bludgeoning","Cold","Fire","Force","Lightning","Necrotic","Piercing","Poison","Psychic","Radiant","Slashing","Thunder"];
function known(v,values){return values.find((n) =>n.toLowerCase()===String(v||"").toLowerCase())||""}
function hpValue(v,minimum){if(v==null||v===""||!Number.isFinite(+v)||+v<minimum)return null;return Math.floor(+v)}
export function normalizeTarget(raw){const x=raw&&typeof raw==="object"&&!Array.isArray(raw)?raw:{};
 return Object.assign({},x,{type:known(x.type,TARGET_TYPES),alignment:known(x.alignment,TARGET_ALIGNMENTS),hp:hpValue(x.hp,0),maxHp:hpValue(x.maxHp,1),tags:Array.isArray(x.tags)?x.tags.filter((v) =>typeof v==="string").map((v) =>v.trim()).filter((v,i,a) =>v&&a.indexOf(v)===i):[]})}
export function targetMatches(p,raw){if(!p||typeof p!=="object"||Array.isArray(p)||targetProblems(p).length)return false;const t=normalizeTarget(raw);
 if(p.types&&!p.types.includes(t.type))return false;
 if(p.creature&&t.type!=="Creature"&&!CREATURE_TYPES.includes(t.type))return false;
 if(p.alignment&&p.alignment!==t.alignment)return false;
 if(p.tag&&!t.tags.includes(p.tag))return false;
 const hasHp=t.hp!=null&&t.maxHp!=null;
 if(p.missingHp&&!(hasHp&&t.hp<t.maxHp))return false;
 if(p.bloodied&&!(hasHp&&t.hp<=Math.floor(t.maxHp/2)))return false;
 return true}
export function targetProblems(p){if(!p||typeof p!=="object"||Array.isArray(p))return ["target must be an object"];
 const out=[],keys=["types","creature","alignment","tag","tagLabel","missingHp","bloodied"];
 Object.keys(p).filter((k) =>!keys.includes(k)).forEach((k) =>out.push("unknown target field "+k));
 if(!["types","creature","alignment","tag","missingHp","bloodied"].some((k) =>k in p))out.push("target needs a condition");
 if("types" in p&&(!Array.isArray(p.types)||!p.types.length||p.types.some((t) =>t==="Creature"||!TARGET_TYPES.includes(t))))out.push("target.types needs known types");
 if("alignment" in p&&!TARGET_ALIGNMENTS.includes(p.alignment))out.push("target.alignment is unknown");
 ["creature","missingHp","bloodied"].forEach((k) =>{if(k in p&&p[k]!==true)out.push("target."+k+" must be true")});
 if("tag" in p&&(typeof p.tag!=="string"||!p.tag.trim()||typeof p.tagLabel!=="string"||!p.tagLabel.trim()))out.push("target tag needs an id and label");
 return out}
export function damageType(t){return known(t,DAMAGE_TYPES)}

export function damageExpression(v){const s=String(v==null?"":v).replace(/−/g,"-").replace(/\s+/g,"");return /^\d+(?:d\d+)?(?:[+-]\d+(?:d\d+)?)*$/i.test(s)?s:null}

/* A weapon reference resolves after all attack type replacements, not at the
   earlier entry-application phase. Free-form type descriptions remain advisory. */
export function riderDamageType(x,type){if(x.typeFrom!=null)return x.typeFrom==="weapon"?damageType(type):"";return damageType(x.t)}
export function riderProblems(x){const out=[];if(!x||typeof x!=="object")return out;
 if("roll" in x&&typeof x.roll!=="boolean")out.push("extra damage roll must be boolean");
 if("typeFrom" in x&&x.typeFrom!=="weapon")out.push("extra damage typeFrom must reference weapon");
 if(x.typeFrom&&x.t)out.push("extra damage must choose a type or a type reference");
 if(x.roll===true&&(!damageExpression(x.d)||!(x.typeFrom==="weapon"||damageType(x.t))))out.push("rolled extra damage needs literal dice and one damage type");
 return out}
