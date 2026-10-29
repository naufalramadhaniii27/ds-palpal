/* G7 TG1 to TG4 Training Ground screens. Plan: claude/rencana-kerja-training-ground.md parts 2, 5, 6 and 8.
   Setup (TG1): 1 Who goes in (characters of this device, or Try a class), 2 What waits for you (difficulty, creatures with counts),
   3 Who comes with you (up to 3 companions), 4 Where you train (arena). Field (TG2 to TG4): a grid drawn on a canvas, the turn order,
   reach squares for a move, the actions of the unit whose turn it is (from the sheet or the stat block), targets, Opportunity Attacks
   as a reaction card, a log, End Turn and Undo. The player gives every command for every token: there is no enemy AI.
   The sheet is never changed. Creature data is fetched the first time (data/tg-creatures.json) and kept by the service worker. */
var TIERS=[["easy","Easy",.25,.25],["medium","Medium",.5,1],["hard","Hard",2,3],["extreme","Extreme",3,6],["infernal","Infernal",7,10],["deadly","Deadly",11,16],["legendary","Legendary",17,21]];
var ALLIES=[["Knight","Leads from the front and takes the hits"],["Scout","Shoots from far away"],["Priest Acolyte","Stays behind and strikes with radiant light"],["Mage Apprentice","Throws arcane bursts"],["Dire Wolf","Runs down a foe"],["Warrior Veteran","Hits hard up close"]];
function sq(list){ var o={}; list.forEach(function(p){ o[p[0]+","+p[1]]=1; }); return o; }
function rect(x,y,w,h){ var o=[]; for(var i=0;i<w;i++) for(var j=0;j<h;j++) o.push([x+i,y+j]); return o; }
var ARENAS=[{id:"field",n:"Open field",s:"Flat grass. Nowhere to hide",w:14,h:10,block:[],rough:[]},
  {id:"forest",n:"Forest clearing",s:"Trees block the way, bushes slow you down",w:14,h:10,block:[[4,2],[9,7],[6,8],[11,2],[2,7]],rough:rect(6,3,2,3).concat(rect(10,4,1,2))},
  {id:"crypt",n:"Old crypt",s:"Pillars and walls make narrow halls",w:14,h:10,block:rect(4,0,1,3).concat(rect(4,7,1,3),rect(9,0,1,3),rect(9,7,1,3),[[6,4],[7,5]]),rough:[]},
  {id:"bridge",n:"Broken bridge",s:"One narrow way across a gap",w:14,h:10,block:rect(5,0,4,4).concat(rect(5,6,4,4)),rough:rect(5,4,4,2)}];
var TG={view:"setup",cr:null,load:null,pc:null,pcs:[],foes:{},allies:{},arena:"forest",tier:"easy",q:"",lim:24,st:null,undo:[],mode:"",act:null,pick:[],sel:null,oa:[],seed:0,cell:44,trial:{cls:"Fighter",lv:3}};
/* one fight in progress is kept in its own IndexedDB database (dnd-tg), not in the app's storage: the start state and the commands.
   Opening the Training Ground again offers Resume, which replays the commands from the start (the engine gives the same fight). */
var TGDB=null;
function tdb(){ if(TGDB) return TGDB; TGDB=new Promise(function(ok,no){ try{ var r=indexedDB.open("dnd-tg",1); r.onupgradeneeded=function(){ r.result.createObjectStore("fight"); }; r.onsuccess=function(){ ok(r.result); }; r.onerror=function(){ no(r.error); }; }catch(e){ no(e); } }); return TGDB; }
var saveT=0; function fightSave(){ clearTimeout(saveT); saveT=setTimeout(function(){ if(!TG.st||!TG.start) return; var rec={v:1,t:Date.now(),start:TG.start,cmds:TG.cmds,arena:TG.arena,name:TG.pc&&TG.pc.name,round:TG.st.round};
  tdb().then(function(d){ d.transaction("fight","readwrite").objectStore("fight").put(rec,"cur"); }).catch(function(){}); },400); }
function fightLoad(){ return tdb().then(function(d){ return new Promise(function(ok){ var q=d.transaction("fight").objectStore("fight").get("cur"); q.onsuccess=function(){ ok(q.result||null); }; q.onerror=function(){ ok(null); }; }); }).catch(function(){ return null; }); }
function fightClear(){ TG.saved=null; tdb().then(function(d){ d.transaction("fight","readwrite").objectStore("fight").delete("cur"); }).catch(function(){}); }
function tgIc(k){ return ico?ico(k,""):""; }
function creatures(){ if(TG.cr) return Promise.resolve(TG.cr); if(TG.load) return TG.load;
  TG.load=fetch("data/tg-creatures.json").then(function(r){ if(!r.ok) throw new Error("http "+r.status); return r.json(); }).then(function(j){ TG.cr=j.creatures||[]; TG.byId={}; TG.cr.forEach(function(c){ TG.byId[c.id]=c; }); return TG.cr; },function(e){ TG.load=null; throw e; });
  return TG.load; }
function crById(id){ return TG.byId&&TG.byId[id]; }
function crByName(n){ return (TG.cr||[]).filter(function(c){ return c.n===n; })[0]; }
function nFoes(){ return Object.keys(TG.foes).reduce(function(a,k){ return a+TG.foes[k]; },0); }
function nAllies(){ return Object.keys(TG.allies).length; }
function dom(){ var w=document.getElementById("tg"); if(w) return w;
  w=document.createElement("div"); w.id="tg"; w.className="lrn tg noico"; w.hidden=true; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","tgT"); w.tabIndex=-1;
  w.innerHTML='<header class="lrn-h"><button type="button" class="lrn-ib" data-tg="back" id="tgBk" aria-label="Back">'+tgIc("ui-chev-l")+'</button><div class="lrn-tt"><b id="tgT">Training Ground</b><small id="tgS"></small></div><button type="button" class="lrn-ib" data-tg="close" aria-label="Close">'+tgIc("ui-close")+'</button></header><div class="lrn-b tg-b" id="tgB"></div><p class="lrn-live sr" id="tgLive" aria-live="polite"></p>';
  document.body.appendChild(w); wire(w); return w; }
