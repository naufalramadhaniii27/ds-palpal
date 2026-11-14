import {bindLive,renderActions,syncLU,renderTiles,used,syncHP,refreshEntry,closeSheet,restRefresh} from "./00a-reg-late-ports.js";/* Responsibility: hit point changes, rest recovery lists and their handlers. Split out of the former single file 32 in SOLID stage 9 (S); runs in the same order as before. */
import {x14} from "./03-data-glossary.js";import {C,S,save} from "./04-logic-storage.js";import {eqOn,esc,num,sg,toast} from "./05-logic-helpers.js";import {D,derive} from "./06-logic-derivation.js";import {clsLvls,hasFeat,lvOf,slotLeft} from "./32b-logic-play-concentration-casting.js";
bindLive("chMaxH",{get:function(){return chMaxH;}});
bindLive("chgApply",{get:function(){return chgApply;}});
bindLive("chgRows",{get:function(){return chgRows;}});
bindLive("hdHeal",{get:function(){return hdHeal;}});
bindLive("hpModH",{get:function(){return hpModH;}});
bindLive("hpSpellNote",{get:function(){return hpSpellNote;}});
bindLive("longExtraH",{get:function(){return longExtraH;}});
bindLive("periOn",{get:function(){return periOn;}});
bindLive("recList",{get:function(){return recList;}});
bindLive("recSum",{get:function(){return recSum;}});
bindLive("restX",{get:function(){return restX;},set:function(v){restX=v;}});
bindLive("shortChg",{get:function(){return shortChg;}});
bindLive("shortExtraH",{get:function(){return shortExtraH;}});
bindLive("slotUsed",{get:function(){return slotUsed;}});
bindLive("spxBody",{get:function(){return spxBody;}});
function chMaxH(r){ if(!r.dmax) return ""; const v=(S.chMax||{})[r.k]; return '<div class="chmax"><label>Starting '+(/Necklace of Fireballs/.test(r.n)?'beads':'charges')+' (roll '+esc(r.dmax)+')<input type="number" min="0" inputmode="numeric" data-chmax="'+esc(r.k)+'" value="'+(v!=null?v:"")+'" placeholder="up to '+r.max0+'"></label>'+(v==null?'<small class="muted">Roll '+esc(r.dmax)+' and type the result. Until then the sheet shows the highest possible number.</small>':'')+'</div>'; }
document.addEventListener("change",(e) =>{ const t=e.target; if(!t.matches||!t.matches("[data-chmax]")) return; const k=t.getAttribute("data-chmax"); S.chMax=S.chMax||{}; if(t.value===""){ delete S.chMax[k]; } else S.chMax[k]=Math.max(0,Math.round(num(t.value,0))); save(); derive(); syncLU(); renderActions(); refreshEntry(); });

