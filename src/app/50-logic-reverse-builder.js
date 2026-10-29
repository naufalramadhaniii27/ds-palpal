/* T11 G4 N1 Reverse Builder. The player writes goals ("AC at least 18, Stealth at least +7"), the app tries legal builds of the same class
   and level and lists the ones that reach every goal, with what changes against the build now.
   What it tries: every species and background of the build's rules set, the background's +2 and +1 on the abilities the goals need,
   the standard array placed in the order the goals need (then the class's main abilities), and for an Armor Class goal every armor the class
   can wear, with or without a Shield. Each try goes through the builder (window.__bldSheetFor) and the sheet derivation (derive), the same
   code as the real sheet, so a result is never a guess. The work runs in small slices (setTimeout), so the screen stays responsive.
   It runs on the main thread, not in a Web Worker: the builder and derivation code live in the page. The result goes into the builder
   only when the player taps Use this build, and the old build stays as the backup build. */
var RB={run:0};
var RB_ARR=[15,14,13,12,10,8], RB_AB=["STR","DEX","CON","INT","WIS","CHA"];
function rbGoals(){ var g=[], q=function(s){ return document.querySelector("#sheetBody "+s); }, n=function(s){ var e=q(s); var v=e?parseInt(e.value,10):NaN; return isFinite(v)?v:null; };
  if(n("[data-rbg=ac]")!=null) g.push({k:"ac",min:n("[data-rbg=ac]"),l:"Armor Class"});
  if(n("[data-rbg=hp]")!=null) g.push({k:"hp",min:n("[data-rbg=hp]"),l:"Hit Points"});
  if(n("[data-rbg=init]")!=null) g.push({k:"init",min:n("[data-rbg=init]"),l:"Initiative"});
  var sk=q("[data-rbs=sk]"); if(sk&&sk.value&&n("[data-rbg=sk]")!=null) g.push({k:"sk",n:sk.value,min:n("[data-rbg=sk]"),l:sk.value});
  var sv=q("[data-rbs=sv]"); if(sv&&sv.value&&n("[data-rbg=sv]")!=null) g.push({k:"sv",n:sv.value,min:n("[data-rbg=sv]"),l:ABN[sv.value]+" save"});
  if(n("[data-rbg=atk]")!=null) g.push({k:"atk",min:n("[data-rbg=atk]"),l:"Best attack bonus"});
  return g; }
/* the ability each goal leans on, in order. Armor Class: Dexterity (light and medium armor), Hit Points: Constitution */
function rbOrder(goals,c){ var w={}, add=function(k,v){ w[k]=(w[k]||0)+v; };
  goals.forEach(function(g){ if(g.k==="ac"){ add("DEX",3); } else if(g.k==="hp") add("CON",3); else if(g.k==="init") add("DEX",3);
    else if(g.k==="sk"){ var s=(c.skills||[]).filter(function(x){ return x.n===g.n; })[0]; if(s) add(s.ab,4); } else if(g.k==="sv") add(g.n,4); else if(g.k==="atk"){ add(c.attacks&&c.attacks[0]&&c.attacks[0].ab||"STR",3); } });
  var sc=(c.abilities)||{}; RB_AB.forEach(function(k){ var a=sc[k]; if(a) add(k,(+a.base||10)/100); });/* ties: keep the build's own order */
  return RB_AB.slice().sort(function(a,b){ return (w[b]||0)-(w[a]||0); }); }
/* the numbers of one try, from the real derivation */
function rbEval(nb,goals,opts){ var c2=null; try{ c2=window.__bldSheetFor(nb); }catch(e){ return null; } if(!c2||!c2.abilities) return null;
  var keepC=C, keepD=D, keepB=B, keepCU=CU0, o={};
  try{ C=c2; derive(); o.ac=D.ac; o.hp=D.hpmax; o.init=D.init; o.sk={}; (c2.skills||[]).forEach(function(s,i){ o.sk[s.n]=D.skill[i]; }); o.sv=JSON.parse(JSON.stringify(D.save||{}));
    o.atk=null; (D.atk||[]).forEach(function(a){ if(a&&isFinite(a.hit)) o.atk=o.atk==null?a.hit:Math.max(o.atk,a.hit); });
    o.mod=JSON.parse(JSON.stringify(D.mod)); o.score=JSON.parse(JSON.stringify(D.score)); o.armorP=String((c2.profs||{}).armor||"");
    o.acBonus=((c2.ac||{}).bonus||[]).reduce(function(a,b){ return a+(+b.v||0); },0); o.acNow=String((c2.ac||{}).baseSrc||""); }
  finally{ C=keepC; D=keepD; B=keepB; CU0=keepCU; }
  /* other armor: base + Dexterity (all, up to +2, or none) + Shield 2 + the bonuses the build already has. Heavy armor needs its Strength */
  if(goals.some(function(g){ return g.k==="ac"; })&&opts&&opts.armor){ var best=null, P=o.armorP.toLowerCase();
    Object.keys(opts.armor).forEach(function(k){ var a=opts.armor[k]; if(P.indexOf(a.cat.toLowerCase())<0) return; if(a.str&&o.score.STR<a.str) return;
      [false,true].forEach(function(sh){ if(sh&&P.indexOf("shield")<0) return; var dx=a.dex==="full"?o.mod.DEX:a.dex==="max2"?Math.min(2,o.mod.DEX):0, ac=a.ac+dx+(sh?2:0)+o.acBonus;
        if(!best||ac>best.ac) best={ac:ac,armor:k,shield:sh}; }); });
    if(best&&best.ac>o.ac){ o.alt=best; } }
  return o; }
