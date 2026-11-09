/* Training Ground field: board, taps, replay, wire and open (split from 30, SOLID stage 12) */
import {env} from "./00-env.js";import {A,esc} from "./00-bridge.js";import {ARENAS,TG,XPB,balance,tgCreatures,cur,dom,enter,evText,fieldHtml,fightClear,fightLoad,fightSave,flash,foeList,hpPct,ini,tgSay,nAllies,nFoes,run,setupHtml,vtPaint} from "./30-ui-tg.js";
/* the grid: one canvas, sized to whole squares. A phone gets 44 px squares and the grid scrolls inside its frame */
let CUR=[0,0];
/* N28 layered board: ground, rough ground, walls and grid are drawn once into a spare canvas and only copied on each tap. Tokens are
   drawn on top every time. The layer is drawn again when the board, cell size, pixel ratio, ground colour or terrain changes.
   The canvas size is set only when it changes (setting it clears the bitmap and costs a full reallocation) */
const LAYER={key:"",cv:null}, DRAWT={n:0,ms:0};
function boardLayer(st,cs,dpr,W,H){ const css=getComputedStyle(document.getElementById("tg")), col=function(n,d){ return (css.getPropertyValue(n)||"").trim()||d; }, g=col("--tg-ground","#2c3a28");
  const key=[st.w,st.h,cs,dpr,g,Object.keys(st.rough).join(";"),Object.keys(st.block).join(";")].join("|"); if(LAYER.key===key&&LAYER.cv&&!TG.noLayer) return LAYER.cv;
  const c=document.createElement("canvas"); c.width=W*dpr; c.height=H*dpr; const x=c.getContext("2d"); x.setTransform(dpr,0,0,dpr,0,0);
  x.fillStyle=g; x.fillRect(0,0,W,H);
  Object.keys(st.rough).forEach((k) =>{ const p=k.split(","); x.fillStyle="rgba(120,160,70,.35)"; x.fillRect(p[0]*cs,p[1]*cs,cs,cs); x.strokeStyle="rgba(200,230,140,.35)"; for(let i=6;i<cs;i+=9){ x.beginPath(); x.moveTo(p[0]*cs+i,p[1]*cs+cs-4); x.lineTo(p[0]*cs+i+3,p[1]*cs+cs-10); x.stroke(); } });
  Object.keys(st.block).forEach((k) =>{ const p=k.split(","); x.fillStyle="#1a1d1f"; x.fillRect(p[0]*cs+1,p[1]*cs+1,cs-2,cs-2); x.fillStyle="#3b3f42"; x.fillRect(p[0]*cs+4,p[1]*cs+4,cs-8,cs-10); });
  x.strokeStyle="rgba(255,255,255,.09)"; x.lineWidth=1; for(let i=0;i<=st.w;i++){ x.beginPath(); x.moveTo(i*cs+.5,0); x.lineTo(i*cs+.5,H); x.stroke(); } for(let j=0;j<=st.h;j++){ x.beginPath(); x.moveTo(0,j*cs+.5); x.lineTo(W,j*cs+.5); x.stroke(); }
  LAYER.key=key; LAYER.cv=c; return c; }
function draw(){ const cv=document.getElementById("tgCv"); if(!cv||!TG.st) return;
 const {t0, st, cs, dpr, W, H, x}=drawStep1(cv); if(!x) return;
  const {u}=drawStep2(x, st, cs, dpr, W, H);
  drawStep3(st, cs, x, u);
  if(TG.kb){ x.strokeStyle="#fff"; x.lineWidth=2; x.strokeRect(CUR[0]*cs+2,CUR[1]*cs+2,cs-4,cs-4); } DRAWT.n++; DRAWT.ms+=performance.now()-t0; }
