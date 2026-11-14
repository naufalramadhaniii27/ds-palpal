import {bindLive,cmbCast,cmbRe,lateGet,featAll,syncLU,used,renderConds,refreshEntry,showEntry,spPactLv,spRowLv,renderSpells,syncHP,renderAll} from "./00a-reg-late-ports.js";/* Responsibility: class levels, concentration and casting a spell (slots, upcast, quick cast). Split out of the former single file 32 in SOLID stage 9 (S); runs in the same order as before. */
import {C,S,save} from "./04-logic-storage.js";import {ask,esc,num,sg,toast} from "./05-logic-helpers.js";import {D} from "./06-logic-derivation.js";import {UNDO,toastU,undoMark} from "./32-logic-play-undo-actions.js";import {modeOn} from "./33-logic-play-rage-conditions.js";
bindLive("clsLvls",{get:function(){return clsLvls;}});
bindLive("concAuto",{get:function(){return concAuto;}});
bindLive("concCheck",{get:function(){return concCheck;}});
bindLive("concChip",{get:function(){return concChip;}});
bindLive("concEnd",{get:function(){return concEnd;}});
bindLive("concHead",{get:function(){return concHead;}});
bindLive("concOf",{get:function(){return concOf;}});
bindLive("hasFeat",{get:function(){return hasFeat;}});
bindLive("spCastH",{get:function(){return spCastH;}});
bindLive("spIx",{get:function(){return spIx;}});
export function clsLvls(){ let o={}, t=String(C.clsLabel||""), m, re=/([A-Z][A-Za-z']+(?: [A-Z][A-Za-z']+)*) (\d+)/g; while((m=re.exec(t))) o[m[1]]=+m[2]; if(!Object.keys(o).length&&C.cls) o[C.cls]=D.level; return o; }
/* a reskin class counts under the class it copies (C.clsInh), so Rage, Aura and weapon mastery hooks keyed by the parent name also work for it */
export function lvOf(c){ const o=clsLvls(), ih=C.clsInh||{}; let t=o[c]||0; Object.keys(o).forEach((k) =>{ if(k!==c&&ih[k]===c) t+=o[k]; }); return t; }
export function hasFeat(n){ return featAll().some((x) =>{ return x.f.n===n; }); }

/* ---------- RU50 Concentration ---------- */
export var INCAP=["Incapacitated","Paralyzed","Petrified","Stunned","Unconscious"];
export function concOf(){ return S.conc&&S.conc.n?S.conc:null; }
function concSet(x,lv){ const o=concOf(), m=(o&&o.n!==x.n)?"Concentration on "+o.n+" ended. ":""; S.conc={n:x.n,l:lv||x.l||0}; return m+"Concentrating on "+x.n+"."; }
export function concEnd(why){ const o=concOf(); if(!o) return ""; delete S.conc; if(o.n==="Shield of Faith") setTimeout(() =>{ try{ renderAll(); }catch(er){} },0); return "Concentration on "+o.n+" ended"+(why?" ("+why+")":"")+"."; }
function concNotes(){ const n=[]; if(hasFeat("War Caster")) n.push("War Caster gives Advantage"); if(hasFeat("Eldritch Mind")) n.push("Eldritch Mind gives Advantage"); if(hasFeat("Bladesong")) n.push("while Bladesong is active, add your Intelligence modifier"); return n; }
function concDC(d){ return Math.min(30,Math.max(10,Math.floor(d/2))); }
function concCheck(d){ const o=concOf(); if(!o||!(d>0)) return; const dc=concDC(d), nt=concNotes();
  ask("Concentration on "+o.n+": make a Constitution saving throw, DC "+dc+" (10 or half the damage, whichever is higher, up to 30). Your bonus is "+sg(D.save.CON)+"."+(nt.length?" "+nt.join(". ")+".":""),"Kept It",() =>{ toastU("Still concentrating on "+o.n+"."); },
   ["Lost It",function(){ const m=concEnd(); save(); renderConds(); refreshEntry(); if(UNDO) UNDO.A=null; toastU(m); }]); }/* v21 N2: Undo stays, and also brings Concentration back */
