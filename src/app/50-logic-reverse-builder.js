import {ABN} from "./02-data-default-character.js";
import {C,__set_C} from "./04-logic-storage.js";
import {esc,sg,toast} from "./05-logic-helpers.js";
import {B,D,__set_B,__set_D,derive} from "./06-logic-derivation.js";
import {__set_navStack,navStack,openSheet} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet} from "./13-ui-detail-cards.js";
import {CU0,__set_CU0} from "./41-ui-edit-mode.js";
import {__R} from "./00-reg.js";import {env} from "./00-env.js";
Object.defineProperty(__R,"rbOpen",{get:function(){return rbOpen;},set:function(v){rbOpen=v;},configurable:true});
/* T11 G4 N1 Reverse Builder. The player writes goals ("AC at least 18, Stealth at least +7"), the app tries legal builds of the same class
   and level and lists the ones that reach every goal, with what changes against the build now.
   What it tries: every species and background of the build's rules set, the background's +2 and +1 on the abilities the goals need,
   the standard array placed in the order the goals need (then the class's main abilities), and for an Armor Class goal every armor the class
   can wear, with or without a Shield. Each try goes through the builder (window.__bldSheetFor) and the sheet derivation (derive), the same
   code as the real sheet, so a result is never a guess. The work runs in small slices (setTimeout), so the screen stays responsive.
   It runs on the main thread, not in a Web Worker: the builder and derivation code live in the page. The result goes into the builder
   only when the player taps Use this build, and the old build stays as the backup build. */
const RB={run:0};
export var RB_ARR=[15,14,13,12,10,8], RB_AB=["STR","DEX","CON","INT","WIS","CHA"];
function rbGoals(){ const g=[], q=function(s){ return document.querySelector("#sheetBody "+s); }, n=function(s){ const e=q(s); const v=e?parseInt(e.value,10):NaN; return isFinite(v)?v:null; };
  if(n("[data-rbg=ac]")!=null) g.push({k:"ac",min:n("[data-rbg=ac]"),l:"Armor Class"});
  if(n("[data-rbg=hp]")!=null) g.push({k:"hp",min:n("[data-rbg=hp]"),l:"Hit Points"});
  if(n("[data-rbg=init]")!=null) g.push({k:"init",min:n("[data-rbg=init]"),l:"Initiative"});
  const sk=q("[data-rbs=sk]"); if(sk&&sk.value&&n("[data-rbg=sk]")!=null) g.push({k:"sk",n:sk.value,min:n("[data-rbg=sk]"),l:sk.value});
  const sv=q("[data-rbs=sv]"); if(sv&&sv.value&&n("[data-rbg=sv]")!=null) g.push({k:"sv",n:sv.value,min:n("[data-rbg=sv]"),l:ABN[sv.value]+" save"});
  if(n("[data-rbg=atk]")!=null) g.push({k:"atk",min:n("[data-rbg=atk]"),l:"Best attack bonus"});
  return g; }
/* the ability each goal leans on, in order. Armor Class: Dexterity (light and medium armor), Hit Points: Constitution */
function rbOrder(goals,c){ const w={}, add=function(k,v){ w[k]=(w[k]||0)+v; };
  goals.forEach((g) =>{ if(g.k==="ac"){ add("DEX",3); } else if(g.k==="hp") add("CON",3); else if(g.k==="init") add("DEX",3);
    else if(g.k==="sk"){ const s=(c.skills||[]).filter((x) =>{ return x.n===g.n; })[0]; if(s) add(s.ab,4); } else if(g.k==="sv") add(g.n,4); else if(g.k==="atk"){ add(c.attacks&&c.attacks[0]&&c.attacks[0].ab||"STR",3); } });
  const sc=(c.abilities)||{}; RB_AB.forEach((k) =>{ const a=sc[k]; if(a) add(k,(+a.base||10)/100); });/* ties: keep the build's own order */
  return RB_AB.slice().sort((a,b) =>{ return (w[b]||0)-(w[a]||0); }); }