function drawStep1(cv){
const t0=performance.now(), st=TG.st, cs=TG.cell, dpr=Math.min(2,env.devicePixelRatio||1), W=st.w*cs, H=st.h*cs;
  if(cv.width!==W*dpr||cv.height!==H*dpr){ cv.width=W*dpr; cv.height=H*dpr; } if(cv.style.width!==W+"px"){ cv.style.width=W+"px"; cv.style.height=H+"px"; } const x=cv.getContext("2d");
  return /** @type {any} */ ({t0, st, cs, dpr, W, H, x});
}
function drawStep2(x, st, cs, dpr, W, H){
  x.setTransform(1,0,0,1,0,0); x.globalAlpha=1; x.drawImage(boardLayer(st,cs,dpr,W,H),0,0); x.setTransform(dpr,0,0,dpr,0,0);
  const u=cur();
  if(TG.mode==="move"&&!st.over){ const R=TGE.reach(st,u.id); Object.keys(R).forEach((k) =>{ if(R[k].pass||R[k].c===0) return; const p=k.split(","); x.fillStyle="rgba(255,214,102,.22)"; x.fillRect(p[0]*cs+2,p[1]*cs+2,u.size*cs-4,u.size*cs-4); }); }
  return /** @type {any} */ ({u});
}
function drawStep3(st, cs, x, u){
  Object.keys(st.units).forEach((id) =>{ const t=st.units[id]; if(t.dead&&t.kind!=="pc") { x.globalAlpha=.25; } const r=t.size*cs/2, cx=t.pos[0]*cs+r, cy=t.pos[1]*cs+r;
    const ring=t.side==="foe"?"#d9534f":t.side==="ally"?"#4caf6e":"#e6b84a"; x.beginPath(); x.arc(cx,cy,r-5,0,Math.PI*2); x.fillStyle=t.side==="foe"?"#3a1d1d":t.side==="ally"?"#1d3a26":"#3a321d"; x.fill();
    x.lineWidth=id===u.id?4:2.5; x.strokeStyle=ring; x.stroke();
    x.beginPath(); x.arc(cx,cy,r-1.5,-Math.PI/2,-Math.PI/2+Math.PI*2*hpPct(t)); x.strokeStyle=hpPct(t)>.5?"#7bd88f":hpPct(t)>.25?"#f0c24b":"#ff6b5e"; x.lineWidth=3; x.stroke();
    if(TG.mode==="target"||TG.mode==="save"||TG.mode==="spell"||TG.mode==="lgtarget"){ const okT=TG.mode==="lgtarget"?(!t.dead&&t.side!==TG.st.units[TG.lgBy].side):targetOk(t); if(okT){ x.beginPath(); x.arc(cx,cy,r-1,0,Math.PI*2); x.setLineDash([5,4]); x.strokeStyle=TG.pick.indexOf(id)>=0?"#ffffff":"#ffd666"; x.lineWidth=2; x.stroke(); x.setLineDash([]); } }
    x.fillStyle="#fff"; x.font="600 "+Math.round(cs*.32*Math.min(1.6,t.size))+"px system-ui, sans-serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillText(ini(t.name),cx,cy+1); x.globalAlpha=1;
    if(t.down&&!t.dead){ x.fillStyle="rgba(0,0,0,.45)"; x.beginPath(); x.arc(cx,cy,r-5,0,Math.PI*2); x.fill(); } });
}
env.__tgDrawStats=function(reset,noLayer){ const o={n:DRAWT.n,ms:DRAWT.ms}; if(reset){ DRAWT.n=0; DRAWT.ms=0; } if(noLayer!=null) TG.noLayer=!!noLayer; return o; };/* N28 test: noLayer draws the board again every time */
env.__tgDraw=function(){ draw(); const c=document.getElementById("tgCv"); return c?c.toDataURL():""; };
export function targetOk(t){ const u=cur(); if(TG.mode==="spell"){ const x=u.spells[TG.sp]; if(!x||t.dead) return false; if(x.k==="heal") return t.side===u.side||(u.side!=="foe"&&t.side!=="foe"); return t.id!==u.id&&(!x.rng||TGE.udist(u,t)<=x.rng); }
  if(t.dead||t.id===u.id) return false; if(TG.mode==="save") return true; const a=TGE.findAct(u,TG.act); if(!a) return false; const d=TGE.udist(u,t);
  if(a.mr==="r") return !!a.rng&&d<=a.rng[1]; if(a.mr==="mr") return d<=(a.reach||5)||(!!a.rng&&d<=a.rng[1]); return d<=(a.reach||5); }
function unitAt(cx,cy){ let st=TG.st, hit=null; Object.keys(st.units).forEach((id) =>{ const t=st.units[id]; if(t.dead&&t.kind!=="pc") return; if(cx>=t.pos[0]&&cx<t.pos[0]+t.size&&cy>=t.pos[1]&&cy<t.pos[1]+t.size) hit=t; }); return hit; }
function tapCell(cx,cy){ if(!TG.st||TG.st.over||TG.oa.length) return;
 const {u, t}=tapCellStep1(cx, cy);
  if(tapMove(cx,cy,u)) return;
  tapCellStep2(t, u);
  if(tapLg(t)||tapTarget(t,u)||tapSpell(t,u)||tapSave(t)) return;
  tapCellStep3(t); }