function rbMeets(o,g){ var v=g.k==="sk"?o.sk[g.n]:g.k==="sv"?o.sv[g.n]:g.k==="ac"?Math.max(o.ac,o.alt?o.alt.ac:-99):o[g.k]; return v!=null&&v>=g.min?{ok:true,v:v}:{ok:false,v:v}; }
/* every try, made lazily: background and its +2/+1, species, ability order */
function rbTries(opts,goals,c){ var b0=opts.b, order=rbOrder(goals,c), out=[];
  var bgs=Object.keys(opts.bg), sps=opts.species.filter(function(s){ return !/Custom/i.test(s); });
  bgs.forEach(function(bg){ var ab=opts.bg[bg].ab||[]; var pref=order.filter(function(k){ return ab.indexOf(k)>=0; });
    var modes=opts.r14?[{bgMode:b0.bgMode||"111"}]:[{bgMode:"21",bg2:pref[0],bg1:pref[1]},{bgMode:"111"}];
    sps.forEach(function(sp){ modes.forEach(function(m){ out.push({species:sp,bg:bg,m:m}); }); }); });
  return {list:out,order:order}; }
function rbBuild(b0,t,order){ var nb=JSON.parse(JSON.stringify(b0)); nb.species=t.species; nb.bg=t.bg; nb.bgMode=t.m.bgMode; nb.bg2=t.m.bg2||""; nb.bg1=t.m.bg1||"";
  var base={}, arr={}; order.forEach(function(k,i){ base[k]=RB_ARR[i]; arr[k]=String(RB_ARR[i]); }); nb.base=base; nb.arr=arr; nb.method="array";/* the Standard Array, as the builder stores it */ if(nb.unset) nb.unset=nb.unset.filter(function(x){ return x!=="species"&&x!=="bg"&&x!=="abil"; }); return nb; }
function rbDiff(b0,nb,o){ var d=[]; if(nb.species!==b0.species) d.push("Species "+nb.species); if(nb.bg!==b0.bg) d.push("Background "+nb.bg);
  if(nb.bgMode==="21") d.push("+2 "+nb.bg2+", +1 "+nb.bg1); else if(nb.bgMode!==b0.bgMode) d.push("+1 to each background ability");
  var bs=RB_AB.filter(function(k){ return (b0.base||{})[k]!==nb.base[k]; }); if(bs.length) d.push("Scores "+RB_AB.map(function(k){ return k+" "+nb.base[k]; }).join(", "));
  if(o.alt) d.push(o.alt.armor+(o.alt.shield?" and a Shield":"")); return d; }
