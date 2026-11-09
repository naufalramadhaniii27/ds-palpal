import {env} from "./00-env.js";import {esc,ico} from "./00-bridge.js";import {paint,targetOk,wire} from "./31-ui-tg-field.js";
import {TGE} from "./20-engine.js";import "./25-sim.js";
env.TGE=TGE;/* the page global TGE (the engine used to be a classic script that set it) */
const TIERS=[["easy","Easy",.25,.25],["medium","Medium",.5,1],["hard","Hard",2,3],["extreme","Extreme",3,6],["infernal","Infernal",7,10],["deadly","Deadly",11,16],["legendary","Legendary",17,21]];
const ALLIES=[["Knight","Leads from the front and takes the hits"],["Scout","Shoots from far away"],["Priest Acolyte","Stays behind and strikes with radiant light"],["Mage Apprentice","Throws arcane bursts"],["Dire Wolf","Runs down a foe"],["Warrior Veteran","Hits hard up close"]];
function sq(list){ const o={}; list.forEach((p) =>{ o[p[0]+","+p[1]]=1; }); return o; }
function rect(x,y,w,h){ const o=[]; for(let i=0;i<w;i++) for(let j=0;j<h;j++) o.push([x+i,y+j]); return o; }
export const ARENAS=[{id:"field",n:"Open field",s:"Flat grass. Nowhere to hide",w:14,h:10,block:[],rough:[]},
  {id:"forest",n:"Forest clearing",s:"Trees block the way, bushes slow you down",w:14,h:10,block:[[4,2],[9,7],[6,8],[11,2],[2,7]],rough:rect(6,3,2,3).concat(rect(10,4,1,2))},
  {id:"crypt",n:"Old crypt",s:"Pillars and walls make narrow halls",w:14,h:10,block:rect(4,0,1,3).concat(rect(4,7,1,3),rect(9,0,1,3),rect(9,7,1,3),[[6,4],[7,5]]),rough:[]},
  {id:"bridge",n:"Broken bridge",s:"One narrow way across a gap",w:14,h:10,block:rect(5,0,4,4).concat(rect(5,6,4,4)),rough:rect(5,4,4,2)}];
export const TG={view:"setup",cr:null,load:null,pc:null,pcs:[],foes:{},allies:{},arena:"forest",tier:"easy",q:"",lim:24,st:null,undo:[],mode:"",act:null,pick:[],sel:null,oa:[],seed:0,cell:44,trial:{cls:"Fighter",lv:3}};
/* one fight in progress is kept in its own IndexedDB database (dnd-tg), not in the app's storage: the start state and the commands.
   Opening the Training Ground again offers Resume, which replays the commands from the start (the engine gives the same fight). */
let TGDB=null;
function tdb(){ if(TGDB) return TGDB; TGDB=new Promise((ok,no) =>{ try{ const r=indexedDB.open("dnd-tg",1); r.onupgradeneeded=function(){ r.result.createObjectStore("fight"); }; r.onsuccess=function(){ ok(r.result); }; r.onerror=function(){ no(r.error); }; }catch(e){ no(e); } }); return TGDB; }
let saveT=0; export function fightSave(){ if(TG.linkMode) return;/* a fight opened from a shared link never replaces the one saved here */ clearTimeout(saveT); saveT=setTimeout(() =>{ if(!TG.st||!TG.start) return; const rec={v:1,t:Date.now(),start:TG.start,cmds:TG.cmds,arena:TG.arena,name:TG.pc&&TG.pc.name,round:TG.st.round};
  tdb().then((d) =>{ d.transaction("fight","readwrite").objectStore("fight").put(rec,"cur"); }).catch(() =>{}); },400); }
export function fightLoad(){ return tdb().then((d) =>{ return new Promise((ok) =>{ const q=d.transaction("fight").objectStore("fight").get("cur"); q.onsuccess=function(){ ok(q.result||null); }; q.onerror=function(){ ok(null); }; }); }).catch(() =>{ return null; }); }
export function fightClear(){ TG.saved=null; tdb().then((d) =>{ d.transaction("fight","readwrite").objectStore("fight").delete("cur"); }).catch(() =>{}); }
function tgIc(k){ return ico?ico(k,""):""; }
export function tgCreatures(){ if(TG.cr) return Promise.resolve(TG.cr); if(TG.load) return TG.load;
  TG.load=fetch("data/tg-creatures.json").then((r) =>{ if(!r.ok) throw new Error("http "+r.status); return r.json(); }).then((j) =>{ TG.cr=j.creatures||[]; TG.byId={}; TG.cr.forEach((c) =>{ TG.byId[c.id]=c; }); return TG.cr; },(e) =>{ TG.load=null; throw e; });
  return TG.load; }