/* a condition that includes Incapacitated, or 0 Hit Points, ends Concentration */
function concAuto(){ const o=concOf(); if(!o) return; const why=S.hp===0?"0 Hit Points":INCAP.filter((k) =>{ return S.cond[k]; })[0]; if(!why) return; const m=concEnd(why); save(); toast(m); }
function spIx(n){ return (C.spells||[]).findIndex((x) =>{ return x.n===n; }); }
export function concChip(){ const o=concOf(); if(!o) return ""; const i=spIx(o.n);
  return '<button type="button" class="chip on conc press"'+(i>=0?' data-info="sp:'+i+'"':'')+'>Concentrating: '+esc(o.n)+'</button><button type="button" class="chip conc-x press" data-concend="1" aria-label="End Concentration on '+esc(o.n)+'">✕</button>'; }
/* header: a line under the name (phone: .mini, computer: .office) */
function concHead(){ const o=concOf(); [".band .mini",".band .office > div"].forEach((sel,j) =>{ const m=document.querySelector(sel); if(!m) return; let b=m.querySelector(".conch");
  if(!o){ if(b) b.remove(); return; } if(!b){ b=document.createElement("button"); b.type="button"; b.className="conch press"; if(!j) b.id="concH"; m.appendChild(b); }
  const i=spIx(o.n); if(i>=0) b.setAttribute("data-info","sp:"+i); else b.removeAttribute("data-info"); b.innerHTML='<i aria-hidden="true">C</i>'+esc(o.n); b.setAttribute("aria-label","Concentrating on "+o.n+". Open the spell"); b.title="Concentrating on "+o.n; }); }
document.addEventListener("click",(e) =>{ const t=e.target.closest&&e.target.closest("[data-concend],[data-concon]"); if(!t) return; e.preventDefault(); e.stopPropagation();
  if(t.hasAttribute("data-concend")){ const m=concEnd(); save(); renderConds(); refreshEntry(); if(m) toast(m); return; }
  const x=(C.spells||[])[+t.getAttribute("data-concon")]; if(!x) return; const m2=concSet(x,lateGet("spLvSel")[x.n]!=null?lateGet("spLvSel")[x.n]:spRowLv(x)); save(); renderConds(); refreshEntry(); toast(m2); },true);

/* ---------- RU49 Cast and Use ---------- */
export function slotLeft(k){ const r=(D.res||[]).filter((q) =>{ return q.k===k; })[0]; return r?{r:r,left:r.max-used(r.k,r.max)}:null; }
function reWord(n){ return new RegExp("(^|[^A-Za-z])"+String(n).replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"([^A-Za-z]|$)"); }
/* Limited Use rows that pay for a free cast of x (species, feat, or feature rows: same source, or the spell named in the row) */
function spUses(x){ if(!x.l) return [];
 const _spUsesStep1=spUsesStep1(x);
 const {ex}=_spUsesStep1;
 let {rows}=_spUsesStep1; if(ex.length) return ex;
  rows=rows.filter((r) =>{ return !(C.spells||[]).some((s) =>{ return s.n!==x.n&&reWord(s.n).test(r.n); }); });/* v21 N1: a row named after another spell is not this one */
  const lr=rows.filter((r) =>{ return /level (\d+) spell/.test(r.n); }); if(!lr.length) return rows; const want=x.gain||x.l, m=lr.filter((r) =>{ return +(/level (\d+) spell/.exec(r.n)[1])===want; });
  return m.length?m.concat(rows.filter((r) =>{ return !/level (\d+) spell/.test(r.n); })):rows; }