function live(t){ var l=document.getElementById("tgLive"); if(l){ l.textContent=""; l.textContent=t; } }
/* ---------- TG1 setup ---------- */
function crLine(c){ return "AC "+c.ac+", HP "+c.hp+", "+(c.sp.walk||0)+" ft"+(c.sp.fly?", fly "+c.sp.fly:""); }
function setupHtml(){ var h='', pcs=TG.pcs;
  if(TG.saved) h+='<div class="tg-p tg-resume"><b>A fight is waiting</b><p>'+esc(TG.saved.name||"Your hero")+' in '+esc((ARENAS.filter(function(a){ return a.id===TG.saved.arena; })[0]||{n:"the field"}).n)+', round '+(TG.saved.round||1)+'.</p><div class="tg-acts"><button type="button" class="btn pri press" data-tg="resume">Resume the fight</button><button type="button" class="btn press" data-tg="drop">Forget it</button></div></div>';
  h+='<section class="tg-s"><h2><span class="tg-n">1</span>Who goes in</h2><div class="tg-cards">'+pcs.map(function(p,i){ var on=TG.pc&&TG.pc.id===p.id&&!TG.pc.trial; return '<button type="button" class="tg-card'+(on?' on':'')+'" data-tgpc="'+i+'" aria-pressed="'+on+'"><b>'+esc(p.name)+'</b><small>'+esc((p.species?p.species+" ":"")+p.cls)+'</small><span class="tg-st">AC '+p.ac+' · HP '+p.max+' · '+p.attacks.length+' attack'+(p.attacks.length===1?'':'s')+'</span></button>'; }).join("")+
    '<div class="tg-card tg-try'+(TG.pc&&TG.pc.trial?' on':'')+'"><b>Try a class</b><label><span>Class</span><select data-tgtry="cls">'+tryClasses().map(function(c){ return '<option'+(c===TG.trial.cls?' selected':'')+'>'+esc(c)+'</option>'; }).join("")+'</select></label><label><span>Level</span><input type="number" min="1" max="20" value="'+TG.trial.lv+'" data-tgtry="lv"></label><button type="button" class="btn press" data-tg="try">Create the hero</button></div></div></section>';
  h+='<section class="tg-s"><h2><span class="tg-n">2</span>What waits for you</h2><div class="tg-tiers" role="group" aria-label="Difficulty">'+TIERS.map(function(t){ return '<button type="button" class="lib-chip'+(TG.tier===t[0]?' on':'')+'" data-tgtier="'+t[0]+'" aria-pressed="'+(TG.tier===t[0])+'">'+t[1]+' <small>CR '+fmtCr(t[2])+(t[3]!==t[2]?'-'+fmtCr(t[3]):'')+'</small></button>'; }).join("")+'</div>'+
    '<label class="tg-q"><span class="vh">Search creatures</span><input type="search" placeholder="Search a creature" value="'+esc(TG.q)+'" data-tgq="1"></label><div class="tg-list" id="tgFoes">'+(TG.cr?foeList():'<p class="bk-f">Loading creatures.</p>')+'</div></section>';
  h+='<section class="tg-s"><h2><span class="tg-n">3</span>Who comes with you <small>up to 3</small></h2><div class="tg-cards">'+ALLIES.map(function(a){ var c=crByName(a[0]), on=!!TG.allies[a[0]]; if(!c&&TG.cr) return ""; return '<button type="button" class="tg-card'+(on?' on':'')+'" data-tgally="'+esc(a[0])+'" aria-pressed="'+on+'"><b>'+esc(a[0])+'</b><small>'+esc(a[1])+'</small>'+(c?'<span class="tg-st">CR '+esc(c.cr)+' · '+esc(crLine(c))+'</span>':'')+'</button>'; }).join("")+'</div></section>';
  h+='<section class="tg-s"><h2><span class="tg-n">4</span>Where you train</h2><div class="tg-cards">'+ARENAS.map(function(a){ var on=TG.arena===a.id; return '<button type="button" class="tg-card tg-arena'+(on?' on':'')+'" data-tgarena="'+a.id+'" aria-pressed="'+on+'">'+arenaPic(a)+'<b>'+esc(a.n)+'</b><small>'+esc(a.s)+'</small></button>'; }).join("")+'</div></section>';
  var nf=nFoes(), na=nAllies(), ok=TG.pc&&nf;
  h+='<div class="tg-bar"><span>'+(TG.pc?esc(TG.pc.name)+', ':'')+nf+' creature'+(nf===1?'':'s')+', '+na+' companion'+(na===1?'':'s')+'</span><button type="button" class="btn pri press" data-tg="enter"'+(ok?'':' aria-disabled="true"')+'>Enter the field</button></div>';
  return h; }
function fmtCr(v){ return v===.25?"1/4":v===.5?"1/2":v===.125?"1/8":String(v); }
function tryClasses(){ var c=window.CLASSES?Object.keys(window.CLASSES).filter(function(k){ return !/\(2014\)/.test(k); }):[]; return c.length?c:["Barbarian","Bard","Cleric","Druid","Fighter","Monk","Paladin","Ranger","Rogue","Sorcerer","Warlock","Wizard"]; }
function arenaPic(a){ var W=a.w, H=a.h, b=sq(a.block), r=sq(a.rough), s='<svg class="tg-map" viewBox="0 0 '+W+' '+H+'" aria-hidden="true"><rect width="'+W+'" height="'+H+'" class="g"/>';
  Object.keys(r).forEach(function(k){ var p=k.split(","); s+='<rect x="'+p[0]+'" y="'+p[1]+'" width="1" height="1" class="r"/>'; }); Object.keys(b).forEach(function(k){ var p=k.split(","); s+='<rect x="'+p[0]+'" y="'+p[1]+'" width="1" height="1" class="w"/>'; }); return s+'</svg>'; }
function foeList(){ var t=TIERS.filter(function(x){ return x[0]===TG.tier; })[0], q=TG.q.trim().toLowerCase();
  var L=TG.cr.filter(function(c){ return q?c.n.toLowerCase().indexOf(q)>=0:(c.crn>=t[2]&&c.crn<=t[3]); }).sort(function(a,b){ return a.crn-b.crn||(a.n<b.n?-1:1); });
  if(!L.length) return '<p class="bk-f">No creature with that name.</p>';
  return L.slice(0,TG.lim).map(function(c){ var n=TG.foes[c.id]||0; return '<div class="tg-foe'+(n?' on':'')+'"><span><b>'+esc(c.n)+'</b><small>CR '+esc(c.cr)+' · '+esc(c.ty)+' · '+esc(crLine(c))+'</small><i>Monster Manual 2024, page '+c.pg+(c.srd?' · SRD 5.2.1':'')+'</i></span><span class="tg-cnt"><button type="button" data-tgf="'+c.id+'" data-d="-1" aria-label="One less '+esc(c.n)+'"'+(n?'':' disabled')+'>−</button><output aria-live="polite">'+n+'</output><button type="button" data-tgf="'+c.id+'" data-d="1" aria-label="One more '+esc(c.n)+'">+</button></span></div>'; }).join("")+(L.length>TG.lim?'<button type="button" class="lib-more" data-tg="more">Show more ('+(L.length-TG.lim)+')</button>':''); }
