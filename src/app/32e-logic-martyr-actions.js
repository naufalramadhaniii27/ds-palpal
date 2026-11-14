import {renderAll,syncHP,hdHeal,used,refreshEntry} from "./00a-reg-late-ports.js";/* Responsibility: one-tap use of Martyr (VSS24), Shifter and Bloodlust features on the sheet. Each button rolls the dice, spends the uses and Hit Point Dice, and changes Hit Points. Hit Point Dice are one pool: the Short Rest dialog and these buttons spend the same dice. */
import {C,S,save} from "./04-logic-storage.js";
import {esc,num,ask} from "./05-logic-helpers.js";
import {B,D} from "./06-logic-derivation.js";
import {toastU,undoMark} from "./32-logic-play-undo-actions.js";
import {hasFeat,spCastOpts,castDo,ckOf} from "./32b-logic-play-concentration-casting.js";
import {env} from "./00-env.js";

function ma_rk(k){ return (D.res||[]).filter((r) =>{ return r.k===k; })[0]||null; }
function ma_left(k){ const r=ma_rk(k); return r?r.max-used(r.k,r.max):0; }
function ma_spend(k,n){ S.used[k]=num(S.used[k],0)+(n||1); }
function ma_hdKey(){ const r=(D.res||[]).filter((q) =>{ return q.k==="hd"||/^hd-d/.test(q.k); })[0]; return r?r.k:"hd"; }
function ma_hdDie(){ const r=ma_rk(ma_hdKey()); return num(r&&r.die,num(C.hitDie,10)); }
/* dice: numbers typed by the player first, then the app dice (3D roller), then a plain random roll. QUEUE holds the faces for one action */
let QUEUE={};
function ma_roll(d){ const q=QUEUE[d]; if(q&&q.length) return q.shift(); return 1+Math.floor(Math.random()*d); }
function ma_faces(txt,n,die){ const a=String(txt||"").match(/\d+/g); if(!a) return null; let v=a.map(Number).filter((x) =>{ return x>=1; }); if(!v.length) return null;
  if(v.length===1&&n>1){ const t=Math.max(n,Math.min(n*die,v[0])), base=Math.floor(t/n), o=[]; for(let i=0;i<n;i++) o.push(base+(i<t-base*n?1:0)); return o; }/* one total: split over the dice */
  return v.slice(0,n).map((x) =>{ return Math.min(die,x); }).concat([]).length===n?v.slice(0,n).map((x) =>{ return Math.min(die,x); }):null; }
function ma_gather(specs,cb){ QUEUE={}; const todo=specs.filter((q) =>{ return q.n>0; }); let i=0;
  const next=function(){ if(i>=todo.length){ cb(); return; } const q=todo[i++], inp=document.querySelector('[data-mrin="'+q.k+'"]'), man=inp?ma_faces(inp.value,q.n,q.die):null;
    if(inp&&inp.value.trim()&&!man){ toastU("Type "+q.n+" number"+(q.n>1?"s":"")+" from 1 to "+q.die+" for "+q.lab+", or one total."); QUEUE={}; return; }
    const put=function(v){ QUEUE[q.die]=(QUEUE[q.die]||[]).concat(v); next(); };
    if(man){ put(man); return; }
    if(env.__miRoll&&env.__miRoll.roll){ try{ env.__miRoll.roll({dmg:q.n+"d"+q.die},"",q.lab,(r) =>{ const m=/\[([^\]]*)\]/.exec(r&&r.d||""); put(m?m[1].split(/,\s*/).map(Number):[]); }); return; }catch(er){} }
    put([]); };
  next(); }