function crById(id){ return TG.byId&&TG.byId[id]; }
function crByName(n){ return (TG.cr||[]).filter((c) =>{ return c.n===n; })[0]; }
export function nFoes(){ return Object.keys(TG.foes).reduce((a,k) =>{ return a+TG.foes[k]; },0); }
export function nAllies(){ return Object.keys(TG.allies).length; }
export function dom(){ let w=document.getElementById("tg"); if(w) return w;
  w=document.createElement("div"); w.id="tg"; w.className="lrn tg noico"; w.hidden=true; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","tgT"); w.tabIndex=-1;
  w.innerHTML='<header class="lrn-h"><button type="button" class="lrn-ib" data-tg="back" id="tgBk" aria-label="Back">'+tgIc("ui-chev-l")+'</button><div class="lrn-tt"><b id="tgT">Training Ground</b><small id="tgS"></small></div><button type="button" class="lrn-ib" data-tg="close" aria-label="Close">'+tgIc("ui-close")+'</button></header><div class="lrn-b tg-b" id="tgB"></div><p class="lrn-live sr" id="tgLive" aria-live="polite"></p>';
  document.body.appendChild(w); wire(w); return w; }
export function tgSay(t){ const l=document.getElementById("tgLive"); if(l){ l.textContent=""; l.textContent=t; } }
/* ---------- TG1 setup ---------- */
function crLine(c){ return "AC "+c.ac+", HP "+c.hp+", "+(c.sp.walk||0)+" ft"+(c.sp.fly?", fly "+c.sp.fly:""); }
export function setupHtml(){
 let {h}=setupHtmlStep1();
  ({h}=setupHtmlStep2(h));
  return h; }
function setupHtmlStep1(){
let h='', pcs=TG.pcs;
  if(TG.saved) h+='<div class="tg-p tg-resume"><b>A fight is waiting</b><p>'+esc(TG.saved.name||"Your hero")+' in '+esc((ARENAS.filter((a) =>{ return a.id===TG.saved.arena; })[0]||{n:"the field"}).n)+', round '+(TG.saved.round||1)+'.</p><div class="tg-acts"><button type="button" class="btn pri press" data-tg="resume">Resume the fight</button><button type="button" class="btn press" data-tg="drop">Forget it</button></div></div>';
  h+='<section class="tg-s"><h2><span class="tg-n">1</span>Who goes in</h2><div class="tg-cards">'+pcs.map((p,i) =>{ const on=TG.pc&&TG.pc.id===p.id&&!TG.pc.trial; return '<button type="button" class="tg-card'+(on?' on':'')+'" data-tgpc="'+i+'" aria-pressed="'+on+'"><b>'+esc(p.name)+'</b><small>'+esc((p.species?p.species+" ":"")+p.cls)+'</small><span class="tg-st">AC '+p.ac+' · HP '+p.max+' · '+p.attacks.length+' attack'+(p.attacks.length===1?'':'s')+'</span></button>'; }).join("")+
    '<div class="tg-card tg-try'+(TG.pc&&TG.pc.trial?' on':'')+'"><b>Try a class</b><label><span>Class</span><select data-tgtry="cls">'+tryClasses().map((c) =>{ return '<option'+(c===TG.trial.cls?' selected':'')+'>'+esc(c)+'</option>'; }).join("")+'</select></label><label><span>Level</span><input type="number" min="1" max="20" value="'+TG.trial.lv+'" data-tgtry="lv"></label><button type="button" class="btn press" data-tg="try">Create the hero</button></div></div></section>';
  h+='<section class="tg-s"><h2><span class="tg-n">2</span>What waits for you</h2><div class="tg-tiers" role="group" aria-label="Difficulty">'+TIERS.map((t) =>{ return '<button type="button" class="lib-chip'+(TG.tier===t[0]?' on':'')+'" data-tgtier="'+t[0]+'" aria-pressed="'+(TG.tier===t[0])+'">'+t[1]+' <small>CR '+fmtCr(t[2])+(t[3]!==t[2]?'-'+fmtCr(t[3]):'')+'</small></button>'; }).join("")+'</div>'+
    '<label class="tg-q"><span class="vh">Search creatures</span><input type="search" placeholder="Search a creature" value="'+esc(TG.q)+'" data-tgq="1"></label><div class="tg-list" id="tgFoes">'+(TG.cr?foeList():'<p class="bk-f">Loading creatures.</p>')+'</div></section>';
  h+='<section class="tg-s"><h2><span class="tg-n">3</span>Who comes with you <small>up to 3</small></h2><div class="tg-cards">'+ALLIES.map((a) =>{ const c=crByName(a[0]), on=!!TG.allies[a[0]]; if(!c&&TG.cr) return ""; return '<button type="button" class="tg-card'+(on?' on':'')+'" data-tgally="'+esc(a[0])+'" aria-pressed="'+on+'"><b>'+esc(a[0])+'</b><small>'+esc(a[1])+'</small>'+(c?'<span class="tg-st">CR '+esc(c.cr)+' · '+esc(crLine(c))+'</span>':'')+'</button>'; }).join("")+'</div></section>';
  return /** @type {any} */ ({h});
}
function setupHtmlStep2(h){
  h+='<section class="tg-s"><h2><span class="tg-n">4</span>Where you train</h2><div class="tg-cards">'+ARENAS.map((a) =>{ const on=TG.arena===a.id; return '<button type="button" class="tg-card tg-arena'+(on?' on':'')+'" data-tgarena="'+a.id+'" aria-pressed="'+on+'">'+arenaPic(a)+'<b>'+esc(a.n)+'</b><small>'+esc(a.s)+'</small></button>'; }).join("")+'</div></section>';
  h+=sizeHtml();
  const nf=nFoes(), na=nAllies(), ok=TG.pc&&nf;
  h+='<div class="tg-bar"><span>'+(TG.pc?esc(TG.pc.name)+', ':'')+nf+' creature'+(nf===1?'':'s')+', '+na+' companion'+(na===1?'':'s')+'</span><button type="button" class="btn pri press" data-tg="enter"'+(ok?'':' aria-disabled="true"')+'>Enter the field</button></div>';
  return /** @type {any} */ ({h});
}
/* T11 N21 encounter size: the XP budget per character from the 2024 Dungeon Master's Guide (Low, Moderate, High) for the hero's level,
   against the XP of the creatures picked (2024: no multiplier for the number of creatures). Companions are not counted: they make it easier */