/* ---------- TG2 to TG4 field ---------- */
function place(ar){ var units=[], used={}, take=function(x,y,s){ for(var i=0;i<s;i++) for(var j=0;j<s;j++) used[(x+i)+","+(y+j)]=1; }, free=function(x,y,s){ if(x<0||y<0||x+s>ar.w||y+s>ar.h) return false; for(var i=0;i<s;i++) for(var j=0;j<s;j++){ var k=(x+i)+","+(y+j); if(used[k]||sq(ar.block)[k]) return false; } return true; };
  /* the spiral placement of the plan (5d): each group around its own corner, never on a wall, never on top of another token */
  function put(u,cx,cy){ for(var r=0;r<12;r++) for(var dx=-r;dx<=r;dx++) for(var dy=-r;dy<=r;dy++){ if(Math.max(Math.abs(dx),Math.abs(dy))!==r) continue; var x=cx+dx, y=cy+dy; if(free(x,y,u.size)){ u.pos=[x,y]; take(x,y,u.size); units.push(u); return; } } }
  put(TGE.fromSheet(TG.pc,"pc",[1,Math.floor(ar.h/2)]),1,Math.floor(ar.h/2));
  Object.keys(TG.allies).forEach(function(n,i){ var c=crByName(n); if(c){ var u=TGE.fromCreature(c,"a"+i,[0,0],"ally"); put(u,1,Math.floor(ar.h/2)+1); } });
  var k=0; Object.keys(TG.foes).forEach(function(id){ var c=crById(id); for(var i=0;i<TG.foes[id];i++){ var u=TGE.fromCreature(c,"f"+(k++),[0,0],"foe"); if(TG.foes[id]>1) u.name=c.n+" "+(i+1); put(u,ar.w-2,Math.floor(ar.h/2)); } });
  return units; }
function enter(){ if(!TG.pc||!nFoes()) { live("Pick who goes in and at least one creature."); return; } var ar=ARENAS.filter(function(a){ return a.id===TG.arena; })[0];
  var seed=0; try{ var a=new Uint32Array(1); crypto.getRandomValues(a); seed=a[0]; }catch(e){ seed=Date.now()>>>0; } TG.seed=seed;
  TG.start=TGE.create({seed:seed,w:ar.w,h:ar.h,block:sq(ar.block),rough:sq(ar.rough),units:place(ar)}); TG.st=TGE.step(TG.start,{t:"start"}); fightSave(); TG.undo=[]; TG.mode=""; TG.act=null; TG.pick=[]; TG.oa=[]; TG.view="field"; TG.cmds=[{t:"start"}];
  paint(); live("The fight starts. "+cur().name+" goes first."); }
function cur(){ return TG.st.units[TGE.now(TG.st)]; }
function run(c){ var before=TG.st, s=TGE.step(TG.st,c); if(s.err){ live(errText(s.err)); flash(errText(s.err)); return false; } TG.undo.push(before); if(TG.undo.length>60) TG.undo.shift(); TG.st=s; TG.cmds.push(c); if(s.over) fightClear(); else fightSave();
  var fresh=s.log.slice(before.log.length); fresh.forEach(function(e){ if(e.t==="oa-open") TG.oa.push({by:e.by,u:e.u}); }); live(fresh.map(evText).filter(Boolean).join(" ")); return true; }
function errText(e){ return {"out of reach":"Too far for that attack.","out of range":"Out of range.","no action left":"No action left this turn.","square taken":"Someone is standing there.","recharging":"Not recharged yet.","no reaction":"The reaction is already used.","target is dead":"That one is down already.","not enough movement":"Not enough movement left.","no spell slot":"No spell slot left for that.","one spell slot per turn":"Only one spell slot can be spent on a turn.","no target":"Pick a target first.","no legendary actions left":"No legendary actions left this round.","not on its own turn":"Legendary actions are used on another creature's turn."}[e]||e; }
function nm(id){ var u=TG.st.units[id]; return u?u.name:id; }
function evText(e){ switch(e.t){
  case "atk": return nm(e.u)+(e.oa?" (Opportunity Attack)":"")+" attacks "+nm(e.tg)+" with "+e.act+": "+e.roll.join(" and ")+" "+(e.bon<0?"− "+(-e.bon):"+ "+e.bon)+" = "+e.tot+" against AC "+e.ac+". "+(e.crit?"Critical Hit!":e.hit?"Hit.":"Miss.");
  case "dmg": return nm(e.u)+" takes "+e.amt+(e.type?" "+e.type:"")+" damage, "+e.hp+" HP left.";
  case "save": return nm(e.u)+(e.auto?" fails the save automatically.":" rolls a save: "+e.tot+" against DC "+e.dc+", "+(e.ok?"success.":"failure."));
  case "save-use": return nm(e.u)+" uses "+e.act+" (DC "+e.dc+" "+e.sv.toUpperCase()+").";
  case "multi": return nm(e.u)+" starts a Multiattack: "+e.list.map(function(x){ return x.replace("|"," or "); }).join(", ")+".";
  case "move": return nm(e.u)+" moves "+e.ft+" feet.";
  case "oa-open": return nm(e.by)+" can make an Opportunity Attack on "+nm(e.u)+".";
  case "down": return nm(e.u)+" drops to 0 Hit Points.";
  case "dead": return nm(e.u)+(e.why==="massive"?" dies from massive damage.":" is down for good.");
  case "ds": return nm(e.u)+" death save: "+e.v+".";
  case "recharge": return e.act+" "+(e.ok?"recharged":"not recharged")+" ("+e.v+").";
  case "turn": return nm(e.u)+"'s turn.";
  case "round": return "Round "+e.n+".";
  case "dash": return nm(e.u)+" dashes."; case "disengage": return nm(e.u)+" disengages."; case "dodge": return nm(e.u)+" dodges.";
  case "manual": return nm(e.u)+" uses "+(e.act||"an action")+(e.note?": "+e.note:"")+".";
  case "heal": return nm(e.u)+" regains "+e.amt+" HP.";
  case "over": return e.w==="pc"?"Victory!":"Defeat.";
  case "lg": return nm(e.u)+" uses a legendary action: "+e.act+" ("+e.left+" left).";
  case "cast": return nm(e.u)+" casts "+e.sp+(e.lvl?" (level "+e.lvl+" slot)":"")+".";
  case "conc-end": return nm(e.u)+" stops concentrating on "+(e.sp||"the old spell")+".";
  case "conc": return nm(e.u)+" Concentration save "+e.roll+" against DC "+e.dc+": "+(e.ok?"held.":"broken.");
  } return ""; }
