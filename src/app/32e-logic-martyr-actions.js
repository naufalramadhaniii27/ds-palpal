import {captureNativeActorIdentity,captureNativeActorFrame} from './lib/native-actor-frame.js';
import {renderAll,syncHP,hdHeal,used,refreshEntry} from "./00a-reg-late-ports.js";/* Responsibility: one-tap use of Martyr (VSS24), Shifter and Bloodlust features on the sheet. Each button rolls the dice, spends the uses and Hit Point Dice, and changes Hit Points. Hit Point Dice are one pool: the Short Rest dialog and these buttons spend the same dice. */
import {C,S,save} from "./04-logic-storage.js";
import {esc,num,ask} from "./05-logic-helpers.js";
import {B,D} from "./06-logic-derivation.js";
import {toastU,undoMark} from "./32-logic-play-undo-actions.js";
import {hasFeat} from "./32b-logic-play-concentration-casting.js";
import {env} from "./00-env.js";

function rk(k){ return (D.res||[]).filter((r) =>{ return r.k===k; })[0]||null; }
function left(k){ const r=rk(k); return r?r.max-used(r.k,r.max):0; }
function spend(k,n){ S.used[k]=num(S.used[k],0)+(n||1); }
function hdKey(){ const r=(D.res||[]).filter((q) =>{ return q.k==="hd"||/^hd-d/.test(q.k); })[0]; return r?r.k:"hd"; }
function hdDie(){ const r=rk(hdKey()); return num(r&&r.die,num(C.hitDie,10)); }
/* dice: numbers typed by the player first, then the app dice (3D roller), then a plain random roll. QUEUE holds the faces for one action */
let QUEUE={};
function roll(d){ const q=QUEUE[d]; if(q&&q.length) return q.shift(); return 1+Math.floor(Math.random()*d); }
function faces(txt,n,die){ const a=String(txt||"").match(/\d+/g); if(!a) return null; let v=a.map(Number).filter((x) =>{ return x>=1; }); if(!v.length) return null;
  if(v.length===1&&n>1){ const t=Math.max(n,Math.min(n*die,v[0])), base=Math.floor(t/n), o=[]; for(let i=0;i<n;i++) o.push(base+(i<t-base*n?1:0)); return o; }/* one total: split over the dice */
  return v.slice(0,n).map((x) =>{ return Math.min(die,x); }).concat([]).length===n?v.slice(0,n).map((x) =>{ return Math.min(die,x); }):null; }
function gather(specs,cb,guard){if(guard&&!guard())return; QUEUE={}; const todo=specs.filter((q) =>{ return q.n>0; }); let i=0;
  const next=function(){if(guard&&!guard())return; if(i>=todo.length){ cb(); return; } const q=todo[i++], inp=document.querySelector('[data-mrin="'+q.k+'"]'), man=inp?faces(inp.value,q.n,q.die):null;
    if(inp&&inp.value.trim()&&!man){ toastU("Type "+q.n+" number"+(q.n>1?"s":"")+" from 1 to "+q.die+" for "+q.lab+", or one total."); QUEUE={}; return; }
    const put=function(v){if(guard&&!guard())return; QUEUE[q.die]=(QUEUE[q.die]||[]).concat(v); next(); };
    if(man){ put(man); return; }
    if(env.__miRoll&&env.__miRoll.roll){ try{ env.__miRoll.roll({dmg:q.n+"d"+q.die},"",q.lab,(r) =>{ const m=/\[([^\]]*)\]/.exec(r&&r.d||""); put(m?m[1].split(/,\s*/).map(Number):[]); },guard); return; }catch(er){} }
    put([]); };
  next(); }
