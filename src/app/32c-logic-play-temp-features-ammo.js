import {bindLive,lateGet,renderAll,flash,syncHP,refreshEntry,ico,invKey,occOf,scOf} from "./00a-reg-late-ports.js";/* Responsibility: temporary features and spells, potions and charges use, ammunition. Split out of the former single file 32 in SOLID stage 9 (S); runs in the same order as before. */
import {ABN} from "./02-data-default-character.js";import {C,S,save,saveC} from "./04-logic-storage.js";import {$,ask,bldGuard,bldSync,clamp,esc,invAt,num,sg,toast,viaBld,hpWord} from "./05-logic-helpers.js";import {D} from "./06-logic-derivation.js";import {env} from "./00-env.js";import {UNDO,toastU,undoMark} from "./32-logic-play-undo-actions.js";import {clsLvls,hasFeat} from "./32b-logic-play-concentration-casting.js";
bindLive("ammoBonus",{get:function(){return ammoBonus;}});
bindLive("ammoFor",{get:function(){return ammoFor;}});
bindLive("ammoH",{get:function(){return ammoH;}});
bindLive("ammoPickH",{get:function(){return ammoPickH;}});
bindLive("qtyAdj",{get:function(){return qtyAdj;}});
bindLive("tmpFeatH",{get:function(){return tmpFeatH;}});
bindLive("tmpSpellH",{get:function(){return tmpSpellH;}});
bindLive("useH",{get:function(){return useH;}});
export function tmpFeat(n,d){ const cl=clsLvls();
  if(n==="Dark One's Blessing") return {v:Math.max(1,D.mod.CHA+(cl.Warlock||0)),s:"Charisma modifier plus Warlock level, when you or someone within 10 feet drops an enemy to 0 Hit Points"};
  if(n==="Inspiring Leader"){ const ab=/\bWIS \+1/.test(d||"")?"WIS":/\bCHA \+1/.test(d||"")?"CHA":(D.mod.WIS>D.mod.CHA?"WIS":"CHA"); return {v:Math.max(0,D.level+D.mod[ab]),s:"character level plus "+ABN[ab]+" modifier, after a Short or Long Rest"}; }
  if(n==="Chef") return {v:D.pb,s:"Proficiency Bonus, when you eat a Bolstering Treat (Bonus Action)"};
  if(n==="Wild Shape"&&cl.Druid) return hasFeat("Circle Forms")?{v:3*cl.Druid,s:"three times your Druid level (Circle Forms), when you assume a Wild Shape form"}:{v:cl.Druid,s:"your Druid level, when you assume a Wild Shape form"};
  if(n==="Circle Forms"&&cl.Druid) return {v:3*cl.Druid,s:"three times your Druid level, when you assume a Wild Shape form"};
  if(n==="Fiendish Vigor") return {v:12,s:"False Life with the highest roll (2d4 + 4)"};
  return null; }
function tmpBtn(v,src){ return '<button type="button" class="btn pri press" data-tmpapply="'+v+'" data-tmpsrc="'+esc(src)+'">Apply '+v+' Temp HP</button>'; }
function tmpFeatH(f){ const t=tmpFeat(f.n,f.d); if(!t) return ""; return '<div class="info-h">Temporary Hit Points</div><p class="info-d"><b>'+t.v+'</b>: '+esc(t.s)+'. They do not add to Temporary Hit Points you already have. You keep the higher number.</p><div class="spcast">'+tmpBtn(t.v,f.n)+'</div>'; }
function tmpSpellH(x,lv){ const L=Math.max(x.l||1,lv||x.l||1);
  if(x.n==="Armor of Agathys"){ const v=5*L; return '<div class="info-h">Temporary Hit Points</div><p class="info-d"><b>'+v+'</b> at level '+L+' (5 per slot level).</p><div class="spcast">'+tmpBtn(v,x.n)+'</div>'; }
  if(x.n==="False Life"){ const add=4+5*(L-1); return '<div class="info-h">Temporary Hit Points</div><p class="info-d">2d4 + '+add+' at level '+L+'. Roll 2d4 and type the dice total.</p><div class="iuse"><input type="number" min="2" max="8" inputmode="numeric" data-tmpdice="'+add+'" placeholder="2d4" aria-label="2d4 total"><button type="button" class="btn pri press" data-tmproll="'+add+'" data-tmpsrc="'+esc(x.n)+'">Apply</button></div>'; }
  if(x.n==="Heroism"){ const m=Math.max(0,scOf(x).mod||0); return '<div class="info-h">Temporary Hit Points</div><p class="info-d">The target gains <b>'+m+'</b> (your spellcasting modifier) at the start of each of its turns.</p><div class="spcast">'+tmpBtn(m,x.n)+'</div>'; }
  return ""; }