function flash(t){ var b=document.getElementById("tgMsg"); if(b){ b.textContent=t; b.classList.remove("on"); void b.offsetWidth; b.classList.add("on"); } }
function hpPct(u){ return Math.max(0,Math.min(1,u.hp/u.max)); }
function fieldHtml(){ var st=TG.st, u=cur();
  var order='<ol class="tg-ord" aria-label="Turn order">'+st.order.map(function(id){ var x=st.units[id]; return '<li class="'+x.side+(id===u.id?' now':'')+(x.dead?' out':'')+'"><button type="button" data-tgu="'+id+'" aria-label="'+esc(x.name)+', '+x.hp+' of '+x.max+' HP'+(id===u.id?', turn now':'')+'"><b>'+esc(ini(x.name))+'</b><i style="--p:'+hpPct(x)+'"></i></button></li>'; }).join("")+'</ol>';
  var h=order+'<div class="tg-wrap" id="tgWrap"><canvas id="tgCv" tabindex="0" aria-label="Battle grid. Arrow keys move the cursor, Enter picks the square"></canvas></div><p class="tg-msg" id="tgMsg" role="status"></p>';
  h+=st.over?overHtml():panelHtml(u);
  h+='<details class="tg-log"'+(TG.logOpen?' open':'')+'><summary>The log</summary><ol>'+st.log.slice(-40).map(evText).filter(Boolean).reverse().map(function(t){ return '<li>'+esc(t)+'</li>'; }).join("")+'</ol></details>';
  return h; }
function ini(n){ var p=String(n).split(/\s+/); return (p[0].charAt(0)+(p[1]?(/^\d+$/.test(p[1])?p[1]:p[1].charAt(0)):"")).toUpperCase(); }
function panelHtml(u){ var t=u.turn, left=TGE.speedLeft(u);
  if(TG.oa.length){ var o=TG.oa[0], by=TG.st.units[o.by], m=(by.acts||[]).filter(function(a){ return a.k==="atk"&&a.mr!=="r"; })[0];
    return '<div class="tg-p tg-react"><b>Reaction</b><p>'+esc(by.name)+' can make an Opportunity Attack: '+esc(nm(o.u))+' left its reach.</p><div class="tg-acts">'+(m&&by.turn.r?'<button type="button" class="btn pri press" data-tgoa="'+esc(m.n)+'">Attack with '+esc(m.n)+'</button>':'')+'<button type="button" class="btn press" data-tgoa="">Let it go</button></div></div>'; }
  var acts=(u.acts||[]).map(function(a,i){ var lab=a.k==="atk"?a.n+" "+(a.hit>=0?"+":"")+a.hit:a.k==="save"?a.n+" (DC "+a.dc+")":a.n; var used=a.rc&&u.used[a.n];
    return '<button type="button" class="btn press tg-a k-'+a.k+(TG.act===a.n?' on':'')+'" data-tga="'+i+'"'+(used?' disabled':'')+' title="'+esc(a.t||"")+'">'+esc(lab)+(a.rc?' <small>'+(used?'recharging':'recharge '+a.rc+'-6')+'</small>':'')+'</button>'; }).join("");
  var bon=(u.bonus||[]).map(function(a,i){ return '<button type="button" class="btn press tg-a" data-tgb="'+i+'" title="'+esc(a.t||"")+'">'+esc(a.n)+'</button>'; }).join("");
  var ORD=["1st","2nd","3rd","4th","5th","6th","7th","8th","9th"], slotsTxt=(u.slots||[]).map(function(n,i){ return n>0?ORD[i]+" "+n:""; }).filter(Boolean).join(", ");
  var spl=(u.spells||[]).map(function(x,i){ var need=x.l>0&&!(u.slots||[]).some(function(n,k){ return k+1>=x.l&&n>0; }); return '<button type="button" class="btn press tg-a k-'+(x.k==="heal"?"heal":x.k==="save"?"save":"atk")+(TG.sp===i&&TG.mode==="spell"?' on':'')+'" data-tgsp="'+i+'"'+(need?' disabled':'')+' title="'+esc(x.t||"")+'">'+esc(x.n)+' <small>'+(x.l?ORD[x.l-1]:'cantrip')+(x.time==="b"?', bonus':'')+(x.c?', conc.':'')+'</small></button>'; }).join("")+
    (u.manual||[]).map(function(x,i){ return '<button type="button" class="btn press tg-a k-man" data-tgman="'+i+'" title="'+esc(x.t||"")+'">'+esc(x.n)+' <small>by hand</small></button>'; }).join("");
  var ma=t.ma&&t.ma.length?'<p class="tg-hint">Multiattack: '+t.ma.length+' left ('+esc(t.ma.map(function(x){ return x.replace("|"," or "); }).join(", "))+')</p>':'';
  var hint=TG.mode==="lgtarget"?"Tap the creature for the legendary attack.":TG.mode==="spell"?"Tap each target, then Cast.":TG.mode==="move"?"Tap a lit square to move there.":TG.mode==="target"?"Tap the creature to attack.":TG.mode==="save"?"Tap each creature in the area, then Done.":"";
  return '<div class="tg-p"><div class="tg-who"><b>'+esc(u.name)+'</b><span>HP '+u.hp+'/'+u.max+' · AC '+u.ac+' · '+left+' ft left</span><span class="tg-pips"><i class="'+(t.a?'on':'')+'">Action</i><i class="'+(t.b?'on':'')+'">Bonus</i><i class="'+(t.r?'on':'')+'">Reaction</i></span></div>'+ma+(hint?'<p class="tg-hint">'+hint+'</p>':'')+
    (u.down?'<p class="tg-hint">At 0 Hit Points. End the turn: the death save is rolled at the start of the next one.</p>':'')+
    '<div class="tg-acts"><button type="button" class="btn press'+(TG.mode==="move"?' on':'')+'" data-tg="move"'+(left&&!u.down?'':' disabled')+'>Move</button>'+acts+'</div>'+(bon?'<div class="tg-acts"><small class="tg-l">Bonus Action</small>'+bon+'</div>':'')+(spl?'<div class="tg-acts"><small class="tg-l">Spells'+(slotsTxt?' · slots '+esc(slotsTxt):'')+'</small>'+spl+'</div>':'')+spellBar(u)+
    '<div class="tg-acts"><button type="button" class="btn press" data-tgx="dash"'+(t.a?'':' disabled')+'>Dash</button><button type="button" class="btn press" data-tgx="disengage"'+(t.a?'':' disabled')+'>Disengage</button><button type="button" class="btn press" data-tgx="dodge"'+(t.a?'':' disabled')+'>Dodge</button>'+(u.cond.prone?'<button type="button" class="btn press" data-tgx="stand">Stand up</button>':'')+'</div>'+
    (TG.mode==="save"?'<div class="tg-acts"><button type="button" class="btn pri press" data-tg="savego"'+(TG.pick.length?'':' disabled')+'>Done ('+TG.pick.length+')</button><button type="button" class="btn press" data-tg="cancel">Cancel</button></div>':'')+
    lgHtml(u)+'<div class="tg-acts tg-end"><button type="button" class="btn press" data-tg="undo"'+(TG.undo.length?'':' disabled')+'>Undo</button><button type="button" class="btn pri press tg-et" data-tg="end">End Turn</button></div></div>'; }