function rbSearch(){ var goals=rbGoals(), box=document.querySelector("#sheetBody .rb-out"); if(!box) return; if(!goals.length){ box.innerHTML='<p class="bk-f">Fill in at least one goal.</p>'; return; }
  var opts=window.__bldOpts&&window.__bldOpts(); if(!opts||!opts.b||!opts.b.cls){ box.innerHTML='<p class="bk-f">Open the builder once, then try again.</p>'; return; }
  var run=++RB.run, T=rbTries(opts,goals,C), i=0, hits=[], near=[], t0=Date.now();
  box.innerHTML='<p class="bk-f rb-prog" aria-live="polite">Trying builds: 0 of '+T.list.length+'</p>';
  (function slice(){ if(run!==RB.run) return; var end=Date.now()+40;
    while(i<T.list.length&&Date.now()<end){ var t=T.list[i++], nb=rbBuild(opts.b,t,T.order), o=rbEval(nb,goals,opts); if(!o) continue;
      var m=goals.map(function(g){ return rbMeets(o,g); }), miss=m.filter(function(x){ return !x.ok; }).length, gap=goals.reduce(function(a,g,j){ return a+Math.max(0,g.min-(m[j].v==null?-99:m[j].v)); },0);
      var rec={nb:nb,o:o,m:m,diff:rbDiff(opts.b,nb,o),gap:gap}; if(!miss) hits.push(rec); else near.push(rec); }
    var p=document.querySelector("#sheetBody .rb-prog"); if(p) p.textContent="Trying builds: "+i+" of "+T.list.length;
    if(i<T.list.length){ setTimeout(slice,0); return; }
    hits.sort(function(a,b){ return a.diff.length-b.diff.length||b.o.hp-a.o.hp; }); near.sort(function(a,b){ return a.gap-b.gap||a.diff.length-b.diff.length; });
    RB.res=hits.length?hits.slice(0,6):near.slice(0,3); RB.goals=goals; RB.ok=!!hits.length; RB.opts=opts;
    box.innerHTML='<p class="bk-f">'+T.list.length+' builds tried in '+((Date.now()-t0)/1000).toFixed(1)+' s. '+(hits.length?hits.length+' reach every goal'+(hits.length>6?', the 6 with the fewest changes are shown':'')+'.':'None reaches every goal. The closest ones:')+'</p>'+RB.res.map(rbCard).join(""); })(); }
function rbCard(r,i){ var g=RB.goals; return '<div class="rb-c'+(RB.ok?'':' near')+'"><ul>'+(r.diff.length?r.diff.map(function(x){ return '<li>'+esc(x)+'</li>'; }).join(""):'<li>Your build already does it</li>')+'</ul><p class="rb-v">'+g.map(function(q,j){ var m=r.m[j]; return '<span class="'+(m.ok?'ok':'no')+'">'+esc(q.l)+' '+(m.v==null?'?':(q.k==="ac"||q.k==="hp"?m.v:sg(m.v)))+'</span>'; }).join("")+'</p>'+(r.diff.length?'<button type="button" class="btn press" data-rbuse="'+i+'">Use this build</button>':'')+'</div>'; }
function rbOpen(){ navStack=[]; var go=function(){ var sk=(C.skills||[]).map(function(s){ return '<option>'+esc(s.n)+'</option>'; }).join(""), sv=RB_AB.map(function(k){ return '<option value="'+k+'">'+esc(ABN[k])+'</option>'; }).join("");
    var f=function(k,l,ph){ return '<label class="rb-f"><span>'+l+' at least</span><input type="number" inputmode="numeric" data-rbg="'+k+'" placeholder="'+ph+'"></label>'; };
    openSheet("Find a build",'<p class="bk-f">Write what you want your '+esc(C.clsLabel||C.cls||"character")+' to reach at level '+D.level+'. The app tries every species, background and score layout of your rules set and shows the builds that get there.</p><div class="rb-g">'+f("ac","Armor Class",D.ac+2)+f("hp","Hit Points",D.hpmax+5)+f("init","Initiative",D.init+2)+f("atk","Best attack bonus","")+
      '<label class="rb-f"><span>Skill</span><select data-rbs="sk"><option value="">None</option>'+sk+'</select></label>'+f("sk","That skill","")+'<label class="rb-f"><span>Saving throw</span><select data-rbs="sv"><option value="">None</option>'+sv+'</select></label>'+f("sv","That save","")+
      '</div><p><button type="button" class="btn pri press" data-rbgo="1">Find builds</button></p><div class="rb-out"></div>',"rb"); };
  if(window.__bldSheetFor&&window.__bldOpts) go(); else { if(window.__bldNeed) try{ window.__bldNeed(); }catch(e){} var n=0; (function w(){ if(window.__bldSheetFor&&window.__bldOpts) go(); else if(++n<60) setTimeout(w,200); else toast("The builder did not load."); })(); } }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-rbgo],[data-rbuse],[data-rbopen]"); if(!b) return; e.preventDefault();
  if(b.hasAttribute("data-rbopen")){ rbOpen(); return; } if(b.hasAttribute("data-rbgo")){ rbSearch(); return; }
  var r=RB.res&&RB.res[+b.getAttribute("data-rbuse")]; if(!r) return; var nb=JSON.parse(JSON.stringify(r.nb));
  if(r.o.alt){ nb.inv=(nb.inv||[]).map(function(x){ var it=Object.assign({},x); if(it.eq&&((RB.opts&&RB.opts.armor[it.n])||it.n==="Shield")) it.eq=false; return it; }); nb.inv.push({n:r.o.alt.armor,q:1,eq:true}); if(r.o.alt.shield) nb.inv.push({n:"Shield",q:1,eq:true}); }
  closeSheet(); window.__bldUse(nb,"Build from Find a build"); });
window.__rbOpen=rbOpen;
