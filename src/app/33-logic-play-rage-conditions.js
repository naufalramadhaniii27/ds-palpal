/* ================= v22: PLAYING THE CHARACTER 2 ================= */
/* RU53, RU56: what active conditions and modes do to the numbers. D.cf = cfx() */
var MODES=[{k:"rage",n:"Rage",f:"Rage",use:/^Rage$/},{k:"wildshape",n:"Wild Shape",f:"Wild Shape",use:/^Wild Shape$/},{k:"sacred",n:"Sacred Weapon",f:"Sacred Weapon",use:/^Channel Divinity$/},
  {k:"wings",n:"Heavenly Wings",f:"Celestial Revelation",use:/^Celestial Revelation$/,g:"cr"},{k:"radiance",n:"Inner Radiance",f:"Celestial Revelation",use:/^Celestial Revelation$/,g:"cr"},{k:"shroud",n:"Necrotic Shroud",f:"Celestial Revelation",use:/^Celestial Revelation$/,g:"cr"}];
function modesAvail(){ return MODES.filter(function(m){ return hasFeat(m.f)&&!(m.g==="cr"&&D.level<3); }); }/* v22 M1: Celestial Revelation from character level 3 */
function modeOn(k){ return !!(S.mode&&S.mode[k])&&modesAvail().some(function(m){ return m.k===k; }); }/* v22 M2: a mode works only while its feature is there */
function modeFix(){ var a=JSON.stringify(S.mode||{}); modeClean(); modeAuto(); return JSON.stringify(S.mode||{})!==a; }
function modeClean(){ if(!S.mode) return; var av=modesAvail().map(function(m){ return m.k; }), gone=Object.keys(S.mode).filter(function(k){ return av.indexOf(k)<0; }); if(!gone.length) return; gone.forEach(function(k){ delete S.mode[k]; }); save(); }
/* v22 m3: Rage ends with the Incapacitated condition (0 Hit Points gives Unconscious) */
function modeAuto(){ if(!modeOn("rage")) return; var why=S.hp===0?"0 Hit Points":INCAP.filter(function(k){ return S.cond[k]; })[0]; if(!why) return; delete S.mode.rage; save(); toast("Rage ended ("+why+")."); setTimeout(function(){ try{ renderAll(); }catch(er){} },0); }/* v22 N1 */
var HEAVY=/^(Ring Mail|Chain Mail|Splint Armor|Plate Armor)\b/;
function rageDmg(){ var l=lvOf("Barbarian"); return l>=16?4:l>=9?3:2; }
/* v56: passive Advantage from features. One table drives the ADV tags on Initiative, skills, saves and Death Saving Throws.
   f = feature name (class, subclass, species trait or feat). Add new rows here, and the audit script (audit-passive.js) checks that none is missing. */
var PADV=[
 {f:"Feral Instinct",init:1},
 {f:"Remarkable Athlete",init:1,skill:["Athletics"]},
 {f:"Assassinate",init:1},
 {f:"Ambush Master",init:1},/* v102: Scout (2014), Advantage on Initiative */
 {f:"Incisive Sense",skill:["Investigation","Insight"]},/* v102: Pallid Elf, Advantage on Investigation and Insight */
 {f:"Dazzling Footwork",skill:["Performance"],note:"only when you dance"},
 {f:"Danger Sense",save:["DEX"],noIncap:1},
 {f:"Gnomish Cunning",save:["INT","WIS","CHA"]},
 {f:"Hippo Build",save:["STR"],skill:["Athletics"],note:"Strength checks"},/* v74 */
 {f:"Survivor",ds:1},
 {f:"Durable",ds:1},
 {f:"Touch of Death",dsd:1},
 {f:"Escaped Death",ds:1},
 {f:"Deathless Nature",ds:1}
];