function lgHtml(u){ var h=""; Object.keys(TG.st.units).forEach(function(id){ var x=TG.st.units[id]; if(id===u.id||!x.lgn||x.dead||x.down) return;
    h+='<div class="tg-acts tg-lg"><small class="tg-l">Legendary: '+esc(x.name)+' ('+x.lgLeft+' of '+x.lgn+' left)</small>'+x.lg.map(function(a,i){ var r=TGE.lgAct(x,a.n), k=r?r.k:a.k; return '<button type="button" class="btn press tg-a k-'+(k==="atk"?"atk":k==="save"?"save":"man")+'" data-tglg="'+id+'|'+i+'"'+(x.lgLeft?'':' disabled')+' title="'+esc(a.t||"")+'">'+esc(a.n)+'</button>'; }).join("")+'</div>'; });
  return h; }
function spellBar(u){ if(TG.mode!=="spell") return ""; var x=u.spells[TG.sp]; if(!x) return ""; var lv=[], ORD=["1st","2nd","3rd","4th","5th","6th","7th","8th","9th"];
  if(x.l>0) (u.slots||[]).forEach(function(n,k){ if(k+1>=x.l&&n>0) lv.push(k+1); }); if(lv.length&&lv.indexOf(TG.lvl)<0) TG.lvl=lv[0];
  return '<div class="tg-acts tg-spbar">'+(lv.length>1?'<label class="tg-lv"><span>Slot</span><select data-tglv="1">'+lv.map(function(l){ return '<option value="'+l+'"'+(l===TG.lvl?' selected':'')+'>'+ORD[l-1]+'</option>'; }).join("")+'</select></label>':'')+'<button type="button" class="btn pri press" data-tg="castgo"'+(TG.pick.length?'':' disabled')+'>Cast ('+TG.pick.length+')</button><button type="button" class="btn press" data-tg="cancel">Cancel</button></div>'; }
function overHtml(){ var won=TG.st.over==="won"; return '<div class="tg-p tg-over"><h2>'+(won?"Victory":"Defeat")+'</h2><p>'+(won?"Every creature is down. ":"Your side is down. ")+'Round '+TG.st.round+'. Nothing on your sheet changed.</p><div class="tg-acts"><button type="button" class="btn pri press" data-tg="again">Fight again</button><button type="button" class="btn press" data-tg="setup">Change the setup</button><button type="button" class="btn press" data-tg="close">Close</button></div></div>'; }
/* the grid: one canvas, sized to whole squares. A phone gets 44 px squares and the grid scrolls inside its frame */
var CUR=[0,0];
function draw(){ var cv=document.getElementById("tgCv"); if(!cv||!TG.st) return; var st=TG.st, cs=TG.cell, dpr=Math.min(2,window.devicePixelRatio||1), W=st.w*cs, H=st.h*cs;
  cv.width=W*dpr; cv.height=H*dpr; cv.style.width=W+"px"; cv.style.height=H+"px"; var x=cv.getContext("2d"); if(!x) return; x.setTransform(dpr,0,0,dpr,0,0);
  var css=getComputedStyle(document.getElementById("tg")), col=function(n,d){ return (css.getPropertyValue(n)||"").trim()||d; };
  x.fillStyle=col("--tg-ground","#2c3a28"); x.fillRect(0,0,W,H);
  Object.keys(st.rough).forEach(function(k){ var p=k.split(","); x.fillStyle="rgba(120,160,70,.35)"; x.fillRect(p[0]*cs,p[1]*cs,cs,cs); x.strokeStyle="rgba(200,230,140,.35)"; for(var i=6;i<cs;i+=9){ x.beginPath(); x.moveTo(p[0]*cs+i,p[1]*cs+cs-4); x.lineTo(p[0]*cs+i+3,p[1]*cs+cs-10); x.stroke(); } });
  Object.keys(st.block).forEach(function(k){ var p=k.split(","); x.fillStyle="#1a1d1f"; x.fillRect(p[0]*cs+1,p[1]*cs+1,cs-2,cs-2); x.fillStyle="#3b3f42"; x.fillRect(p[0]*cs+4,p[1]*cs+4,cs-8,cs-10); });
  x.strokeStyle="rgba(255,255,255,.09)"; x.lineWidth=1; for(var i=0;i<=st.w;i++){ x.beginPath(); x.moveTo(i*cs+.5,0); x.lineTo(i*cs+.5,H); x.stroke(); } for(var j=0;j<=st.h;j++){ x.beginPath(); x.moveTo(0,j*cs+.5); x.lineTo(W,j*cs+.5); x.stroke(); }
  var u=cur();
  if(TG.mode==="move"&&!st.over){ var R=TGE.reach(st,u.id); Object.keys(R).forEach(function(k){ if(R[k].pass||R[k].c===0) return; var p=k.split(","); x.fillStyle="rgba(255,214,102,.22)"; x.fillRect(p[0]*cs+2,p[1]*cs+2,u.size*cs-4,u.size*cs-4); }); }
  Object.keys(st.units).forEach(function(id){ var t=st.units[id]; if(t.dead&&t.kind!=="pc") { x.globalAlpha=.25; } var r=t.size*cs/2, cx=t.pos[0]*cs+r, cy=t.pos[1]*cs+r;
    var ring=t.side==="foe"?"#d9534f":t.side==="ally"?"#4caf6e":"#e6b84a"; x.beginPath(); x.arc(cx,cy,r-5,0,Math.PI*2); x.fillStyle=t.side==="foe"?"#3a1d1d":t.side==="ally"?"#1d3a26":"#3a321d"; x.fill();
    x.lineWidth=id===u.id?4:2.5; x.strokeStyle=ring; x.stroke();
    x.beginPath(); x.arc(cx,cy,r-1.5,-Math.PI/2,-Math.PI/2+Math.PI*2*hpPct(t)); x.strokeStyle=hpPct(t)>.5?"#7bd88f":hpPct(t)>.25?"#f0c24b":"#ff6b5e"; x.lineWidth=3; x.stroke();
    if(TG.mode==="target"||TG.mode==="save"||TG.mode==="spell"||TG.mode==="lgtarget"){ var okT=TG.mode==="lgtarget"?(!t.dead&&t.side!==TG.st.units[TG.lgBy].side):targetOk(t); if(okT){ x.beginPath(); x.arc(cx,cy,r-1,0,Math.PI*2); x.setLineDash([5,4]); x.strokeStyle=TG.pick.indexOf(id)>=0?"#ffffff":"#ffd666"; x.lineWidth=2; x.stroke(); x.setLineDash([]); } }
    x.fillStyle="#fff"; x.font="600 "+Math.round(cs*.32*Math.min(1.6,t.size))+"px system-ui, sans-serif"; x.textAlign="center"; x.textBaseline="middle"; x.fillText(ini(t.name),cx,cy+1); x.globalAlpha=1;
    if(t.down&&!t.dead){ x.fillStyle="rgba(0,0,0,.45)"; x.beginPath(); x.arc(cx,cy,r-5,0,Math.PI*2); x.fill(); } });
  if(TG.kb){ x.strokeStyle="#fff"; x.lineWidth=2; x.strokeRect(CUR[0]*cs+2,CUR[1]*cs+2,cs-4,cs-4); } }