export const XPB=[[50,75,100],[100,150,200],[150,225,400],[250,375,500],[500,750,1100],[600,1000,1400],[750,1300,1700],[1000,1700,2100],[1300,2000,2600],[1600,2300,3100],[1900,2900,4100],[2200,3700,4700],[2600,4200,5400],[2900,4900,6200],[3300,5400,7800],[3800,6100,9800],[4500,7200,11700],[5000,8700,14200],[5500,10700,17200],[6400,13200,22000]];
function xpFoes(){ return Object.keys(TG.foes).reduce((a,id) =>{ const c=crById(id); return a+(c?c.xp*TG.foes[id]:0); },0); }
function budget(){ const lv=Math.max(1,Math.min(20,(TG.pc&&TG.pc.level)||1)); return XPB[lv-1]; }
function sizeOf(xp){ const b=budget(); return xp<b[0]?"Under Low":xp<b[1]?"Low":xp<b[2]?"Moderate":xp<=b[2]*1.5?"High":"Above High"; }
function sizeHtml(){ if(!TG.pc||!TG.cr) return ""; const b=budget(), xp=xpFoes(), mx=b[2]*1.5, pct=function(v){ return Math.min(100,v/mx*100).toFixed(1); };
  return '<div class="tg-size" role="group" aria-label="Encounter size"><div class="tg-sz-t"><b>'+sizeOf(xp)+'</b><span>'+xp+' XP · Low '+b[0]+', Moderate '+b[1]+', High '+b[2]+' for level '+(TG.pc.level||1)+'</span></div><div class="tg-sz-b" aria-hidden="true"><i style="width:'+pct(xp)+'%"></i><s style="left:'+pct(b[0])+'%"></s><s style="left:'+pct(b[1])+'%"></s><s style="left:'+pct(b[2])+'%"></s></div>'+(nFoes()?'<button type="button" class="btn press" data-tg="balance">Make it Moderate</button>':'')+(nAllies()?'<small>Companions are not counted. They make it easier.</small>':'')+'</div>'; }
/* Make it Moderate: changes the counts of the picked creatures until the total XP is as close as it gets to the Moderate budget without going over High */
export function balance(){ const b=budget(), ids=Object.keys(TG.foes); if(!ids.length) return; let best=null;
  if(ids.length>5){ const c=ids.map(() =>{ return 1; }), xpOf=function(){ return c.reduce((a,x,j) =>{ return a+x*crById(ids[j]).xp; },0); };/* many kinds: one of each, then add the cheapest while it stays under Moderate */
    const order=ids.map((id,j) =>{ return j; }).sort((x,y) =>{ return crById(ids[x]).xp-crById(ids[y]).xp; }); let go=true; while(go){ go=false; for(let q=0;q<order.length;q++){ const j=order[q]; if(c.reduce((a,x) =>{ return a+x; },0)>=12) break; c[j]++; if(xpOf()>b[1]){ c[j]--; } else { go=true; break; } } }
    best=xpOf()<=b[2]?{c:c}:null; }
  else (function walk(i,cur){ if(i===ids.length){ const n=cur.reduce((a,x) =>{ return a+x; },0); if(!n||n>12) return; const xp=cur.reduce((a,x,j) =>{ return a+x*crById(ids[j]).xp; },0); if(xp>b[2]) return; const d=Math.abs(xp-b[1]); if(!best||d<best.d) best={d:d,c:cur.slice()}; return; }
    for(let k=0;k<=8;k++){ cur.push(k); walk(i+1,cur); cur.pop(); } })(0,[]);
  if(!best){ tgSay("Even one of these is above High for this level."); flash("Even one of these is above High for this level."); return; }
  ids.forEach((id,j) =>{ if(best.c[j]) TG.foes[id]=best.c[j]; else delete TG.foes[id]; }); paint(); tgSay("Now "+sizeOf(xpFoes())+": "+xpFoes()+" XP."); }