function martyrLv(){ return C.cls==="Martyr"?num(C.level,1):0; }
function chosen(n){ return (C.features||[]).some((g) =>{ return (g.items||[]).some((i) =>{ return i.n==="Chosen: "+n; }); }); }
export function shiftAc(){ return S.shift&&chosen("Beasthide")?1:0; }
function done(msg,guard){if(guard&&!guard())return;save();if(guard&&!guard())return;try{renderAll()}catch(error){}if(guard&&!guard())return;try{syncHP()}catch(error){}if(!guard||guard())toastU(msg)}
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
  undying:function(value,guard){if(guard&&!guard())return; if(left("x-undying")<1){ toastU("Undying is used. A Long Rest restores it."); return; } undoMark("Undying");if(guard&&!guard())return;const owner=guard?captureNativeActorIdentity():null; spend("x-undying",1); S.hp=Math.max(1,num(S.hp,0)); S.ds=[0,0];
    const m=mirac(Math.floor(martyrLv()/2),true);if(owner&&!owner())return;done("Undying: you drop to 1 Hit Point instead. "+(m||"No Hit Point Dice left to heal."),guard?captureNativeActorFrame({allowCharacterClone:true}):undefined); },
  respite:function(){ if(left("x-divine-respite")<1){ toastU("Divine Respite is used. A Long Rest restores it."); return; } const L=martyrLv(), n=L>=17?10:L>=13?6:3, k=hdKey(), u=num(S.used[k],0), g=Math.min(n,u);
    undoMark("Divine Respite"); S.used[k]=u-g; spend("x-divine-respite",1); done("Divine Respite: regained "+g+" Hit Point "+(g===1?"Die":"Dice")+"."); },
  reprisal:function(){ const L=S.lastDmg; if(!L||!L.a){ toastU("Take the damage on the sheet first, then use Reprisal."); return; } const half=Math.floor(L.a/2), lv=martyrLv(), dn=lv>=17?4:lv>=11?3:lv>=5?2:1; let r=0; for(let i=0;i<dn;i++) r+=roll(6);
    undoMark("Reprisal"); const back=Math.min(half,num(L.hp,0)); S.hp=Math.min(D.hpmax,num(S.hp,0)+back); if(half>back) S.tmp=num(S.tmp,0)+(half-back); S.lastDmg=null;
    done("Reprisal: the "+L.a+" damage is halved, you get "+half+" back. The attacker takes "+r+" Necrotic or Radiant ("+dn+"d6)."); }
};
/* buttons under a feature card */
function rin(k,lab,ph){ return '<label class="mact-f"><span>'+esc(lab)+'</span><input type="text" inputmode="numeric" autocomplete="off" data-mrin="'+k+'" placeholder="'+esc(ph)+'"></label>'; }
function stat(lab,v,sub){ return '<div class="mact-s"><small>'+esc(lab)+'</small><b>'+v+'</b>'+(sub?'<i>'+esc(sub)+'</i>':'')+'</div>'; }
function box(title,stats,fields,btns,grid){ return '<div class="mact"><div class="mact-h">'+esc(title)+'</div>'+(stats?'<div class="mact-ss">'+stats+'</div>':'')
  +(fields?'<div class="mact-fs">'+fields+'</div><p class="mact-n">Type what you rolled, or leave empty and tap a button to roll the app dice.</p>':'')
  +'<div class="mact-b'+(grid?' g'+grid:'')+'">'+btns+'</div></div>'; }
function b(a,v,t,s,off,pri){ return '<button type="button" class="btn press'+(pri?' pri':'')+(off?' off':'')+'" data-mact="'+a+'" data-mv="'+(v||"")+'"'+(off?' disabled':'')+'><span>'+t+'</span>'+(s?'<small>'+s+'</small>':'')+'</button>'; }
/* buttons under a feature card */
export function martyrActH(f){ const n=f&&f.n, hl=left(hdKey()), hr=rk(hdKey()), hm=hr?hr.max:0, hd=hdDie(), cm=num(D.mod.CON,0), cs=(cm>=0?"+":"\u2212")+Math.abs(cm), dbl=hdHeal(5)>Math.max(1,5+cm), bal=hasFeat("Balm");
  const per=dbl?"(1d"+hd+" "+cs+") \u00d7 2":"1d"+hd+" "+cs, hdS=stat("Hit Point Dice",hl+" / "+hm,"shared with Short Rest");
  if(n==="Miraculous Healing"&&martyrLv()){ const mx=Math.floor(martyrLv()/2); let bt=""; for(let i=1;i<=mx;i++) bt+=b("mh",i,String(i),i===1?"die":"dice",i>hl,i===Math.min(mx,hl));
    return box("Spend Hit Point Dice",hdS+stat("Each die heals",per,B["heal-hd"]?B["heal-hd"].total:""),rin("mh","Hit Point Dice (d"+hd+")","7 3 12")+(bal?rin("balm","Balm (d8)","5 2 8"):""),bt,mx); }
  if(n==="Bloodlust") return box("Sanguine Feast",stat("Uses left",String(left("x-sanguine-feast")))+hdS,rin("feast","Hit Point Die (d"+hd+")","9"),b("feast","","Heal with 1 Hit Point Die",per,left("x-sanguine-feast")<1||hl<1,true));
  if(n==="Shifting"){ const bh=chosen("Beasthide"), pb=num(D.pb,2);
    return box(S.shift?"Shifted":"Shift",stat("Uses left",String(left("x-shifting")))+stat("Temporary HP",(2*pb)+(bh?" + 1d6":""),bh?"+1 AC while shifted":""),!S.shift&&bh?rin("shift","Beasthide (d6)","4"):"",S.shift?b("unshift","","End Shifting"):b("shift","","Shift now","",left("x-shifting")<1,true)); }
  return martyrAdditionalActH(n,hl,hd,bal,hdS); }