function tapMove(cx,cy,u){ if(TG.mode!=="move") return false; if(run({t:"move",to:[cx,cy]})){ TG.mode=TGE.speedLeft(TG.st.units[u.id])?"move":""; } paint(); return true; return true; }
function tapLg(t){ if(!(TG.mode==="lgtarget"&&t)) return false; const lb=TG.st.units[TG.lgBy], la=TGE.lgAct(lb,TG.lgN); run({t:"attack",lg:TG.lgN,by:TG.lgBy,target:t.id,act:la.n}); TG.mode=""; TG.lgBy=null; paint(); return true; return true; }
function tapTarget(t,u){ if(!(TG.mode==="target"&&t)) return false; if(!targetOk(t)){ flash("Out of reach or range."); return true; } run({t:"attack",target:t.id,act:TG.act}); const m=TG.st.units[u.id].turn.ma; if(m&&m.length&&!TG.st.over){ TG.act=pickAtk(TG.st.units[u.id],m[0]); TG.mode=TG.act?"target":""; } else { TG.mode=""; TG.act=null; } paint(); return true; return true; }
function tapSpell(t,u){ if(!(TG.mode==="spell"&&t)) return false; if(!targetOk(t)){ flash("Out of range for this spell."); return true; } const x=u.spells[TG.sp], j=TG.pick.indexOf(t.id); if(x&&x.cnt&&j>=0&&TG.pick.length<6){ TG.pick.push(t.id); } else if(j>=0) TG.pick.splice(j,1); else TG.pick.push(t.id); paint(); return true; return true; }
function tapSave(t){ if(!(TG.mode==="save"&&t)) return false; const i=TG.pick.indexOf(t.id); if(i>=0) TG.pick.splice(i,1); else TG.pick.push(t.id); paint(); return true; return true; }
function tapCellStep1(cx, cy){
const u=cur(), t=unitAt(cx,cy);
  return /** @type {any} */ ({u, t});
}
function tapCellStep2(t, u){
  if(TG.mode==="target"&&t&&!targetOk(t)){ /* inside a Multiattack the entry may allow another weapon that does reach: switch to it */
    const me=TG.st.units[u.id], en=me.turn.ma&&me.turn.ma[0], keep=TG.act; if(en) en.split("|").some((n) =>{ const a2=TGE.findAct(me,n); if(!a2) return false; TG.act=a2.n; if(targetOk(t)) return true; TG.act=keep; return false; }); }
}
function tapCellStep3(t){
  if(t){ flash(t.name+": HP "+t.hp+"/"+t.max+", AC "+t.ac+(Object.keys(t.cond).length?", "+Object.keys(t.cond).join(", "):"")); }
}
function actPick(i){ const u=cur(), a=u.acts[i]; if(!a) return;
  if(a.k==="multi"){ if(run({t:"multi",act:a.n})){ const first=(TG.st.units[u.id].turn.ma||[])[0]; TG.act=first?pickAtk(u,first):null; TG.mode=TG.act?"target":""; } paint(); return; }
  if(a.k==="atk"){ const m=u.turn.ma; if(m&&m.length&&!m.some((x) =>{ return x.split("|").indexOf(a.n)>=0; })){ flash("Not part of the Multiattack."); return; } if(!(m&&m.length)&&!u.turn.a){ flash("No action left this turn."); return; } TG.act=a.n; TG.mode="target"; paint(); return; }
  if(a.k==="save"){ if(!u.turn.a){ flash("No action left this turn."); return; } TG.act=a.n; TG.mode="save"; TG.pick=[]; paint(); return; }
  /* tier C: the player resolves it by hand */
  A.ask(a.n+": "+(a.t||"")+"\n\nThe board does not run this one. Resolve it at the table, then use it here to spend the action.","Use it",() =>{ run({t:"manual",act:a.n}); paint(); }); }
function pickAtk(u,entry){ const names=entry.split("|"); for(let i=0;i<names.length;i++){ const a=TGE.findAct(u,names[i]); if(a) return a.n; } return null; }
/* T11 N26 fight replay: every state from the start and the commands (the engine gives the same fight again), a slider through them,
   Play and step buttons. A fight is shared as a link: setup and commands, gzip and base64url after #fight=, nothing goes to a server */
function rpBuild(start,cmds){ let st=[start], x=start; cmds.forEach((c) =>{ x=TGE.step(x,c); st.push(x); }); return st; }
function rpOpen(){ if(!TG.start||!TG.cmds) return; TG.rp={cmds:TG.cmds.slice(),states:rpBuild(TG.start,TG.cmds),i:0,back:TG.st}; TG.view="replay"; paint(); }
function rpStep(d){ const r=TG.rp; r.i=Math.max(0,Math.min(r.cmds.length,r.i+d)); paint(); const n=r.states[r.i], p=r.states[Math.max(0,r.i-1)]; if(d) tgSay(n.log.slice(p.log.length).map(evText).filter(Boolean).join(" ")); }
function replayHtml(){ const r=TG.rp, n=r.states[r.i], p=r.i?r.states[r.i-1]:null, lines=p?n.log.slice(p.log.length).map(evText).filter(Boolean):["The fight is about to start."];
  return '<div class="tg-wrap" id="tgWrap"><canvas id="tgCv" aria-label="Battle grid at step '+r.i+'"></canvas></div><div class="tg-p tg-rp"><label class="tg-rps"><span class="vh">Step</span><input type="range" min="0" max="'+r.cmds.length+'" value="'+r.i+'" data-tgrp="1"></label>'
   +'<div class="tg-acts"><button type="button" class="btn press" data-tgrs="-1" aria-label="One step back">Back</button><button type="button" class="btn pri press" data-tg="rpplay">'+(TG.rpT?'Pause':'Play')+'</button><button type="button" class="btn press" data-tgrs="1" aria-label="One step forward">Next</button></div>'
   +'<ol class="tg-rpl">'+lines.map((t) =>{ return '<li>'+esc(t)+'</li>'; }).join("")+'</ol><div class="tg-acts"><button type="button" class="btn press" data-tg="sharefight">Share this fight</button><button type="button" class="btn press" data-tg="rpdone">Done</button></div></div>'; }