function fmtCr(v){ return v===.25?"1/4":v===.5?"1/2":v===.125?"1/8":String(v); }
function tryClasses(){ const c=env.CLASSES?Object.keys(env.CLASSES).filter((k) =>{ return !/\(2014\)/.test(k); }):[]; return c.length?c:["Barbarian","Bard","Cleric","Druid","Fighter","Monk","Paladin","Ranger","Rogue","Sorcerer","Warlock","Wizard"]; }
function arenaPic(a){ let W=a.w, H=a.h, b=sq(a.block), r=sq(a.rough), s='<svg class="tg-map" viewBox="0 0 '+W+' '+H+'" aria-hidden="true"><rect width="'+W+'" height="'+H+'" class="g"/>';
  Object.keys(r).forEach((k) =>{ const p=k.split(","); s+='<rect x="'+p[0]+'" y="'+p[1]+'" width="1" height="1" class="r"/>'; }); Object.keys(b).forEach((k) =>{ const p=k.split(","); s+='<rect x="'+p[0]+'" y="'+p[1]+'" width="1" height="1" class="w"/>'; }); return s+'</svg>'; }
export function foeList(){ const t=TIERS.filter((x) =>{ return x[0]===TG.tier; })[0], q=TG.q.trim().toLowerCase();
  const L=TG.cr.filter((c) =>{ return q?c.n.toLowerCase().indexOf(q)>=0:(c.crn>=t[2]&&c.crn<=t[3]); }).sort((a,b) =>{ return a.crn-b.crn||(a.n<b.n?-1:1); });
  if(!L.length) return '<p class="bk-f">No creature with that name.</p>';
  return L.slice(0,TG.lim).map((c) =>{ const n=TG.foes[c.id]||0; return '<div class="tg-foe'+(n?' on':'')+'"><span><b>'+esc(c.n)+'</b><small>CR '+esc(c.cr)+' · '+esc(c.ty)+' · '+esc(crLine(c))+'</small><i>Monster Manual 2024, page '+c.pg+(c.srd?' · SRD 5.2.1':'')+'</i></span><span class="tg-cnt"><button type="button" data-tgf="'+c.id+'" data-d="-1" aria-label="One less '+esc(c.n)+'"'+(n?'':' disabled')+'>−</button><output aria-live="polite">'+n+'</output><button type="button" data-tgf="'+c.id+'" data-d="1" aria-label="One more '+esc(c.n)+'">+</button></span></div>'; }).join("")+(L.length>TG.lim?'<button type="button" class="lib-more" data-tg="more">Show more ('+(L.length-TG.lim)+')</button>':''); }
/* ---------- TG2 to TG4 field ---------- */
function tgPlace(ar){ const units=[], used={}, take=function(x,y,s){ for(let i=0;i<s;i++) for(let j=0;j<s;j++) used[(x+i)+","+(y+j)]=1; }, free=function(x,y,s){ if(x<0||y<0||x+s>ar.w||y+s>ar.h) return false; for(let i=0;i<s;i++) for(let j=0;j<s;j++){ const k=(x+i)+","+(y+j); if(used[k]||sq(ar.block)[k]) return false; } return true; };
  /* the spiral placement of the plan (5d): each group around its own corner, never on a wall, never on top of another token */
  function put(u,cx,cy){ for(let r=0;r<12;r++) for(let dx=-r;dx<=r;dx++) for(let dy=-r;dy<=r;dy++){ if(Math.max(Math.abs(dx),Math.abs(dy))!==r) continue; const x=cx+dx, y=cy+dy; if(free(x,y,u.size)){ u.pos=[x,y]; take(x,y,u.size); units.push(u); return; } } }
  put(TGE.fromSheet(TG.pc,"pc",[1,Math.floor(ar.h/2)]),1,Math.floor(ar.h/2));
  Object.keys(TG.allies).forEach((n,i) =>{ const c=crByName(n); if(c){ const u=TGE.fromCreature(c,"a"+i,[0,0],"ally"); put(u,1,Math.floor(ar.h/2)+1); } });
  let k=0; Object.keys(TG.foes).forEach((id) =>{ const c=crById(id); for(let i=0;i<TG.foes[id];i++){ const u=TGE.fromCreature(c,"f"+(k++),[0,0],"foe"); if(TG.foes[id]>1) u.name=c.n+" "+(i+1); put(u,ar.w-2,Math.floor(ar.h/2)); } });
  return units; }