/* ---------- RU45 Hit Point maximum modifier and override ---------- */
function hpModH(){ return '<div class="info-h">Change the Maximum</div><div class="hpmods"><label>Max HP modifier<input type="number" inputmode="numeric" data-hpmod="1" value="'+(num(S.hpMod,0)||"")+'" placeholder="0"></label><label>Override Max HP<input type="number" min="1" inputmode="numeric" data-hpover="1" value="'+(num(S.hpOver,0)>0?S.hpOver:"")+'" placeholder="none"></label></div><p class="bk-f">A modifier adds to or takes from the maximum, for example a curse that lowers it. An override replaces the total. The Long Rest dialog can reset both.</p>'+hpQuickH(); }
/* v100: spells that others cast on you change your maximum. Aid adds 5 (5 more per slot level above 2), Heroes' Feast adds 2d10, Harm lowers it. One tap applies the number and moves the current Hit Points the way the rules say */
function hpQuickH(){ return '<div class="info-h">Spells cast on you</div><p class="bk-f">Aid, Heroes\' Feast and Harm change your maximum. <button type="button" class="lk" data-info="spx:1">Apply one of them</button></p>'; }
function spxBody(){ let d=num(S.hpMod,0), i, aid="";
  for(i=2;i<=9;i++) aid+='<button type="button" class="btn press spx-c" data-spxdo="aid:'+i+'">'+i+'<small>+'+5*(i-1)+'</small></button>';
  return '<div class="dc"><p class="info-d">Hit Point maximum <b>'+D.hpmax+'</b>'+(d?' (spells and other changes: '+(d>0?"+":"")+d+')':'')+'. Current Hit Points <b>'+num(S.hp,0)+'</b>.</p>'
   +'<div class="info-h">Aid</div><p class="info-d">Pick the slot level the caster used. Your maximum and current Hit Points rise by the amount shown. It lasts 8 hours.</p><div class="spx-r">'+aid+'</div>'
   +'<div class="info-h">Heroes\' Feast</div><p class="info-d">Adds 2d10 to your maximum and to your current Hit Points. It lasts 24 hours.</p><div class="spx-f"><button type="button" class="btn pri press" data-spxdo="feast:r">Roll 2d10 and apply</button><input type="number" min="2" max="20" inputmode="numeric" data-spx-feast="1" placeholder="or your roll" aria-label="Your 2d10 roll"><button type="button" class="btn press" data-spxdo="feast:m">Apply</button></div>'
   +'<div class="info-h">Harm</div><p class="info-d">Lowers your maximum by the Necrotic damage you took. It lasts until a Long Rest. Your current Hit Points drop to the new maximum if needed.</p><div class="spx-f"><input type="number" min="1" inputmode="numeric" data-spx-harm="1" placeholder="Necrotic damage" aria-label="Necrotic damage taken"><button type="button" class="btn press" data-spxdo="harm">Lower maximum</button></div>'
   +(d?'<div class="info-h">Effect ended</div><p class="info-d">Remove every Hit Point maximum change, including ones you typed in yourself.</p><button type="button" class="btn press" data-spxdo="end">Remove all changes</button>':'')+'</div>'; }
function hpFx(amt,why){ if(!amt) return; const om=D.hpmax; S.hpMod=num(S.hpMod,0)+amt; if(!S.hpMod) delete S.hpMod; derive();
  if(S.hp!=null){ if(D.hpmax>om) S.hp=Math.min(D.hpmax,S.hp+(D.hpmax-om)); else S.hp=Math.min(S.hp,D.hpmax); }
  save(); syncHP(true); renderTiles(); refreshEntry(); toast(why+": maximum "+D.hpmax+", current "+num(S.hp,0)+"."); }
document.addEventListener("click",(e) =>{ const t=e.target&&e.target.closest&&e.target.closest("[data-spxdo]"); if(!t) return; let k=t.getAttribute("data-spxdo").split(":"), q=function(a){ return document.querySelector("["+a+"]"); }, v;
  if(k[0]==="aid") hpFx(5*(+k[1]-1),"Aid");
  else if(k[0]==="feast"){ if(k[1]==="r") v=2+Math.floor(Math.random()*10)+Math.floor(Math.random()*10); else v=Math.round(num(q("data-spx-feast").value,0)); if(v<2||v>20){ toast("Enter your 2d10 roll, 2 to 20."); return; } hpFx(v,"Heroes' Feast +"+v); }
  else if(k[0]==="harm"){ v=Math.round(num(q("data-spx-harm").value,0)); if(v<1){ toast("Enter the Necrotic damage you took."); return; } hpFx(-v,"Harm -"+v); }
  else if(k[0]==="end"){ const d0=num(S.hpMod,0); if(d0) hpFx(-d0,"Changes removed"); } });
function hpSpellNote(x){ if(!x||["Aid","Heroes\' Feast","Harm"].indexOf(x.n)<0) return ""; return '<p class="info-d dc-mat">Cast on you? <button type="button" class="lk" data-info="spx:1">Apply it to your Hit Points</button></p>'; }
document.addEventListener("change",(e) =>{ const t=e.target; if(!t.matches||!t.matches("[data-hpmod],[data-hpover]")) return; const v=Math.round(num(t.value,0)), k=t.hasAttribute("data-hpmod")?"hpMod":"hpOver";
  if(!v||(k==="hpOver"&&v<1)) delete S[k]; else S[k]=v; const om=D.hpmax; derive(); if(S.hp!=null&&D.hpmax>om) S.hp=Math.min(D.hpmax,S.hp+(D.hpmax-om)); save(); syncHP(true); renderTiles(); refreshEntry(); toast("Hit Point maximum is now "+D.hpmax+"."); });