function spUsesStep1(x){
const src=String(x.src||""), rw=reWord(x.n);
  let rows=(D.res||[]).filter((r) =>{ if(/^s\d$|^pact$|^hd/.test(r.k)||r.item) return false; const f=r.f||"", own=r.own||"";
    const same=!!src&&((f&&(f===src||src.indexOf(f)===0||f.indexOf(src)===0))||(own&&src.indexOf(own)===0));
    return rw.test(r.n)||(same&&(f===src||/\bspell\b|Arcanum/i.test(r.n))); });
  /* v21 M1: a row naming the spell wins. Otherwise a "level N spell" row: N is the character level the species spell came at, or the spell level for a feat */
  const ex=rows.filter((r) =>{ return rw.test(r.n); });
  return /** @type {any} */ ({rows, ex});
}
export function spAtWill(x){ return !x.l||/At will/i.test(x.use||""); }
function spItemOpts(x){ const c=x.itc, r=(D.res||[]).filter((q) =>{ return q.item&&q.f===c.it; })[0], o=[]; if(!r) return o; const left=r.max-used(r.k,r.max), lv0=c.lv;
  if(Array.isArray(c.c)){ for(let n=c.c[0];n<=c.c[1];n++){ const L=lv0+n-c.c[0]; o.push({k:r.k,lv:L,lab:c.it+", "+n+" charge"+(n>1?"s":"")+" (level "+L+")",left:left,free:1,need:n}); } }
  else o.push({k:r.k,lv:lv0,lab:c.it+", "+c.c+" charge"+(c.c===1?"":"s"),left:left,free:1,need:c.c});
  return o; }
export function qOk(q){ return q.left>=(q.need||1); }
export function ckOf(q){ return q.k+(q.need>1?"|"+q.need:""); }
/* Martyr (VSS24) Hit Point Spellcasting: a level 1+ Martyr spell costs one Spell Use plus Radiant damage by the slot level built
   (5, 10, 20, 30, 40). Merciful Healing (Burden of Mercy) makes its own spells free of the damage. The highest level is Max Spell Levels */
const MARTYR_HP=[0,5,10,20,30,40];
function martyrFeat(n){ return (C.features||[]).some((g) =>{ return (g.items||[]).some((i) =>{ return i.n===n; }); }); }
export function martyrMax(){ let m=0; (C.features||[]).forEach((g) =>{ (g.items||[]).forEach((i) =>{ if(i.n==="Max Spell Levels"){ const r=/:\s*(\d)/.exec(i.d||""); if(r) m=+r[1]; } }); }); return m; }
export function martyrCost(x,lv){ if(/Burden of Mercy/.test(String(x.src||""))&&martyrFeat("Merciful Healing")) return 0; return MARTYR_HP[lv]||0; }
function martyrOpts(x){ const o=[]; if(C.cls!=="Martyr"||!x.l||x.itc) return o; if(!/^(Martyr|Burden of)/.test(String(x.src||""))) return o;
  const r=slotLeft("r-spell-uses"), mx=martyrMax(); if(!r||!mx) return o;
  for(let L=x.l;L<=mx;L++){ const hp=martyrCost(x,L); o.push({k:"r-spell-uses",lv:L,lab:"Spell Use, level "+L+(hp?" ("+hp+" Radiant to you)":" (no damage, Merciful Healing)"),left:r.left,free:1}); }
  return o; }
export function spCastOpts(x){ const o=[], sc=C.spellcasting||{}; if(spAtWill(x)) return o; if(x.itc) return spItemOpts(x);
  const mo=martyrOpts(x); if(mo.length) return mo;
  for(let L=x.l;L<=9;L++){ const s=slotLeft("s"+L); if(s) o.push({k:"s"+L,lv:L,lab:"level "+L+" slot",left:s.left}); }
  const p=slotLeft("pact"); if(p&&sc.pact&&spPactLv()>=x.l) o.push({k:"pact",lv:spPactLv(),lab:"Pact slot (level "+spPactLv()+")",left:p.left});
  spUses(x).forEach((r) =>{ o.push({k:r.k,lv:x.l,lab:r.n,left:r.max-used(r.k,r.max),free:1}); });
  return o; }