export function tmpApply(v,src,join){ v=Math.max(0,Math.round(v)); if(!v){ toast("No Temporary Hit Points to apply."); return; }
  const go=function(){ if(join&&UNDO) UNDO.A=null; else undoMark("Temporary Hit Points"); S.tmp=v; save(); syncHP(); refreshEntry(); toastU("Temporary Hit Points: "+v+" ("+src+")."); };
  if(S.tmp>0){ ask("You have "+S.tmp+" Temporary Hit Points. They do not stack with the "+v+" from "+src+". Keep the ones you have, or take the new ones?","Take "+v,go,["Keep "+S.tmp,function(){}]); return; }/* v21 i1, i4 */
  go(); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-tmpapply],[data-tmproll]"); if(!b) return; e.preventDefault(); e.stopPropagation();
  if(b.hasAttribute("data-tmpapply")){ tmpApply(+b.getAttribute("data-tmpapply"),b.getAttribute("data-tmpsrc")); return; }
  const inp=b.parentNode.querySelector("[data-tmpdice]"), d=Math.floor(num(inp&&inp.value,0)); if(d<2||d>8){ toast("Type the 2d4 total, 2 to 8."); if(inp) inp.focus(); return; } tmpApply(d+(+b.getAttribute("data-tmproll")),b.getAttribute("data-tmpsrc")); },true);

/* ---------- RU51 consumables: potions, scrolls, ammunition ---------- */
const POT={"":"2d4 + 2",Greater:"4d4 + 4",Superior:"8d4 + 8",Supreme:"10d4 + 20"};
function useH(it,ix){ const n=it.n, pm=/^Potion of Healing(?: \((Greater|Superior|Supreme)\))?$/.exec(n), q=num(it.q,1);
  if(pm) return '<div class="info-h">Drink</div><p class="info-d">You regain '+POT[pm[1]||""]+' Hit Points. Roll the dice and type the total.</p>'+(q>0?'<div class="iuse"><input type="number" min="1" inputmode="numeric" data-potv="'+ix+'" placeholder="total" aria-label="Hit Points rolled"><button type="button" class="btn pri press" data-potgo="'+ix+'" data-potn="'+esc(it.key||it.n)+'">Drink</button></div>':'<p class="muted">None left.</p>');
  if(/^Spell Scroll\b/.test(n)) return '<div class="info-h">Use</div><p class="info-d">Reading the scroll casts its spell, and the scroll turns to dust.</p>'+(q>0?'<div class="spcast"><button type="button" class="btn pri press" data-scroll="'+ix+'" data-potn="'+esc(it.key||it.n)+'">Use Scroll</button></div>':'<p class="muted">None left.</p>');
  if(lateGet("CONS1").test(n)) return '<div class="info-h">Use</div>'+(q>0?'<p class="info-d">'+q+' left. Use 1 takes one away, Undo puts it back.</p><div class="ipk"><button type="button" class="btn pri press" data-use1="'+ix+'" data-potn="'+esc(it.key||it.n)+'">'+ico("ui-check")+'Use 1</button></div>':'<p class="muted">None left. Raise the Qty below when you get more.</p>');/* v32 RU134 */
  const a=ammoInfo(it); return a?ammoH(a):""; }
