/* Responsibility: combat effect numbers, condition flags and mode toggles of the Situations panel. Split out of the former single file 34 in SOLID stage 9 (S); runs in the same order as before. */
import {ABK} from "./02-data-default-character.js";import {x14} from "./03-data-glossary.js";import {C,S,save} from "./04-logic-storage.js";import {ask,eqOn,esc,num} from "./05-logic-helpers.js";import {D} from "./06-logic-derivation.js";import {used} from "./08-ui-render-sheet-and-actions.js";import {refreshEntry} from "./12-ui-bottom-sheet-modal.js";import {dTxt,spCalc,spEffH,spRangeH,svgI} from "./22-ui-spell-data-and-slots.js";import {AK_ICON,akIcon,tyIcon} from "./23-ui-uses-items-coins-rest-spell-dc.js";import {scOf} from "./23e-ui-spells-dc.js";import {INCAP,concEnd,concOf,hasFeat} from "./32b-logic-play-concentration-casting.js";import {tmpApply,tmpFeat} from "./32c-logic-play-temp-features-ammo.js";import {toastU,undoMark} from "./32-logic-play-undo-actions.js";import {HEAVY,MODES,PADV,modeOn,modesAvail,rageDmg} from "./33-logic-play-rage-conditions.js";import {__R} from "./00-reg.js";import {sitFx} from "./34-ui-situations.js";
Object.defineProperty(__R,"cfFlags",{get:function(){return cfFlags;},set:function(v){cfFlags=v;},configurable:true});
Object.defineProperty(__R,"cfSave",{get:function(){return cfSave;},set:function(v){cfSave=v;},configurable:true});
Object.defineProperty(__R,"cfSkill",{get:function(){return cfSkill;},set:function(v){cfSkill=v;},configurable:true});
Object.defineProperty(__R,"cfx",{get:function(){return cfx;},set:function(v){cfx=v;},configurable:true});
Object.defineProperty(__R,"modeChips",{get:function(){return modeChips;},set:function(v){modeChips=v;},configurable:true});
Object.defineProperty(__R,"modeXdRows",{get:function(){return modeXdRows;},set:function(v){modeXdRows=v;},configurable:true});
Object.defineProperty(__R,"noActH",{get:function(){return noActH;},set:function(v){noActH=v;},configurable:true});
Object.defineProperty(__R,"saveCantripRows",{get:function(){return saveCantripRows;},set:function(v){saveCantripRows=v;},configurable:true});
function cfx(){ const o={atk:[],chk:[],chkAb:{},skill:{},save:{},speed0:[],noAct:[],res:[],fly:null,xd:[],dmgStr:0,atkW:0,init:[],ds:[]}, c=Object.assign({},S.cond||{});
  if(c.Petrified) delete c.Poisoned;/* v22 m2: Petrified gives Immunity to the Poisoned condition */
  if(c.Invisible) o.init.push({t:"ADV",s:"Invisible when you roll Initiative"}); INCAP.forEach((k) =>{ if(c[k]) o.init.push({t:"DIS",s:k+" when you roll Initiative"}); });/* v22 m1 */
  function add(a,t,s){ a.push({t:t,s:s}); } function sv(ab,t,s){ (o.save[ab]=o.save[ab]||[]).push({t:t,s:s}); }  const inc=INCAP.some((k) =>{ return c[k]; });
  const exL=num(S.exh,0), xr2=x14();/* v94: Exhaustion, 2014: level 1 Disadvantage on ability checks, level 3 on attack rolls and saving throws */
  if(xr2&&exL>=1){ add(o.chk,"DIS","Exhaustion level "+exL); add(o.init,"DIS","Exhaustion level "+exL+" (Initiative is an ability check)"); }
  if(xr2&&exL>=3){ add(o.atk,"DIS","Exhaustion level "+exL); ABK.forEach((k) =>{ sv(k,"DIS","Exhaustion level "+exL); }); }
  PADV.forEach((r) =>{ if(!hasFeat(r.f)) return; if(/\(2014\)$/.test(C.sub||"")&&(r.f==="Remarkable Athlete"||r.f==="Survivor"||r.f==="Assassinate")) return;/* v72: 2014 versions of these features give no Advantage */ const src=r.f+(r.note?" ("+r.note+")":"");
    if(r.init) add(o.init,"ADV",src);
    (r.skill||[]).forEach((k) =>{ (o.skill[k]=o.skill[k]||[]).push({t:"ADV",s:src}); });
    if(!(r.noIncap&&inc)) (r.save||[]).forEach((k) =>{ sv(k,"ADV",src); });
    if(r.ds) add(o.ds,"ADV",src); if(r.dsd) add(o.ds,"DIS",src); });
  (C.itemAdv||[]).forEach((r) =>{ if(r.k==="Initiative") add(o.init,"ADV",r.s); else (o.skill[r.k]=o.skill[r.k]||[]).push({t:"ADV",s:r.s}); });/* v65: magic items */
  if(c.Blinded) add(o.atk,"DIS","Blinded");
  if(c.Frightened){ add(o.atk,"DIS","Frightened, while the source of fear is in sight"); add(o.chk,"DIS","Frightened, while the source of fear is in sight"); }
  if(c.Grappled){ if(!xr2) add(o.atk,"DIS","Grappled, against anyone other than the grappler"); o.speed0.push("Grappled"); }
  if(c.Invisible) add(o.atk,"ADV","Invisible, against creatures that cannot see you");
  if(c.Poisoned){ add(o.atk,"DIS","Poisoned"); add(o.chk,"DIS","Poisoned"); }
  if(c.Prone||c.Unconscious) add(o.atk,"DIS",c.Prone?"Prone":"Unconscious (Prone)");
  if(c.Restrained){ add(o.atk,"DIS","Restrained"); sv("DEX","DIS","Restrained"); o.speed0.push("Restrained"); }
  ["Paralyzed","Petrified","Stunned","Unconscious"].forEach((k) =>{ if(!c[k]) return; sv("STR","FAIL",k); sv("DEX","FAIL",k); if(k!=="Stunned") o.speed0.push(k); });
  INCAP.forEach((k) =>{ if(c[k]) o.noAct.push(k); });
  if(c.Petrified) o.res.push({t:"Resistance",v:"All damage",s:"Petrified"});
  if(modeOn("rage")){ o.dmgStr=rageDmg(); (o.chkAb.STR=[]).push({t:"ADV",s:"Rage"}); sv("STR","ADV","Rage"); if(!(C.defenses||[]).some((d) =>{ return /while raging|\bRage\b/i.test(String(d.v)+" "+String(d.s)); })) ["Bludgeoning","Piercing","Slashing"].forEach((t) =>{ o.res.push({t:"Resistance",v:t,s:"Rage"}); }); }
  if(modeOn("sacred")) o.atkW=Math.max(1,D.mod.CHA);
  if(modeOn("wings")) o.fly={v:"walk",s:"Heavenly Wings (Celestial Revelation)"};
  ["wings","radiance","shroud"].forEach((k) =>{ if(modeOn(k)) o.xd.push({n:"Celestial Revelation",dmg:String(D.pb),type:k==="shroud"?"Necrotic":"Radiant",note:"Once on each of your turns, one target you damage with an attack or a spell takes this extra damage while the transformation lasts."+(k==="radiance"?" At the end of each of your turns, each creature within 10 feet takes "+D.pb+" Radiant damage.":k==="shroud"?" When you transform, creatures other than your allies within 10 feet make a Charisma save (DC "+(8+D.pb+D.mod.CHA)+") or have the Frightened condition until the end of your next turn.":"")}); });
  sitFx(o);/* v103 */
  return o; }