export function enter(){ if(!TG.pc||!nFoes()) { tgSay("Pick who goes in and at least one creature."); return; } const ar=ARENAS.filter((a) =>{ return a.id===TG.arena; })[0];
  let seed=0; if(TG.forceSeed!=null){ seed=TG.forceSeed>>>0; TG.forceSeed=null; } else { try{ const a=new Uint32Array(1); crypto.getRandomValues(a); seed=a[0]; }catch(e){ seed=Date.now()>>>0; } } TG.seed=seed;
  TG.start=TGE.create({seed:seed,w:ar.w,h:ar.h,block:sq(ar.block),rough:sq(ar.rough),units:tgPlace(ar)}); TG.st=TGE.step(TG.start,{t:"start"}); fightSave(); TG.undo=[]; TG.mode=""; TG.act=null; TG.pick=[]; TG.oa=[]; TG.view="field"; TG.cmds=[{t:"start"}]; TG.hpPrev={};
  vtPaint(); tgSay("The fight starts. "+cur().name+" goes first."); }
/* G7 queue 2: View Transitions between the setup and the board (a cross-fade the browser draws). Only with motion on, plain paint otherwise */
export function vtPaint(){ const M=env.__MI; if(document.startViewTransition&&M&&!(M.rm&&M.rm())&&M.mode!=="off"){ try{ document.startViewTransition(paint); return; }catch(e){} } paint(); }
export function cur(){ return TG.st.units[TGE.now(TG.st)]; }
export function run(c){ const before=TG.st, s=TGE.step(TG.st,c); if(s.err){ tgSay(errText(s.err)); flash(errText(s.err)); return false; } TG.undo.push(before); if(TG.undo.length>60) TG.undo.shift(); TG.st=s; TG.cmds.push(c); if(s.over) fightClear(); else fightSave();
  const fresh=s.log.slice(before.log.length); fresh.forEach((e) =>{ if(e.t==="oa-open") TG.oa.push({by:e.by,u:e.u}); }); tgSay(fresh.map(evText).filter(Boolean).join(" ")); showDice(fresh); feel(fresh); return true; }
/* G7 queue 8: a short vibration when a hero or ally takes damage, a longer one when it drops. Follows the app setting (MI.buzz: vibration
   on, motion not reduced). Gamepad support is left out: no player asked, and the board already works with the keyboard */
function feel(fresh){ const M=env.__MI; if(!M||!M.buzz||!TG.st) return; let k="";
  fresh.forEach((e) =>{ const u=e.u&&TG.st.units[e.u]; if(!u||u.side==="foe") return; if(e.t==="down"||e.t==="dead") k="heavy"; else if(e.t==="dmg"&&e.amt>0&&k!=="heavy") k="medium"; }); if(k) M.buzz(k); }
/* N23 honest dice: the d20s of attacks and death saves land on the 3D table with the numbers the engine rolled (N27 dice take given
   values). Only with motion on, at most 6 dice, and not while the previous dice are still rolling (no queue of old rolls) */
function showDice(fresh){ const M=env.__MI; if(!env.__dice3d||TG.diceBusy||!M||(M.rm&&M.rm())||M.mode==="off") return; let v=[];
  fresh.forEach((e) =>{ if(e.t==="atk"&&e.roll) v=v.concat(e.roll); else if(e.t==="ds"&&e.v>=1&&e.v<=20) v.push(e.v); }); v=v.slice(0,6); if(!v.length) return;
  TG.diceBusy=1; env.__dice3d.roll(v.map(() =>{ return 20; }),v).then((r) =>{ TG.diceBusy=0; TG.diceLast={want:v,got:r}; },() =>{ TG.diceBusy=0; }); }
function errText(e){ return {"out of reach":"Too far for that attack.","out of range":"Out of range.","no action left":"No action left this turn.","square taken":"Someone is standing there.","recharging":"Not recharged yet.","no reaction":"The reaction is already used.","target is dead":"That one is down already.","not enough movement":"Not enough movement left.","no spell slot":"No spell slot left for that.","one spell slot per turn":"Only one spell slot can be spent on a turn.","no target":"Pick a target first.","no legendary actions left":"No legendary actions left this round.","not on its own turn":"Legendary actions are used on another creature's turn."}[e]||e; }
function nm(id){ const u=TG.st.units[id]; return u?u.name:id; }
export function evText(e){ let r=evTextA(e); if(r===undefined) r=evTextB(e); if(r===undefined) r=evTextC(e); return r===undefined?"":r; }
function evTextA(e){ switch(e.t){
  case "atk": return nm(e.u)+(e.oa?" (Opportunity Attack)":"")+" attacks "+nm(e.tg)+" with "+e.act+": "+e.roll.join(" and ")+" "+(e.bon<0?"− "+(-e.bon):"+ "+e.bon)+" = "+e.tot+" against AC "+e.ac+". "+(e.crit?"Critical Hit!":e.hit?"Hit.":"Miss.");
  case "dmg": return nm(e.u)+" takes "+e.amt+(e.type?" "+e.type:"")+" damage, "+e.hp+" HP left.";
  case "save": return nm(e.u)+(e.auto?" fails the save automatically.":" rolls a save: "+e.tot+" against DC "+e.dc+", "+(e.ok?"success.":"failure."));
  case "save-use": return nm(e.u)+" uses "+e.act+" (DC "+e.dc+" "+e.sv.toUpperCase()+").";
  case "multi": return nm(e.u)+" starts a Multiattack: "+e.list.map((x) =>{ return x.replace("|"," or "); }).join(", ")+".";
  case "move": return nm(e.u)+" moves "+e.ft+" feet.";
  case "oa-open": return nm(e.by)+" can make an Opportunity Attack on "+nm(e.u)+".";
  case "down": return nm(e.u)+" drops to 0 Hit Points.";
  case "dead": return nm(e.u)+(e.why==="massive"?" dies from massive damage.":" is down for good.");
  case "ds": return nm(e.u)+" death save: "+e.v+".";
  } }
