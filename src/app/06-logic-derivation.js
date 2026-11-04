// @ts-check
import {ABK,ABN} from "./02-data-default-character.js";
import {x14} from "./03-data-glossary.js";
import {C,S} from "./04-logic-storage.js";
import {clamp,esc,mod,num,rich,senseList,sg} from "./05-logic-helpers.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"D",{get:function(){return D;},set:function(v){D=v;},configurable:true});
/* ================= DERIVATION WITH SOURCES ================= */
export var D = {}, B = {};
export function part(l,v,note){ return {l:l, v:v, note:note||""}; }
export function derive(){
  D = {}; B = {}; __R.CU0 = {};/* v34 RU85 */
  const lvl = clamp(Math.round(num(C.level,1)),1,20);
  const pbA = clamp(Math.round(num(C.pbAdd,0)),0,6), pb = 2 + Math.floor((lvl-1)/4) + pbA;/* fx engine v5: C.pbAdd */
  D.level = lvl; D.pb = pb;
  /* v19 RL44: Exhaustion (PHB 2024 Rules Glossary): each level takes 2 from every D20 Test (ability checks, saving throws, attack rolls, Initiative)
     and 5 feet from Speed. Passive scores are not D20 Tests and stay the same */
  const exMin=clamp(Math.round(num(C.exhMin,0)),0,5); if(exMin>num(S.exh,0)) S.exh=exMin;/* fx engine v5: C.exhMin, Exhaustion that cannot be removed (curse) */ const exh=clamp(Math.round(num(S.exh,0)),0,6); D.exh=exh; D.exhMin=exMin; const xr=x14(), exhN=xr?0:exh; D.exhN=exhN;/* v94: 2014 Exhaustion has no number on D20 Tests */
  function exP(){ return part("Exhaustion level "+exh, -2*exh, "Every D20 Test is 2 lower for each Exhaustion level"); }
  B.pb = {t:"Proficiency Bonus", parts:[part("Character level "+lvl, pb-pbA, "Levels 1 to 4 give +2, 5 to 8 give +3, 9 to 12 give +4, 13 to 16 give +5, 17 to 20 give +6")].concat(pbA?[part("Magic item or feature", pbA, "Adds to your Proficiency Bonus")]:[]), total:sg(pb), f:"Set by total character level (PHB-2024, Character Advancement)."};

  D.score={}; D.mod={};
  ABK.forEach((k) =>{
    const a=C.abilities[k]||{base:10,bonus:[]};
    const parts=[part("Rolled score", num(a.base,10), k==="STR"&&C.rolledNote?C.rolledNote:"Base score before bonuses")]; parts[0].raw=true;
    (a.bonus||[]).forEach((b) =>{ parts.push(part(b.s||"Bonus", num(b.v))); });
    let sc = parts.reduce((t,p) =>{return t+p.v},0); sc=__R.cuApply("ab-"+k,parts,sc);/* v34 RU85 */
    D.score[k]=sc; D.mod[k]=mod(sc);
    B["ab-"+k]={t:ABN[k]+" "+sc+" ("+sg(mod(sc))+")", parts:parts, total:String(sc), totalLabel:"Score",
      f:"Modifier: <code>("+sc+" \u2212 10) \u00f7 2</code>, rounded down = <b>"+sg(mod(sc))+"</b>"+(sc>20?". Scores above 20 need a feature that raises the cap.":"")};
  });
  function abPart(k){ return part(ABN[k]+" modifier", D.mod[k], ABN[k]+" score "+D.score[k]); }

  D.save={};
  ABK.forEach((k) =>{
    const src=C.saves&&C.saves[k], parts=[abPart(k)];
    if(src) parts.push(part("Proficiency Bonus", pb, "Proficient from "+src));    (C.saveBonus||[]).forEach((b) =>{ if(b.np&&src) return; if(b.ab&&b.ab!==k) return;/* fx saveBonusAb: only that save */ parts.push(part(b.s||"Bonus", num(b.v))); });/* M18 */
    if(exhN) parts.push(exP());
    let t=parts.reduce((a,p) =>{return a+p.v},0); t=__R.cuApply("save-"+k,parts,t);/* v26 RU38 no. 2 */
    D.save[k]=t; B["save-"+k]={t:ABN[k]+" saving throw", parts:parts, total:sg(t), f:src?"":(C.saveBonus&&C.saveBonus.length?"Not proficient: the modifier and the bonuses above apply.":"Not proficient, so only the modifier applies.")};
  });

  D.skill={};
  C.skills.forEach((s,i) =>{
    const parts=[abPart(s.ab)], p=num(s.p,0);
    if(p>=1) parts.push(part(p===2?"Expertise (double Proficiency Bonus)":"Proficiency Bonus", pb*(p===2?2:1), s.src?("From "+s.src):"Source not set"));    if(num(s.misc,0)) parts.push(part(s.miscSrc||"Other bonus", num(s.misc)));
    if(exhN) parts.push(exP());
    let t=parts.reduce((a,q) =>{return a+q.v},0); t=__R.cuApply("sk:"+s.n,parts,t);/* v26 RU38 no. 2 */
    D.skill[i]=t;
    const f=[]; if(s.dis) f.push("Disadvantage on this check while wearing "+esc(s.dis)+".");
    if(s.hb) f.push(s.hbd?esc(s.hbd)+" (Retromistika Playtest, Skills.)":"Homebrew skill from Retromistika Playtest, Skills.");
    if(!p) f.push("Not proficient, so only the modifier applies.");
    B["sk-"+i]={t:s.n+" ("+s.ab+")", parts:parts, total:sg(t), f:f.join(" ")};
  });
  function skillByName(n){ for(let i=0;i<C.skills.length;i++){ if(C.skills[i].n===n) return i; } return -1; }
  [["Perception","per"],["Insight","ins"],["Investigation","inv"]].forEach((x) =>{
    const i=skillByName(x[0]); const v=i>=0?D.skill[i]+2*exhN:D.mod[x[0]==="Investigation"?"INT":"WIS"];
    let pp=[{l:"Base",v:10,note:"Every passive check starts at 10",raw:true},part(x[0]+" bonus",v,"Tap the skill to see where this comes from")], pbn=0; (C.pasBon||[]).forEach((b) =>{if(b.k===x[1]){pp.push(part(b.s,b.v,"Passive bonus"));pbn+=b.v}}); const xdis=(xr&&exh>=1)?-5:0; if(xdis) pp.push(part("Disadvantage on ability checks (Exhaustion level "+exh+")",-5,"A passive check with Disadvantage is 5 lower")); const pv=__R.cuApply("pas-"+x[1],pp,10+v+pbn+xdis);/* v69 *//* v26 RU38 no. 2 */
    D["pas_"+x[1]]=pv;
    B["pas-"+x[1]]={t:"Passive "+x[0], parts:pp, total:String(pv), f:""};
  });

  const dexPart=null, dm=D.mod.DEX, mode=C.ac.dex||"none";
  const acParts=[part(C.ac.baseSrc||"Base AC", num(C.ac.base,10))]; acParts[0].raw=true;
  if(mode==="full") acParts.push(part("Dexterity modifier", dm, "Light armor or no armor"));
  else if(mode==="max2") acParts.push(part("Dexterity modifier (max 2)", Math.min(2,dm), "Medium armor caps it at +2"));
  else if(mode==="max3") acParts.push(part("Dexterity modifier (max 3)", Math.min(3,dm), "Medium Armor Master raises the cap to +3"));/* v69 */
  (C.ac.bonus||[]).forEach((b) =>{ acParts.push(part(b.s||"Bonus", num(b.v))); });
  __R.sitNum("ac").forEach((b) =>{ acParts.push(part(b.s,b.v)); });/* v103 */
  D.ac=acParts.reduce((a,p) =>{return a+p.v},0); D.ac=__R.cuApply("ac",acParts,D.ac);/* v26 RU38 no. 2 */
  B.ac={t:"Armor Class", parts:acParts, total:String(D.ac), f:mode==="none"?"Heavy armor ignores your Dexterity modifier.":""};

  const inParts=[abPart("DEX")]; (C.initBonus||[]).forEach((b) =>{ inParts.push(part(b.s||"Bonus", num(b.v))); }); if(exhN) inParts.push(exP());
  D.init=inParts.reduce((a,p) =>{return a+p.v},0); D.init=__R.cuApply("init",inParts,D.init);/* v26 RU38 no. 2 */
  B.init={t:"Initiative", parts:inParts, total:sg(D.init), f:"In the 2024 rules, Initiative is a Dexterity check."};

  D.speed=xr?(exh>=5?0:exh>=2?Math.floor(num(C.speed,30)/2):num(C.speed,30)):Math.max(0,num(C.speed,30)-5*exh);
  B.speed={t:"Speed", parts:[{l:C.speedSrc||"Base walking Speed", v:num(C.speed,30)+" ft", note:"", raw:true}].concat(exh?[xr?{l:"Exhaustion level "+exh, v:exh>=5?"Speed 0":"Halved", note:exh>=5?"Level 5: your Speed is 0":"Level 2: your Speed is halved", raw:true}:{l:"Exhaustion level "+exh, v:"\u2212"+(5*exh)+" ft", note:"5 feet less for each level", raw:true}]:[]), total:D.speed+" ft", f:""};
  __R.sitNum("spd").forEach((b) =>{ D.speed+=b.v; B.speed.parts.push({l:b.s,v:"+"+b.v+" ft",note:"",raw:true}); });/* v103 */
  D.speed=__R.cuSpeed(D.speed,B.speed.parts); B.speed.total=D.speed+" ft";/* v26 RU38 no. 2 */
  B.dark={t:"Darkvision", parts:[{l:C.darkSrc||"Source not recorded", v:num(C.darkvision,0)+" ft", note:"", raw:true}], total:num(C.darkvision,0)+" ft", f:"You see in Dim Light within this range as if it were Bright Light, and in Darkness as if it were Dim Light (shades of gray only)."};
  /* RU19: other senses from the builder (C.senses, e.g. Devil's Sight). Optional field: missing = none */
  senseList().forEach((x) =>{ const s=x[0]; B["sense-"+x[1]]={t:s.n, parts:[{l:s.s||"Source not recorded", v:num(s.v,0)+" ft", note:"", raw:true}], total:num(s.v,0)+" ft", f:esc(s.d||"")}; });

  const hd=num(C.hitDie,10), cm=D.mod.CON, avg=hd/2+1;
  const hpParts=[part("Level 1: maximum of d"+hd, hd, C.cls+" level 1 (PHB-2024)")]; hpParts[0].raw=true;
  const hpl=Array.isArray(C.hpPerLevel)?C.hpPerLevel:[];
  if(lvl>1 && hpl.length===lvl-1){ hpl.forEach((e,i) =>{ const v=typeof e==="object"?num(e.v):num(e); hpParts.push(part("Level "+(i+2)+(e&&e.c?" ("+e.c+")":"")+(e&&e.r?": rolled":": fixed"), v, e&&e.n?e.n:"")); }); }
  else if(lvl>1) hpParts.push(part("Levels 2 to "+lvl+": fixed "+avg+" each", avg*(lvl-1), (lvl-1)+" \u00d7 "+avg+" (average of d"+hd+", rounded up)"));
  hpParts.push(part("Constitution modifier \u00d7 "+lvl+" levels", cm*lvl, "Con "+D.score.CON+" gives "+sg(cm)+" per level"));
  (C.hpBonus||[]).forEach((b) =>{ hpParts.push(part(b.s||"Bonus", num(b.v))); });  if(num(S.hpMod,0)) hpParts.push(part("Max HP modifier", Math.round(num(S.hpMod,0)), "Set on the sheet"));/* v21 RU45 */
  if(xr&&exh>=4){ const hs0=Math.max(1,hpParts.reduce((a,q) =>{return a+q.v},0)); hpParts.push(part("Exhaustion level "+exh+": maximum halved",-Math.floor(hs0/2),"Level 4: your Hit Point maximum is half of "+hs0)); }/* v94 */
  D.hpmax=Math.max(1,hpParts.reduce((a,p) =>{return a+p.v},0)); const hpOv=Math.round(num(S.hpOver,0)); __R.CU0.hp=D.hpmax; if(hpOv>0){ hpParts.push({l:"Set by you",v:String(hpOv),note:"Calculated value: "+D.hpmax+". Your number replaces it.",raw:true}); D.hpmax=hpOv; }/* v34 RU85 */
  B.hp={t:"Hit Point Maximum", parts:hpParts, total:String(D.hpmax), f:"Uses the fixed-value option for every level after the first."+(hpOv>0?" Override set on the sheet: "+hpOv+".":"")};

  /* RL35 4b (RL34): C.dcAb from the builder (Monk Dexterous Attacks). Missing = Strength, as before */
  const dab=ABK.indexOf(C.dcAb)>=0?C.dcAb:"STR", dabP=abPart(dab); if(C.dcSrc) dabP.note=C.dcSrc;
  D.dc=8+D.mod[dab]+pb; const dcP=[]; D.dc=__R.cuApply("dc",dcP,D.dc);/* v34 RU85 */
  B.dc={t:"Unarmed Strike: Grapple and Shove DC", parts:[{l:"Base",v:8,note:"",raw:true},dabP,part("Proficiency Bonus",pb,"Every creature is proficient with Unarmed Strike")].concat(dcP), total:String(D.dc), f:"The target makes a Strength or Dexterity saving throw (its choice) against this DC (PHB-2024, Unarmed Strike)."};

  const CY=__R.carryOf(D.score.STR); D.carry=CY.v;/* v25: size and Powerful Build */
  B.carry={t:"Carrying Capacity", parts:[{l:"Strength score \u00d7 "+CY.m, v:D.carry+" lb", note:"Str "+D.score.STR+", "+CY.s+" creature"+(CY.pb?", Powerful Build (one size larger)":"")+(CY.bear?", Aspect of the Beast: Bear (doubled)":""), raw:true}], total:D.carry+" lb", f:"PHB-2024, Rules Glossary: Carrying Capacity."+(__R.setOf("enc")==="off"?" Weight is not tracked (Settings).":"")};

  const CF=__R.cfx(); D.cf=CF;/* v22 RU53, RU56 */
  if(B.init&&(CF.init||[]).length){ const ia=CF.init.filter((x) =>{ return x.t==="ADV"; }).map((x) =>{ return x.s; }); if(ia.length) B.init.f+=" Advantage: "+ia.join(", ")+"."; }/* v56 */
  if(CF.speed0.length){ D.speed=0; B.speed.parts.push({l:CF.speed0.join(", "), v:"Speed 0", note:"Condition", raw:true}); B.speed.total="0 ft"; }
  D.atk=[];
  (C.attacks||[]).forEach((a,i) =>{
    const m=D.mod[a.ab]||0, hp=[part(ABN[a.ab]+" modifier", m, ABN[a.ab]+" score "+D.score[a.ab])];
    if(a.prof) hp.push(part("Proficiency Bonus", pb, "Proficient with this weapon"));
    if(num(a.misc,0)) hp.push(part(a.miscSrc||"Other bonus", num(a.misc)));
    const amB=__R.ammoBonus(a), amN=amB&&amB.on?amB.on.n:0; if(amN) hp.push(part(amB.on.it.n, amN, "Magic ammunition fired from this weapon"));/* v102 */
    if(CF.atkW&&!/^Cantrip/.test(a.sub||"")&&a.n!=="Unarmed Strike"&&__R.atkKind(a)==="melee") hp.push(part("Sacred Weapon", CF.atkW, "Charisma modifier, while it lasts"));/* v22 RU56 */    if(exhN) hp.push(exP());
    const cuA=__R.cuK("a:"+a.n); if(cuA) __R.CU0["a:"+a.n+"|ho"]=hp.reduce((t,p) =>{return t+p.v},0); if(cuA&&__R.cuNum(cuA.hb)) hp.push(part("Customize: bonus", __R.cuNum(cuA.hb), cuA.note||"Set with Customize"));/* v26 RU38 no. 2 */
    let hit=hp.reduce((t,p) =>{return t+p.v},0);
    if(cuA&&__R.cuNum(cuA.ho)!=null){ hp.push({l:"Set by you", v:sg(__R.cuNum(cuA.ho)), note:"Calculated value: "+sg(__R.CU0["a:"+a.n+"|ho"])+". Your number replaces it.", raw:true}); hit=__R.cuNum(cuA.ho); }
    const rgB=(CF.dmgStr&&a.ab==="STR"&&!/^Cantrip/.test(a.sub||""))?CF.dmgStr:0;/* v22 RU56 Rage */ const dm=(a.nomod?0:m)+num(a.dmgBonus,0)+amN+rgB+(cuA?__R.cuNum(cuA.db)||0:0); let dmg=(a.die||"1")+(dm===0?"":(dm>0?"+"+dm:"\u2212"+Math.abs(dm)));
    const dmC=dm-(cuA?__R.cuNum(cuA.db)||0:0), cDo=cuA&&cuA["do"]?String(cuA["do"]):""; if(cuA) __R.CU0["a:"+a.n+"|do"]=(a.die||"1")+(dmC===0?"":(dmC>0?"+"+dmC:"\u2212"+Math.abs(dmC))); if(cDo) dmg=cDo;/* v34 RU85 */
    D.atk[i]={hit:hit, dmg:dmg, rg:rgB};
    if(amB&&!amB.on) hp.push({l:"Magic ammunition", v:"None selected", note:"You carry "+amB.L.map((x) =>{ return x.it.n; }).join(" and ")+". Open this attack to pick one.", raw:true});/* v102 */
    B["ah-"+i]={t:a.n+": attack roll", parts:hp, total:sg(hit), f:""};
    B["ad-"+i]={t:a.n+": damage", parts:[{l:"Damage die", v:a.die||"\u2014", note:a.dieSrc||"", raw:true}, part(ABN[a.ab]+" modifier", a.nomod?0:m, a.nomod?"Not added to this damage":"Added to damage")].concat(num(a.dmgBonus,0)?[part(a.miscSrc||"Magic bonus", num(a.dmgBonus))]:[]).concat(amN?[part(amB.on.it.n, amN, "Magic ammunition fired from this weapon")]:[]).concat(cuA&&__R.cuNum(cuA.db)?[part("Customize: damage bonus", __R.cuNum(cuA.db), cuA.note||"Set with Customize")]:[]).concat(cDo?[{l:"Set by you", v:cDo, note:"Calculated value: "+__R.CU0["a:"+a.n+"|do"]+". Your text replaces it.", raw:true}]:[]), total:dmg, f:a.type?("Damage type: "+esc(a.type)+"."):""};
  });
  (C.attacks||[]).forEach((a,i) =>{ if(D.atk[i]&&D.atk[i].rg&&B["ad-"+i]){ B["ad-"+i].parts.push(part("Rage damage", D.atk[i].rg, "Rage is active, attack with Strength")); B["ad-"+i].total=D.atk[i].dmg; } });
  D.res=(C.res||[]).map((r) =>{ let mx = r.auto==="level" ? lvl : Math.max(0,Math.round(num(r.max,0))), mx0=mx; if(r.dmax&&S.chMax&&S.chMax[r.k]!=null) mx=clamp(Math.round(num(S.chMax[r.k],mx)),0,mx);/* v21 RU44 */ return {k:r.k, n:r.n, tag:r.auto==="level" ? ("d"+hd+sg(cm)+" each") : r.die ? ("d"+num(r.die,hd)+sg(cm)+" each") /* N4 */ : (r.tag||""), max:mx, reset:r.reset||"none", pool:!!r.pool, f:r.f||"", die:r.auto==="level"?hd:(r.die?num(r.die,hd):null), own:r.own||"", item:!!r.item, rg:r.rg||"", when:r.when||"", dmax:r.dmax||"", max0:mx0}; });
  if(S.hp==null || S.hp>D.hpmax) S.hp=Math.min(S.hp==null?D.hpmax:S.hp, D.hpmax);
  if(C.spellcasting) try{ __R.scAdj(C.spellcasting); }catch(er){}/* v34 RU85: Spell Attack and Save DC breakdown */
}
/* full texts: bold labels start a new line */
/* v33 p09: entries "**Name.** text" each in its own block (name on its own line, text below, space between). Also splits old saved text joined with spaces */
function fBlkT(t){ return String(t==null?"":t).replace(/([.!?:)\]"]) \*\*(?!Your choice\.|Still open\.)([^*\n]{1,80}?\.)\*\* /g,"$1\n\n**$2** "); }
export function richB(t){ const parts=fBlkT(t).split(/\n\s*\n/).filter((p) =>{ return p.trim(); }); if(parts.length<2) return rich(t).replace(/ <strong>([^<]{1,60}:)<\/strong>/g,"<br><strong>$1</strong>");
  return parts.map((p) =>{ const h=rich(p.trim()).replace(/ <strong>([^<]{1,60}:)<\/strong>/g,"<br><strong>$1</strong>"), m=/^<strong>([^<]{1,80}\.)<\/strong>\s*/.exec(h); return '<span class="fblk'+(m&&!/^(Your choice|Still open)\.$/.test(m[1])?" nm":"")+'">'+h+'</span>'; }).join(""); }
export function richP(t){ const b=richB(t); return /class="fblk/.test(b)?b:rich(t).replace(/ <strong>/g,"<br><strong>"); }
export function fill(t){ return String(t||"").replace(/\{dc\}/g,D.dc).replace(/\{level\}/g,D.level).replace(/\{pb\}/g,sg(D.pb)).replace(/\{unarmed\}/g, (D.atk[0]?D.atk[0].dmg:"")); }


export function __set_D(v){ return D=v; }
export function __set_B(v){ return B=v; }
