// @ts-check
/* TG6 TG7 the player character parts read from the sheet's raw rows (src/app/52-tg-bridge.js sends them as they are, to keep the first download small):
   Defenses, spell slots with Pact Magic, damage riders, Rage, mark spells. Used by fromSheet in 20-engine.js */
export function lc(a){ return (a||[]).map((x) =>{ return String(x).toLowerCase(); }).join(" | "); }
/* TG7 marks: [{n, l slot level, dmg die, type ("" = the weapon's), wpn (weapon attacks only), rng feet}], cast with the "mark" command */
/* TG6 damage riders the sheet shows: [{n, dmg dice, type ("" = the weapon's), once (first Finesse or ranged hit each turn), slot (smite: spends a slot after a melee hit), b (needs the Bonus Action), max dice}]; rage {dmg, res} */
const DTY=/^(acid|bludgeoning|cold|fire|force|lightning|necrotic|piercing|poison|psychic|radiant|slashing|thunder)$/i;
/* p.rx: the sheet's raw rows (xd C.xdmg, df C.defenses, rg Rage damage when Rage can be switched on here), parsed in this deferred part to keep the first download small */
/* weapon extra dice (Flame Tongue +2d6 Fire): raw sheet rows {d, t} or ready [0, dice, type] */
function pcXd(xd){ const o=(xd||[]).map((x) =>{ return Array.isArray(x)?x:[0,String(x.d||"").replace(/\s+/g,""),String(x.t||"").split(" ")[0]]; }).filter((q) =>{ return /^\d*d\d+$/.test(q[1])&&DTY.test(q[2]); }); return o.length?o:undefined; }
export function pcAct(a){ return Object.assign({k:"atk",mr:a.rng?(a.reach?"mr":"r"):"m"},a,{xd:pcXd(a.xd),str:a.str||(a.ab==="STR"?1:undefined),fin:a.fin||(/Finesse|Ammunition/.test(a.sub||"")?1:undefined)}); }
const pcTy=(t) =>{ return DTY.test(t)?t:""; };
function pcXdmg(x,out){ const d=String(x.dmg||"").replace(/\s+/g,""), note=String(x.note||""); if(x.save||!/^\d*d\d+$/.test(d)) return;
  if(/expend a spell slot/i.test(note)){ const mx=/max (\d+)d/i.exec(note); out.push({n:x.n,dmg:d,type:pcTy(x.type),slot:1,max:mx?+mx[1]:0}); }
  else if(/^Once per turn/i.test(note)) out.push({n:x.n,dmg:d,type:pcTy(x.type),once:1}); }
function pcSmite(x,out){ const m=/(\d+d\d+) (\w+) damage/.exec(String(x.v||"")); if(x.t!=="Note"||!m||!/spell slot/i.test(x.v)||out.some((r) =>{ return r.slot; })) return;
  const mx=/\((\d+)d\d+ at most\)/.exec(x.v); out.push({n:String(x.v).split(",")[0],dmg:m[1],type:pcTy(m[2]),slot:1,b:/Bonus Action/.test(x.v)?1:0,max:mx?+mx[1]:0}); }
function pcRage(rx){ if(rx.rg==null) return null; const res=[];
  (rx.df||[]).forEach((x) =>{ if(x.t==="Resistance"&&/while raging/i.test(x.v)) String(x.v).replace(/\s*\(.*\)/,"").split(/\s*,\s*(?:and\s+)?|\s+and\s+/).forEach((v) =>{ if(DTY.test(v)) res.push(v); }); });
  return {dmg:rx.rg||0,res:lc(res)}; }
/* damage types the sheet lists under Defenses ("Bludgeoning, Piercing, and Slashing" is three); conditions and "(while raging)" stay out */
export function pcDefs(p,t){ const o=[]; ((p.rx||{}).df||[]).forEach((x) =>{ if(x.t!==t||/while raging/i.test(x.v)) return; String(x.v||"").split(/\s*,\s*(?:and\s+)?|\s+and\s+|\s+or\s+/).forEach((v) =>{ if(DTY.test(v)&&o.indexOf(v)<0) o.push(v); }); }); return o; }
/* spell slots per level, Pact Magic slots ({n, lvl}) added at the Pact level: the engine spends them the same way */
export function pcSlots(p){ const sl=(p.slots||[]).slice(), q=p.pact; if(q&&+q.lvl>0&&+q.n>0){ while(sl.length<+q.lvl) sl.push(0); sl[+q.lvl-1]+=+q.n; } return sl; }
/* TG7 a mark spell (Hex, Hunter's Mark) from the manual spell rows: leveled, Bonus Action, Concentration, first damage part "on a hit".
   r = spell list row [time, range, components, duration, concentration], d = first damage part [die, type, _, note]. The die is the sheet's
   (Foe Slayer's spDie already wrote 1d10). Type "Weapon": the weapon's own type, weapon attacks only */
function pcMark(x){ const r=x.r||[], q=x.d, d=q&&String(q[0]).replace(/\s+/g,""); if(!x.l||!/^Bonus/.test(r[0]||"")||!+r[4]||!q||!/^on a hit/.test(q[3]||"")||!/^\d*d\d+$/.test(d)) return null;
  const rng=/^(\d+)\s*ft/.exec(r[1]||""); return {n:x.n,l:x.l,dmg:d,type:pcTy(q[1]),wpn:q[1]==="Weapon"?1:0,rng:rng?+rng[1]:null}; }
export function pcRiders(p){ const rx=p.rx||{}, out=[]; (rx.xd||[]).forEach((x) =>{ pcXdmg(x,out); }); (rx.df||[]).forEach((x) =>{ pcSmite(x,out); });
  return {marks:p.marks?p.marks.map((x) =>{ return Object.assign({},x); }):(p.manual||[]).map(pcMark).filter(Boolean),riders:p.riders?p.riders.map((x) =>{ return Object.assign({},x); }):out,rage:p.rage?{dmg:p.rage.dmg||0,res:lc(p.rage.res)}:pcRage(rx)}; }