function evTextB(e){ switch(e.t){
  case "recharge": return e.act+" "+(e.ok?"recharged":"not recharged")+" ("+e.v+").";
  case "turn": return nm(e.u)+"'s turn.";
  case "round": return "Round "+e.n+".";
  case "dash": return nm(e.u)+" dashes."; case "disengage": return nm(e.u)+" disengages."; case "dodge": return nm(e.u)+" dodges.";
  } }
function evTextC(e){ switch(e.t){
  case "manual": return nm(e.u)+" uses "+(e.act||"an action")+(e.note?": "+e.note:"")+".";
  case "heal": return nm(e.u)+" regains "+e.amt+" HP.";
  case "over": return e.w==="pc"?"Victory!":"Defeat.";
  case "lg": return nm(e.u)+" uses a legendary action: "+e.act+" ("+e.left+" left).";
  case "cast": return nm(e.u)+" casts "+e.sp+(e.lvl?" (level "+e.lvl+" slot)":"")+".";
  case "conc-end": return nm(e.u)+" stops concentrating on "+(e.sp||"the old spell")+".";
  case "conc": return nm(e.u)+" Concentration save "+e.roll+" against DC "+e.dc+": "+(e.ok?"held.":"broken.");
  } }
export function flash(t){ const b=document.getElementById("tgMsg"); if(b){ b.textContent=t; b.classList.remove("on"); void b.offsetWidth; b.classList.add("on"); } }
export function hpPct(u){ return Math.max(0,Math.min(1,u.hp/u.max)); }
export function fieldHtml(){ const st=TG.st, u=cur();
  const order='<ol class="tg-ord" aria-label="Turn order">'+st.order.map((id) =>{ const x=st.units[id]; return '<li class="'+x.side+(id===u.id?' now':'')+(x.dead?' out':'')+'"><button type="button" data-tgu="'+id+'" aria-label="'+esc(x.name)+', '+x.hp+' of '+x.max+' HP'+(id===u.id?', turn now':'')+'"><b>'+esc(ini(x.name))+'</b><i style="--p:'+(TG.hpPrev&&TG.hpPrev[id]!=null?TG.hpPrev[id]:hpPct(x))+'" data-p="'+hpPct(x)+'"></i></button></li>'; }).join("")+'</ol>';
  let h=order+'<div class="tg-wrap" id="tgWrap"><canvas id="tgCv" tabindex="0" aria-label="Battle grid. Arrow keys move the cursor, Enter picks the square"></canvas></div><p class="tg-msg" id="tgMsg" role="status"></p>';
  h+=st.over?overHtml():panelHtml(u);
  h+='<details class="tg-log"'+(TG.logOpen?' open':'')+'><summary>The log</summary><ol>'+st.log.slice(-40).map(evText).filter(Boolean).reverse().map((t) =>{ return '<li>'+esc(t)+'</li>'; }).join("")+'</ol></details>';
  return h; }