function ma_martyrLv(){ return C.cls==="Martyr"?num(C.level,1):0; }
function ma_chosen(n){ return (C.features||[]).some((g) =>{ return (g.items||[]).some((i) =>{ return i.n==="Chosen: "+n; }); }); }
export function shiftAc(){ return S.shift&&ma_chosen("Beasthide")?1:0; }
function ma_done(msg){ save(); try{ renderAll(); }catch(er){} try{ syncHP(); }catch(er){} toastU(msg); }
function ma_healRolls(n){ const die=ma_hdDie(), r=[]; let t=0; for(let i=0;i<n;i++){ const v=ma_roll(die); r.push(v); t+=hdHeal(v); } return {r:r,t:t}; }
function ma_addHp(t){ const b=num(S.hp,0); S.hp=Math.min(D.hpmax,b+t); return S.hp-b; }

function ma_mirac(n,free){ const max=Math.floor(ma_martyrLv()/2), hl=ma_left(ma_hdKey()); n=Math.min(n,max,hl); if(n<1){ toastU("No Hit Point Dice left."); return ""; }
  const h=ma_healRolls(n); ma_spend(ma_hdKey(),n); const got=ma_addHp(h.t);
  let m=(free?"":"Miraculous Healing: ")+"spent "+n+" Hit "+(n>1?"Dice":"Die")+" (rolled "+h.r.join(", ")+"), healed "+got+(got<h.t?" of "+h.t:"")+".";
  if(hasFeat("Balm")){ let b=0; const br=[]; for(let i=0;i<n;i++){ const v=ma_roll(8); br.push(v); b+=v; } m+=" Balm: one creature within 60 ft regains "+b+" ("+br.join(", ")+") and can end Blinded, Deafened or Poisoned."; }
  return m; }
/* healing spells (Cure Wounds, Prayer of Healing...): roll the formula, heal yourself or show the number for an ally */
function ma_healRoll(f){ const m=/(\d+)d(\d+)\s*([+-]\s*\d+)?/.exec(f||""); if(!m) return {t:num(f,0),r:[]}; const r=[]; let t=0; for(let i=0;i<+m[1];i++){ const v=ma_roll(+m[2]); r.push(v); t+=v; } t+=m[3]?+m[3].replace(/\s/g,""):0; return {t:Math.max(0,t),r:r}; }
/* the heal buttons cast the spell too: spend the slot or Spell Use (and the Martyr HP cost) at the chosen level */
function ma_castFor(n,lv){ const i=(C.spells||[]).findIndex((x) =>{ return x.n===n; }); if(i<0) return true; const x=C.spells[i];
  const o=spCastOpts(x).filter((q) =>{ return q.left==null||q.left>0; }); if(!o.length){ toastU("No spell slot or use left for "+n+"."); return false; }
  const q=o.filter((z) =>{ return z.lv===lv; })[0]||o[0]; castDo(i,ckOf(q),q.lv); return true; }