/* one tag per kind. Advantage and Disadvantage together cancel out */
export function cfFlags(list){ list=list||[]; if(!list.length) return ""; const by={}; list.forEach((x) =>{ (by[x.t]=by[x.t]||[]).push(x.s); });
  if(by.FAIL) return '<span class="flag cf fail" title="'+esc("Automatic failure: "+by.FAIL.join(", "))+'">FAIL</span>';
  if(by.ADV&&by.DIS) return '<span class="flag cf" title="'+esc("Advantage ("+by.ADV.join(", ")+") and Disadvantage ("+by.DIS.join(", ")+") cancel out")+'">ADV/DIS</span>';
  const t=by.ADV?"ADV":"DIS"; return '<span class="flag cf '+t.toLowerCase()+'" title="'+esc((t==="ADV"?"Advantage: ":"Disadvantage: ")+(by[t]||[]).join(", "))+'">'+t+'</span>'; }
function cfSkill(s){ const f=D.cf||{}; return (f.chk||[]).concat((f.chkAb||{})[s.ab]||[]).concat((f.skill||{})[s.n]||[]); }
function cfSave(k){ const f=D.cf||{}; return ((f.save||{})[k]||[]).slice(); }
export function modeChips(){ const av=modesAvail(); if(!av.length) return ""; return av.map((m) =>{ const on=modeOn(m.k); return '<button type="button" class="chip mode'+(on?' on':'')+' press" data-mode="'+m.k+'" aria-pressed="'+on+'">'+esc(m.n)+'</button>'; }).join(""); }
function modeUse(m){ return (D.res||[]).filter((r) =>{ return m.use.test(r.n); })[0]; }
function modeToggle(k){ const m=MODES.filter((x) =>{ return x.k===k; })[0]; if(!m) return; S.mode=S.mode||{};
  if(S.mode[k]){ undoMark("End "+m.n); delete S.mode[k]; save(); __R.renderAll(); refreshEntry(); toastU(m.n+" ended."); return; }
  const go=function(useIt){ undoMark(m.n); let r=modeUse(m), msg=m.n+" is active.", wsT=null;
    if(m.g) MODES.forEach((x) =>{ if(x.g===m.g&&x.k!==k) delete S.mode[x.k]; });
    S.mode[k]=1; if(useIt&&r){ S.used[r.k]=num(S.used[r.k],0)+1; msg+=" One use of "+r.n+" spent."; }
    if(k==="rage"&&concOf()) msg+=" "+concEnd("Rage");
    if(k==="wildshape"){ wsT=tmpFeat(hasFeat("Circle Forms")?"Circle Forms":"Wild Shape",""); if(wsT&&wsT.v&&!(S.tmp>0)){ S.tmp=wsT.v; msg+=" Temporary Hit Points: "+wsT.v+"."; wsT=null; } }
    save(); __R.renderAll(); refreshEntry(); toastU(msg);
    if(wsT&&wsT.v) tmpApply(wsT.v,"Wild Shape",true); };/* v22 M5: one Undo for the whole action */
  const r=modeUse(m), grp=m.g&&MODES.some((x) =>{ return x.g===m.g&&modeOn(x.k); });
  if(grp){ go(false); return; }
  if(k==="rage"&&(C.inv||[]).some((i) =>{ return eqOn(i)&&HEAVY.test(i.n); })){ ask("You wear Heavy armor. Rage needs you out of Heavy armor. Turn it on anyway?","Turn On",() =>{ go(!!r&&used(r.k,r.max)<r.max); }); return; }/* v22 m3 */
  if(r&&used(r.k,r.max)>=r.max){ ask("No "+r.n+" uses left. Turn on "+m.n+" anyway, without spending a use?","Turn On",() =>{ go(false); }); return; }
  go(true); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-mode]"); if(!b) return; e.preventDefault(); e.stopPropagation(); modeToggle(b.getAttribute("data-mode")); },true);
