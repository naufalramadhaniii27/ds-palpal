import {renderAll,syncHP,hdHeal,used,refreshEntry} from "./00a-reg-late-ports.js";/* Responsibility: one-tap use of Martyr (VSS24), Shifter and Bloodlust features on the sheet. Each button rolls the dice, spends the uses and Hit Point Dice, and changes Hit Points. Hit Point Dice are one pool: the Short Rest dialog and these buttons spend the same dice. */
import {C,S,save} from "./04-logic-storage.js";
import {esc,num,ask} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {toastU,undoMark} from "./32-logic-play-undo-actions.js";
import {hasFeat} from "./32b-logic-play-concentration-casting.js";
import {env} from "./00-env.js";

function rk(k){ return (D.res||[]).filter((r) =>{ return r.k===k; })[0]||null; }
function left(k){ const r=rk(k); return r?r.max-used(r.k,r.max):0; }
function spend(k,n){ S.used[k]=num(S.used[k],0)+(n||1); }
function hdKey(){ const r=(D.res||[]).filter((q) =>{ return q.k==="hd"||/^hd-d/.test(q.k); })[0]; return r?r.k:"hd"; }
function hdDie(){ const r=rk(hdKey()); return num(r&&r.die,num(C.hitDie,10)); }
function roll(d){ return 1+Math.floor(Math.random()*d); }
function martyrLv(){ return C.cls==="Martyr"?num(C.level,1):0; }
function chosen(n){ return (C.features||[]).some((g) =>{ return (g.items||[]).some((i) =>{ return i.n==="Chosen: "+n; }); }); }
export function shiftAc(){ return S.shift&&chosen("Beasthide")?1:0; }
function done(msg){ save(); try{ renderAll(); }catch(er){} try{ syncHP(); }catch(er){} toastU(msg); }
function healRolls(n){ const die=hdDie(), r=[]; let t=0; for(let i=0;i<n;i++){ const v=roll(die); r.push(v); t+=hdHeal(v); } return {r:r,t:t}; }
function addHp(t){ const b=num(S.hp,0); S.hp=Math.min(D.hpmax,b+t); return S.hp-b; }

function mirac(n,free){ const max=Math.floor(martyrLv()/2), hl=left(hdKey()); n=Math.min(n,max,hl); if(n<1){ toastU("No Hit Point Dice left."); return ""; }
  const h=healRolls(n); spend(hdKey(),n); const got=addHp(h.t);
  let m=(free?"":"Miraculous Healing: ")+"spent "+n+" Hit "+(n>1?"Dice":"Die")+" (rolled "+h.r.join(", ")+"), healed "+got+(got<h.t?" of "+h.t:"")+".";
  if(hasFeat("Balm")){ let b=0; const br=[]; for(let i=0;i<n;i++){ const v=roll(8); br.push(v); b+=v; } m+=" Balm: one creature within 60 ft regains "+b+" ("+br.join(", ")+") and can end Blinded, Deafened or Poisoned."; }
  return m; }
