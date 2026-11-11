// Pure computed wield requirements. No storage or equipment mutation.
const AB = ['STR','DEX','CON','INT','WIS','CHA'];
const LABELS={STR:'Strength',DEX:'Dexterity',CON:'Constitution',INT:'Intelligence',WIS:'Wisdom',CHA:'Charisma'};
const own = (o,k) => Object.prototype.hasOwnProperty.call(o,k);
export function wieldMinimumProblems(rule) {
  if (!rule || typeof rule !== 'object' || Array.isArray(rule)) return ['rule'];
  const errors = Object.keys(rule).filter(k => k !== 'abilityMin');
  const a = rule.abilityMin;
  if (!a || typeof a !== 'object' || Array.isArray(a) || !Object.keys(a).length) return errors.concat('abilityMin');
  for (const k of Object.keys(a)) if (!AB.includes(k) || !Number.isSafeInteger(a[k]) || a[k] < 1) errors.push('abilityMin.'+k);
  return errors;
}
export function nativeWieldMinimum(name) {
  // Only exact reviewed native names, never fuzzy item/base/ability heuristics.
  return ["Forgemaster's Might","Forgemaster's Might (Maul)","Forgemaster's Might (Warhammer)"].includes(name) ? {abilityMin:{STR:17}} : null;
}
export function evaluateWieldMinimum(rule, scores) {
  if (rule === null) return {allowed:true, unmet:[], checks:[]};
  if (wieldMinimumProblems(rule).length) return {allowed:false, invalid:true, unmet:[], checks:[]};
  const unmet=[],checks=[];
  for (const [ability,minimum] of Object.entries(rule.abilityMin)) {
    const actual=scores && own(scores,ability) ? scores[ability] : null;
    const check={ability,minimum,actual:Number.isFinite(actual)?actual:null};
    checks.push(check);
    if (check.actual===null || check.actual < minimum) unmet.push(check);
  }
  return {allowed:unmet.length===0,unmet,checks};
}
export function explainWieldMinimum(result) {
  if (result.invalid) return 'Weapon requirement unavailable.';
  return (result.checks || result.unmet).map(x => LABELS[x.ability]+' '+x.minimum+' required to wield (current '+(x.actual===null?'unknown':x.actual)+').').join(' ');
}
// Call with the CURRENT actor's canonical derived scores; never infer them from a requirement.
export function weaponRowAllowed(name, scores) {
  return evaluateWieldMinimum(nativeWieldMinimum(name), scores).allowed;
}

// cust is the current actor's S.cust map: n:ab-STR -> {b,o}.
export function applyWieldScoreCustomization(scores,cust) {
  const out={...scores};
  const numeric=v=>v==null||v===''||Number.isNaN(+v)?null:+v;
  for(const k of AB){
    if(!own(out,k)) continue;
    const c=cust&&cust['n:ab-'+k];
    if(!c||typeof c!=='object') continue;
    const b=numeric(c.b),o=numeric(c.o);
    if(b)out[k]+=b;
    if(o!==null)out[k]=o;
  }
  return out;
}