const ACT={
  sheal:function(v){ const p=String(v||"").split("|"); if(!ma_castFor(p[1],+p[2])) return; const h=ma_healRoll(p[0]); undoMark(p[1]||"Healing"); const got=ma_addHp(h.t); ma_done((p[1]||"Healing")+": rolled "+h.r.join(", ")+", you regain "+got+(got<h.t?" of "+h.t:"")+"."); },
  shealo:function(v){ const p=String(v||"").split("|"); if(!ma_castFor(p[1],+p[2])) return; const h=ma_healRoll(p[0]); toastU((p[1]||"Healing")+": rolled "+h.r.join(", ")+". The creature regains "+h.t+" Hit Points."); },
  mh:function(n){ undoMark("Miraculous Healing"); const m=ma_mirac(+n||1); if(m) ma_done(m); },
  feast:function(){ if(ma_left("x-sanguine-feast")<1){ toastU("No Sanguine Feast uses left."); return; } if(ma_left(ma_hdKey())<1){ toastU("No Hit Point Dice left."); return; }
    undoMark("Sanguine Feast"); const h=ma_healRolls(1); ma_spend(ma_hdKey(),1); ma_spend("x-sanguine-feast",1); const got=ma_addHp(h.t); ma_done("Sanguine Feast: rolled "+h.r[0]+", healed "+got+"."); },
  shift:function(){ if(ma_left("x-shifting")<1){ toastU("No Shifting uses left."); return; } undoMark("Shifting");
    const pb=num(D.pb,2), bh=ma_chosen("Beasthide"), d=bh?ma_roll(6):0, t=2*pb+d; ma_spend("x-shifting",1); S.shift=1; const was=num(S.tmp,0); S.tmp=Math.max(was,t);
    ma_done("Shifted: "+t+" Temporary Hit Points"+(bh?" (2 × "+pb+" + 1d6 rolled "+d+"), +1 AC":"")+(was>t?". You keep your "+was:"")+"."); },
  unshift:function(){ undoMark("End Shifting"); S.shift=0; ma_done("Shifting ended."); },
  strike:function(){ undoMark("Sacrificial Strike"); const b=num(S.hp,0); S.hp=Math.max(0,b-5); ma_done("Sacrificial Strike: you take 5 Radiant (not from Temporary Hit Points). The target takes 10 extra Radiant."); },
  skill:function(){ undoMark("Sacrificial Skill"); const b=num(S.hp,0); S.hp=Math.max(0,b-10); ma_done("Sacrificial Skill: you take 10 Radiant and add +5 to the roll."); },
  undying:function(){ if(ma_left("x-undying")<1){ toastU("Undying is used. A Long Rest restores it."); return; } undoMark("Undying"); ma_spend("x-undying",1); S.hp=Math.max(1,num(S.hp,0)); S.ds=[0,0];
    const m=ma_mirac(Math.floor(ma_martyrLv()/2),true); ma_done("Undying: you drop to 1 Hit Point instead. "+(m||"No Hit Point Dice left to heal.")); },
  respite:function(){ if(ma_left("x-divine-respite")<1){ toastU("Divine Respite is used. A Long Rest restores it."); return; } const L=ma_martyrLv(), n=L>=17?10:L>=13?6:3, k=ma_hdKey(), u=num(S.used[k],0), g=Math.min(n,u);
    undoMark("Divine Respite"); S.used[k]=u-g; ma_spend("x-divine-respite",1); ma_done("Divine Respite: regained "+g+" Hit Point "+(g===1?"Die":"Dice")+"."); },
  reprisal:function(){ const L=S.lastDmg; if(!L||!L.a){ toastU("Take the damage on the sheet first, then use Reprisal."); return; } const half=Math.min(Math.floor(L.a/2),num(L.hp,0)+num(L.tmp,0)), lv=ma_martyrLv(), dn=lv>=17?4:lv>=11?3:lv>=5?2:1; let r=0; for(let i=0;i<dn;i++) r+=ma_roll(6);
    undoMark("Reprisal"); const back=Math.min(half,num(L.hp,0)); S.hp=Math.min(D.hpmax,num(S.hp,0)+back); if(half>back) S.tmp=num(S.tmp,0)+Math.min(half-back,num(L.tmp,0));/* only what this hit took comes back */ S.lastDmg=null;
    ma_done("Reprisal: the "+L.a+" damage is halved, you get "+half+" back. The attacker takes "+r+" Necrotic or Radiant ("+dn+"d6)."); }
};
/* buttons under a feature card */
function ma_rin(k,lab,ph){ return '<label class="mact-f"><span>'+esc(lab)+'</span><input type="text" inputmode="numeric" autocomplete="off" data-mrin="'+k+'" placeholder="'+esc(ph)+'"></label>'; }
function ma_stat(lab,v,sub){ return '<div class="mact-s"><small>'+esc(lab)+'</small><b>'+v+'</b>'+(sub?'<i>'+esc(sub)+'</i>':'')+'</div>'; }
function ma_box(title,stats,fields,btns,grid){ return '<div class="mact"><div class="mact-h">'+esc(title)+'</div>'+(stats?'<div class="mact-ss">'+stats+'</div>':'')
  +(fields?'<div class="mact-fs">'+fields+'</div><p class="mact-n">Type what you rolled, or leave empty and tap a button to roll the app dice.</p>':'')
  +'<div class="mact-b'+(grid?' g'+grid:'')+'">'+btns+'</div></div>'; }