export function ini(n){ const p=String(n).split(/\s+/); return (p[0].charAt(0)+(p[1]?(/^\d+$/.test(p[1])?p[1]:p[1].charAt(0)):"")).toUpperCase(); }
function panelHtml(u){
 const {t, left}=panelHtmlStep1(u);
  if(TG.oa.length){ const o=TG.oa[0], by=TG.st.units[o.by], m=(by.acts||[]).filter((a) =>{ return a.k==="atk"&&a.mr!=="r"; })[0];
    return '<div class="tg-p tg-react"><b>Reaction</b><p>'+esc(by.name)+' can make an Opportunity Attack: '+esc(nm(o.u))+' left its reach.</p><div class="tg-acts">'+(m&&by.turn.r?'<button type="button" class="btn pri press" data-tgoa="'+esc(m.n)+'">Attack with '+esc(m.n)+'</button>':'')+'<button type="button" class="btn press" data-tgoa="">Let it go</button></div></div>'; }
  const {acts, bon, ORD, slotsTxt}=panelHtmlStep2(u);
  const _panelHtmlStep3=panelHtmlStep3(u, t, ORD);
  const {spl, ma}=_panelHtmlStep3;
  let {lens}=_panelHtmlStep3;
  const _panelHtmlStep4=panelHtmlStep4(lens, u);
  const {hint}=_panelHtmlStep4;
  lens=_panelHtmlStep4.lens;
  return '<div class="tg-p"><div class="tg-who"><b>'+esc(u.name)+'</b><span>HP '+u.hp+'/'+u.max+' · AC '+u.ac+' · '+left+' ft left</span><span class="tg-pips"><i class="'+(t.a?'on':'')+'">Action</i><i class="'+(t.b?'on':'')+'">Bonus</i><i class="'+(t.r?'on':'')+'">Reaction</i></span></div>'+ma+(hint?'<p class="tg-hint">'+hint+'</p>':'')+lens+
    (u.down?'<p class="tg-hint">At 0 Hit Points. End the turn: the death save is rolled at the start of the next one.</p>':'')+
    '<div class="tg-acts"><button type="button" class="btn press'+(TG.mode==="move"?' on':'')+'" data-tg="move"'+(left&&!u.down?'':' disabled')+'>Move</button>'+acts+'</div>'+(bon?'<div class="tg-acts"><small class="tg-l">Bonus Action</small>'+bon+'</div>':'')+(spl?'<div class="tg-acts"><small class="tg-l">Spells'+(slotsTxt?' · slots '+esc(slotsTxt):'')+'</small>'+spl+'</div>':'')+spellBar(u)+
    panelHtmlTail(u,t); }
function panelHtmlTail(u,t){ return '<div class="tg-acts"><button type="button" class="btn press" data-tgx="dash"'+(t.a?'':' disabled')+'>Dash</button><button type="button" class="btn press" data-tgx="disengage"'+(t.a?'':' disabled')+'>Disengage</button><button type="button" class="btn press" data-tgx="dodge"'+(t.a?'':' disabled')+'>Dodge</button>'+(u.cond.prone?'<button type="button" class="btn press" data-tgx="stand">Stand up</button>':'')+'</div>'+
    (TG.mode==="save"?'<div class="tg-acts"><button type="button" class="btn pri press" data-tg="savego"'+(TG.pick.length?'':' disabled')+'>Done ('+TG.pick.length+')</button><button type="button" class="btn press" data-tg="cancel">Cancel</button></div>':'')+
    lgHtml(u)+'<div class="tg-acts tg-end"><button type="button" class="btn press" data-tg="undo"'+(TG.undo.length?'':' disabled')+'>Undo</button><button type="button" class="btn pri press tg-et" data-tg="end">End Turn</button></div></div>'; }