function b64u(buf){ let u=new Uint8Array(buf), t=""; for(let i=0;i<u.length;i+=32768) t+=String.fromCharCode.apply(null,u.subarray(i,i+32768)); return btoa(t).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,""); }
function unb64u(s){ s=s.replace(/-/g,"+").replace(/_/g,"/"); while(s.length%4) s+="="; const b=atob(s), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u; }
function fightCode(){ const rec={v:1,seed:TG.seed,arena:TG.arena,pc:TG.pc,foes:TG.foes,allies:TG.allies,cmds:TG.cmds}; if(!env.CompressionStream) return Promise.reject(new Error("This browser cannot pack a link."));
  return new Response(new Blob([JSON.stringify(rec)]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer().then(b64u); }
function fightShare(){ fightCode().then((code) =>{ const u=location.origin+location.pathname+"#fight="+code;
    if(navigator.share){ navigator.share({title:"Training Ground fight",url:u}).catch(() =>{}); return; }
    try{ navigator.clipboard.writeText(u).then(() =>{ flash("Link copied ("+u.length+" characters)."); },() =>{ flash("Copy did not work here."); }); }catch(e){ flash("Copy is not available here."); } },(e) =>{ flash(e.message); }); }
function fightFromCode(code){ let u; try{ u=unb64u(code); }catch(e){ return Promise.reject(new Error("This fight link is damaged.")); }
  return new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream("gzip"))).text().then((t) =>{ return JSON.parse(t); }); }
function fightOpenLink(code){ fightFromCode(code).then((rec) =>{ return tgCreatures().then(() =>{ TG.pc=rec.pc; TG.foes=rec.foes||{}; TG.allies=rec.allies||{}; TG.arena=rec.arena||"field"; TG.forceSeed=rec.seed; TG.linkMode=1; enter(); if(TG.start&&rec.cmds){ TG.cmds=[{t:"start"}]; TG.st=TGE.step(TG.start,{t:"start"}); rec.cmds.slice(1).forEach((c) =>{ TG.st=TGE.step(TG.st,c); TG.cmds.push(c); }); rpOpen(); tgSay("A shared fight: "+(TG.pc&&TG.pc.name||"a hero")+". Watch it, or go back to the setup to fight your own."); } }); }).catch((e) =>{ flash(e.message||"This fight link could not be opened."); }); }
/* G7 queue 1: Screen Wake Lock. While a fight is on screen the display stays on (players think between turns); released on the setup
   screen, on close and when the page is hidden (the browser drops it then), taken again when the page comes back to a fight */
const WL={l:null,want:false};
function wakeSync(){ const w=document.getElementById("tg"), want=!!(w&&!w.hidden&&TG.view==="field"&&TG.st&&!TG.st.over); WL.want=want;
  if(want&&!WL.l&&navigator.wakeLock&&document.visibilityState==="visible"){ WL.l=1; navigator.wakeLock.request("screen").then((l) =>{ if(!WL.want){ l.release().catch(() =>{}); WL.l=null; return; } WL.l=l; l.addEventListener("release",() =>{ if(WL.l===l) WL.l=null; }); },() =>{ WL.l=null; }); }
  else if(!want&&WL.l&&WL.l!==1){ const l=WL.l; WL.l=null; l.release().catch(() =>{}); } }
document.addEventListener("visibilitychange",() =>{ if(document.visibilityState==="visible") wakeSync(); });
env.__tgWake=function(){ return {want:WL.want,held:!!(WL.l&&WL.l!==1&&!WL.l.released)}; };
/* the turn order is drawn again on each paint: the bar starts at the last value shown and moves to the new one on the next frame */
function hpBars(){ const b=document.getElementById("tgB"); if(!b||!TG.st) return; const L=b.querySelectorAll(".tg-ord i[data-p]"); if(!L.length) return; TG.hpPrev=TG.hpPrev||{};
  requestAnimationFrame(() =>{ L.forEach((i) =>{ i.style.setProperty("--p",i.getAttribute("data-p")); }); });
  Object.keys(TG.st.units).forEach((id) =>{ TG.hpPrev[id]=hpPct(TG.st.units[id]); }); }
export function paint(){ wakeSync(); const b=document.getElementById("tgB"); if(!b) return; const s=document.getElementById("tgS"), t=document.getElementById("tgT");
  if(TG.view==="setup"){ t.textContent="Training Ground"; s.textContent="Practice fights. Your sheet never changes"; b.innerHTML=setupHtml(); }
  else if(TG.view==="replay"){ t.textContent="Replay"; s.textContent="Step "+TG.rp.i+" of "+(TG.rp.cmds.length); TG.st=TG.rp.states[TG.rp.i]; b.innerHTML=replayHtml(); TG.cell=innerWidth<760?44:52; draw(); }
  else { t.textContent=ARENAS.filter((a) =>{ return a.id===TG.arena; })[0].n; s.textContent="Round "+TG.st.round+" · "+cur().name+"'s turn"; b.innerHTML=fieldHtml(); TG.cell=innerWidth<760?44:52; draw(); wireCv(); hpBars(); }
  document.getElementById("tgBk").setAttribute("aria-label",TG.view==="setup"?"Close":"Back to the setup"); document.getElementById("tg").setAttribute("data-view",TG.view); }