const spStepSel={};
function spStepIx(i,sl){ let v=spStepSel[i]; if(v==null||v<0||v>=sl.length){ v=0; for(let k=0;k<sl.length;k++){ if(sl[k].left>0){ v=k; break; } } spStepSel[i]=v; } return v; }
function spCastH(x,i){ let h='<div class="info-h">Cast</div><div class="spcast">', o=spCastOpts(x);
  if(spAtWill(x)) h+='<button type="button" class="btn pri press" data-cast="'+i+'" data-ck="">Cast <small>'+(x.l?'at will':'cantrip, no slot')+'</small></button>';
  else { const qb=function(q){ return '<button type="button" class="btn press'+(qOk(q)?'':' off')+'" data-cast="'+i+'" data-ck="'+esc(ckOf(q))+'" data-cl="'+q.lv+'"'+(qOk(q)?'':' disabled')+'>'+esc(q.free?"Use "+q.lab:"Cast with a "+q.lab)+' <small>'+q.left+' left</small></button>'; };
    /* v49: with two or more slot levels, one stepper picks the level and one Cast button casts */
    const sl=o.filter((q) =>{ return !q.free; }), fr=o.filter((q) =>{ return q.free; });
    if(sl.length>=2){ const si=spStepIx(i,sl), sq=sl[si];
      h+='<div class="spstep"><button type="button" class="spstep-b press" data-sstep="'+i+'|-1" aria-label="Lower slot level"'+(si<=0?' disabled':'')+'>\u2212</button><div class="spstep-v"><small>Slot</small><b>'+esc(sq.lab)+'</b><i>'+sq.left+' left</i></div><button type="button" class="spstep-b press" data-sstep="'+i+'|1" aria-label="Higher slot level"'+(si>=sl.length-1?' disabled':'')+'>+</button></div>'+qb(sq).replace('btn press','btn pri press'); fr.forEach((q) =>{ h+=qb(q); }); }
    else o.forEach((q) =>{ h+=qb(q); });
    if(!o.length) h+='<p class="muted">No spell slots or uses for this spell yet.</p>'; else if(!o.some(qOk)) h+='<p class="muted">Nothing left to cast it with. A rest restores slots and uses.</p>'; }
  if(x.rit&&x.l) h+='<button type="button" class="btn press" data-cast="'+i+'" data-ck="rit">Cast as a Ritual <small>no slot, 10 minutes longer</small></button>';
  if(x.conc){ const c=concOf(); h+=(c&&c.n===x.n)?'<button type="button" class="btn press" data-concend="1">End Concentration</button>':'<button type="button" class="btn press" data-concon="'+i+'">Concentrate on this spell</button>'; }
  return h+'</div>'+(x.conc?'<p class="muted spcn">Concentration spell. Casting it ends any other spell you concentrate on.</p>':''); }