function targetOk(t){ var u=cur(); if(TG.mode==="spell"){ var x=u.spells[TG.sp]; if(!x||t.dead) return false; if(x.k==="heal") return t.side===u.side||(u.side!=="foe"&&t.side!=="foe"); return t.id!==u.id&&(!x.rng||TGE.udist(u,t)<=x.rng); }
  if(t.dead||t.id===u.id) return false; if(TG.mode==="save") return true; var a=TGE.findAct(u,TG.act); if(!a) return false; var d=TGE.udist(u,t);
  if(a.mr==="r") return !!a.rng&&d<=a.rng[1]; if(a.mr==="mr") return d<=(a.reach||5)||(!!a.rng&&d<=a.rng[1]); return d<=(a.reach||5); }
function unitAt(cx,cy){ var st=TG.st, hit=null; Object.keys(st.units).forEach(function(id){ var t=st.units[id]; if(t.dead&&t.kind!=="pc") return; if(cx>=t.pos[0]&&cx<t.pos[0]+t.size&&cy>=t.pos[1]&&cy<t.pos[1]+t.size) hit=t; }); return hit; }
function tapCell(cx,cy){ if(!TG.st||TG.st.over||TG.oa.length) return; var u=cur(), t=unitAt(cx,cy);
  if(TG.mode==="move"){ if(run({t:"move",to:[cx,cy]})){ TG.mode=TGE.speedLeft(TG.st.units[u.id])?"move":""; } paint(); return; }
  if(TG.mode==="target"&&t&&!targetOk(t)){ /* inside a Multiattack the entry may allow another weapon that does reach: switch to it */
    var me=TG.st.units[u.id], en=me.turn.ma&&me.turn.ma[0], keep=TG.act; if(en) en.split("|").some(function(n){ var a2=TGE.findAct(me,n); if(!a2) return false; TG.act=a2.n; if(targetOk(t)) return true; TG.act=keep; return false; }); }
  if(TG.mode==="lgtarget"&&t){ var lb=TG.st.units[TG.lgBy], la=TGE.lgAct(lb,TG.lgN); run({t:"attack",lg:TG.lgN,by:TG.lgBy,target:t.id,act:la.n}); TG.mode=""; TG.lgBy=null; paint(); return; }
  if(TG.mode==="target"&&t){ if(!targetOk(t)){ flash("Out of reach or range."); return; } run({t:"attack",target:t.id,act:TG.act}); var m=TG.st.units[u.id].turn.ma; if(m&&m.length&&!TG.st.over){ TG.act=pickAtk(TG.st.units[u.id],m[0]); TG.mode=TG.act?"target":""; } else { TG.mode=""; TG.act=null; } paint(); return; }
  if(TG.mode==="spell"&&t){ if(!targetOk(t)){ flash("Out of range for this spell."); return; } var x=u.spells[TG.sp], j=TG.pick.indexOf(t.id); if(x&&x.cnt&&j>=0&&TG.pick.length<6){ TG.pick.push(t.id); } else if(j>=0) TG.pick.splice(j,1); else TG.pick.push(t.id); paint(); return; }
  if(TG.mode==="save"&&t){ var i=TG.pick.indexOf(t.id); if(i>=0) TG.pick.splice(i,1); else TG.pick.push(t.id); paint(); return; }
  if(t){ flash(t.name+": HP "+t.hp+"/"+t.max+", AC "+t.ac+(Object.keys(t.cond).length?", "+Object.keys(t.cond).join(", "):"")); } }