function wireCv(){ const cv=document.getElementById("tgCv"); if(!cv) return;
  cv.addEventListener("click",(e) =>{ const r=cv.getBoundingClientRect(), cx=Math.floor((e.clientX-r.left)/TG.cell), cy=Math.floor((e.clientY-r.top)/TG.cell); TG.kb=0; tapCell(cx,cy); });
  cv.addEventListener("keydown",(e) =>{ const k=e.key, d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[k];
    if(d){ e.preventDefault(); TG.kb=1; CUR=[Math.max(0,Math.min(TG.st.w-1,CUR[0]+d[0])),Math.max(0,Math.min(TG.st.h-1,CUR[1]+d[1]))]; draw(); const t=unitAt(CUR[0],CUR[1]); tgSay("Square "+(CUR[0]+1)+", "+(CUR[1]+1)+(t?": "+t.name:"")); }
    else if(k==="Enter"||k===" "){ e.preventDefault(); tapCell(CUR[0],CUR[1]); const c2=document.getElementById("tgCv"); if(c2) try{ c2.focus({preventScroll:true}); }catch(er){} } });
  const u=cur(), wrap=document.getElementById("tgWrap"); if(wrap&&u&&!TG.kb){ const cs=TG.cell; const lft=u.pos[0]*cs-wrap.clientWidth/2+cs, top=u.pos[1]*cs-wrap.clientHeight/2+cs; try{ wrap.scrollTo({left:Math.max(0,lft),top:Math.max(0,top)}); }catch(e){} } }
function tgc01(b,d,w){ if(!(b.getAttribute("aria-disabled")==="true")) return false; tgSay(d.tg==="enter"?"Pick who goes in and at least one creature.":""); flash("Pick who goes in and at least one creature."); return true; return true; }
function tgc02(b,d,w){ if(!(d.tg==="close")) return false; close(); return true; return true; }
function tgc03(b,d,w){ if(!(d.tg==="back")) return false; back(); return true; return true; }
function tgc04(b,d,w){ if(!(d.tgpc!=null)) return false; TG.pc=TG.pcs[+d.tgpc]; paint(); return true; return true; }
function tgc05(b,d,w){ if(!(d.tg==="try")) return false; const cls=w.querySelector('[data-tgtry="cls"]').value, lv=+w.querySelector('[data-tgtry="lv"]').value||1; TG.trial={cls:cls,lv:lv}; const go=function(){ const p=A.tgTry(cls,lv); if(!p){ tgSay("That class could not be made."); return; } p.id="trial"; TG.pc=p; paint(); tgSay(p.name+" is ready."); }; if(env.__bldSheetFor) go(); else if(env.__bldNeed) Promise.resolve(env.__bldNeed()).then(go,go); else setTimeout(go,300); return true; return true; }
function tgc06(b,d,w){ if(!(d.tgtier)) return false; TG.tier=d.tgtier; TG.q=""; TG.lim=24; paint(); return true; return true; }
function tgc07(b,d,w){ if(!(d.tgf)) return false; const n=(TG.foes[d.tgf]||0)+(+d.d); if(n>0&&nFoes()>=12&&+d.d>0){ flash("Up to 12 creatures."); return true; } if(n<=0) delete TG.foes[d.tgf]; else TG.foes[d.tgf]=n; const l=document.getElementById("tgFoes"), sc=l?l.scrollTop:0; paint(); return true; return true; }
function tgc08(b,d,w){ if(!(d.tg==="balance")) return false; balance(); return true; return true; }
function tgc09(b,d,w){ if(!(d.tg==="replay")) return false; rpOpen(); return true; return true; }
function tgc10(b,d,w){ if(!(d.tg==="sharefight")) return false; fightShare(); return true; return true; }
function tgc11(b,d,w){ if(!(d.tgrs)) return false; clearInterval(TG.rpT); TG.rpT=0; rpStep(+d.tgrs); return true; return true; }
function tgc12(b,d,w){ if(!(d.tg==="rpplay")) return false; if(TG.rpT){ clearInterval(TG.rpT); TG.rpT=0; paint(); return true; } if(TG.rp.i>=TG.rp.cmds.length) TG.rp.i=0; TG.rpT=setInterval(() =>{ if(TG.view!=="replay"||TG.rp.i>=TG.rp.cmds.length){ clearInterval(TG.rpT); TG.rpT=0; if(TG.view==="replay") paint(); return; } rpStep(1); },A.reduce&&A.reduce()?1200:700); paint(); return true; return true; }
function tgc13(b,d,w){ if(!(d.tg==="rpdone")) return false; clearInterval(TG.rpT); TG.rpT=0; TG.st=TG.rp.back||TG.rp.states[TG.rp.states.length-1]; TG.view="field"; paint(); return true; return true; }
function tgc14(b,d,w){ if(!(d.tg==="more")) return false; TG.lim+=24; paint(); return true; return true; }
function tgc15(b,d,w){ if(!(d.tgally)) return false; if(TG.allies[d.tgally]) delete TG.allies[d.tgally]; else { if(nAllies()>=3){ flash("Up to 3 companions."); return true; } TG.allies[d.tgally]=1; } paint(); return true; return true; }
function tgc16(b,d,w){ if(!(d.tgarena)) return false; TG.arena=d.tgarena; paint(); return true; return true; }
function tgc17(b,d,w){ if(!(d.tg==="enter")) return false; TG.linkMode=0; enter(); return true; return true; }
function tgc18(b,d,w){ if(!(d.tg==="move")) return false; TG.mode=TG.mode==="move"?"":"move"; TG.act=null; paint(); return true; return true; }
function tgc19(b,d,w){ if(!(d.tga!=null)) return false; actPick(+d.tga); return true; return true; }
function tgc20(b,d,w){ if(!(d.tgb!=null)) return false; const u=cur(), a=u.bonus[+d.tgb]; if(a&&a.k==="save"){ TG.act=a.n; TG.mode="save"; TG.bonus=1; TG.pick=[]; paint(); } else A.ask(a.n+": "+(a.t||"")+"\n\nResolve it at the table, then use it here to spend the Bonus Action.","Use it",() =>{ run({t:"manual",act:a.n,slot:"b"}); paint(); }); return true; return true; }
function tgc21(b,d,w){ if(!(d.tgx)) return false; run({t:d.tgx}); TG.mode=""; paint(); return true; return true; }
function tgc22(b,d,w){ if(!(d.tgsp!=null)) return false; TG.sp=+d.tgsp; TG.mode="spell"; TG.pick=[]; TG.act=null; paint(); return true; return true; }
function tgc23(b,d,w){ if(!(d.tg==="castgo")) return false; run({t:"cast",sp:cur().spells[TG.sp].n,targets:TG.pick.slice(),lvl:TG.lvl||0}); TG.mode=""; TG.pick=[]; TG.sp=null; paint(); return true; return true; }
function tgc24(b,d,w){ if(!(d.tgman!=null)) return false; const mu=cur(), mx=mu.manual[+d.tgman]; A.ask(mx.n+": "+(mx.t||"")+"\n\nThe board does not run this spell. Resolve it at the table (damage and conditions can be set on the tokens), then use it here to spend the action.","Use it",() =>{ run({t:"manual",act:mx.n}); paint(); }); return true; return true; }
function tgc25(b,d,w){ if(!(d.tglg)) return false; const pp=d.tglg.split("|"), lu=TG.st.units[pp[0]], lx=lu&&lu.lg[+pp[1]]; if(!lx) return true; const lr=TGE.lgAct(lu,lx.n);
    if(lr&&lr.k==="atk"){ TG.mode="lgtarget"; TG.lgBy=lu.id; TG.lgN=lx.n; flash("Tap the creature "+lu.name+" attacks."); paint(); return true; }
    if(lr&&lr.k==="save"){ TG.mode="save"; TG.act=null; TG.lgBy=lu.id; TG.lgN=lx.n; TG.pick=[]; paint(); return true; }
    A.ask(lu.name+": "+lx.n+". "+(lx.t||"")+"\n\nResolve it at the table, then use it here to spend one legendary action.","Use it",() =>{ run({t:"manual",lg:lx.n,by:lu.id}); paint(); }); return true; return true; }