/* the numbers of one try, from the real derivation */
function rbEval(nb,goals,opts,bat){ let c2=null, t0=performance.now(); try{ c2=bat?bat.one(nb):env.__bldSheetFor(nb); }catch(e){ return null; } const t1=performance.now(); RB.st.bld+=t1-t0; if(!c2||!c2.abilities) return null;
  const keepC=C, keepD=D, keepB=B, keepCU=CU0, o={};
  try{ __set_C(c2); derive(); RB.st.der+=performance.now()-t1; RB.st.n++; o.ac=D.ac; o.hp=D.hpmax; o.init=D.init; o.sk={}; (c2.skills||[]).forEach((s,i) =>{ o.sk[s.n]=D.skill[i]; }); o.sv=structuredClone(D.save||{});
    o.atk=null; (D.atk||[]).forEach((a) =>{ if(a&&isFinite(a.hit)) o.atk=o.atk==null?a.hit:Math.max(o.atk,a.hit); });
    o.mod=structuredClone(D.mod); o.score=structuredClone(D.score); o.armorP=String((c2.profs||{}).armor||"");
    o.acBonus=((c2.ac||{}).bonus||[]).reduce((a,b) =>{ return a+(+b.v||0); },0); o.acNow=String((c2.ac||{}).baseSrc||""); }
  finally{ __set_C(keepC); __set_D(keepD); __set_B(keepB); __set_CU0(keepCU); }
  /* other armor: base + Dexterity (all, up to +2, or none) + Shield 2 + the bonuses the build already has. Heavy armor needs its Strength */
  if(goals.some((g) =>{ return g.k==="ac"; })&&opts&&opts.armor){ let best=null, P=o.armorP.toLowerCase();
    Object.keys(opts.armor).forEach((k) =>{ const a=opts.armor[k]; if(P.indexOf(a.cat.toLowerCase())<0) return; if(a.str&&o.score.STR<a.str) return;
      [false,true].forEach((sh) =>{ if(sh&&P.indexOf("shield")<0) return; const dx=a.dex==="full"?o.mod.DEX:a.dex==="max2"?Math.min(2,o.mod.DEX):0, ac=a.ac+dx+(sh?2:0)+o.acBonus;
        if(!best||ac>best.ac) best={ac:ac,armor:k,shield:sh}; }); });
    if(best&&best.ac>o.ac){ o.alt=best; } }
  return o; }
function rbMeets(o,g){ const v=g.k==="sk"?o.sk[g.n]:g.k==="sv"?o.sv[g.n]:g.k==="ac"?Math.max(o.ac,o.alt?o.alt.ac:-99):o[g.k]; return v!=null&&v>=g.min?{ok:true,v:v}:{ok:false,v:v}; }
/* every try, made lazily: background and its +2/+1, species, ability order */
function rbTries(opts,goals,c){ const b0=opts.b, order=rbOrder(goals,c), out=[];
  const bgs=Object.keys(opts.bg), sps=opts.species.filter((s) =>{ return !/Custom/i.test(s); });
  bgs.forEach((bg) =>{ const ab=opts.bg[bg].ab||[]; const pref=order.filter((k) =>{ return ab.indexOf(k)>=0; });
    const modes=opts.r14?[{bgMode:b0.bgMode||"111"}]:[{bgMode:"21",bg2:pref[0],bg1:pref[1]},{bgMode:"111"}];
    sps.forEach((sp) =>{ modes.forEach((m) =>{ out.push({species:sp,bg:bg,m:m}); }); }); });
  return {list:out,order:order}; }
function rbBuild(b0,t,order){ const nb=structuredClone(b0); nb.species=t.species; nb.bg=t.bg; nb.bgMode=t.m.bgMode; nb.bg2=t.m.bg2||""; nb.bg1=t.m.bg1||"";
  const base={}, arr={}; order.forEach((k,i) =>{ base[k]=RB_ARR[i]; arr[k]=String(RB_ARR[i]); }); nb.base=base; nb.arr=arr; nb.method="array";/* the Standard Array, as the builder stores it */ if(nb.unset) nb.unset=nb.unset.filter((x) =>{ return x!=="species"&&x!=="bg"&&x!=="abil"; }); return nb; }