function actPick(i){ var u=cur(), a=u.acts[i]; if(!a) return;
  if(a.k==="multi"){ if(run({t:"multi",act:a.n})){ var first=(TG.st.units[u.id].turn.ma||[])[0]; TG.act=first?pickAtk(u,first):null; TG.mode=TG.act?"target":""; } paint(); return; }
  if(a.k==="atk"){ var m=u.turn.ma; if(m&&m.length&&!m.some(function(x){ return x.split("|").indexOf(a.n)>=0; })){ flash("Not part of the Multiattack."); return; } if(!(m&&m.length)&&!u.turn.a){ flash("No action left this turn."); return; } TG.act=a.n; TG.mode="target"; paint(); return; }
  if(a.k==="save"){ if(!u.turn.a){ flash("No action left this turn."); return; } TG.act=a.n; TG.mode="save"; TG.pick=[]; paint(); return; }
  /* tier C: the player resolves it by hand */
  A.ask(a.n+": "+(a.t||"")+"\n\nThe board does not run this one. Resolve it at the table, then use it here to spend the action.","Use it",function(){ run({t:"manual",act:a.n}); paint(); }); }
function pickAtk(u,entry){ var names=entry.split("|"); for(var i=0;i<names.length;i++){ var a=TGE.findAct(u,names[i]); if(a) return a.n; } return null; }
function paint(){ var b=document.getElementById("tgB"); if(!b) return; var s=document.getElementById("tgS"), t=document.getElementById("tgT");
  if(TG.view==="setup"){ t.textContent="Training Ground"; s.textContent="Practice fights. Your sheet never changes"; b.innerHTML=setupHtml(); }
  else { t.textContent=ARENAS.filter(function(a){ return a.id===TG.arena; })[0].n; s.textContent="Round "+TG.st.round+" · "+cur().name+"'s turn"; b.innerHTML=fieldHtml(); TG.cell=innerWidth<760?44:52; draw(); wireCv(); }
  document.getElementById("tgBk").setAttribute("aria-label",TG.view==="setup"?"Close":"Back to the setup"); document.getElementById("tg").setAttribute("data-view",TG.view); }
function wireCv(){ var cv=document.getElementById("tgCv"); if(!cv) return;
  cv.addEventListener("click",function(e){ var r=cv.getBoundingClientRect(), cx=Math.floor((e.clientX-r.left)/TG.cell), cy=Math.floor((e.clientY-r.top)/TG.cell); TG.kb=0; tapCell(cx,cy); });
  cv.addEventListener("keydown",function(e){ var k=e.key, d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[k];
    if(d){ e.preventDefault(); TG.kb=1; CUR=[Math.max(0,Math.min(TG.st.w-1,CUR[0]+d[0])),Math.max(0,Math.min(TG.st.h-1,CUR[1]+d[1]))]; draw(); var t=unitAt(CUR[0],CUR[1]); live("Square "+(CUR[0]+1)+", "+(CUR[1]+1)+(t?": "+t.name:"")); }
    else if(k==="Enter"||k===" "){ e.preventDefault(); tapCell(CUR[0],CUR[1]); var c2=document.getElementById("tgCv"); if(c2) try{ c2.focus({preventScroll:true}); }catch(er){} } });
  var u=cur(), wrap=document.getElementById("tgWrap"); if(wrap&&u&&!TG.kb){ var cs=TG.cell; var lft=u.pos[0]*cs-wrap.clientWidth/2+cs, top=u.pos[1]*cs-wrap.clientHeight/2+cs; try{ wrap.scrollTo({left:Math.max(0,lft),top:Math.max(0,top)}); }catch(e){} } }