function tgc26(b,d,w){ if(!(d.tg==="savego"&&TG.lgBy)) return false; run({t:"save",lg:TG.lgN,by:TG.lgBy,targets:TG.pick.slice()}); TG.mode=""; TG.lgBy=null; TG.pick=[]; paint(); return true; return true; }
function tgc27(b,d,w){ if(!(d.tg==="savego")) return false; run({t:"save",act:TG.act,targets:TG.pick.slice(),bonus:TG.bonus?1:0}); TG.mode=""; TG.act=null; TG.pick=[]; TG.bonus=0; paint(); return true; return true; }
function tgc28(b,d,w){ if(!(d.tg==="cancel")) return false; TG.mode=""; TG.act=null; TG.pick=[]; TG.bonus=0; TG.sp=null; TG.lgBy=null; paint(); return true; return true; }
function tgc29(b,d,w){ if(!(d.tgoa!=null)) return false; const o=TG.oa.shift(); if(d.tgoa&&o) run({t:"attack",oa:1,by:o.by,target:o.u,act:d.tgoa}); paint(); return true; return true; }
function tgc30(b,d,w){ if(!(d.tg==="undo")) return false; const p=TG.undo.pop(); if(p){ TG.st=p; TG.cmds.pop(); TG.oa=[]; TG.mode=""; TG.act=null; fightSave(); tgSay("Undone."); } paint(); return true; return true; }
function tgc31(b,d,w){ if(!(d.tg==="resume")) return false; const rec=TG.saved; if(rec){ TG.start=rec.start; TG.cmds=rec.cmds.slice(); TG.st=TGE.replay(rec.start,rec.cmds); TG.arena=rec.arena; TG.undo=[]; TG.oa=[]; TG.mode=""; TG.act=null; TG.view="field"; TG.saved=null; paint(); tgSay("Back in the fight. Round "+TG.st.round+"."); } return true; return true; }
function tgc32(b,d,w){ if(!(d.tg==="drop")) return false; fightClear(); paint(); return true; return true; }
function tgc33(b,d,w){ if(!(d.tg==="end")) return false; TG.oa=[]; TG.mode=""; TG.act=null; TG.pick=[]; run({t:"end"}); paint(); const c=cur(); if(c) tgSay(c.name+"'s turn."); return true; return true; }
function tgc34(b,d,w){ if(!(d.tg==="again")) return false; TG.linkMode=0; enter(); return true; return true; }
function tgc35(b,d,w){ if(!(d.tg==="setup")) return false; TG.view="setup"; TG.st=null; vtPaint(); return true; return true; }
function tgc36(b,d,w){ if(!(d.tgu)) return false; const t=TG.st.units[d.tgu]; if(t){ if(TG.mode==="target"||TG.mode==="save"||TG.mode==="spell"){ tapCell(t.pos[0],t.pos[1]); return true; } flash(t.name+": HP "+t.hp+"/"+t.max+", AC "+t.ac); } return true; return true; }
const CLICKS=[tgc01,tgc02,tgc03,tgc04,tgc05,tgc06,tgc07,tgc08,tgc09,tgc10,tgc11,tgc12,tgc13,tgc14,tgc15,tgc16,tgc17,tgc18,tgc19,tgc20,tgc21,tgc22,tgc23,tgc24,tgc25,tgc26,tgc27,tgc28,tgc29,tgc30,tgc31,tgc32,tgc33,tgc34,tgc35,tgc36];
function onClick(w,e){ const b=e.target.closest("button"); if(!b||!w.contains(b)) return; const d=b.dataset;
  for(let k=0;k<CLICKS.length;k++) if(CLICKS[k](b,d,w)) return; }