function ma_b(a,v,t,s,off,pri){ return '<button type="button" class="btn press'+(pri?' pri':'')+(off?' off':'')+'" data-mact="'+a+'" data-mv="'+(v||"")+'"'+(off?' disabled':'')+'><span>'+t+'</span>'+(s?'<small>'+s+'</small>':'')+'</button>'; }
/* buttons under a feature card */
/* what every panel shows about the Hit Point Dice pool */
function ma_ctx(){ const hl=ma_left(ma_hdKey()), hr=ma_rk(ma_hdKey()), hd=ma_hdDie(), cm=num(D.mod.CON,0), cs=(cm>=0?"+":"−")+Math.abs(cm), dbl=hdHeal(5)>Math.max(1,5+cm);
  return {hl:hl, hd:hd, bal:hasFeat("Balm"), per:dbl?"(1d"+hd+" "+cs+") × 2":"1d"+hd+" "+cs, hdS:ma_stat("Hit Point Dice",hl+" / "+(hr?hr.max:0),"shared with Short Rest")}; }
function ma_uses(k){ return ma_stat("Uses left",String(ma_left(k))); }
const PANEL={
  "Miraculous Healing":function(V){ if(!ma_martyrLv()) return ""; const mx=Math.floor(ma_martyrLv()/2); let bt=""; for(let i=1;i<=mx;i++) bt+=ma_b("mh",i,String(i),i===1?"die":"dice",i>V.hl,i===Math.min(mx,V.hl));
    return ma_box("Spend Hit Point Dice",V.hdS+ma_stat("Each die heals",V.per,B["heal-hd"]?B["heal-hd"].total:""),ma_rin("mh","Hit Point Dice (d"+V.hd+")","7 3 12")+(V.bal?ma_rin("balm","Balm (d8)","5 2 8"):""),bt,mx); },
  "Bloodlust":function(V){ const u=ma_left("x-sanguine-feast"); return ma_box("Sanguine Feast",ma_uses("x-sanguine-feast")+V.hdS,ma_rin("feast","Hit Point Die (d"+V.hd+")","9"),ma_b("feast","","Heal with 1 Hit Point Die",V.per,u<1||V.hl<1,true)); },
  "Shifting":function(){ const bh=ma_chosen("Beasthide"), pb=num(D.pb,2), btn=S.shift?ma_b("unshift","","End Shifting"):ma_b("shift","","Shift now","",ma_left("x-shifting")<1,true);
    return ma_box(S.shift?"Shifted":"Shift",ma_uses("x-shifting")+ma_stat("Temporary HP",(2*pb)+(bh?" + 1d6":""),bh?"+1 AC while shifted":""),!S.shift&&bh?ma_rin("shift","Beasthide (d6)","4"):"",btn); },
  "Sacrifice":function(){ return ma_box("Pay with your blood","","",ma_b("strike","","Sacrificial Strike","you take 5, target +10")+ma_b("skill","","Sacrificial Skill","you take 10, roll +5"),2); },
  "Undying":function(V){ const k=Math.min(Math.floor(ma_martyrLv()/2),V.hl);
    return ma_box("Undying",ma_uses("x-undying")+V.hdS,ma_rin("und","Hit Point Dice (d"+V.hd+")","7 3 12 5 9")+(V.bal?ma_rin("undb","Balm (d8)","5 2 8 1 6"):""),ma_b("undying","","Use Undying","1 HP, then heal "+k+" dice",ma_left("x-undying")<1,true)); },
  "Divine Respite":function(V){ const L=ma_martyrLv(), g=L>=17?10:L>=13?6:3; return ma_box("Divine Respite",ma_uses("x-divine-respite")+V.hdS,"",ma_b("respite","","Regain "+g+" Hit Point Dice","after a Short Rest",ma_left("x-divine-respite")<1,true)); },
  "Reprisal":function(){ const lv=ma_martyrLv(); if(!lv) return ""; const L=S.lastDmg, on=!!(L&&L.a), dn=lv>=17?4:lv>=11?3:lv>=5?2:1;
    return ma_box("Reprisal",ma_stat("Last damage",on?String(L.a):"—",on?"you get "+Math.floor(L.a/2)+" back":"take damage first")+ma_stat("Attacker takes",dn+"d6"),ma_rin("rep","Reprisal ("+dn+"d6)","3 5"),ma_b("reprisal","","Halve the last damage","",!on,true)); }
};
export function martyrActH(f){ const p=f&&PANEL[f.n]; return p?p(ma_ctx()):""; }
/* the dice each action needs, so they can be typed or rolled before it runs */
function ma_need(a,v){ const n=+v||1, lv=ma_martyrLv(), mx=Math.floor(lv/2), hl=ma_left(ma_hdKey()), hd=ma_hdDie(), bal=hasFeat("Balm");
  if(a==="mh"){ const k=Math.min(n,mx,hl); return [{k:"mh",n:k,die:hd,lab:"Hit Point Dice"},{k:"balm",n:bal?k:0,die:8,lab:"Balm"}]; }
  if(a==="undying"){ const k=Math.min(mx,hl); return [{k:"und",n:k,die:hd,lab:"Hit Point Dice"},{k:"undb",n:bal?k:0,die:8,lab:"Balm"}]; }
  if(a==="feast") return [{k:"feast",n:1,die:hd,lab:"Hit Point Die"}];
  if(a==="shift") return [{k:"shift",n:ma_chosen("Beasthide")?1:0,die:6,lab:"Beasthide"}];
  if(a==="reprisal") return [{k:"rep",n:lv>=17?4:lv>=11?3:lv>=5?2:1,die:6,lab:"Reprisal"}];
  if(a==="sheal"||a==="shealo"){ const m=/(\d+)d(\d+)/.exec(String(v||"").split("|")[0]); return m?[{k:"sh",n:+m[1],die:+m[2],lab:"Healing"}]:[]; }
  return []; }