function rbDiff(b0,nb,o){ const d=[]; if(nb.species!==b0.species) d.push("Species "+nb.species); if(nb.bg!==b0.bg) d.push("Background "+nb.bg);
  if(nb.bgMode==="21") d.push("+2 "+nb.bg2+", +1 "+nb.bg1); else if(nb.bgMode!==b0.bgMode) d.push("+1 to each background ability");
  const bs=RB_AB.filter((k) =>{ return (b0.base||{})[k]!==nb.base[k]; }); if(bs.length) d.push("Scores "+RB_AB.map((k) =>{ return k+" "+nb.base[k]; }).join(", "));
  if(o.alt) d.push(o.alt.armor+(o.alt.shield?" and a Shield":"")); return d; }
function rbSearch(){ const goals=rbGoals(), box=document.querySelector("#sheetBody .rb-out"); if(!box) return; if(!goals.length){ box.innerHTML='<p class="bk-f">Fill in at least one goal.</p>'; return; }
  const opts=env.__bldOpts&&env.__bldOpts(); if(!opts||!opts.b||!opts.b.cls){ box.innerHTML='<p class="bk-f">Open the builder once, then try again.</p>'; return; }
  let run=++RB.run, T=rbTries(opts,goals,C), i=0, hits=[], near=[], t0=Date.now(); RB.st={n:0,bld:0,der:0,tries:T.list.length,t:0,h:2166136261};
  box.innerHTML='<p class="bk-f rb-prog" aria-live="polite">Trying builds: 0 of '+T.list.length+'</p>';
  /* N29: one batch for the whole search (builder tables set up only when they change), paused at the end of each slice */
  const bat=!RB.slow&&env.__bldSheetBatch?env.__bldSheetBatch():null;
  (function slice(){ if(run!==RB.run){ if(bat) bat.end(); return; } const end=Date.now()+14;
    while(i<T.list.length&&Date.now()<end){ var t=T.list[i++], nb=rbBuild(opts.b,t,T.order), o=rbEval(nb,goals,opts,bat); if(!o) continue;
      var m=goals.map((g) =>{ return rbMeets(o,g); }), miss=m.filter((x) =>{ return !x.ok; }).length, gap=goals.reduce((a,g,j) =>{ return a+Math.max(0,g.min-(m[j].v==null?-99:m[j].v)); },0);
      let hs=JSON.stringify(o), hh=RB.st.h>>>0; for(let q=0;q<hs.length;q++){ hh^=hs.charCodeAt(q); hh=Math.imul(hh,16777619)>>>0; } RB.st.h=hh;/* N29: one fingerprint of every try's numbers */
      const rec={nb:nb,o:o,m:m,diff:rbDiff(opts.b,nb,o),gap:gap}; if(!miss) hits.push(rec); else near.push(rec); }
    const p=document.querySelector("#sheetBody .rb-prog"); if(p) p.textContent="Trying builds: "+i+" of "+T.list.length;
    if(bat) bat.pause(); if(i<T.list.length){ rbYield(slice); return; } if(bat) bat.end();
    hits.sort((a,b) =>{ return a.diff.length-b.diff.length||b.o.hp-a.o.hp; }); near.sort((a,b) =>{ return a.gap-b.gap||a.diff.length-b.diff.length; });
    RB.st.t=Date.now()-t0; RB.res=hits.length?hits.slice(0,6):near.slice(0,3); RB.goals=goals; RB.ok=!!hits.length; RB.opts=opts;
    box.innerHTML='<p class="bk-f">'+T.list.length+' builds tried in '+((Date.now()-t0)/1000).toFixed(1)+' s. '+(hits.length?hits.length+' reach every goal'+(hits.length>6?', the 6 with the fewest changes are shown':'')+'.':'None reaches every goal. The closest ones:')+'</p>'+RB.res.map(rbCard).join(""); })(); }