function wire(w){ w.addEventListener("click",function(e){ var b=e.target.closest("button"); if(!b||!w.contains(b)) return; var d=b.dataset;
  if(b.getAttribute("aria-disabled")==="true"){ live(d.tg==="enter"?"Pick who goes in and at least one creature.":""); flash("Pick who goes in and at least one creature."); return; }
  if(d.tg==="close"){ close(); return; } if(d.tg==="back"){ back(); return; }
  if(d.tgpc!=null){ TG.pc=TG.pcs[+d.tgpc]; paint(); return; }
  if(d.tg==="try"){ var cls=w.querySelector('[data-tgtry="cls"]').value, lv=+w.querySelector('[data-tgtry="lv"]').value||1; TG.trial={cls:cls,lv:lv}; var go=function(){ var p=A.tgTry(cls,lv); if(!p){ live("That class could not be made."); return; } p.id="trial"; TG.pc=p; paint(); live(p.name+" is ready."); }; if(window.__bldSheetFor) go(); else { if(window.__bldNeed) window.__bldNeed(); setTimeout(go,300); } return; }
  if(d.tgtier){ TG.tier=d.tgtier; TG.q=""; TG.lim=24; paint(); return; }
  if(d.tgf){ var n=(TG.foes[d.tgf]||0)+(+d.d); if(n>0&&nFoes()>=12&&+d.d>0){ flash("Up to 12 creatures."); return; } if(n<=0) delete TG.foes[d.tgf]; else TG.foes[d.tgf]=n; var l=document.getElementById("tgFoes"), sc=l?l.scrollTop:0; paint(); return; }
  if(d.tg==="more"){ TG.lim+=24; paint(); return; }
  if(d.tgally){ if(TG.allies[d.tgally]) delete TG.allies[d.tgally]; else { if(nAllies()>=3){ flash("Up to 3 companions."); return; } TG.allies[d.tgally]=1; } paint(); return; }
  if(d.tgarena){ TG.arena=d.tgarena; paint(); return; }
  if(d.tg==="enter"){ enter(); return; }
  if(d.tg==="move"){ TG.mode=TG.mode==="move"?"":"move"; TG.act=null; paint(); return; }
  if(d.tga!=null){ actPick(+d.tga); return; }
  if(d.tgb!=null){ var u=cur(), a=u.bonus[+d.tgb]; if(a&&a.k==="save"){ TG.act=a.n; TG.mode="save"; TG.bonus=1; TG.pick=[]; paint(); } else A.ask(a.n+": "+(a.t||"")+"\n\nResolve it at the table, then use it here to spend the Bonus Action.","Use it",function(){ run({t:"manual",act:a.n,slot:"b"}); paint(); }); return; }
  if(d.tgx){ run({t:d.tgx}); TG.mode=""; paint(); return; }
  if(d.tgsp!=null){ TG.sp=+d.tgsp; TG.mode="spell"; TG.pick=[]; TG.act=null; paint(); return; }
  if(d.tg==="castgo"){ run({t:"cast",sp:cur().spells[TG.sp].n,targets:TG.pick.slice(),lvl:TG.lvl||0}); TG.mode=""; TG.pick=[]; TG.sp=null; paint(); return; }
  if(d.tgman!=null){ var mu=cur(), mx=mu.manual[+d.tgman]; A.ask(mx.n+": "+(mx.t||"")+"\n\nThe board does not run this spell. Resolve it at the table (damage and conditions can be set on the tokens), then use it here to spend the action.","Use it",function(){ run({t:"manual",act:mx.n}); paint(); }); return; }
  if(d.tglg){ var pp=d.tglg.split("|"), lu=TG.st.units[pp[0]], lx=lu&&lu.lg[+pp[1]]; if(!lx) return; var lr=TGE.lgAct(lu,lx.n);
    if(lr&&lr.k==="atk"){ TG.mode="lgtarget"; TG.lgBy=lu.id; TG.lgN=lx.n; flash("Tap the creature "+lu.name+" attacks."); paint(); return; }
    if(lr&&lr.k==="save"){ TG.mode="save"; TG.act=null; TG.lgBy=lu.id; TG.lgN=lx.n; TG.pick=[]; paint(); return; }
    A.ask(lu.name+": "+lx.n+". "+(lx.t||"")+"\n\nResolve it at the table, then use it here to spend one legendary action.","Use it",function(){ run({t:"manual",lg:lx.n,by:lu.id}); paint(); }); return; }
  if(d.tg==="savego"&&TG.lgBy){ run({t:"save",lg:TG.lgN,by:TG.lgBy,targets:TG.pick.slice()}); TG.mode=""; TG.lgBy=null; TG.pick=[]; paint(); return; }
  if(d.tg==="savego"){ run({t:"save",act:TG.act,targets:TG.pick.slice(),bonus:TG.bonus?1:0}); TG.mode=""; TG.act=null; TG.pick=[]; TG.bonus=0; paint(); return; }
  if(d.tg==="cancel"){ TG.mode=""; TG.act=null; TG.pick=[]; TG.bonus=0; TG.sp=null; TG.lgBy=null; paint(); return; }
  if(d.tgoa!=null){ var o=TG.oa.shift(); if(d.tgoa&&o) run({t:"attack",oa:1,by:o.by,target:o.u,act:d.tgoa}); paint(); return; }
  if(d.tg==="undo"){ var p=TG.undo.pop(); if(p){ TG.st=p; TG.cmds.pop(); TG.oa=[]; TG.mode=""; TG.act=null; fightSave(); live("Undone."); } paint(); return; }
  if(d.tg==="resume"){ var rec=TG.saved; if(rec){ TG.start=rec.start; TG.cmds=rec.cmds.slice(); TG.st=TGE.replay(rec.start,rec.cmds); TG.arena=rec.arena; TG.undo=[]; TG.oa=[]; TG.mode=""; TG.act=null; TG.view="field"; TG.saved=null; paint(); live("Back in the fight. Round "+TG.st.round+"."); } return; }
  if(d.tg==="drop"){ fightClear(); paint(); return; }
  if(d.tg==="end"){ TG.oa=[]; TG.mode=""; TG.act=null; TG.pick=[]; run({t:"end"}); paint(); var c=cur(); if(c) live(c.name+"'s turn."); return; }
  if(d.tg==="again"){ enter(); return; } if(d.tg==="setup"){ TG.view="setup"; TG.st=null; paint(); return; }
  if(d.tgu){ var t=TG.st.units[d.tgu]; if(t){ if(TG.mode==="target"||TG.mode==="save"||TG.mode==="spell"){ tapCell(t.pos[0],t.pos[1]); return; } flash(t.name+": HP "+t.hp+"/"+t.max+", AC "+t.ac); } return; } });
  w.addEventListener("change",function(e){ var t=e.target; if(t.matches&&t.matches("[data-tglv]")){ TG.lvl=+t.value; } });
  w.addEventListener("input",function(e){ var t=e.target; if(t.matches&&t.matches("[data-tgq]")){ TG.q=t.value; TG.lim=24; var l=document.getElementById("tgFoes"); if(l&&TG.cr) l.innerHTML=foeList(); } });
  w.addEventListener("toggle",function(e){ if(e.target.classList&&e.target.classList.contains("tg-log")) TG.logOpen=e.target.open; },true); }
function back(){ if(TG.view==="field"){ if(TG.st&&!TG.st.over){ A.ask("Leave this fight? It stays saved on this device, and Resume brings it back.","Leave",function(){ TG.view="setup"; TG.st=null; fightLoad().then(function(rec){ TG.saved=rec; paint(); }); }); return; } TG.view="setup"; TG.st=null; paint(); return; } close(); }
function close(){ var w=document.getElementById("tg"); if(!w) return; w.classList.remove("on"); w.hidden=true; if(A.ovQueue) A.ovQueue(); if(A.homeInert) try{ A.homeInert(); }catch(e){} if(TG.opener&&TG.opener.focus&&TG.opener.isConnected) try{ TG.opener.focus({preventScroll:true}); }catch(e){} }
function open(){ var w=dom(); TG.opener=document.activeElement; try{ TG.pcs=A.tgRoster?A.tgRoster():[]; }catch(e){ TG.pcs=[]; }
  if(!TG.pc&&TG.pcs.length) TG.pc=TG.pcs[0];
  w.hidden=false; if(TG.view!=="field") TG.view="setup"; paint(); requestAnimationFrame(function(){ w.classList.add("on"); }); if(A.ovQueue) A.ovQueue(); try{ w.focus({preventScroll:true}); }catch(e){}
  if(TG.view==="setup"&&!TG.st) fightLoad().then(function(rec){ if(rec&&rec.start&&rec.cmds&&!w.hidden&&TG.view==="setup"){ TG.saved=rec; paint(); } });
  if(!TG.cr) creatures().then(function(){ if(!w.hidden&&TG.view==="setup") paint(); },function(){ var l=document.getElementById("tgFoes"); if(l) l.innerHTML='<p class="bk-f">The creature list could not be loaded. Check the connection and open the Training Ground again.</p>'; }); }
window.__tgOpen=open;
window.__tgBack=function(){ var w=document.getElementById("tg"); if(!w||w.hidden) return null; return back; };
window.__tgState=function(){ return {saved:!!TG.saved,view:TG.view,st:TG.st,pc:TG.pc,foes:TG.foes,allies:TG.allies,arena:TG.arena,cmds:TG.cmds,seed:TG.seed,cr:!!TG.cr}; };
addEventListener("resize",function(){ if(TG.view==="field"&&TG.st){ var n=innerWidth<760?44:52; if(n!==TG.cell){ TG.cell=n; draw(); } } });