function qtyAdj(nm,ix,d,lbl,after){ const it=invAt(nm,ix); if(!it) return; const q=Math.max(0,num(it.q,1)+d);
  const go=function(){ undoMark(lbl); if(viaBld(nm)&&env.__bldSetQty) env.__bldSetQty(nm,q,occOf(invAt(nm,ix))); else { const i2=invAt(nm,ix); if(i2){ i2.q=q; bldSync(nm,{q:q,occ:occOf(i2)}); saveC(); } } if(after) after(); renderAll(); refreshEntry(); };
  if(viaBld(nm)&&env.__bldSetQty) bldGuard(go); else go(); }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-potgo],[data-scroll]"); if(!b) return; e.preventDefault(); e.stopPropagation(); const nm=b.getAttribute("data-potn");
  if(b.hasAttribute("data-scroll")){ const ix=+b.getAttribute("data-scroll"); qtyAdj(nm,ix,-1,"Use "+nm,() =>{ toastU("Used "+nm+"."); }); return; }
  const ix2=+b.getAttribute("data-potgo"), inp=$("#sheetBody [data-potv]"), v=Math.floor(num(inp&&inp.value,0)); if(v<1){ toast("Type the total you rolled."); if(inp) inp.focus(); return; }
  qtyAdj(nm,ix2,-1,"Drink "+nm,() =>{ const was0=S.hp===0, bf=S.hp; S.hp=Math.min(D.hpmax,S.hp+v); if(was0) S.ds=[0,0]; if(S.hp>bf) flash("healed"); save(); syncHP(); toastU("Drank "+nm+": "+(S.hp-bf)+" "+hpWord(S.hp-bf)+" regained."); }); },true);
/* ammunition: the count is kept in S.ammo (used pieces per item). Total = quantity x the number in the name ("Arrows (20)") */
const AMMO=[[/Crossbow/i,"Bolt"],[/Longbow|Shortbow/i,"Arrow"],[/Sling/i,"Sling Bullet"],[/Blowgun/i,"Needle"],[/Laser|Antimatter/i,"Energy Cell"],[/Musket|Pistol|Revolver|Rifle|Shotgun/i,"Firearm Bullet"]];
function ammoKind(n){ const k=AMMO.filter((a) =>{ return a[0].test(n); })[0]; return k?k[1]:null; }
/* v48: the gear names "Bullets, Firearm (10)" and "Bullets, Sling (20)" count as Firearm Bullet and Sling Bullet */
function ammoNm(n){ return String(n||"").replace(/^Bullets, (Firearm|Sling)\b/,"$1 Bullet"); }
function ammoInfo(it){ if(!it) return null; const m=/^(Arrow|Bolt|Sling Bullet|Needle|Firearm Bullet|Energy Cell)s?\b/.exec(ammoNm(it.n)); if(!m) return null; const per=+((/\((\d+)\)/.exec(it.n)||[0,1])[1]), tot=Math.max(0,num(it.q,1))*per, k=invKey(it), u=clamp(num((S.ammo||{})[k],0),0,tot); return {it:it,k:k,tot:tot,used:u,left:tot-u}; }
/* v102: magic ammunition ("Arrow, +2"). Its bonus goes to the attack roll and the damage of a weapon that uses that kind of ammunition.
   One kind in the pack: used. More than one: the player picks (S.ammoAct[kind] = item key, or "none"). Used up pieces do not count */