const ACT={
  mh:function(n){ undoMark("Miraculous Healing"); const m=mirac(+n||1); if(m) done(m); },
  feast:function(){ if(left("x-sanguine-feast")<1){ toastU("No Sanguine Feast uses left."); return; } if(left(hdKey())<1){ toastU("No Hit Point Dice left."); return; }
    undoMark("Sanguine Feast"); const h=healRolls(1); spend(hdKey(),1); spend("x-sanguine-feast",1); const got=addHp(h.t); done("Sanguine Feast: rolled "+h.r[0]+", healed "+got+"."); },
  shift:function(){ if(left("x-shifting")<1){ toastU("No Shifting uses left."); return; } undoMark("Shifting");
    const pb=num(D.pb,2), bh=chosen("Beasthide"), d=bh?roll(6):0, t=2*pb+d; spend("x-shifting",1); S.shift=1; const was=num(S.tmp,0); S.tmp=Math.max(was,t);
    done("Shifted: "+t+" Temporary Hit Points"+(bh?" (2 × "+pb+" + 1d6 rolled "+d+"), +1 AC":"")+(was>t?". You keep your "+was:"")+"."); },
  unshift:function(){ undoMark("End Shifting"); S.shift=0; done("Shifting ended."); },
  strike:function(){ undoMark("Sacrificial Strike"); const b=num(S.hp,0); S.hp=Math.max(0,b-5); done("Sacrificial Strike: you take 5 Radiant (not from Temporary Hit Points). The target takes 10 extra Radiant."); },
  skill:function(){ undoMark("Sacrificial Skill"); const b=num(S.hp,0); S.hp=Math.max(0,b-10); done("Sacrificial Skill: you take 10 Radiant and add +5 to the roll."); },
  undying:function(){ if(left("x-undying")<1){ toastU("Undying is used. A Long Rest restores it."); return; } undoMark("Undying"); spend("x-undying",1); S.hp=Math.max(1,num(S.hp,0)); S.ds=[0,0];
    const m=mirac(Math.floor(martyrLv()/2),true); done("Undying: you drop to 1 Hit Point instead. "+(m||"No Hit Point Dice left to heal.")); },
  respite:function(){ if(left("x-divine-respite")<1){ toastU("Divine Respite is used. A Long Rest restores it."); return; } const L=martyrLv(), n=L>=17?10:L>=13?6:3, k=hdKey(), u=num(S.used[k],0), g=Math.min(n,u);
    undoMark("Divine Respite"); S.used[k]=u-g; spend("x-divine-respite",1); done("Divine Respite: regained "+g+" Hit Point "+(g===1?"Die":"Dice")+"."); },
  reprisal:function(){ const L=S.lastDmg; if(!L||!L.a){ toastU("Take the damage on the sheet first, then use Reprisal."); return; } const half=Math.floor(L.a/2), lv=martyrLv(), dn=lv>=17?4:lv>=11?3:lv>=5?2:1; let r=0; for(let i=0;i<dn;i++) r+=roll(6);
    undoMark("Reprisal"); const back=Math.min(half,num(L.hp,0)); S.hp=Math.min(D.hpmax,num(S.hp,0)+back); if(half>back) S.tmp=num(S.tmp,0)+(half-back); S.lastDmg=null;
    done("Reprisal: the "+L.a+" damage is halved, you get "+half+" back. The attacker takes "+r+" Necrotic or Radiant ("+dn+"d6)."); }
};
/* buttons under a feature card */
export function martyrActH(f){ const n=f&&f.n, b=function(a,v,t,s,off){ return '<button type="button" class="btn press'+(off?' off':'')+'" data-mact="'+a+'" data-mv="'+(v||"")+'"'+(off?' disabled':'')+'>'+t+(s?' <small>'+s+'</small>':'')+'</button>'; };
  const hl=left(hdKey()), hd=hdDie();
  if(n==="Miraculous Healing"&&martyrLv()){ const mx=Math.min(Math.floor(martyrLv()/2),hl); let h='<div class="info-h">Use</div><p class="info-d">Each die heals 1d'+hd+' + CON'+(hdHeal(1)>Math.max(1,1+num(D.mod.CON,0))?' (doubled)':'')+'. Hit Point Dice left: <b>'+hl+'</b>. The Short Rest dialog uses the same dice.</p><div class="spcast">';
    for(let i=1;i<=Math.floor(martyrLv()/2);i++) h+=b("mh",i,"Spend "+i,i>mx?"":"",i>mx); return h+'</div>'; }
  if(n==="Bloodlust") return '<div class="info-h">Sanguine Feast</div><p class="info-d">After you hit a Bloodied creature. Uses left: <b>'+left("x-sanguine-feast")+'</b>, Hit Point Dice left: <b>'+hl+'</b>.</p><div class="spcast">'+b("feast","","Spend 1 Hit Point Die","",left("x-sanguine-feast")<1||hl<1)+'</div>';
  if(n==="Shifting") return '<div class="spcast">'+(S.shift?b("unshift","","End Shifting"):b("shift","","Shift now",left("x-shifting")+" left",left("x-shifting")<1))+'</div>';
  if(n==="Sacrifice") return '<div class="spcast">'+b("strike","","Sacrificial Strike","take 5")+b("skill","","Sacrificial Skill","take 10")+'</div>';
  if(n==="Undying") return '<div class="spcast">'+b("undying","","Use Undying",left("x-undying")+" left",left("x-undying")<1)+'</div>';
  if(n==="Divine Respite") return '<div class="spcast">'+b("respite","","Regain Hit Point Dice",left("x-divine-respite")+" left",left("x-divine-respite")<1)+'</div>';
  if(n==="Reprisal"&&martyrLv()) return '<div class="spcast">'+b("reprisal","","Halve the last damage",S.lastDmg&&S.lastDmg.a?"last: "+S.lastDmg.a:"no damage yet",!(S.lastDmg&&S.lastDmg.a))+'</div>';
  return ""; }
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("[data-mact]"); if(!t||t.disabled) return; e.preventDefault(); e.stopPropagation();
  const f=ACT[t.getAttribute("data-mact")]; if(f) f(t.getAttribute("data-mv")); try{ refreshEntry(); }catch(er){} },true);
/* at 0 Hit Points with Undying left: offer it at once */
export function martyrZero(){ if(num(S.hp,0)!==0||left("x-undying")<1||!martyrLv()) return; ask("You dropped to 0 Hit Points. Use Undying: drop to 1 Hit Point and heal with Miraculous Healing?","Use Undying",() =>{ ACT.undying(); }); }
env.__martyr={act:function(a,v){ if(ACT[a]) ACT[a](v); }, html:martyrActH};/* test hook */
