/* === Z pack: dice rolls with history, sound, hover cards, level-up gains, Hit Die result, builder stamps and class sweep, share card === */
(function(){
  var MI=window.__MI; if(!MI||!document.body.animate) return;
  var D=document, FINE=matchMedia("(hover: hover) and (pointer: fine)");
  function full(){ return MI.full(); }
  function calm(){ return MI.rm()||MI.mode==="off"; }
  function nf(fn){ (window.__miNF||setTimeout)(fn); }
  function rm(e){ if(e&&e.parentNode) e.parentNode.removeChild(e); }
  function vis(e){ return e&&e.getClientRects().length; }
  function esc(t){ return String(t).replace(/[&<>"]/g,function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function fx(cls,html,ms){ var e=D.createElement("div"); e.className="mi-w "+cls; e.setAttribute("aria-hidden","true"); if(html) e.innerHTML=html; D.body.appendChild(e); setTimeout(function(){ rm(e); },ms||2300); return e; }
  function ls(k,v){ try{ if(v===undefined) return localStorage.getItem(k); localStorage.setItem(k,v); }catch(e){ return null; } }
  function st(){ try{ return window.__sheetState?window.__sheetState():null; }catch(e){ return null; } }

  /* X1 sound: made on the fly with Web Audio, nothing to download. On by default, Settings turns it off */
  function snd(){ return (ls("mi-snd")||"on")==="on"&&MI.mode!=="off"; }
  function ctx(){ return MI.ac(); }
  function tone(f,t0,dur,type,vol,f2){ var c=ctx(); if(!c) return; var o=c.createOscillator(), g=c.createGain(), t=c.currentTime+t0; o.type=type||"sine"; o.frequency.setValueAtTime(f,t); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t+dur); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||.15,t+.012); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+dur+.02); }
  function noise(t0,dur,freq,vol){ var c=ctx(); if(!c) return; var n=Math.floor(c.sampleRate*dur), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0); for(var i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
    var s=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(), t=c.currentTime+t0; s.buffer=b; f.type="bandpass"; f.frequency.value=freq; f.Q.value=1.4; g.gain.value=vol||.25; s.connect(f); f.connect(g); g.connect(c.destination); s.start(t); }
  var SND={
    dice:function(){ for(var i=0;i<6;i++) noise(i*.055+Math.random()*.02,.05,1800+Math.random()*2200,.22); },
    crit:function(){ [523,659,784,1047].forEach(function(f,i){ tone(f,.5+i*.08,.5,"triangle",.12); }); tone(2093,.82,.7,"sine",.05); },
    fail:function(){ tone(320,.5,.55,"sawtooth",.06,70); tone(160,.55,.5,"sine",.12,50); },
    heal:function(){ tone(880,0,.6,"sine",.1); tone(1320,.08,.7,"sine",.07); tone(1760,.16,.6,"sine",.04); },
    hurt:function(){ tone(140,0,.35,"sine",.25,40); noise(0,.12,500,.25); },
    level:function(){ [392,523,659,784,1047].forEach(function(f,i){ tone(f,i*.11,.6,"triangle",.11); }); },
    rest:function(){ tone(220,0,1.4,"sine",.06); tone(330,.1,1.3,"sine",.05); tone(440,.2,1.2,"sine",.03); },
    cast:function(){ tone(660,0,.45,"sine",.06,1320); tone(990,.05,.4,"triangle",.04,1980); },
    click:function(){ tone(1200,0,.05,"square",.02); },
    coin:function(){ tone(1980,0,.12,"triangle",.07); tone(2640,.06,.16,"triangle",.05); tone(1760,.12,.2,"sine",.04); },
    armor:function(){ noise(0,.09,2600,.25); tone(220,0,.18,"square",.03); noise(.05,.07,4200,.15); },
    blade:function(){ noise(0,.16,6000,.18); tone(1400,.02,.25,"sine",.03,2200); },
    chime:function(){ tone(1568,0,.6,"sine",.08); tone(2093,.07,.7,"sine",.05); },
    crystal:function(){ tone(2637,0,.25,"triangle",.06); tone(3520,.03,.3,"sine",.04); noise(0,.05,8000,.08); },
    cond:function(){ tone(330,0,.3,"triangle",.06,260); },
    heart:function(){ [0,.32,1,1.32].forEach(function(t){ tone(60,t,.18,"sine",.35,40); }); },
    hover:function(){ tone(2400,0,.03,"sine",.012); },
    page:function(){ noise(0,.12,3200,.12); noise(.05,.1,1800,.08); }
  };
  function play(k){ if(!snd()) return; try{ SND[k]&&SND[k](); }catch(e){} }
  window.__miSnd=play;
  addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-misnd]"); if(!b) return; ls("mi-snd",b.getAttribute("data-misnd"));
    Array.prototype.forEach.call(D.querySelectorAll("[data-misnd]"),function(x){ var on=x===b; x.classList.toggle("on",on); x.setAttribute("aria-pressed",on); }); if(b.getAttribute("data-misnd")==="on") play("heal"); },true);
  addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("#dmgBtn,#healBtn"); if(!b) return; var amt=+((D.getElementById("hpAmt")||{}).value||0); if(amt>0) play(b.id==="healBtn"?"heal":"hurt"); },true);
  var W=window.__miWow; if(W){ if(W.level){ var l0=W.level; W.level=function(){ l0.apply(this,arguments); play("level"); }; } if(W.rest){ var r0=W.rest; W.rest=function(){ r0.apply(this,arguments); play("rest"); }; } if(W.cast){ var c0=W.cast; W.cast=function(){ c0.apply(this,arguments); play("cast"); }; } }

  /* X2 rolls: the breakdown of a bonus or a damage gets Roll buttons. X3 natural 20 and natural 1 have their own moment. X4 the last 30 rolls stay in a drawer */
  var last=null;
  addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-bd]"); if(b&&!b.closest("#sheet")) last={k:b.getAttribute("data-bd"),el:b,t:Date.now(),txt:(b.textContent||"").replace(/\s+/g," ")}; },true);
  function rollSpec(k,el,txt){ if(!k) return null;
    if(/^ad-/.test(k)){ var m=/(\d*d\d+(?:\s*[+−-]\s*\d*d?\d+)*)/.exec(txt); return m?{dmg:m[1].replace(/−/g,"-").replace(/\s+/g,""),dtype:(window.__miRoll&&window.__miRoll.dtype)?window.__miRoll.dtype(txt):""}:null; }
    if(/^(ah-|save-|sk-|ab-|init$|spatk$)/.test(k)){ var src=txt; if(/^ab-/.test(k)){ var mm=el&&el.querySelector(".m"); src=mm?mm.textContent:txt; } var n=/([+−-]\s?\d+)/.exec(src); return n?{bon:parseInt(n[1].replace(/−/,"-").replace(/\s/,""),10)}:null; }
    return null; }
  function d(n){ var a=new Uint32Array(1); (window.crypto||{getRandomValues:function(x){ x[0]=Math.random()*4294967295; return x; }}).getRandomValues(a); return 1+a[0]%n; }
  function parseDmg(x){ var terms=[], re=/([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/g, m; while((m=re.exec(x))){ if(m[3]) terms.push({s:m[1]==="-"?-1:1,n:+(m[2]||1),f:+m[3]}); else terms.push({s:m[4]==="-"?-1:1,k:+m[5]}); } return terms; }
  var H=[]; try{ H=JSON.parse(sessionStorage.getItem("mi-rolls")||"[]")||[]; }catch(e){ H=[]; }
  function save(){ try{ sessionStorage.setItem("mi-rolls",JSON.stringify(H.slice(0,30))); }catch(e){} }
  function doRoll(spec,mode,label){ var r={l:label,t:Date.now()}; if(spec.dtype) r.dt=spec.dtype;
    if(spec.dmg){ var terms=parseDmg(spec.dmg), tot=0, parts=[], dice=[]; terms.forEach(function(q){ if(q.f){ var n=q.n*(mode==="crit"?2:1); for(var i=0;i<n;i++){ var v=d(q.f); dice.push(v); tot+=q.s*v; } parts.push((q.s<0?"-":"")+n+"d"+q.f); } else { tot+=q.s*q.k; parts.push((q.s<0?"-":"+")+q.k); } });
      r.v=Math.max(0,tot); r.d="["+dice.join(", ")+"] "+parts.join("").replace(/^\+/,""); r.k=mode==="crit"?"crit":"dmg"; }
    else { var a=d(20), b=d(20), use=mode==="adv"?Math.max(a,b):mode==="dis"?Math.min(a,b):a; r.nat=use; r.v=use+spec.bon; r.d=(mode?("["+a+", "+b+"] "+(mode==="adv"?"advantage":"disadvantage")+" "):"")+use+(spec.bon<0?" − "+(-spec.bon):" + "+spec.bon); r.k=use===20?"nat20":use===1?"nat1":"d20"; }
    H.unshift(r); H=H.slice(0,30); save(); show(r); hist(); if(window.__miJournal&&(r.k!=="d20"||/save|check/i.test(label))) window.__miJournal.add("roll",label+": "+r.v+(r.k==="nat20"?" (natural 20)":r.k==="nat1"?" (natural 1)":"")); if(r.dt&&window.__miRoll&&window.__miRoll.fxDamage) setTimeout(function(){ window.__miRoll.fxDamage(r.dt); },650); return r; }
  (window.__miRoll=window.__miRoll||{}).roll=doRoll;
  var D20='<svg viewBox="0 0 100 100"><path d="M50 4l42 24v44L50 96 8 72V28z" class="o"/><path d="M50 4L29 40h42zM29 40L8 72M71 40l21 32M29 40l21 38 21-38M50 78L8 72M50 78l42-6M50 78v18" class="i"/></svg>';
  function show(r){ play("dice"); var big=r.k==="nat20"||r.k==="nat1";
    if(calm()){ if(window.__miToast) window.__miToast(r.l+": "+r.v); return; }
    var o=fx("mi-roll-o mi-roll-"+r.k,(big&&window.__artVig?window.__artVig("moment",r.k==="nat20"?"natural-20":"natural-1",104):"")+'<div class="dz">'+D20+'<b>'+(r.nat||"")+'</b></div><div class="rv"><small>'+esc(r.l)+'</small><strong>'+r.v+'</strong><em>'+esc(r.d)+'</em>'+(r.k==="nat20"?'<i>Natural 20</i>':r.k==="nat1"?'<i>Natural 1</i>':r.k==="crit"?'<i>Critical damage</i>':'')+'</div>',2300);
    var dz=o.querySelector(".dz"), rv=o.querySelector(".rv");
    dz.animate([{transform:"translateY(-40vh) rotate(-540deg) scale(.5)",opacity:0},{transform:"translateY(12px) rotate(-20deg) scale(1.05)",opacity:1,offset:.6},{transform:"translateY(-6px) rotate(8deg)",offset:.78},{transform:"none",opacity:1}],{duration:820,easing:"cubic-bezier(.2,.8,.2,1)"});
    rv.animate([{opacity:0,transform:"translateY(14px) scale(.9)"},{opacity:1,transform:"none"}],{duration:380,delay:700,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"});
    o.animate([{opacity:1},{opacity:1,offset:.82},{opacity:0}],{duration:2100,easing:"linear"}).onfinish=function(){ rm(o); };
    if(r.k==="nat20"){ setTimeout(function(){ play("crit"); MI.buzz("success"); if(window.__miBurst) window.__miBurst(innerWidth/2,innerHeight*.42,{n:28,colors:["#ffe7a3","#ffd166","#ffffff","#e2aa4c"],shape:"mi-star",dist:180,dur:1100}); },650); }
    if(r.k==="nat1"){ setTimeout(function(){ play("fail"); MI.buzz("heavy"); o.animate([{transform:"none"},{transform:"translateX(-10px)"},{transform:"translateX(8px)"},{transform:"translateX(-4px)"},{transform:"none"}],{duration:380,easing:"ease-out"}); },650); }
    if(!big) MI.buzz("light"); }
  function bar(){ var sh=D.getElementById("sheet"), body=D.getElementById("sheetBody"); if(!sh||!body||!sh.classList.contains("on")||!last||Date.now()-last.t>4000) return; if(body.querySelector(".mi-roll")) return;
    var spec=rollSpec(last.k,last.el,last.txt); if(!spec) return; var lab=((D.getElementById("sheetTitle")||{}).textContent||"Roll").replace(/\s+/g," ").trim().slice(0,60);
    var h=spec.dmg?'<button type="button" class="mi-rb pri" data-mr="">'+DI+'Roll '+esc(spec.dmg)+'</button><button type="button" class="mi-rb" data-mr="crit">Critical</button>':'<button type="button" class="mi-rb pri" data-mr="">'+DI+'Roll d20 '+(spec.bon<0?"−"+(-spec.bon):"+"+spec.bon)+'</button><button type="button" class="mi-rb" data-mr="adv">Advantage</button><button type="button" class="mi-rb" data-mr="dis">Disadvantage</button>';
    var hint=(!spec.dmg&&window.__miRoll&&window.__miRoll.hint)?window.__miRoll.hint(last.k):null, hh="";
    if(hint){ if(hint.fail.length) hh='<p class="mi-rhint bad">Automatic failure: '+esc(hint.fail.join(", "))+'</p>'; else hh='<p class="mi-rhint">'+(hint.mode==="dis"?"Disadvantage":hint.mode==="adv"?"Advantage":"Advantage and disadvantage cancel")+' from '+esc(hint.dis.concat(hint.adv).join(", "))+'</p>'; }
    var w=D.createElement("div"); w.className="mi-roll"; w.innerHTML=hh+'<div class="mi-rbs">'+h+'</div><div class="mi-rres" aria-live="polite"></div>'; w.__spec=spec; w.__lab=lab; w.__mode=hint?hint.mode:""; body.insertBefore(w,body.firstChild);
    if(w.__mode){ var pb=w.querySelector(".mi-rb.pri"); if(pb){ pb.setAttribute("data-mr",w.__mode); pb.innerHTML+=' <small>'+(w.__mode==="dis"?"with disadvantage":"with advantage")+'</small>'; } } }
  var DI='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 2l-5 8h10zM7 10l5 9 5-9"/></svg>';
  var shE=D.getElementById("sheet"), shB=D.getElementById("sheetBody"), bq=0; function bQ(){ bar(); }
  if(shE&&shB){ new MutationObserver(bQ).observe(shE,{attributes:true,attributeFilter:["class"]}); new MutationObserver(bQ).observe(shB,{childList:true}); }
  addEventListener("click",function(e){ var s=e.target.closest&&e.target.closest("[data-mrs]"); if(s){ e.preventDefault(); e.stopPropagation(); var res=s.closest(".mi-rres"), r=res&&res.__r; if(!r) return; var c=st(), t=((c&&c.C&&c.C.name)||"I")+" rolled "+r.l+": "+r.v+" ("+r.d+")";
      if(navigator.share) navigator.share({text:t}).catch(function(){}); else if(navigator.clipboard) navigator.clipboard.writeText(t).then(function(){ s.textContent="Copied"; },function(){}); return; }
    var b=e.target.closest&&e.target.closest(".mi-rb:not(.mi-4d6):not([data-cpr]):not([data-cpx])"); if(!b) return; e.preventDefault(); e.stopPropagation(); var w=b.closest(".mi-roll"); if(!w) return; var r=doRoll(w.__spec,b.getAttribute("data-mr"),w.__lab), res=w.querySelector(".mi-rres");
    res.innerHTML='<b class="'+r.k+'">'+r.v+'</b><span>'+esc(r.d)+'</span><button type="button" class="mi-rsh" data-mrs="1">Share</button>'; res.__r=r; res.animate([{opacity:0,transform:"translateY(6px)"},{opacity:1,transform:"none"}],{duration:300,delay:calm()?0:700,fill:"backwards",easing:"ease-out"}); },true);
  /* X4 drawer */
  var hb=null, dr=null;
  function hist(){ if(!H.length) return; if(!hb){ hb=D.createElement("button"); hb.type="button"; hb.className="mi-rhb"; hb.setAttribute("aria-label","Roll history"); hb.innerHTML=DI+'<b></b>'; D.body.appendChild(hb); hb.addEventListener("click",function(e){ e.stopPropagation(); openH(); }); }
    hb.querySelector("b").textContent=H[0].v; if(dr&&dr.classList.contains("on")) fill(); }
  function fill(){ var l=dr.querySelector(".mi-rhl"); l.innerHTML=H.map(function(r){ var tm=new Date(r.t); return '<div class="mi-rhr '+r.k+'"><b>'+r.v+'</b><span><i>'+esc(r.l)+'</i><small>'+esc(r.d)+' • '+("0"+tm.getHours()).slice(-2)+":"+("0"+tm.getMinutes()).slice(-2)+'</small></span></div>'; }).join(""); }
  function openH(){ if(!dr){ dr=D.createElement("div"); dr.className="mi-rh"; dr.setAttribute("role","dialog"); dr.setAttribute("aria-label","Roll history"); dr.innerHTML='<div class="mi-rhx"></div><div class="mi-rhp"><div class="mi-rhh"><b>Rolls</b><button type="button" class="mi-rhc" data-mrj="1">Journal</button><button type="button" class="mi-rhc" data-mrc="1">Clear</button><button type="button" class="mi-rhc" data-mrx="1">Done</button></div><div class="mi-rhl"></div></div>'; D.body.appendChild(dr);
      dr.addEventListener("click",function(e){ if(e.target.closest("[data-mrj]")){ jour(); e.stopPropagation(); return; } if(e.target.closest("[data-mre]")){ jexp(); e.stopPropagation(); return; } if(e.target.closest(".mi-rhx,[data-mrx]")) closeH(); else if(e.target.closest("[data-mrc]")){ H=[]; save(); closeH(); rm(hb); hb=null; } e.stopPropagation(); });
      ["pointerdown","touchstart","touchmove"].forEach(function(t){ dr.addEventListener(t,function(e){ e.stopPropagation(); },{passive:true}); }); }
    fill(); dr.classList.add("on"); }
  function closeH(){ if(dr) dr.classList.remove("on"); }
  function jour(){ var J=window.__miJournal, l=dr.querySelector(".mi-rhl"), hb=dr.querySelector(".mi-rhh b"), on=dr.classList.toggle("jr"); hb.textContent=on?"Journal":"Rolls"; dr.querySelector("[data-mrj]").textContent=on?"Rolls":"Journal";
    if(!on){ fill(); return; } var a=J?J.all():[], day=""; l.innerHTML=(a.length?a.map(function(x){ var d=new Date(x.t), ds=d.toLocaleDateString(), h=(ds!==day?'<div class="mi-jd">'+esc(ds)+'</div>':""); day=ds; return h+'<div class="mi-jr mi-jr-'+esc(x.k)+'"><i>'+("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2)+'</i><span>'+esc(x.x)+'</span></div>'; }).join(""):'<p class="mi-jd">Nothing yet. Damage, healing, big rolls, rests and level ups are written here.</p>')+(a.length?'<button type="button" class="mi-rhc mi-jexp" data-mre="1">Save as text</button>':''); }
  function jexp(){ var J=window.__miJournal; if(!J) return; var c=st(), nm=(c&&c.C&&c.C.name)||"Character", t=nm+" \u2014 Journal\n\n"+J.all().slice().reverse().map(function(x){ var d=new Date(x.t); return d.toLocaleString()+"  "+x.x; }).join("\n"); var b=new Blob([t],{type:"text/plain"}), u=URL.createObjectURL(b), a=D.createElement("a"); a.href=u; a.download=nm.replace(/[^\w\- ]+/g,"")+" journal.txt"; D.body.appendChild(a); a.click(); rm(a); setTimeout(function(){ URL.revokeObjectURL(u); },4000); }
  addEventListener("keydown",function(e){ if(e.key==="Escape"&&dr&&dr.classList.contains("on")){ closeH(); e.stopPropagation(); } },true);
  if(H.length) hist();

  /* H5 + H6 + H7 mouse only: a small card with the summary of a spell, item or feature, what an ability feeds, or how an attack adds up */
  if(FINE.matches){ var card=null, cur=null, tm=0;
    function hide(){ clearTimeout(tm); cur=null; if(card) card.classList.remove("on"); }
    function txt(h){ var t=D.createElement("div"); t.innerHTML=h; Array.prototype.forEach.call(t.querySelectorAll(".dc-head,.dc-badge,svg,button,.bk-f"),function(x){ x.remove(); }); var parts=[], w=D.createTreeWalker(t,NodeFilter.SHOW_TEXT), n; while((n=w.nextNode())&&parts.join(" ").length<300){ var x=n.nodeValue.replace(/\s+/g," ").trim(); if(x) parts.push(x); } var s=parts.join(" \u00b7 ").replace(/ \u00b7 ([,.;:])/g,"$1"); return s.length>260?s.slice(0,257).replace(/\s+\S*$/,"")+"…":s; }
    function build(t){ var k=t.getAttribute("data-info")||"", b=t.getAttribute("data-bd")||"", h="";
      if(/^(sp|it|f):/.test(k)&&window.__miInfo){ var r=window.__miInfo(k); if(!r||!r.h) return ""; var t2=D.createElement("div"); t2.innerHTML=r.h; var sub=t2.querySelector(".dc-sub"), cells=[].slice.call(t2.querySelectorAll(".dc-cell")).filter(function(c){ var v=c.querySelector("b"); return v&&v.textContent.trim(); }).slice(0,4), pp=null;
          [].some.call(t2.querySelectorAll("p"),function(x){ if(!x.classList.contains("rule")&&!x.classList.contains("bk-f")&&(x.textContent||"").trim().length>20){ pp=x; return true; } });
          var ds=pp?(pp.textContent||"").replace(/\s+/g," ").trim():""; if(ds.length>200) ds=ds.slice(0,197).replace(/\s+\S*$/,"")+"\u2026";
          h='<b>'+esc(r.t||"")+'</b>'+(sub?'<small>'+esc(sub.textContent.replace(/\s+/g," ").trim())+'</small>':'')+(cells.length?'<div class="mi-hcg">'+cells.map(function(c){ return '<span><i>'+esc((c.querySelector("small")||{}).textContent||"")+'</i>'+esc(c.querySelector("b").textContent.replace(/\s+/g," ").trim())+'</span>'; }).join("")+'</div>':'')+(ds?'<p>'+esc(ds)+'</p>':''); if(!sub&&!cells.length&&!ds) return ""; }
      else if(/^ab-/.test(b)){ var ab=b.slice(3), rows=[]; Array.prototype.forEach.call(D.querySelectorAll("#skills .row"),function(r){ var a=r.querySelector(".ab3"); if(a&&a.textContent.trim()===ab){ rows.push('<li><span>'+esc((r.querySelector(".nm")||{}).textContent||"")+'</span><em>'+esc(((r.querySelector(".bonus")||{}).textContent||"").trim())+'</em></li>'); } });
        var sv=D.querySelector('#saves [data-bd="save-'+ab+'"]'); h='<b>'+esc(ab)+' feeds</b><ul>'+(sv?'<li><span>Saving throw</span><em>'+esc(sv.textContent.trim())+'</em></li>':"")+rows.join("")+'</ul>'; if(!rows.length&&!sv) return ""; }
      else if(/^(ah|ad)-/.test(b)&&window.__miBd){ var bd=window.__miBd(b); if(!bd||!bd.parts) return ""; h='<b>'+(b[1]==="h"?"Attack roll":"Damage")+'</b><ul>'+bd.parts.map(function(p){ return '<li><span>'+esc(p.l)+'</span><em>'+esc(p.raw?p.v:(p.v<0?"−"+(-p.v):"+"+p.v))+'</em></li>'; }).join("")+'</ul>'; }
      return h; }
    var SEL='#app .sp-r[data-info],#app .iname[data-info],#app .fitem .tx[data-info^="f:"],#abil .ab[data-bd],#app .abox[data-bd]';
    MI.on("pointerover",function(e){ if(e.pointerType!=="mouse") return; var t=e.target.closest&&e.target.closest(SEL); if(!t||t===cur) return; hide(); cur=t;
      tm=setTimeout(function(){ if(cur!==t||!t.isConnected||e.buttons) return; var h=build(t); if(!h) return; if(!card){ card=D.createElement("div"); card.className="mi-hc"; card.setAttribute("aria-hidden","true"); D.body.appendChild(card); }
        card.innerHTML=h; var r=t.getBoundingClientRect(), w=card.offsetWidth, ch=card.offsetHeight, x=r.right+12, y=Math.max(8,Math.min(innerHeight-ch-8,r.top));
        if(x+w>innerWidth-8){ x=Math.max(8,Math.min(innerWidth-w-8,r.left+r.width/2-w/2)); y=r.bottom+10; if(y+ch>innerHeight-8) y=Math.max(8,r.top-ch-10); }
        card.style.left=x+"px"; card.style.top=y+"px"; card.classList.add("on"); },420); },true);
    MI.on("pointerout",function(e){ if(cur&&(!e.relatedTarget||!cur.contains(e.relatedTarget))) hide(); },true);
    addEventListener("pointerdown",hide,true); addEventListener("scroll",function(){ if(cur) hide(); },{passive:true,capture:true}); }

  /* M13 after a level up: what grew shows a green +N, once */
  function snap(){ var s=st(); if(!s||!s.C) return null; function num(sel){ var e=D.querySelector(sel); return e?parseInt((e.textContent||"").replace(/[^\d-]/g,""),10):null; }
    return {n:s.C.name, lv:s.C.level, hp:num("#hpMax"), pb:num('.tile[data-bd="pb"] .v'), ac:num(".tile.ac .v"), sl:D.querySelectorAll(".spsl .bx").length}; }
  function gains(){ var now=snap(); if(!now||!now.n) return; var key="mi-snap-"+now.n, old=null; try{ old=JSON.parse(ls(key)||"null"); }catch(e){}
    ls(key,JSON.stringify(now)); if(!old||!(now.lv>old.lv)||calm()) return;
    [["#hpMax","hp"],['.tile[data-bd="pb"] .v',"pb"],[".tile.ac .v","ac"]].forEach(function(q,i){ var el=D.querySelector(q[0]), dv=(now[q[1]]||0)-(old[q[1]]||0); if(!vis(el)||!(dv>0)) return; var r=el.getBoundingClientRect();
      var g=fx("mi-gain","+"+dv,2000); g.style.left=(r.left+r.width/2)+"px"; g.style.top=r.top+"px";
      g.animate([{transform:"translate(-50%,0) scale(.6)",opacity:0},{transform:"translate(-50%,-26px) scale(1.15)",opacity:1,offset:.3},{transform:"translate(-50%,-34px)",opacity:1,offset:.75},{transform:"translate(-50%,-46px)",opacity:0}],{duration:1600,delay:600+i*160,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}).onfinish=function(){ rm(g); }; }); }
  function boot(){ setTimeout(gains,500); }
  if(D.readyState==="complete") boot(); else addEventListener("load",boot,{once:true});

  /* M14 a Hit Die result typed in: the die lands on that number */
  addEventListener("change",function(e){ var t=e.target; if(!t||!t.matches||!t.matches("input[data-hdv]")||calm()) return; var v=parseInt(t.value,10); if(!(v>0)) return; var r=t.getBoundingClientRect();
    var g=fx("mi-hdr",'<b>'+v+'</b>',1600); g.style.left=(r.right-24)+"px"; g.style.top=(r.top+r.height/2)+"px"; play("dice");
    g.animate([{transform:"translate(-50%,-50%) translateY(-60px) rotate(-360deg) scale(.5)",opacity:0},{transform:"translate(-50%,-50%) rotate(10deg) scale(1.1)",opacity:1,offset:.55},{transform:"translate(-50%,-50%) rotate(-4deg)",opacity:1,offset:.7},{transform:"translate(-50%,-50%)",opacity:1,offset:.85},{transform:"translate(-50%,-50%) scale(.9)",opacity:0}],{duration:1300,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(g); }; },true);

  /* M15 builder: a step that becomes complete gets a stamp. M16 picking a class sweeps its colour across */
  var steps=D.getElementById("steps"), okSet=null;
  function oks(){ var o={}; if(steps) Array.prototype.forEach.call(steps.querySelectorAll(".st[data-step]"),function(s){ if(s.querySelector(".sprog.ok")) o[s.getAttribute("data-step")]=1; }); return o; }
  if(steps){ okSet=oks(); var oq=0; new MutationObserver(function(){ if(oq) return; oq=1; nf(function(){ oq=0; var n=oks(); for(var k in n) if(!okSet[k]&&full()){ var s=steps.querySelector('.st[data-step="'+CSS.escape(k)+'"]'); if(vis(s)){ var r=s.getBoundingClientRect(), g=fx("mi-bstamp",'<svg viewBox="0 0 24 24"><path d="M5 12l5 5 9-10"/></svg>',1500);
        g.style.left=(r.left+r.width/2)+"px"; g.style.top=(r.top+r.height/2)+"px"; g.animate([{transform:"translate(-50%,-50%) scale(2.4) rotate(-20deg)",opacity:0},{transform:"translate(-50%,-50%) scale(.9) rotate(0)",opacity:1,offset:.35},{transform:"translate(-50%,-50%) scale(1)",opacity:1,offset:.7},{transform:"translate(-50%,-50%) scale(1)",opacity:0}],{duration:1100,easing:"cubic-bezier(.2,.8,.2,1)"}).onfinish=function(){ rm(g); }; MI.buzz("success"); play("click"); } } okSet=n; }); }).observe(steps,{subtree:true,childList:true,attributes:true,attributeFilter:["class"]}); }
  var CL=["Artificer","Barbarian","Bard","Cleric","Druid","Fighter","Monk","Paladin","Ranger","Rogue","Sorcerer","Warlock","Wizard"], bCls=null;
  function bldCls(){ var b=D.getElementById("bld"); if(!vis(b)) return null; var f=null; Array.prototype.some.call(b.querySelectorAll("h1,h2,h3,b,strong"),function(e){ var t=(e.textContent||"").trim(); if(CL.indexOf(t)>=0){ f=t; return true; } }); return f; }
  function clsCheck(){ var c=bldCls(); if(!c) return; if(bCls&&c!==bCls){ D.documentElement.setAttribute("data-mi-cls",c.toLowerCase()); if(full()){ var s=fx("mi-csw","",1400); s.animate([{transform:"translateX(-110%) skewX(-12deg)",opacity:.9},{transform:"translateX(110%) skewX(-12deg)",opacity:.9}],{duration:900,easing:"cubic-bezier(.4,0,.2,1)"}).onfinish=function(){ rm(s); }; play("cast"); } } bCls=c; }
  addEventListener("change",function(e){ if(e.target&&e.target.closest&&e.target.closest("#bld")) setTimeout(clsCheck,120); },true);
  addEventListener("click",function(e){ if(e.target&&e.target.closest&&e.target.closest("#bld")) setTimeout(clsCheck,160); },true);
  setTimeout(function(){ bCls=bldCls(); },600);

  /* X5 share card: a picture of the character drawn on a canvas, then shared or saved */
  function shareBtn(){ var card=D.querySelector("#app .idcard"); if(!card||card.querySelector(".mi-share")) return; var row=card.querySelector(".xpbtns"); var b=D.createElement("button"); b.type="button"; b.className="mi-share"; b.setAttribute("aria-label","Share character card"); b.setAttribute("data-mi-tip","Share character card");
    b.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13"/></svg>'; (row||card).appendChild(b); if(row) b.classList.add("in-row"); }
  var sq=0, so=new MutationObserver(function(){ if(!sq){ sq=1; nf(function(){ sq=0; shareBtn(); }); } }); var ap=D.getElementById("app"); if(ap){ var ic=D.querySelector("#app .idcard"); if(ic&&ic.parentNode) so.observe(ic.parentNode,{childList:true,subtree:true}); shareBtn(); }
  addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest(".mi-share"); if(!b) return; e.preventDefault(); e.stopPropagation(); makeCard(); },true);
  function rr(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
  function makeCard(){ var s=st(); if(!s||!s.C) return; var C=s.C, W=1080, Hh=1350, cv=D.createElement("canvas"); cv.width=W; cv.height=Hh; var g=cv.getContext("2d"); if(!g) return;
    var rgb=(getComputedStyle(D.documentElement).getPropertyValue("--pl-rgb")||"214,69,59").trim(), disp=(D.fonts&&D.fonts.check&&D.fonts.check('700 40px "Cinzel"'))?'"Cinzel",serif':'"Barlow Condensed",Arial,sans-serif';
    var bg=g.createLinearGradient(0,0,0,Hh); bg.addColorStop(0,"#1b2127"); bg.addColorStop(1,"#0c0f12"); g.fillStyle=bg; g.fillRect(0,0,W,Hh);
    var rg=g.createRadialGradient(W/2,260,40,W/2,260,760); rg.addColorStop(0,"rgba("+rgb+",.45)"); rg.addColorStop(1,"rgba("+rgb+",0)"); g.fillStyle=rg; g.fillRect(0,0,W,Hh);
    g.strokeStyle="rgba(201,164,92,.8)"; g.lineWidth=3; rr(g,36,36,W-72,Hh-72,36); g.stroke(); g.strokeStyle="rgba("+rgb+",.6)"; g.lineWidth=1.5; rr(g,52,52,W-104,Hh-104,28); g.stroke();
    var img=D.querySelector("#app .idcard .photo img"), px=W/2-150, py=120;
    g.save(); rr(g,px,py,300,300,40); g.clip(); g.fillStyle="#232a30"; g.fillRect(px,py,300,300); if(!(img&&img.complete&&img.naturalWidth)){ g.fillStyle="rgba("+rgb+",.9)"; g.font="700 170px "+disp; g.textAlign="center"; g.fillText((C.name||"?").trim().charAt(0).toUpperCase(),px+150,py+210); } if(img&&img.complete&&img.naturalWidth){ try{ var k=Math.max(300/img.naturalWidth,300/img.naturalHeight); g.drawImage(img,px+150-img.naturalWidth*k/2,py+150-img.naturalHeight*k/2,img.naturalWidth*k,img.naturalHeight*k); }catch(er){} } g.restore();
    g.strokeStyle="rgba("+rgb+",1)"; g.lineWidth=6; rr(g,px,py,300,300,40); g.stroke();
    g.textAlign="center"; g.fillStyle="#ffffff"; g.font="700 76px "+disp; g.fillText(C.name||"",W/2,530);
    g.fillStyle="#c9a45c"; g.font="600 34px \"Barlow Condensed\",Arial,sans-serif"; g.fillText([C.species,C.cls+(C.level?" "+C.level:""),C.sub].filter(Boolean).join("  •  ").toUpperCase(),W/2,585);
    function stat(x,y,l,v){ g.fillStyle="rgba(255,255,255,.06)"; rr(g,x-110,y-70,220,140,24); g.fill(); g.strokeStyle="rgba("+rgb+",.5)"; g.lineWidth=2; rr(g,x-110,y-70,220,140,24); g.stroke(); g.fillStyle="#fff"; g.font="800 64px \"Barlow Condensed\",Arial,sans-serif"; g.fillText(v,x,y+16); g.fillStyle="#a7b1b9"; g.font="700 22px \"Barlow Condensed\",Arial,sans-serif"; g.fillText(l,x,y+50); }
    function txtOf(sel){ var e=D.querySelector(sel); return e?(e.textContent||"").replace(/\s+/g,"").trim():"–"; }
    stat(W/2-360,720,"HIT POINTS",txtOf("#hpMax")); stat(W/2-120,720,"ARMOR CLASS",txtOf(".tile.ac .v")); stat(W/2+120,720,"INITIATIVE",txtOf('.tile[data-bd="init"] .v')); stat(W/2+360,720,"PROFICIENCY",txtOf('.tile[data-bd="pb"] .v'));
    var AB=["STR","DEX","CON","INT","WIS","CHA"]; AB.forEach(function(a,i){ var e=D.querySelector('#abil .ab[data-bd="ab-'+a+'"]'), m=e?(e.querySelector(".m")||{}).textContent:"", sc=e?(e.querySelector(".s")||{}).textContent:"", x=W/2-375+i*150, y=1000, key=e&&e.classList.contains("key");
      g.beginPath(); g.arc(x,y,62,0,Math.PI*2); var cg=g.createRadialGradient(x,y-20,10,x,y,62); cg.addColorStop(0,key?"#4a3d22":"#3d4750"); cg.addColorStop(1,key?"#2b2416":"#242b31"); g.fillStyle=cg; g.fill(); g.lineWidth=5; g.strokeStyle=key?"#e2aa4c":"rgba(255,255,255,.35)"; g.stroke();
      g.fillStyle="#fff"; g.font="800 52px \"Barlow Condensed\",Arial,sans-serif"; g.fillText((m||"").trim(),x,y+18); g.fillStyle=key?"#ffd36b":"#a7b1b9"; g.font="700 24px \"Barlow Condensed\",Arial,sans-serif"; g.fillText(a,x,y-80); g.fillStyle="#d7dde2"; g.font="700 28px \"Barlow Condensed\",Arial,sans-serif"; g.fillText((sc||"").trim(),x,y+100); });
    g.fillStyle="rgba(255,255,255,.35)"; g.font="600 22px \"Barlow Condensed\",Arial,sans-serif"; g.fillText("D&D SHEET",W/2,Hh-80);
    cv.toBlob(function(bl){ if(!bl) return; var name=(C.name||"character").replace(/[^\w\- ]+/g,"").trim()||"character", f=null; try{ f=new File([bl],name+".png",{type:"image/png"}); }catch(er){}
      if(f&&navigator.canShare&&navigator.canShare({files:[f]})){ navigator.share({files:[f],title:C.name||"Character"}).catch(function(){}); return; }
      var u=URL.createObjectURL(bl), a=D.createElement("a"); a.href=u; a.download=name+".png"; D.body.appendChild(a); a.click(); rm(a); setTimeout(function(){ URL.revokeObjectURL(u); },4000); },"image/png"); play("click"); }
})();