export function wire(w){ w.addEventListener("click",(e) =>{ onClick(w,e); });
  wireStep1(w); }
function wireStep1(w){
  w.addEventListener("change",(e) =>{ const t=e.target; if(t.matches&&t.matches("[data-tglv]")){ TG.lvl=+t.value; } });
  w.addEventListener("input",(e) =>{ const t=e.target; if(t.matches&&t.matches("[data-tgrp]")){ clearInterval(TG.rpT); TG.rpT=0; TG.rp.i=+t.value; TG.st=TG.rp.states[TG.rp.i]; const s2=document.getElementById("tgS"); if(s2) s2.textContent="Step "+TG.rp.i+" of "+TG.rp.cmds.length; draw(); const l=w.querySelector(".tg-rpl"), n=TG.rp.states[TG.rp.i], p=TG.rp.i?TG.rp.states[TG.rp.i-1]:null; if(l) l.innerHTML=(p?n.log.slice(p.log.length).map(evText).filter(Boolean):["The fight is about to start."]).map((x) =>{ return '<li>'+esc(x)+'</li>'; }).join(""); } });
  w.addEventListener("input",(e) =>{ const t=e.target; if(t.matches&&t.matches("[data-tgq]")){ TG.q=t.value; TG.lim=24; const l=document.getElementById("tgFoes"); if(l&&TG.cr) l.innerHTML=foeList(); } });
  w.addEventListener("toggle",(e) =>{ if(e.target.classList&&e.target.classList.contains("tg-log")) TG.logOpen=e.target.open; },true);
}
function back(){ if(TG.view==="replay"){ clearInterval(TG.rpT); TG.rpT=0; TG.st=TG.rp.back||TG.rp.states[TG.rp.states.length-1]; TG.view=TG.st&&TG.start?"field":"setup"; paint(); return; } if(TG.view==="field"){ if(TG.st&&!TG.st.over){ A.ask("Leave this fight? It stays saved on this device, and Resume brings it back.","Leave",() =>{ TG.view="setup"; TG.st=null; fightLoad().then((rec) =>{ TG.saved=rec; paint(); }); }); return; } TG.view="setup"; TG.st=null; paint(); return; } close(); }
function close(){ const w=document.getElementById("tg"); if(!w) return; w.classList.remove("on"); w.hidden=true; wakeSync(); if(A.ovQueue) A.ovQueue(); if(A.homeInert) try{ A.homeInert(); }catch(e){} if(TG.opener&&TG.opener.focus&&TG.opener.isConnected) try{ TG.opener.focus({preventScroll:true}); }catch(e){} }
function open(){ const w=dom(); TG.opener=document.activeElement; try{ TG.pcs=A.tgRoster?A.tgRoster():[]; }catch(e){ TG.pcs=[]; }
  if(!TG.pc&&TG.pcs.length) TG.pc=TG.pcs[0];
  w.hidden=false; if(TG.view!=="field") TG.view="setup"; paint(); requestAnimationFrame(() =>{ w.classList.add("on"); }); if(A.ovQueue) A.ovQueue(); try{ w.focus({preventScroll:true}); }catch(e){}
  if(TG.view==="setup"&&!TG.st) fightLoad().then((rec) =>{ if(rec&&rec.start&&rec.cmds&&!w.hidden&&TG.view==="setup"){ TG.saved=rec; paint(); } });
  if(!TG.cr) tgCreatures().then(() =>{ if(!w.hidden&&TG.view==="setup") paint(); },() =>{ const l=document.getElementById("tgFoes"); if(l) l.innerHTML='<p class="bk-f">The creature list could not be loaded. Check the connection and open the Training Ground again.</p>'; }); }