/* ---------- RU54, RU72, RU44, RU45 rest additions ---------- */
var restX={};
function periOn(){ return (C.inv||[]).some((i) =>{ return (i.n==="Periapt of Wound Closure"||i.n==="Blessing of Wound Closure")&&eqOn(i); }); }/* v27 RD23 */
function hdHeal(v){ if(v<3&&(C.features||[]).some((g) =>{ return (g.items||[]).some((i) =>{ return i.n==="Bloodlust"; }); })) v=3;/* Bloodlust: Powerful Recovery */ return Math.max(1,v+D.mod.CON)*(periOn()?2:1); }
function recList(){ const o=[]; [["Wizard","Arcane Recovery",/^Arcane Recovery$/],["Druid","Natural Recovery",/^Natural Recovery: recover slots$/]].forEach((q) =>{ const lv=lvOf(q[0]), r=(D.res||[]).filter((x) =>{ return q[2].test(x.n); })[0]; if(!lv||!r) return; o.push({n:q[1],r:r,cap:Math.ceil(lv/2),left:r.max-used(r.k,r.max)}); }); return o; }
function slotUsed(L){ const s=slotLeft("s"+L); return s?s.r.max-s.left:0; }
function recSum(i){ let t=0, m=restX.rec&&restX.rec[i]||{}; Object.keys(m).forEach((L) =>{ t+=(+L)*num(m[L],0); }); return t; }
function shortExtraH(){ let h=""; if(periOn()) h+='<p class="info-d">Periapt of Wound Closure: each Hit Point Die heals twice as much.</p>';
  if(hasFeat("Chef")) h+='<div class="rx"><label class="ck"><input type="checkbox" data-rchef="1"'+(restX.chef?' checked':'')+'> Replenishing Meal (Chef): an extra 1d8 Hit Points if you spend Hit Point Dice</label>'+(restX.chef?'<label class="hdv">1d8 roll<input type="number" min="1" max="8" data-rchefv="1" value="'+(restX.chefV||"")+'" placeholder="roll"></label>':'')+'</div>';
  recList().forEach((q,i) =>{ if(!q.left) return; let any=false, rows=""; for(let L=1;L<=5;L++){ const u=slotUsed(L); if(!u) continue; any=true; const cur=num((restX.rec&&restX.rec[i]||{})[L],0); rows+='<label class="hdv">Level '+L+' slots<select data-rrec="'+i+'" data-rl="'+L+'">'; for(let n=0;n<=u;n++) rows+='<option value="'+n+'"'+(n===cur?' selected':'')+'>'+n+'</option>'; rows+='</select></label>'; }
    h+='<div class="rx"><div class="info-h">'+esc(q.n)+'</div><p class="info-d">Recover spent spell slots with a combined level up to '+q.cap+' (half your '+(q.n==="Arcane Recovery"?"Wizard":"Druid")+' level, rounded up), none of level 6 or higher. Once per Long Rest.</p>'+(any?rows+'<p class="muted" id="rrecT'+i+'">Chosen: '+recSum(i)+' of '+q.cap+' levels</p>':'<p class="muted">No spent slots of level 1 to 5.</p>')+'</div>'; });
  shortChg().forEach((r) =>{ h+=chgRow(r); }); return h; }