function martyrAdditionalActH(n,hl,hd,bal,hdS){
  if(n==="Sacrifice") return box("Pay with your blood","","",b("strike","","Sacrificial Strike","you take 5, target +10")+b("skill","","Sacrificial Skill","you take 10, roll +5"),2);
  if(n==="Undying") return box("Undying",stat("Uses left",String(left("x-undying")))+hdS,rin("und","Hit Point Dice (d"+hd+")","7 3 12 5 9")+(bal?rin("undb","Balm (d8)","5 2 8 1 6"):""),b("undying","","Use Undying","1 HP, then heal "+Math.min(Math.floor(martyrLv()/2),hl)+" dice",left("x-undying")<1,true));
  if(n==="Divine Respite"){ const L=martyrLv(), g=L>=17?10:L>=13?6:3; return box("Divine Respite",stat("Uses left",String(left("x-divine-respite")))+hdS,"",b("respite","","Regain "+g+" Hit Point Dice","after a Short Rest",left("x-divine-respite")<1,true)); }
  if(n==="Reprisal"&&martyrLv()){ const L=S.lastDmg, lv=martyrLv(), dn=lv>=17?4:lv>=11?3:lv>=5?2:1; return box("Reprisal",stat("Last damage",L&&L.a?String(L.a):"\u2014",L&&L.a?"you get "+Math.floor(L.a/2)+" back":"take damage first")+stat("Attacker takes",dn+"d6"),rin("rep","Reprisal ("+dn+"d6)","3 5"),b("reprisal","","Halve the last damage","",!(L&&L.a),true)); }
  return ""; }
/* the dice each action needs, so they can be typed or rolled before it runs */
function need(a,v){ const n=+v||1, lv=martyrLv(), mx=Math.floor(lv/2), hl=left(hdKey()), hd=hdDie(), bal=hasFeat("Balm");
  if(a==="mh"){ const k=Math.min(n,mx,hl); return [{k:"mh",n:k,die:hd,lab:"Hit Point Dice"},{k:"balm",n:bal?k:0,die:8,lab:"Balm"}]; }
  if(a==="undying"){ const k=Math.min(mx,hl); return [{k:"und",n:k,die:hd,lab:"Hit Point Dice"},{k:"undb",n:bal?k:0,die:8,lab:"Balm"}]; }
  if(a==="feast") return [{k:"feast",n:1,die:hd,lab:"Hit Point Die"}];
  if(a==="shift") return [{k:"shift",n:chosen("Beasthide")?1:0,die:6,lab:"Beasthide"}];
  if(a==="reprisal") return [{k:"rep",n:lv>=17?4:lv>=11?3:lv>=5?2:1,die:6,lab:"Reprisal"}];
  return []; }
function run(a,v,guard){const f=ACT[a];if(!f||guard&&!guard())return;gather(need(a,v),()=>{if(guard&&!guard())return;const owner=guard?captureNativeActorIdentity():null;f(v,guard);if(owner&&!owner())return;QUEUE={};document.querySelectorAll("[data-mrin]").forEach(input=>{input.value=""});try{refreshEntry()}catch(error){}},guard)}
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("[data-mact]"); if(!t||t.disabled) return; e.preventDefault(); e.stopPropagation(); run(t.getAttribute("data-mact"),t.getAttribute("data-mv")); },true);
/* at 0 Hit Points with Undying left: offer it at once */
export function martyrZero(guard){if(guard&&!guard())return; if(num(S.hp,0)!==0||left("x-undying")<1||!martyrLv()) return; ask("You dropped to 0 Hit Points. Use Undying: drop to 1 Hit Point and heal with Miraculous Healing?","Use Undying",() =>{if(!guard||guard())run("undying","",guard); }); }
env.__martyr={act:function(a,v){ run(a,v); }, html:martyrActH};/* test hook */