function panelHtmlStep1(u){
const t=u.turn, left=TGE.speedLeft(u);
  return /** @type {any} */ ({t, left});
}
function panelHtmlStep2(u){
  const acts=(u.acts||[]).map((a,i) =>{ const lab=a.k==="atk"?a.n+" "+(a.hit>=0?"+":"")+a.hit:a.k==="save"?a.n+" (DC "+a.dc+")":a.n; const used=a.rc&&u.used[a.n];
    return '<button type="button" class="btn press tg-a k-'+a.k+(TG.act===a.n?' on':'')+'" data-tga="'+i+'"'+(used?' disabled':'')+' title="'+esc(a.t||"")+'">'+esc(lab)+(a.rc?' <small>'+(used?'recharging':'recharge '+a.rc+'-6')+'</small>':'')+'</button>'; }).join("");
  const bon=(u.bonus||[]).map((a,i) =>{ return '<button type="button" class="btn press tg-a" data-tgb="'+i+'" title="'+esc(a.t||"")+'">'+esc(a.n)+'</button>'; }).join("");
  const ORD=["1st","2nd","3rd","4th","5th","6th","7th","8th","9th"], slotsTxt=(u.slots||[]).map((n,i) =>{ return n>0?ORD[i]+" "+n:""; }).filter(Boolean).join(", ");
  return /** @type {any} */ ({acts, bon, ORD, slotsTxt});
}
function panelHtmlStep3(u, t, ORD){
  const spl=(u.spells||[]).map((x,i) =>{ const need=x.l>0&&!(u.slots||[]).some((n,k) =>{ return k+1>=x.l&&n>0; }); return '<button type="button" class="btn press tg-a k-'+(x.k==="heal"?"heal":x.k==="save"?"save":"atk")+(TG.sp===i&&TG.mode==="spell"?' on':'')+'" data-tgsp="'+i+'"'+(need?' disabled':'')+' title="'+esc(x.t||"")+'">'+esc(x.n)+' <small>'+(x.l?ORD[x.l-1]:'cantrip')+(x.time==="b"?', bonus':'')+(x.c?', conc.':'')+'</small></button>'; }).join("")+
    (u.manual||[]).map((x,i) =>{ return '<button type="button" class="btn press tg-a k-man" data-tgman="'+i+'" title="'+esc(x.t||"")+'">'+esc(x.n)+' <small>by hand</small></button>'; }).join("");
  const ma=t.ma&&t.ma.length?'<p class="tg-hint">Multiattack: '+t.ma.length+' left ('+esc(t.ma.map((x) =>{ return x.replace("|"," or "); }).join(", "))+')</p>':'';
  let lens="";/* N20 odds lens: every target this attack can reach, with the exact chances */
  return /** @type {any} */ ({spl, ma, lens});
}
function panelHtmlStep4(lens, u){
  if(TG.mode==="target"&&TG.act){ const rows=Object.keys(TG.st.units).map((id) =>{ return TG.st.units[id]; }).filter((x) =>{ return targetOk(x); }).map((x) =>{ const o=TGE.odds(TG.st,u.id,x.id,TG.act); return o?{x:x,o:o}:null; }).filter(Boolean).sort((a,b) =>{ return b.o.kill-a.o.kill||b.o.hit-a.o.hit; });
    if(rows.length) lens='<div class="tg-lens" aria-label="Chances with '+esc(TG.act)+'"><small class="tg-l">'+esc(TG.act)+': chance to hit, average damage, chance to drop</small>'+rows.map((r) =>{ const pc=function(v){ return Math.round(v*100)+"%"; }; return '<button type="button" class="tg-lr" data-tgu="'+r.x.id+'"><b>'+esc(r.x.name)+'</b><span>'+pc(r.o.hit)+' hit'+(r.o.adv>0?' (Adv.)':r.o.adv<0?' (Dis.)':'')+'</span><span>'+r.o.avg.toFixed(1)+' dmg</span><span>'+pc(r.o.kill)+' drop</span></button>'; }).join("")+'</div>'; }
  const hint=TG.mode==="lgtarget"?"Tap the creature for the legendary attack.":TG.mode==="spell"?"Tap each target, then Cast.":TG.mode==="move"?"Tap a lit square to move there.":TG.mode==="target"?"Tap the creature to attack.":TG.mode==="save"?"Tap each creature in the area, then Done.":"";
  return /** @type {any} */ ({hint, lens});
}
function lgHtml(u){ let h=""; Object.keys(TG.st.units).forEach((id) =>{ const x=TG.st.units[id]; if(id===u.id||!x.lgn||x.dead||x.down) return;
    h+='<div class="tg-acts tg-lg"><small class="tg-l">Legendary: '+esc(x.name)+' ('+x.lgLeft+' of '+x.lgn+' left)</small>'+x.lg.map((a,i) =>{ const r=TGE.lgAct(x,a.n), k=r?r.k:a.k; return '<button type="button" class="btn press tg-a k-'+(k==="atk"?"atk":k==="save"?"save":"man")+'" data-tglg="'+id+'|'+i+'"'+(x.lgLeft?'':' disabled')+' title="'+esc(a.t||"")+'">'+esc(a.n)+'</button>'; }).join("")+'</div>'; });
  return h; }
function spellBar(u){ if(TG.mode!=="spell") return ""; const x=u.spells[TG.sp]; if(!x) return ""; const lv=[], ORD=["1st","2nd","3rd","4th","5th","6th","7th","8th","9th"];
  if(x.l>0) (u.slots||[]).forEach((n,k) =>{ if(k+1>=x.l&&n>0) lv.push(k+1); }); if(lv.length&&lv.indexOf(TG.lvl)<0) TG.lvl=lv[0];
  return '<div class="tg-acts tg-spbar">'+(lv.length>1?'<label class="tg-lv"><span>Slot</span><select data-tglv="1">'+lv.map((l) =>{ return '<option value="'+l+'"'+(l===TG.lvl?' selected':'')+'>'+ORD[l-1]+'</option>'; }).join("")+'</select></label>':'')+'<button type="button" class="btn pri press" data-tg="castgo"'+(TG.pick.length?'':' disabled')+'>Cast ('+TG.pick.length+')</button><button type="button" class="btn press" data-tg="cancel">Cancel</button></div>'; }
function overHtml(){ const won=TG.st.over==="won"; return '<div class="tg-p tg-over"><h2>'+(won?"Victory":"Defeat")+'</h2><p>'+(won?"Every creature is down. ":"Your side is down. ")+'Round '+TG.st.round+'. Nothing on your sheet changed.</p><div class="tg-acts"><button type="button" class="btn pri press" data-tg="again">Fight again</button><button type="button" class="btn press" data-tg="replay">Watch the replay</button><button type="button" class="btn press" data-tg="sharefight">Share this fight</button><button type="button" class="btn press" data-tg="setup">Change the setup</button><button type="button" class="btn press" data-tg="close">Close</button></div></div>'; }