function rbCard(r,i){ const g=RB.goals; return '<div class="rb-c'+(RB.ok?'':' near')+'"><ul>'+(r.diff.length?r.diff.map((x) =>{ return '<li>'+esc(x)+'</li>'; }).join(""):'<li>Your build already does it</li>')+'</ul><p class="rb-v">'+g.map((q,j) =>{ const m=r.m[j]; return '<span class="'+(m.ok?'ok':'no')+'">'+esc(q.l)+' '+(m.v==null?'?':(q.k==="ac"||q.k==="hp"?m.v:sg(m.v)))+'</span>'; }).join("")+'</p>'+'<p class="rb-acts">'+(r.diff.length?'<button type="button" class="btn press" data-rbuse="'+i+'">Use this build</button>':'')+'<button type="button" class="btn press" data-rbduel="'+i+'">Test in fights</button></p><p class="bk-f rb-duel" aria-live="polite" hidden></p></div>'; }
/* N22 build duel: 100 fights of this build and of the current one against the same group (src/tg/25-sim.js, window.__tgDuel).
   The build is derived on a copy, nothing is saved. The current build is fought once per search and kept */
function rbFinal(r){ const nb=structuredClone(r.nb); if(r.o.alt){ nb.inv=(nb.inv||[]).map((x) =>{ const it=Object.assign({},x); if(it.eq&&((RB.opts&&RB.opts.armor[it.n])||it.n==="Shield")) it.eq=false; return it; }); nb.inv.push({n:r.o.alt.armor,q:1,eq:true}); if(r.o.alt.shield) nb.inv.push({n:"Shield",q:1,eq:true}); } return nb; }
function rbPlural(n,k){ if(k===1) return "one "+n; let w=n.split(" "), l=w.pop(); l=/(s|x|ch|sh)$/.test(l)?l+"es":/[^aeiou]y$/.test(l)?l.slice(0,-1)+"ies":/f$/.test(l)?l.slice(0,-1)+"ves":l+"s"; w.push(l); return k+" "+w.join(" "); }
/* M12: scheduler.postTask at user-visible priority when the browser has it, else a timer. scheduler.yield() was tried: its continuations ran five slices in one frame (100 ms) and the page did not paint between them */
const rbYield=(f) =>{ if(window.scheduler&&typeof window.scheduler.postTask==="function") window.scheduler.postTask(f,{priority:"user-visible"}); else setTimeout(f,0); };
let RB_DUEL_WAIT=false;
function rbDuel(i,btn){ const r=RB.res&&RB.res[i], out=btn.closest(".rb-c").querySelector(".rb-duel"); if(!r||!out) return; out.hidden=false;
  if(!env.__tgDuelPick){ if(env.__bldNeed&&!RB_DUEL_WAIT){ RB_DUEL_WAIT=true; const again=() =>{ RB_DUEL_WAIT=false; rbDuel(i,btn); }; Promise.resolve(env.__bldNeed()).then(again,again); out.textContent="Loading the fight simulator."; return; } if(!env.__tgDuelPick){ out.textContent="The fight simulator is still loading. Try again in a moment."; return; } }
  let pc=null; try{ pc=__R.tgPcFor(env.__bldSheetFor(rbFinal(r))); }catch(e){ pc=null; } if(!pc){ out.textContent="This build could not be prepared for a fight."; return; }
  btn.disabled=true; const run=RB.run, pct=function(x){ return Math.round(x*100); };
  const line=function(a,base,e1){ const g=base.g, x=a?pct(a.rate):null, y=pct(base.r.rate), d=a?x-y:0;
    return (a?'Won <b>'+x+' of 100</b> fights. Your current build: <b>'+y+'</b>'+(d?' ('+(d>0?'+':'\u2212')+Math.abs(d)+')':', the same')+'.':'Quick estimate: <b>'+pct(e1)+'%</b>. Your current build: <b>'+y+' of 100</b>. Fighting\u2026')+
      '<br><small>Against '+esc(rbPlural(g.c.n,g.k))+' ('+g.xp+' XP, '+g.band+' at level '+pc.level+'), '+(base.r.rate>=0.3&&base.r.rate<=0.7?'a group your current build beats about half the time':'the group closest to an even fight for your current build')+'. '+(a?'Quick estimate was '+pct(e1)+'%. ':'')+'Same 100 fights for both. Simple play: walk up, attack. Other class features are not used.</small>'; };
  const fin=function(a,base,e1){ btn.disabled=false; if(run!==RB.run) return; if(!a||!base){ out.textContent="The creature list could not be loaded. Check the connection and try again."; return; } out.innerHTML=line(a,base,e1); };
  const go2=function(base){ const e1=env.__tgEst(pc,base.g); out.innerHTML=line(null,base,e1); env.__tgDuel(pc,base.g,(a) =>{ fin(a,base,e1); }); };
  if(RB.base&&RB.base.run===run){ go2(RB.base); return; }
  let cur=null; try{ cur=__R.tgPcNow(); cur.por=""; }catch(e){ cur=null; } if(!cur){ fin(null); return; }
  out.textContent="Picking a fair group for your current build"; env.__tgDuelPick(cur,(g) =>{ if(!g){ fin(null); return; } out.textContent="Your current build: 0 of 100"; env.__tgDuel(cur,g,(b) =>{ if(!b){ fin(null); return; } RB.base={run:run,g:g,r:b}; go2(RB.base); },(n,m) =>{ out.textContent="Your current build: "+n+" of "+m; }); },(n,m) =>{ out.textContent="Picking a fair group for your current build: "+n+" of "+m; }); }