function ma_run(a,v){ const f=ACT[a]; if(!f) return; ma_gather(ma_need(a,v),() =>{ f(v); QUEUE={}; document.querySelectorAll("[data-mrin]").forEach((i) =>{ i.value=""; }); try{ refreshEntry(); }catch(er){} }); }
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("[data-mact]"); if(!t||t.disabled) return; e.preventDefault(); e.stopPropagation(); ma_run(t.getAttribute("data-mact"),t.getAttribute("data-mv")); },true);
/* at 0 Hit Points with Undying left: offer it at once */
export function martyrZero(){ if(num(S.hp,0)!==0||ma_left("x-undying")<1||!ma_martyrLv()) return; ask("You dropped to 0 Hit Points. Use Undying: drop to 1 Hit Point and heal with Miraculous Healing?","Use Undying",() =>{ ma_run("undying",""); }); }
export function healH(f,n,dur,lv){ if(!/\d+d\d+/.test(f||"")||/hour|minute/i.test(dur||"")&&!/Instant/i.test(dur||"")) return ""; const v=esc(f+"|"+n+"|"+(lv||""));
  return ma_box("Roll the healing","",ma_rin("sh","Healing dice ("+(/(\d+d\d+)/.exec(f)||["",""])[1]+")","e.g. 5 7"),'<button type="button" class="btn press pri" data-mact="sheal" data-mv="'+v+'"><span>Heal me</span><small>'+esc(f)+'</small></button><button type="button" class="btn press" data-mact="shealo" data-mv="'+v+'"><span>Heal an ally</span><small>shows the number</small></button>',2); }
env.__martyr={act:function(a,v){ ma_run(a,v); }, html:martyrActH, healH:healH};/* test hook */