function chgRows(kinds){ return (D.res||[]).filter((r) =>{ return r.rg&&kinds.indexOf(r.when)>=0&&used(r.k,r.max)>0; }); }
function shortChg(){ return chgRows(["short"]); }
function chgRow(r){ return '<label class="hdv">'+esc(r.n)+': charges regained ('+esc(r.rg)+')<input type="number" min="0" inputmode="numeric" data-rchg="'+esc(r.k)+'" value="'+(restX.chg&&restX.chg[r.k]!=null?restX.chg[r.k]:"")+'" placeholder="roll"></label>'; }
function lrNotes(){ const cl=clsLvls(), o=[], r14=x14(), all=(r14?["Artificer","Cleric","Druid","Paladin","Wizard"]:["Cleric","Druid","Wizard"]).filter((c) =>{ return cl[c]; }), one=(r14?[]:["Paladin","Ranger"]).filter((c) =>{ return cl[c]; });/* v94: in the 2014 rules the prepared casters are Artificer, Cleric, Druid, Paladin, and Wizard, and there is no Weapon Mastery */
  if(all.length) o.push("Change your list of prepared spells ("+all.join(", ")+").");
  if(one.length) o.push("Replace one prepared spell with another ("+one.join(", ")+").");
  if(cl.Wizard&&!r14) o.push("Replace one Wizard cantrip with another (Wizard).");
  const wm1=(r14?[]:["Barbarian","Fighter"]).filter((c) =>{ return cl[c]; }), wmA=(r14?[]:["Paladin","Ranger","Rogue"]).filter((c) =>{ return cl[c]; });
  if(wm1.length) o.push("Change one of your Weapon Mastery weapon kinds ("+wm1.join(", ")+").");
  if(wmA.length) o.push("Change any of your Weapon Mastery weapon kinds ("+wmA.join(", ")+").");
  if(!r14&&hasFeat("Weapon Master")) o.push("Swap the weapon kind of your Weapon Master feat.");/* v21 m2 */
  if(cl.Druid>=2&&!r14) o.push("Replace one of your known Wild Shape forms (Druid).");
  if(!r14&&/High Elf/.test(String(C.species||""))) o.push("Swap your High Elf cantrip for another Wizard cantrip.");
  if(!r14&&hasFeat("Aspect of the Wilds")) o.push("Change your Aspect of the Wilds option.");
  return o; }
function longExtraH(){ let h="", lc=chgRows(["dawn","dusk","long"]);
  if(lc.length) h+='<div class="rx"><div class="info-h">Charges</div><p class="info-d">These items regain a rolled number of charges at dawn or dusk. Type each roll. Leave a box empty to change it later.</p>'+lc.map(chgRow).join("")+'</div>';
  if(num(S.hpMod,0)||num(S.hpOver,0)>0) h+='<label class="ck rx"><input type="checkbox" data-rhpreset="1"'+(restX.hpReset?' checked':'')+'> Reset Maximum HP changes (modifier '+sg(num(S.hpMod,0))+(num(S.hpOver,0)>0?', override '+S.hpOver:'')+')</label>';
  const nt=lrNotes(); if(nt.length) h+='<div class="rx"><div class="info-h">After this rest you can also</div><ul class="rest-notes">'+nt.map((t) =>{ return '<li>'+esc(t)+'</li>'; }).join("")+'</ul><button type="button" class="btn press" data-restbld="1">Open the Builder</button></div>';
  return h; }
document.addEventListener("change",(e) =>{ const t=e.target; if(!t.closest||!t.closest("#restDlg")) return; const kind=t.closest("#restDlg").getAttribute("data-kind");
  if(t.matches("[data-rchef]")){ restX.chef=t.checked; restRefresh(kind); return; }
  if(t.matches("[data-rhpreset]")){ restX.hpReset=t.checked; restRefresh(kind); return; }
  if(t.matches("[data-rrec]")){ const i=+t.getAttribute("data-rrec"); restX.rec=restX.rec||{}; restX.rec[i]=restX.rec[i]||{}; restX.rec[i][t.getAttribute("data-rl")]=+t.value; const q=recList()[i], el=document.getElementById("rrecT"+i); if(el&&q){ const s=recSum(i); el.textContent="Chosen: "+s+" of "+q.cap+" levels"+(s>q.cap?" (too many)":""); el.classList.toggle("caution",s>q.cap); } return; } });
document.addEventListener("input",(e) =>{ const t=e.target; if(!t.matches) return; if(t.matches("#restDlg [data-rchefv]")) restX.chefV=Math.floor(num(t.value,0)); if(t.matches("#restDlg [data-rchg]")){ restX.chg=restX.chg||{}; if(t.value==="") delete restX.chg[t.getAttribute("data-rchg")]; else restX.chg[t.getAttribute("data-rchg")]=Math.max(0,Math.floor(num(t.value,0))); } });
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-restbld]"); if(!b) return; e.preventDefault(); closeSheet(); const bb=document.getElementById("bldBtn"); if(bb) bb.click(); });
function chgApply(rows){ let n=0; rows.forEach((r) =>{ const v=restX.chg&&restX.chg[r.k]; if(v==null) return; S.used[r.k]=Math.max(0,used(r.k,r.max)-v); n++; }); return n; }