function rbOpen(){ __set_navStack([]); const go=function(){ const sk=(C.skills||[]).map((s) =>{ return '<option>'+esc(s.n)+'</option>'; }).join(""), sv=RB_AB.map((k) =>{ return '<option value="'+k+'">'+esc(ABN[k])+'</option>'; }).join("");
    const f=function(k,l,ph){ return '<label class="rb-f"><span>'+l+' at least</span><input type="number" inputmode="numeric" data-rbg="'+k+'" placeholder="'+ph+'"></label>'; };
    openSheet("Find a build",'<p class="bk-f">Write what you want your '+esc(C.clsLabel||C.cls||"character")+' to reach at level '+D.level+'. The app tries every species, background and score layout of your rules set and shows the builds that get there.</p><div class="rb-g">'+f("ac","Armor Class",D.ac+2)+f("hp","Hit Points",D.hpmax+5)+f("init","Initiative",D.init+2)+f("atk","Best attack bonus","")+
      '<label class="rb-f"><span>Skill</span><select data-rbs="sk"><option value="">None</option>'+sk+'</select></label>'+f("sk","That skill","")+'<label class="rb-f"><span>Saving throw</span><select data-rbs="sv"><option value="">None</option>'+sv+'</select></label>'+f("sv","That save","")+
      '</div><p><button type="button" class="btn pri press" data-rbgo="1">Find builds</button></p><div class="rb-out"></div>',"rb"); };
  if(env.__bldSheetFor&&env.__bldOpts) go(); else { if(env.__bldNeed) try{ env.__bldNeed(); }catch(e){} let n=0; (function w(){ if(env.__bldSheetFor&&env.__bldOpts) go(); else if(++n<60) setTimeout(w,200); else toast("The builder did not load."); })(); } }
document.addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-rbgo],[data-rbuse],[data-rbopen],[data-rbduel]"); if(!b) return; e.preventDefault();
  if(b.hasAttribute("data-rbduel")){ rbDuel(+b.getAttribute("data-rbduel"),b); return; }
  if(b.hasAttribute("data-rbopen")){ rbOpen(); return; } if(b.hasAttribute("data-rbgo")){ rbSearch(); return; }
  const r=RB.res&&RB.res[+b.getAttribute("data-rbuse")]; if(!r) return; const nb=rbFinal(r);
  closeSheet(); env.__bldUse(nb,"Build from Find a build"); });
env.__rbOpen=rbOpen; env.__rbStats=function(){ return RB.st||null; }; env.__rbSlow=function(v){ RB.slow=!!v; };/* N29 test: one by one, to compare *//* N29: time per part of the last search */