/* Martyr Hit Point casting: the Radiant cost by slot level, after the Spell Use */
function castMartyrHp(x,k,lv){ let m=""; if(k==="r-spell-uses"&&C.cls==="Martyr"){ const hp=martyrCost(x,+lv||x.l); if(hp){ S.hp=Math.max(0,num(S.hp,0)-hp); m+=", level "+(+lv||x.l)+", you take "+hp+" Radiant (not from Temporary Hit Points)"; try{ syncHP(); }catch(er){} } else m+=", level "+(+lv||x.l)+", no damage"; lateGet("spLvSel")[x.n]=+lv||x.l; } return m; }
/* Magic Weapon: the first melee weapon gets the bonus until a rest (S.mw) */
function castMagicWeapon(x,lv){ let m=""; if(x.n==="Magic Weapon"){ const w=(C.attacks||[]).filter((a) =>{ return a.n!=="Unarmed Strike"&&!/^Cantrip/.test(a.sub||"")&&/^\d+ ft$|^5 ft/.test(a.range||"5 ft"); })[0]||(C.attacks||[]).filter((a) =>{ return a.n!=="Unarmed Strike"; })[0]; if(w){ S.mw={w:w.n,l:+lv||x.l}; m+=". "+w.n+" gets +"+((+lv||x.l)>=6?3:(+lv||x.l)>=4?2:1)+" to attack and damage until you rest"; } } return m; }
function castRefresh(x,k){ if(x.n==="Magic Weapon"||x.conc||k==="r-spell-uses"){ try{ renderAll(); }catch(er){} } }
export function castDo(i,k,lv,ok){ const x=(C.spells||[])[i]; if(!x) return; let s=null, nd=1; if(k&&k.indexOf("|")>0){ const kp=k.split("|"); k=kp[0]; nd=+kp[1]||1; }
  if(!ok&&modeOn("rage")){ ask("You are raging, and Rage stops you from casting spells. Cast "+x.n+" anyway?","Cast",() =>{ castDo(i,k,lv,true); }); return; }/* v22 i4 */
  if(k&&k!=="rit"){ s=slotLeft(k); if(!s||s.left<nd){ toast("Nothing left to cast "+x.n+" with. A rest restores slots and uses."); return; } }
  undoMark("Cast "+x.n); let msg="Cast "+x.n;
  if(s){ S.used[k]=num(S.used[k],0)+nd; if(k==="pact"){ msg+=" with a Pact slot"; lateGet("spLvSel")[x.n]=+lv; } else if(/^s\d$/.test(k)){ msg+=" with a level "+k.slice(1)+" slot"; lateGet("spLvSel")[x.n]=+lv; } else { msg+=" ("+s.r.n+(nd>1?", "+nd+" charges":"")+")"; if(x.itc) lateGet("spLvSel")[x.n]=+lv; } }
  else if(k==="rit") msg+=" as a Ritual";
  msg+=castMartyrHp(x,k,lv)+castMagicWeapon(x,lv);
  msg+="."; if(x.conc) msg+=" "+concSet(x,+lv||x.l);
  save(); castRefresh(x,k); syncLU(); renderSpells(); renderConds(); refreshEntry(); toastU(msg); try{ cmbCast(x.n); save(); cmbRe(); }catch(er){} }
/* the CAST or USE badge in the Spells list: one way to cast it, cast now. Several (slot levels, Pact, free use): open the spell to choose */
export function quickCast(i){ const x=(C.spells||[])[i]; if(!x) return; if(spAtWill(x)){ castDo(i,"",0); return; }
  const o=spCastOpts(x), av=o.filter(qOk);
  if(av.length===1&&!x.rit){ castDo(i,ckOf(av[0]),av[0].lv); return; }
  if(!av.length&&!x.rit){ toast("Nothing left to cast "+x.n+" with. A rest restores slots and uses."); return; }
  showEntry({type:"info",spec:"sp:"+i},false); }
document.addEventListener("click",(e) =>{ const st=e.target.closest&&e.target.closest("[data-sstep]"); if(st&&!st.disabled){ e.preventDefault(); e.stopPropagation(); const pp=st.getAttribute("data-sstep").split("|"), ii=+pp[0]; spStepSel[ii]=(spStepSel[ii]||0)+(+pp[1]); showEntry({type:"info",spec:"sp:"+ii},false); return; }
  const q=e.target.closest&&e.target.closest("[data-qcast]"); if(q){ e.preventDefault(); e.stopPropagation(); quickCast(+q.getAttribute("data-qcast")); return; }
  const b=e.target.closest&&e.target.closest("[data-cast]"); if(!b||b.disabled) return; e.preventDefault(); e.stopPropagation(); castDo(+b.getAttribute("data-cast"),b.getAttribute("data-ck")||"",+b.getAttribute("data-cl")||0); },true);
