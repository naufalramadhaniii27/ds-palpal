/* T11 Learn UI: the map, the stops step by step, the final check, the glossary card and "Find it on your sheet".
   One root (#learn) over Home and the sheet. Every drag has a tap way, every button works with the keyboard, the step text is read out
   by a live region. Motion off and reduced motion: no transitions, the 2D die shows its number at once, no 3D dice. */
(function(){
var V={view:"map",p:0,i:0,ok:false,s:{}}, OPENER=null, D20S='<svg viewBox="0 0 100 100" aria-hidden="true"><path d="M50 4l42 24v44L50 96 8 72V28z" class="o"/><path d="M50 4L29 40h42zM29 40L8 72M71 40l21 32M29 40l21 38 21-38M50 78L8 72M50 78l42-6M50 78v18" class="i"/></svg>';
var U=function(k){ return lrnL(LEARN.ui[k]); }, F=function(k,o){ return lrnF(LEARN.ui[k],o); };
var HOOT="img/vig/empty/spells.avif";/* an owl from the app art until the Hoot art (batch 234) is ready */
var ICONS={party:"ui-users",die:"ui-dice",sword:"ui-shield",rest:"ui-moon",talk:"ui-bag",wind:"ui-star"};
function ic(k,c){ return typeof ico==="function"?ico(k,c||""):""; }
function reduce(){ return (A.reduce&&A.reduce())||document.documentElement.classList.contains("mi-off"); }
/* text with glossary words: [[key|words]] becomes a button that opens the glossary card */
function fmt(t){ return esc(lrnL(t)).replace(/\[\[(\w+)\|([^\]]+)\]\]/g,function(m,k,w){ return LEARN.terms[k]?'<button type="button" class="lrn-term" data-lterm="'+k+'">'+w+'</button>':w; }); }
function pic(base,cls,alt){ if(!base) return ""; if(/\.avif$/.test(base)) return '<picture class="'+(cls||"")+'"><img src="'+base+'" alt="'+esc(alt||"")+'" loading="lazy" decoding="async"></picture>'; return '<picture class="'+(cls||"")+'"><source media="(min-width:760px)" srcset="'+base+'-pc.avif"><img src="'+base+'-phone.avif" alt="'+esc(alt||"")+'" loading="lazy" decoding="async"></picture>'; }
function hoot(sm){ return '<span class="lrn-hoot'+(sm?" sm":"")+'">'+pic(HOOT,"",U("hootAlt"))+'</span>'; }
function dom(){ var w=document.getElementById("learn"); if(w) return w;
  w=document.createElement("div"); w.id="learn"; w.className="lrn noico";/* noico: the app does not add its own icons to Learn buttons */ w.hidden=true; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","lrnT"); w.tabIndex=-1;
  w.innerHTML='<header class="lrn-h"><button type="button" class="lrn-ib" data-l="back" id="lrnBk">'+ic("ui-chev-l")+'</button><div class="lrn-tt"><b id="lrnT"></b><small id="lrnS"></small></div><span class="lrn-xp" id="lrnXp"></span><div class="lrn-lang" role="group" id="lrnLg"><button type="button" data-llang="en" lang="en">EN</button><button type="button" data-llang="id" lang="id">ID</button></div><button type="button" class="lrn-ib" data-l="close" id="lrnX">'+ic("ui-close")+'</button></header>'
    +'<div class="lrn-b" id="lrnB"></div><p class="lrn-live sr" id="lrnLive" aria-live="polite"></p><div class="lrn-pop" id="lrnPop" role="dialog" aria-modal="false"></div>';
  document.body.appendChild(w); wire(w); return w; }
function head(){ var t="",s=""; if(V.view==="map"){ t=U("learn"); s=lrnCoreDone()+" / "+lrnCore().length+" · "+U("core"); } else if(V.view==="place"){ var p=LEARN.places[V.p]; t=lrnL(p.name); s=V.fin?U("finishPlace"):U("step")+" "+(V.i+1)+" "+U("of")+" "+p.steps.length; } else { t=U("quiz"); s=V.qd?U("done"):(V.qi+1)+" "+U("of")+" "+LEARN.quiz.length; }
  document.getElementById("lrnT").textContent=t; document.getElementById("lrnS").textContent=s; document.getElementById("lrnXp").textContent=LRN.xp+" "+U("xp");
  document.getElementById("lrnBk").setAttribute("aria-label",V.view==="map"?U("close"):U("back")); document.getElementById("lrnX").setAttribute("aria-label",U("close"));
  document.getElementById("lrnLg").setAttribute("aria-label",U("lang"));
  Array.prototype.forEach.call(document.querySelectorAll("[data-llang]"),function(b){ b.setAttribute("aria-pressed",b.getAttribute("data-llang")===LRN.lang); });
  var w=document.getElementById("learn"); w.setAttribute("lang",LRN.lang); w.setAttribute("data-view",V.view); }
function say(html){ var b=document.getElementById("lrnSay"); if(b){ b.innerHTML=html; } var l=document.getElementById("lrnLive"); if(l){ l.textContent=""; l.textContent=(b?b.textContent:""); } }
function paint(focus){ var go=function(){ head(); var b=document.getElementById("lrnB"); b.innerHTML=V.view==="map"?mapHtml():V.view==="quiz"?quizHtml():placeHtml(); after(); if(focus!==false){ var h=b.querySelector("h2,[data-lfocus]"); if(h){ h.tabIndex=-1; h.style.setProperty("outline","none","important"); h.style.setProperty("box-shadow","none","important"); try{ h.focus({preventScroll:true}); }catch(e){} } } b.scrollTop=0; };
  /* a new view or a new step moves with a View Transition, a change inside a step (paint(false)) draws at once */
  if(focus===undefined&&document.startViewTransition&&!reduce()&&!document.getElementById("learn").hidden){ try{ document.startViewTransition(go); return; }catch(e){} } go(); }
function after(){ var p=V.view==="place"&&!V.fin?LEARN.places[V.p]:null, st=p&&p.steps[V.i]; if(st&&st.t==="show") drawFrame(); if(st&&st.t==="grid") gridPaint(); }

/* ===== map ===== */
function stopCard(p,k,num){ var d=LRN.done[p.id], next=!d&&num&&lrnCore().filter(function(x){ return !LRN.done[x.id]; })[0]===p;
  return '<li><button type="button" class="lrn-stop'+(d?" done":"")+(next?" lrn-nx":"")+'" data-lgo="'+k+'">'+pic(p.img,"lrn-sp","")+'<span class="lrn-sx">'+(num?'<span class="lrn-sn">'+num+'</span>':'<span class="lrn-sn">'+ic(ICONS[p.icon]||"ui-star")+'</span>')+'<b>'+esc(lrnL(p.name))+'</b><small>'+esc(lrnL(p.goal))+'</small></span><span class="lrn-st">'+(d?ic("ui-check")+'<span class="sr">'+U("done")+'</span>':esc(U("start")))+'</span></button></li>'; }
function mapHtml(){ var core=lrnCore(), n=lrnCoreDone(), h='<section class="lrn-hero">'+hoot()+'<div><h2>'+esc(U("title"))+'</h2><p>'+esc(U("sub"))+'</p><div class="lrn-bar" role="progressbar" aria-valuemin="0" aria-valuemax="'+core.length+'" aria-valuenow="'+n+'" aria-label="'+esc(U("core"))+'"><i style="width:'+Math.round(n*100/core.length)+'%"></i></div><small>'+n+" / "+core.length+'</small></div></section>';
  h+='<h3 class="lrn-sh">'+esc(U("core"))+'</h3><p class="lrn-ss">'+esc(U("coreSub"))+'</p><ol class="lrn-path">';
  var num=0; LEARN.places.forEach(function(p,k){ if(p.core){ num++; h+=stopCard(p,k,num); } }); h+='</ol>';
  var q=LRN.quiz, open=n>=core.length;
  h+='<button type="button" class="lrn-quizc'+(open?"":" lock")+(q&&q.best!=null?" done":"")+'" data-lquiz="1"'+(open?"":' aria-disabled="true"')+'>'+ic("ui-star")+'<span><b>'+esc(U("quiz"))+'</b><small>'+esc(open?U("quizSub"):U("quizLock"))+'</small></span>'+(q&&q.best!=null?'<span class="lrn-st">'+q.best+' / '+LEARN.quiz.length+'</span>':'')+'</button>';
  h+='<h3 class="lrn-sh">'+esc(U("bonus"))+'</h3><p class="lrn-ss">'+esc(U("bonusSub"))+'</p><ul class="lrn-path lrn-bonus">'; LEARN.places.forEach(function(p,k){ if(!p.core) h+=stopCard(p,k,0); }); h+='</ul>';
  if(n>0&&n<core.length) h+='<p class="lrn-break">'+esc(U("takeBreak"))+'</p>';
  return h; }

/* ===== a stop ===== */
function placeHtml(){ var p=LEARN.places[V.p];
  if(V.fin) return '<section class="lrn-fin">'+pic(p.img,"lrn-fp","")+'<div class="lrn-stamp">'+ic("ui-check")+'</div><h2>'+esc(U("finishPlace"))+'</h2><p>'+esc(lrnL(p.goal))+'</p>'+(V.fin>0?'<p class="lrn-xpg">'+esc(F("xpGot",{x:V.fin}))+'</p>':'')+'<div class="lrn-acts">'+(nextCore()>=0?'<button type="button" class="btn pri press" data-lgo="'+nextCore()+'">'+esc(U("nextStop"))+'</button>':(lrnCoreDone()>=lrnCore().length&&!(LRN.quiz&&LRN.quiz.best!=null)?'<button type="button" class="btn pri press" data-lquiz="1">'+esc(U("quiz"))+'</button>':''))+'<button type="button" class="btn press" data-l="map">'+esc(U("toMap"))+'</button></div></section>';
  var st=p.steps[V.i], r=step(st), dots=p.steps.map(function(x,k){ return '<i class="'+(k<V.i?"d":k===V.i?"c":"")+'"></i>'; }).join("");
  return '<div class="lrn-place" data-t="'+st.t+'"><div class="lrn-dots" aria-hidden="true">'+dots+'</div>'+(st.t==="guess"?pic(p.img,"lrn-scene",""):"")+'<div class="lrn-say">'+hoot(1)+'<p class="lrn-bub" id="lrnSay" data-lfocus="1">'+r.say+'</p></div><div class="lrn-stage">'+r.body+'</div>'
    +'<div class="lrn-foot">'+(V.i===0&&!LRN.done[p.id]?'<button type="button" class="btn press lrn-skip" data-l="skip">'+esc(U("skip"))+'</button>':'<span></span>')+'<button type="button" class="btn pri press lrn-next" data-l="next" id="lrnNext"'+(V.ok?"":" disabled")+'>'+esc(nextLabel(st))+'</button></div></div>'; }
function nextLabel(st){ var p=LEARN.places[V.p]; if(st.t==="show"&&V.s.f<st.frames.length-1) return U("next"); return V.i===p.steps.length-1?U("done"):U("next"); }
function nextCore(){ var c=LEARN.places; for(var k=0;k<c.length;k++) if(c[k].core&&!LRN.done[c[k].id]) return k; return -1; }
function opt(cls,attrs,label,state){ return '<button type="button" class="lrn-opt'+(state?" "+state:"")+(cls?" "+cls:"")+'" '+attrs+'>'+label+'</button>'; }
function step(st){ var S=V.s, i;
  switch(st.t){
  case "guess": return {say:S.pick!=null?fmt(st.a):fmt(st.q), body:'<div class="lrn-opts" role="group">'+st.opts.map(function(o,k){ return opt("",'data-lg="'+k+'" aria-pressed="'+(S.pick===k)+'"',esc(lrnL(o)),S.pick===k?"sel":""); }).join("")+'</div>'};
  case "show": i=S.f||0; return {say:fmt(st.frames[i].say), body:'<div class="lrn-vis" id="lrnVis"></div><div class="lrn-frm">'+st.frames.map(function(x,k){ return '<i class="'+(k<=i?"on":"")+'"></i>'; }).join("")+'</div>'+(i===st.frames.length-1?'<button type="button" class="btn press lrn-again" data-l="replay">'+ic("ui-redo")+esc(U("replay"))+'</button>':'')};
  case "pick": case "why": return {say:S.fb?fmt(S.fb)+(S.hint?' <span class="lrn-hint">'+fmt(st.hint)+'</span>':''):fmt(st.q), body:'<div class="lrn-opts" role="group">'+st.opts.map(function(o,k){ var s=S.res&&S.res[k]; return opt("",'data-lp="'+k+'"',(s==="good"?ic("ui-check"):"")+esc(lrnL(o.x)),s||""); }).join("")+'</div>'};
  case "roll": return rollStep(st,S);
  case "check": return checkStep(st,S);
  case "grid": return {say:S.msg||fmt(st.say), body:'<div class="lrn-grid" id="lrnGrid" role="grid" aria-label="'+esc(lrnL(LEARN.places[V.p].name))+'"></div><p class="lrn-left" id="lrnLeft"></p><div class="lrn-acts lrn-gacts" role="group" aria-label="'+esc(U("pickAction"))+'">'+st.acts.map(function(a){ return opt("lrn-act",'data-la="'+a[0]+'"','<b>'+a[0]+'</b><small>'+esc(lrnL(a[1]))+'</small>',S.act===a[0]?"good":""); }).join("")+'</div>'};
  case "hp": return hpStep(st,S);
  case "dice": return diceStep(st,S);
  case "adv": return advStep(st,S);
  case "sheet": return {say:fmt(st.say), body:'<div class="lrn-sheet">'+(lrnHasChar()?'<button type="button" class="btn pri press" data-l="sheet">'+ic("ui-search")+esc(U("showSheet"))+'</button><p class="lrn-lbl"><b>'+esc(lrnL(st.label))+'</b></p>':'<p>'+esc(U("noChar"))+'</p>')+'</div>'};
  case "card": return {say:'<b>'+esc(lrnL(st.title))+'</b>', body:'<div class="lrn-card"><h3>'+esc(lrnL(st.title))+'</h3><ul>'+st.items.map(function(x){ return '<li>'+ic("ui-check")+'<span>'+fmt(x)+'</span></li>'; }).join("")+'</ul></div>'};
  } return {say:"",body:""}; }
/* the d20 plus bonus against the Target Number, drawn as blocks: die, bonus, total bar and a target line (concrete, picture, number) */
function sumVis(die,bonus,dc,stage){ var tot=die+bonus, max=Math.max(25,tot,dc+2), pct=function(v){ return Math.round(Math.max(0,v)*100/max); };
  return '<div class="lrn-sum" data-stage="'+stage+'"><div class="lrn-die" aria-hidden="true">'+D20S+'<b>'+(stage>=1?die:"?")+'</b></div><span class="lrn-plus">+</span><div class="lrn-chip'+(stage>=2?" in":"")+'">'+(bonus<0?"−"+(-bonus):"+"+bonus)+'</div><span class="lrn-plus">=</span><div class="lrn-tot">'+(stage>=2?tot:"?")+'</div></div>'
    +'<div class="lrn-meter" aria-hidden="true"><div class="lrn-fill'+(stage>=3?(tot>=dc?" ok":" no"):"")+'" style="width:'+(stage>=2?pct(tot):stage>=1?pct(die):0)+'%"></div><div class="lrn-dc" style="left:'+pct(dc)+'%"><span>'+esc(U("target"))+' '+dc+'</span></div></div>'
    +'<p class="sr">'+(stage>=1?die:"")+(stage>=2?" + "+bonus+" = "+tot:"")+", "+esc(U("target"))+" "+dc+'</p>'; }
function rollStep(st,S){ var b=S.bonus!=null?S.bonus:(S.bonus=lrnBonus(st.bonus)), stage=S.stage||0, said=fmt(st.say), act="";
  if(stage===0) act='<button type="button" class="btn pri press lrn-big" data-l="roll"'+(S.busy?" disabled":"")+'>'+ic("ui-dice")+esc(U("roll"))+'</button>';
  else if(stage===1){ said=esc(F("rolled",{d:S.die})); act='<button type="button" class="btn pri press lrn-big lrn-chipb" data-l="bonus">'+esc(U("addBonus"))+' ('+(b<0?"−"+(-b):"+"+b)+')</button>'; }
  else { var t=S.die+b; said=esc(F(t>=st.dc?"made":"missed",{t:t,dc:st.dc})); act=t>=st.dc?"":'<button type="button" class="btn press lrn-big" data-l="reroll">'+ic("ui-redo")+esc(U("rollAgain"))+'</button>'; }
  return {say:said, body:sumVis(S.die||0,b,st.dc,stage>=2?3:stage)+'<div class="lrn-acts">'+act+'</div>'}; }
function checkStep(st,S){ var k=S.k||0; if(k>=st.items.length) return {say:fmt(st.good), body:'<div class="lrn-okall">'+ic("ui-check")+'</div>'};
  var it=st.items[k]; return {say:S.miss?fmt(st.hint):(S.k?fmt(st.good)+" "+fmt(st.q):fmt(st.q)), body:sumVis(it.die,it.bonus,it.dc,1).replace('class="lrn-chip"','class="lrn-chip in"')+'<div class="lrn-opts lrn-yn" role="group">'+opt("",'data-lc="1"',esc(U("yes")))+opt("",'data-lc="0"',esc(U("no")))+'</div><p class="lrn-cnt">'+(k+1)+" / "+st.items.length+'</p>'}; }
function hpVis(max,cur,mark){ return '<div class="lrn-hp" aria-hidden="true"><div class="lrn-hpb"><i style="width:'+Math.round(cur*100/max)+'%"></i></div><b>'+cur+' / '+max+'</b>'+(mark?'<span class="lrn-hpm '+mark[0]+'">'+mark[1]+'</span>':'')+'</div>'; }
function hpStep(st,S){ var ph=S.ph||0;
  if(ph===0) return {say:S.miss?fmt(st.hint):fmt(st.say), body:hpVis(st.max,st.start,["dmg","−"+st.dmg])+'<div class="lrn-opts lrn-num" role="group">'+st.opts.map(function(v){ return opt("",'data-lh="'+v+'"',esc(U("hpNow"))+": <b>"+v+"</b>",S.res&&S.res[v]||""); }).join("")+'</div>'};
  var R=st.rest; return {say:S.fb?fmt(S.fb):fmt(R.q), body:hpVis(st.max,ph===2?st.max:st.ok,ph===2?["heal","+"+(st.max-st.ok)]:null)+'<div class="lrn-opts" role="group">'+R.opts.map(function(o,k){ var s=S.res2&&S.res2[k]; return opt("",'data-lr="'+k+'"',esc(lrnL(o.x)),s||""); }).join("")+'</div>'}; }
var DICE=[4,6,8,10,12,20];
function dieSvg(n){ var P={4:"M50 8L92 86H8z",6:"M14 14h72v72H14z",8:"M50 4l40 46-40 46-40-46z",10:"M50 4l42 34-42 58L8 38z",12:"M50 4l40 20 10 40-30 32H30L0 64l10-40z",20:"M50 4l42 24v44L50 96 8 72V28z"}; return '<svg viewBox="0 0 100 100" aria-hidden="true"><path d="'+P[n]+'" class="o"/></svg>'; }
function diceStep(st,S){ var r=S.r||{}, n=Object.keys(r).length, last=S.last; var tip=last&&st.tips[last]?" "+fmt(st.tips[last]):"";
  return {say:last?esc(F("dieRes",{s:last,v:r[last]}))+tip:fmt(st.say), body:'<div class="lrn-dice" role="group" aria-label="'+esc(U("tapDie"))+'">'+DICE.map(function(d){ return '<button type="button" class="lrn-dd'+(r[d]?" on":"")+'" data-ld="'+d+'" aria-label="d'+d+(r[d]?": "+r[d]:"")+'">'+dieSvg(d)+'<b>'+(r[d]||"")+'</b><small>d'+d+'</small></button>'; }).join("")+'</div>'+(n>0&&n<3?'<p class="lrn-cnt">'+esc(U("diceMore"))+'</p>':'')}; }
function advStep(st,S){ var v=S.v, act, said=fmt(st.say), body;
  if(st.mode==="insp"){ if(!v) act='<button type="button" class="btn pri press lrn-big" data-l="arol">'+ic("ui-dice")+esc(U("inspRoll"))+'</button>';
      else if(S.re==null){ said=esc(F("inspFirst",{k:v[0]})); act='<button type="button" class="btn pri press lrn-big" data-l="insp">'+ic("ui-redo")+esc(U("rerollOne"))+'</button>'; }
      else { said=esc(F("inspRes",{k:S.re})); act=""; }
    body='<div class="lrn-two">'+(v?'<div class="lrn-die'+(S.re!=null?" out":"")+'">'+D20S+'<b>'+v[0]+'</b></div>':'')+(S.re!=null?'<div class="lrn-die keep">'+D20S+'<b>'+S.re+'</b></div>':'')+'</div>';
    return {say:said, body:body+'<div class="lrn-acts">'+act+'</div>'}; }
  if(!v) return {say:said, body:'<div class="lrn-two"></div><div class="lrn-acts"><button type="button" class="btn pri press lrn-big" data-l="arol"'+(S.busy?" disabled":"")+'>'+ic("ui-dice")+esc(U("advRoll"))+'</button></div>'};
  var k=st.mode==="adv"?Math.max(v[0],v[1]):Math.min(v[0],v[1]), ki=v[0]===k?0:1;
  return {say:esc(F("advRes",{a:v[0],b:v[1],k:k})), body:'<div class="lrn-two">'+v.map(function(x,j){ return '<div class="lrn-die'+(j===ki?" keep":" out")+'">'+D20S+'<b>'+x+'</b></div>'; }).join("")+'</div><p class="lrn-lbl"><b>'+esc(U(st.mode==="adv"?"lucky":"unlucky"))+'</b></p><div class="lrn-acts"><button type="button" class="btn press" data-l="arol">'+ic("ui-redo")+esc(U("rollAgain"))+'</button></div>'}; }

/* Hoot shows: one visual per frame, built from data (U38 Choreo: the same frames give the animation, the still version and the test steps) */
function drawFrame(){ var st=LEARN.places[V.p].steps[V.i], fr=st.frames[V.s.f||0], el=document.getElementById("lrnVis"); if(!el) return; var h="";
  if(fr.vis==="sum") h=sumVis(fr.die,fr.bonus,fr.dc,fr.stage);
  else if(fr.vis==="hp") h=hpVis(fr.max,fr.to,fr.dmg?["dmg","−"+fr.dmg]:fr.heal?["heal","+"+fr.heal]:null);
  else if(fr.vis==="talk") h='<div class="lrn-talk who-'+fr.who+'"><span class="lrn-tk">'+(fr.who==="die"?'<span class="lrn-die sm">'+D20S+'<b>?</b></span>':fr.who==="dm"?ic("ui-book"):ic("ui-users"))+'</span><b>'+esc(fr.who==="dm"?lrnL(LEARN.terms.dm.name):fr.who==="you"?U("you"):"d20")+'</b></div>';
  else if(fr.vis==="grid"){ h='<div class="lrn-grid demo" aria-hidden="true">'+cells(6,function(x,y){ var c=""; if(fr.path&&fr.path.some(function(q){ return q[0]===x&&q[1]===y; })) c+=" path"; if(fr.hero[0]===x&&fr.hero[1]===y) return '<i class="hero'+c+'">'+ic("ui-users")+'</i>'; if(fr.foe[0]===x&&fr.foe[1]===y) return '<i class="foe">'+ic("ui-shield")+'</i>'; return '<i class="'+c+'"></i>'; })+'</div>'+(fr.act?'<p class="lrn-lbl"><b>'+esc(fr.act)+'</b>'+(fr.over?' · '+esc(U("turnOver")):'')+'</p>':''); }
  el.innerHTML=h; }
function cells(n,f){ var h=""; for(var y=0;y<n;y++) for(var x=0;x<n;x++) h+=f(x,y); return h; }
/* the turn on a grid: the hero walks up to Speed squares (each square 5 feet), then picks one main action */
function gridPaint(){ var st=LEARN.places[V.p].steps[V.i], S=V.s, g=document.getElementById("lrnGrid"); if(!g) return; if(!S.pos) S.pos=st.hero.slice(); if(S.left==null) S.left=st.speed;
  var h=""; for(var y=0;y<6;y++){ h+='<div role="row" class="lrn-gr">'; for(var x=0;x<6;x++){ var d=Math.max(Math.abs(x-S.pos[0]),Math.abs(y-S.pos[1])), hero=x===S.pos[0]&&y===S.pos[1], foe=x===st.foe[0]&&y===st.foe[1], can=!hero&&!foe&&d<=S.left&&!S.act;
      h+='<button type="button" role="gridcell" class="lrn-cell'+(hero?" hero":"")+(foe?" foe":"")+(can?" can":"")+'" data-lx="'+x+'" data-ly="'+y+'" aria-label="'+(hero?esc(U("you")):foe?"Goblin":esc(U("moveHere"))+" "+(x+1)+", "+(y+1))+'"'+(hero||foe?' aria-disabled="true"':"")+'>'+(hero?ic("ui-users"):foe?ic("ui-shield"):"")+'</button>'; } h+='</div>'; }
  g.innerHTML=h; var l=document.getElementById("lrnLeft"); if(l) l.textContent=U("squaresLeft")+": "+S.left; }
function near(a,b){ return Math.max(Math.abs(a[0]-b[0]),Math.abs(a[1]-b[1]))===1; }

/* ===== final check ===== */
function quizHtml(){ var Q=LEARN.quiz;
  if(V.qd) return '<section class="lrn-fin">'+hoot()+'<h2>'+esc(U("quizDone"))+'</h2><p class="lrn-xpg">'+esc(U("quizScore"))+': '+V.qok+' / '+Q.length+'</p><div class="lrn-acts"><button type="button" class="btn pri press" data-l="hero">'+ic("ui-build")+esc(U("makeHero"))+'</button><button type="button" class="btn press" data-l="map">'+esc(U("toMap"))+'</button></div></section>';
  var q=Q[V.qi], S=V.s; return '<div class="lrn-place"><div class="lrn-dots" aria-hidden="true">'+Q.map(function(x,k){ return '<i class="'+(k<V.qi?"d":k===V.qi?"c":"")+'"></i>'; }).join("")+'</div><div class="lrn-say">'+hoot(1)+'<p class="lrn-bub" id="lrnSay" data-lfocus="1">'+(S.res?fmt(S.ok?q.fb:{en:LEARN.ui.tryAgain.en,id:LEARN.ui.tryAgain.id}):fmt(q.q))+'</p></div><div class="lrn-stage"><h2 class="sr">'+esc(lrnL(q.q))+'</h2><div class="lrn-opts" role="group">'+q.opts.map(function(o,k){ return opt("",'data-lq="'+k+'"',esc(lrnL(o)),S.res&&S.res[k]||""); }).join("")+'</div></div><div class="lrn-foot"><span></span><button type="button" class="btn pri press lrn-next" data-l="qnext"'+(S.ok?"":" disabled")+'>'+esc(V.qi===Q.length-1?U("done"):U("next"))+'</button></div></div>'; }

/* ===== moving around ===== */
function goPlace(k){ V={view:"place",p:k,i:0,ok:false,s:{}}; okInit(); paint(); }
function okInit(){ var st=LEARN.places[V.p].steps[V.i]; V.ok=st.t==="sheet"||st.t==="card"; if(st.t==="show") V.ok=true;/* Next walks through the frames */ }
function setOk(v){ V.ok=v; var n=document.getElementById("lrnNext"); if(n){ n.disabled=!v; n.textContent=nextLabel(LEARN.places[V.p].steps[V.i]); } }
function next(){ var p=LEARN.places[V.p], st=p.steps[V.i];
  if(st.t==="show"&&(V.s.f||0)<st.frames.length-1){ V.s.f=(V.s.f||0)+1; paint(); return; }
  if(V.i<p.steps.length-1){ V.i++; V.s={}; okInit(); paint(); return; }
  V.fin=lrnFinish(p.id,false)||-1; paint(); }
function back(){ if(V.view==="place"&&!V.fin&&V.i>0){ V.i--; V.s={}; okInit(); paint(); return; } if(V.view!=="map"){ V={view:"map",p:0,i:0,ok:false,s:{}}; paint(); return; } close(); }
function pre(t){ return t==="map"?0:1; }
function open(o){ var w=dom(); OPENER=document.activeElement; LRN=lrnGet(); if(o&&o.place!=null){ var k=-1; LEARN.places.forEach(function(p,j){ if(p.id===o.place) k=j; }); if(k>=0){ w.hidden=false; goPlace(k); show(w); return; } }
  if(!V.view||w.hidden) V={view:"map",p:0,i:0,ok:false,s:{}}; w.hidden=false; paint("instant"); show(w); }
function show(w){ requestAnimationFrame(function(){ w.classList.add("on"); }); if(typeof ovQueue==="function") ovQueue(); try{ w.focus({preventScroll:true}); }catch(e){} var h=w.querySelector("#lrnB h2,[data-lfocus]"); if(h){ h.tabIndex=-1; h.style.setProperty("outline","none","important"); h.style.setProperty("box-shadow","none","important"); try{ h.focus({preventScroll:true}); }catch(e){} } }
function close(){ var w=document.getElementById("learn"); if(!w) return; popHide(); w.classList.remove("on"); w.hidden=true; if(typeof ovQueue==="function") ovQueue(); if(typeof homeInert==="function") try{ homeInert(); }catch(e){} if(OPENER&&OPENER.focus&&OPENER.isConnected) try{ OPENER.focus({preventScroll:true}); }catch(e){} if(A.learnBand){ var hb=document.getElementById("hlearnB"); if(hb) hb.outerHTML=A.learnBand(); } }
/* glossary card: a popover in the top layer, placed under the word with anchor positioning when the browser has it */
var POPB=null;
function popShow(btn){ var k=btn.getAttribute("data-lterm"), t=LEARN.terms[k], p=document.getElementById("lrnPop"); if(!t||!p) return; popHide();
  p.innerHTML='<b class="lrn-pn">'+esc(lrnL(t.name))+'</b><small>'+esc(U("book"))+': '+esc(t.book)+'</small><p>'+esc(lrnL(t.say))+'</p><div class="lrn-acts"><button type="button" class="btn press" data-lib-q="'+esc(t.lib)+'">'+ic("ui-book")+esc(U("open"))+'</button><button type="button" class="btn pri press" data-l="pop">'+esc(U("done"))+'</button></div>';
  POPB=btn; if(spotAnchor()){ btn.style.setProperty("anchor-name","--lterm"); p.classList.add("anc"); } else p.classList.remove("anc");
  if(window.__topLayer) window.__topLayer(p); p.classList.add("on"); btn.setAttribute("aria-expanded","true"); var f=p.querySelector('[data-l="pop"]'); if(f) try{ f.focus({preventScroll:true}); }catch(e){} }
function popHide(){ var p=document.getElementById("lrnPop"); if(!p||!p.classList.contains("on")) return; p.classList.remove("on"); try{ if(p.matches(":popover-open")) p.hidePopover(); }catch(e){} if(POPB){ POPB.style.removeProperty("anchor-name"); POPB.setAttribute("aria-expanded","false"); try{ POPB.focus({preventScroll:true}); }catch(e){} } POPB=null; }
/* "Find it on your sheet": Learn steps aside, the sheet of the open character comes forward with a ring and a label, Back returns */
function toSheet(st){ var w=document.getElementById("learn"), hv=document.getElementById("homeV"), home=!!(hv&&!hv.hidden);
  w.hidden=true; if(home){ hv.hidden=true; document.body.style.overflow=""; if(typeof homeInert==="function") try{ homeInert(); }catch(e){} }
  if(A.sheetOn&&A.sheetOn()) try{ A.closeSheet(); }catch(e){}
  var done=function(){ w.hidden=false; if(home&&typeof showHome==="function") showHome(); if(typeof ovQueue==="function") ovQueue(); var b=w.querySelector('[data-l="sheet"]'); if(b) try{ b.focus({preventScroll:true}); }catch(e){} };
  setTimeout(function(){ var el=lrnFind(st.find); if(!el){ done(); say(esc(U("noChar"))); return; }
    try{ el.scrollIntoView({block:"center",behavior:reduce()?"auto":"smooth"}); }catch(e){}
    setTimeout(function(){ spotShow(el,'<p><b>'+esc(lrnL(st.label))+'</b></p><p>'+fmt(st.say)+'</p><button type="button" class="btn pri press" data-spot-x="1">'+ic("ui-chev-l")+esc(U("backLearn"))+'</button>',done); if(typeof ovQueue==="function") ovQueue(); },reduce()?0:350); },60); }
document.addEventListener("click",function(e){ var x=e.target.closest&&e.target.closest("[data-spot-x]"); if(x){ spotHide(); } });

function wire(w){
  w.addEventListener("click",function(e){ var t=e.target.closest("button"); if(!t||t.disabled||!w.contains(t)) return; var d=t.dataset, st=V.view==="place"&&!V.fin?LEARN.places[V.p].steps[V.i]:null, S=V.s;
    if(d.llang){ LRN.lang=d.llang; lrnPut(LRN); paint(false); return; }
    if(d.lterm){ popShow(t); return; }
    if(d.libQ){ var q=d.libQ; popHide(); if(typeof libOpen==="function"){ libOpen({q:q}); var lb=document.getElementById("lib"); if(lb) lb.classList.add("lrn-over"); } return; }
    if(d.lgo!=null){ goPlace(+d.lgo); return; }
    if(d.lquiz){ if(lrnCoreDone()<lrnCore().length) { say(esc(U("quizLock"))); var c=t.querySelector("small"); if(c) c.classList.add("lrn-pulse"); return; } V={view:"quiz",qi:0,qok:0,s:{}}; paint(); return; }
    if(d.l==="close"){ close(); return; } if(d.l==="back"){ back(); return; } if(d.l==="map"){ V={view:"map",p:0,i:0,ok:false,s:{}}; paint(); return; }
    if(d.l==="pop"){ popHide(); return; }
    if(d.l==="next"){ next(); return; }
    if(d.l==="skip"){ var p=LEARN.places[V.p]; ask(U("skipAsk"),U("skipOk"),function(){ lrnFinish(p.id,true); V={view:"map",p:0,i:0,ok:false,s:{}}; paint(); }); return; }
    if(d.l==="replay"){ S.f=0; paint(false); return; }
    if(d.l==="sheet"&&st){ toSheet(st); return; }
    if(d.l==="hero"){ close(); var hn=document.querySelector("#homeV [data-hnew]"); if(hn&&!document.getElementById("homeV").hidden) hn.click(); else if(window.__bldOpen) window.__bldOpen(); return; }
    if(d.lg!=null&&st){ S.pick=+d.lg; paint(false); setOk(true); return; }
    if(d.lp!=null&&st){ var o=st.opts[+d.lp]; S.res=S.res||{}; S.fb=o.fb; if(o.ok){ S.res[+d.lp]="good"; S.hint=0; if(typeof buzz==="function") buzz(12); paint(false); setOk(true); } else { S.res[+d.lp]="try"; S.hint=st.hint?1:0; paint(false); setOk(!!V.ok||Object.keys(S.res).some(function(k){ return S.res[k]==="good"; })); } return; }
    if(d.l==="roll"||d.l==="reroll"){ if(S.busy) return; S.busy=1; if(d.l==="reroll"){ S.stage=0; } paint(false); lrnRoll([20]).then(function(r){ S.busy=0; S.die=r.v[0]; S.stage=1; paint(false); }); return; }
    if(d.l==="bonus"){ S.stage=2; paint(false); setOk(true); return; }
    if(d.lc!=null&&st){ var it=st.items[S.k||0], tot=it.die+it.bonus, right=(tot>=it.dc)===(d.lc==="1"); if(right){ S.k=(S.k||0)+1; S.miss=0; if(S.k>=st.items.length) setOk(true); } else S.miss=1; paint(false); if(V.ok) setOk(true); return; }
    if(d.lh!=null&&st){ var v=+d.lh; S.res=S.res||{}; if(v===st.ok){ S.res[v]="good"; S.ph=1; S.fb=null; } else { S.res[v]="try"; S.miss=1; } paint(false); return; }
    if(d.lr!=null&&st){ var ro=st.rest.opts[+d.lr]; S.res2=S.res2||{}; S.fb=ro.fb; if(ro.ok){ S.res2[+d.lr]="good"; S.ph=2; paint(false); setOk(true); } else { S.res2[+d.lr]="try"; paint(false); } return; }
    if(d.ld!=null&&st){ var n=+d.ld; if(S.busy) return; S.busy=1; t.classList.add("roll"); lrnRoll([n]).then(function(r){ S.busy=0; S.r=S.r||{}; S.r[n]=r.v[0]; S.last=n; paint(false); if(Object.keys(S.r).length>=3) setOk(true); }); return; }
    if(d.l==="arol"&&st){ if(S.busy) return; S.busy=1; S.re=null; lrnRoll(st.mode==="insp"?[20]:[20,20]).then(function(r){ S.busy=0; var v=r.v; if(st.mode==="insp"&&v[0]>12) v=[Math.max(1,v[0]-10)];/* the first roll in this lesson is a low one, so the reroll makes sense */ S.v=v; paint(false); if(st.mode!=="insp") setOk(true); }); return; }
    if(d.l==="insp"&&st){ if(S.busy) return; S.busy=1; lrnRoll([20]).then(function(r){ S.busy=0; S.re=r.v[0]; paint(false); setOk(true); }); return; }
    if(d.lx!=null&&st){ var x=+d.lx, y=+d.ly, dist=Math.max(Math.abs(x-S.pos[0]),Math.abs(y-S.pos[1])); if(t.classList.contains("hero")||t.classList.contains("foe")) return; if(S.act){ S.msg=fmt(st.second); paint(false); return; }
      if(dist>S.left){ S.msg=fmt(st.far); paint(false); return; } S.left-=dist; S.pos=[x,y]; S.msg=esc(F("moved",{n:S.left})); paint(false); var c2=document.querySelector('[data-lx="'+x+'"][data-ly="'+y+'"]'); if(c2) try{ c2.focus({preventScroll:true}); }catch(er){} return; }
    if(d.la&&st){ if(S.act){ S.msg=fmt(st.second); paint(false); return; } if(d.la==="Attack"&&!near(S.pos||st.hero,st.foe)){ S.msg=esc(U("notNear")); paint(false); return; } S.act=d.la; S.msg=fmt(st.good); paint(false); setOk(true); return; }
    if(V.view==="quiz"){ var Q=LEARN.quiz[V.qi]; if(d.lq!=null){ if(S.ok) return; S.res=S.res||{}; var right2=+d.lq===Q.a; S.res[+d.lq]=right2?"good":"try"; if(right2){ S.ok=1; if(!S.miss) V.qok++; } else S.miss=1; paint(false); return; }
      if(d.l==="qnext"){ if(V.qi<LEARN.quiz.length-1){ V.qi++; V.s={}; paint(); } else { V.qd=1; lrnQuizDone(V.qok); paint(); } return; } }
  });
  w.addEventListener("keydown",function(e){ if(e.key==="Escape"){ e.stopPropagation(); if(document.getElementById("lrnPop").classList.contains("on")) popHide(); else back(); return; }
    var c=e.target.closest&&e.target.closest(".lrn-cell"); if(c&&/^Arrow/.test(e.key)){ e.preventDefault(); var x=+c.dataset.lx+(e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0), y=+c.dataset.ly+(e.key==="ArrowDown"?1:e.key==="ArrowUp"?-1:0); var n=document.querySelector('[data-lx="'+x+'"][data-ly="'+y+'"]'); if(n) n.focus(); } });
  /* Escape on the glossary card (it sits in the top layer, outside the keydown path of the root on some browsers) */
  document.getElementById("lrnPop").addEventListener("keydown",function(e){ if(e.key==="Escape"){ e.stopPropagation(); popHide(); } });
}
/* the Back button of the phone: glossary card, then the sheet spotlight, then one step back in Learn (40-ui ovTop asks this first) */
window.__learnBack=function(){ var p=document.getElementById("lrnPop"); if(p&&p.classList.contains("on")) return popHide; if(SPOT) return function(){ spotHide(); }; var w=document.getElementById("learn"); if(w&&!w.hidden) return back; return null; };
window.__learnOpen=open;
window.__learnState=function(){ return {view:V.view,p:V.p,i:V.i,ok:V.ok,s:V.s,fin:V.fin,qi:V.qi,qd:V.qd,lrn:LRN}; };
try{ if(location.hash==="#learn") setTimeout(function(){ open(); },0); }catch(e){}
})();