export function noActH(){ const f=D.cf||{}; return f.noAct&&f.noAct.length?'<div class="caution cfna">⚠ '+esc(f.noAct.join(", "))+': you cannot take actions, Bonus Actions, or Reactions.</div>':''; }

/* ---------- RU43: cantrips with a saving throw, as rows in Actions ---------- */
function saveCantripRows(){ return (C.spells||[]).map((x,i) =>{ if(x.l||!x.sv||x.sv==="ATK") return ""; const sc=scOf(x);
  const cc=spCalc(x,0,D.level,sc.mod), ty=cc&&cc.parts.length?cc.parts[0].t:"";
  return '<div class="arow xd sv"><div class="an">'+svgI(AK_ICON.spell,"aki ak-spell","Spell, saving throw")+'<button type="button" class="tx" data-info="sp:'+i+'">'+esc(x.n)+'</button><small>CANTRIP \u2022 '+esc(x.sv)+' SAVE</small><span class="arng">'+spRangeH(x.r,x).replace(/ft\./g,"ft")+'</span></div><span class="abox">'+esc(x.sv)+'<small>'+sc.dc+'</small></span><span class="abox wide">'+spEffH(x,0)+(ty?'<small>'+esc(dTxt(ty))+'</small>':'')+'</span></div>'; }).join(""); }/* v22 m5 */
function modeXdRows(){ return ((D.cf||{}).xd||[]).map((x) =>{ return '<div class="arow xd"><div class="an">'+akIcon("feature")+'<b class="tx">'+esc(x.n)+'</b><small>ACTIVE</small><span class="arng">--</span></div><span class="abox">--</span><span class="abox wide" title="'+esc(x.note)+'">'+esc(x.dmg)+tyIcon(x.type)+'<small>'+esc(x.type)+'</small></span></div>'; }).join(""); }