env.__tgOpen=open;
/* N22 build duel: the same group for both builds, so results compare. A ladder of groups: for 1 to 4 copies of one creature and for the
   Low, Moderate and High budgets of the level (DMG 2024), the strongest SRD creature without legendary actions that has an attack and fits
   (humanoid, undead, goblinoid first on a tie). The group where the current build's quick estimate (N30, TGE.sim.est) is closest to half
   is kept (the estimate shortlists 3, 30 fights pick one): a fight both builds always win or always lose tells nothing. Then 100 fights each, seeds 1000 to 1099 */
function duelLadder(lv){
 const {row, rank, cand, out, seen}=duelLadderStep1(lv);
  duelLadderStep2(row, out, cand, seen, rank); return out; }
function duelLadderStep1(lv){
const row=XPB[Math.max(1,Math.min(20,lv|0||1))-1], rank=function(c){ const t=String(c.ty||""); return /humanoid/.test(t)?0:/undead/.test(t)?1:/goblinoid/.test(t)?2:/giant|monstrosity/.test(t)?3:4; };
  const cand=(TG.cr||[]).filter((c) =>{ return c.srd&&!c.lg&&c.xp>0&&(c.act||[]).some((a) =>{ return a.k==="atk"&&(a.dmg||[]).length; }); }), out=[], seen={};
  return /** @type {any} */ ({row, rank, cand, out, seen});
}
function duelLadderStep2(row, out, cand, seen, rank){
  row.forEach((cap,bi) =>{ for(var k=1;k<=4;k++){ const f=cand.filter((c) =>{ return c.xp*k<=cap&&c.xp*k>=0.5*cap; }); if(!f.length) continue;
    f.sort((a,b) =>{ return b.xp-a.xp||rank(a)-rank(b)||(a.n<b.n?-1:1); }); const key=f[0].id+"x"+k; if(seen[key]) continue; seen[key]=1; out.push({c:f[0],k:k,xp:f[0].xp*k,band:["Low","Moderate","High"][bi]}); } });
  out.sort((a,b) =>{ return a.xp-b.xp||a.k-b.k; });
}
function duelFoes(g){ const f=[]; for(let i=0;i<g.k;i++) f.push(g.c); return f; }
/* pc: the current build. onDone gets the chosen group with the estimate (est), or null when the creature list cannot be loaded */
env.__tgDuelPick=function(pc,onDone,onStep){ if(!pc||!env.TGE||!TGE.sim){ onDone(null); return; } tgCreatures().then(() =>{
  /* the quick estimate shortlists the 3 groups closest to half, 30 fights each pick the one */
  let L=duelLadder(pc.level).map((g) =>{ g.est=TGE.sim.est(pc,g.c,g.k).p; return g; }).sort((a,b) =>{ return Math.abs(a.est-0.5)-Math.abs(b.est-0.5)||a.xp-b.xp; }).slice(0,3), i=0, best=null;
  if(!L.length){ onDone(null); return; }
  (function nx(){ if(i>=L.length){ onDone(best); return; } const g=L[i]; TGE.sim.duel(pc,duelFoes(g),30,2000,(r) =>{ g.cal=r.rate; if(!best||Math.abs(r.rate-0.5)<Math.abs(best.cal-0.5)-1e-9) best=g; i++; if(onStep) onStep(i,L.length); setTimeout(nx,0); }); })(); },() =>{ onDone(null); }); };
env.__tgEst=function(pc,g){ return env.TGE&&TGE.sim&&pc&&g?TGE.sim.est(pc,g.c,g.k).p:null; };
env.__tgDuel=function(pc,g,onDone,onStep){ if(!pc||!g||!env.TGE||!TGE.sim){ onDone(null); return; } TGE.sim.duel(pc,duelFoes(g),100,1000,onDone,onStep); };
function tgHash(){ const m=/^#fight=([A-Za-z0-9_-]{20,})$/.exec(location.hash||""); if(!m) return; const code=m[1]; try{ history.replaceState(null,"",location.pathname+location.search); }catch(e){} open(); fightOpenLink(code); }
tgHash(); addEventListener("hashchange",tgHash);
env.__tgBack=function(){ const w=document.getElementById("tg"); if(!w||w.hidden) return null; return back; };
env.__tgState=function(){ return {dice:TG.diceLast||null,rp:TG.rp?{i:TG.rp.i,n:TG.rp.cmds.length}:null,saved:!!TG.saved,view:TG.view,st:TG.st,pc:TG.pc,foes:TG.foes,allies:TG.allies,arena:TG.arena,cmds:TG.cmds,seed:TG.seed,cr:!!TG.cr}; };
addEventListener("resize",() =>{ if(TG.view==="field"&&TG.st){ const n=innerWidth<760?44:52; if(n!==TG.cell){ TG.cell=n; draw(); } } });