function ammoMagic(kd){ const re=new RegExp("^"+kd+"s?, \\+(\\d)\\b"); return (C.inv||[]).map((i) =>{ const m=re.exec(ammoNm(i.n)), inf=m?ammoInfo(i):null; return inf&&inf.left>0?{it:i,n:+m[1],k:invKey(i),left:inf.left}:null; }).filter(Boolean); }
function ammoActive(kd){ const L=ammoMagic(kd); if(!L.length) return {L:L,on:null}; const ch=(S.ammoAct||{})[kd]; if(ch==="none") return {L:L,on:null}; let pick=L.filter((x) =>{ return x.k===ch; })[0]; if(!pick&&L.length===1) pick=L[0]; return {L:L,on:pick||null}; }
function ammoBonus(a){ if(!a||!/Ammunition/.test(String(a.sub||""))) return null; const kd=ammoKind(a.n); if(!kd) return null; const r=ammoActive(kd); return r.L.length?{kd:kd,L:r.L,on:r.on}:null; }
function ammoFor(a){ if(!/Ammunition/.test(String(a.sub||""))) return null; const kd=ammoKind(a.n); if(!kd) return null; const act=ammoActive(kd).on, re=new RegExp("^"+kd+"s?\\b"), all=(C.inv||[]).filter((i) =>{ return re.test(ammoNm(i.n)); }), it=act?act.it:(all.filter((i) =>{ return !/^[A-Za-z ]+s?, \+\d/.test(ammoNm(i.n)); })[0]||all[0]); return it?ammoInfo(it):{none:kd}; }
function ammoPickH(a){ const b=ammoBonus(a); if(!b) return ""; const on=b.on&&b.on.k;
  return '<div class="info-h">Magic ammunition</div><p class="info-d">'+(b.on?'Using <b>'+esc(b.on.it.n)+'</b>: '+sg(b.on.n)+' to the attack roll and the damage roll.':'No magic ammunition selected. Pick the one you are firing.')+'</p><div class="spcast">'+b.L.map((x) =>{ return '<button type="button" class="btn press'+(x.k===on?' pri':'')+'" data-ammoact="'+esc(b.kd)+'" data-ak="'+esc(x.k)+'">'+esc(x.it.n)+' ('+x.left+')</button>'; }).join("")+'<button type="button" class="btn press'+(!on?' pri':'')+'" data-ammoact="'+esc(b.kd)+'" data-ak="none">None</button></div>'; }
function ammoH(a){ if(!a) return ""; if(a.none) return '<div class="info-h">Ammunition</div><p class="muted">No '+esc(a.none)+'s in your inventory.</p>';
  return '<div class="info-h">Ammunition: '+esc(a.it.n)+'</div><p class="info-d"><b>'+a.left+'</b> of '+a.tot+' left. After a fight you can spend 1 minute to recover half of what you used (round down).</p><div class="spcast"><button type="button" class="btn pri press" data-ammo="'+esc(a.k)+'" data-ad="1"'+(a.left?'':' disabled')+'>Use 1</button><button type="button" class="btn press" data-ammo="'+esc(a.k)+'" data-ad="-1"'+(a.used?'':' disabled')+'>Get 1 Back</button><button type="button" class="btn press" data-ammo="'+esc(a.k)+'" data-ad="half"'+(a.used>1?'':' disabled')+'>Recover Half ('+Math.floor(a.used/2)+')</button></div>'; }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-ammo]"); if(!b||b.disabled) return; e.preventDefault(); e.stopPropagation(); const k=b.getAttribute("data-ammo"), it=(C.inv||[]).filter((i) =>{ return invKey(i)===k; })[0], a=ammoInfo(it); if(!a) return;
  const d=b.getAttribute("data-ad"), nu=d==="half"?a.used-Math.floor(a.used/2):clamp(a.used+(+d),0,a.tot); undoMark(d==="1"?"Use ammunition":"Recover ammunition"); S.ammo=S.ammo||{}; S.ammo[k]=nu; if(!nu) delete S.ammo[k]; save(); refreshEntry();
  toastU(d==="1"?"Used 1 from "+it.n+". "+(a.tot-nu)+" left.":"Recovered "+(a.used-nu)+". "+(a.tot-nu)+" left."); },true);

document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-ammoact]"); if(!b) return; e.preventDefault(); e.stopPropagation(); const kd=b.getAttribute("data-ammoact"), k=b.getAttribute("data-ak"); undoMark("Choose ammunition"); S.ammoAct=S.ammoAct||{}; S.ammoAct[kd]=k; save(); renderAll(); refreshEntry(); },true);
