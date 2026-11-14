/* === Z pack: dice rolls with history, sound, hover cards, level-up gains, Hit Die result, builder stamps and class sweep, share card === */
const FXS16A={};
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  FXS16A.calm=function calm(){ return MI.rm()||MI.mode==="off"; };

  /* X1 sound: made on the fly with Web Audio, nothing to download. On by default, Settings turns it off */
  function snd(){ return (ls("mi-snd")||"on")==="on"&&MI.mode!=="off"; }
  FXS16A.play=function play(k){ if(!snd()) return; try{ FXS16A.SND[k]&&FXS16A.SND[k](); }catch(e){} };
  FXS16A.parseDmg=function parseDmg(x){ let terms=[], re=/([+-]?)(\d*)d(\d+)|([+-]?)(\d+)/g, m; while((m=re.exec(x))){ if(m[3]) terms.push({s:m[1]==="-"?-1:1,n:+(m[2]||1),f:+m[3]}); else terms.push({s:m[4]==="-"?-1:1,k:+m[5]}); } return terms; }; FXS16A.rk=function rk(){ const J=FXENV.__miJournal; return J&&J.key?J.key().replace(/^mi-jr-/,"mi-rl-"):"mi-rl-"; };;
  FXS16A.hload=function hload(){ FXS16A.HK=FXS16A.rk(); try{ FXS16A.H=JSON.parse(ls(FXS16A.HK)||"[]")||[]; }catch(e){ FXS16A.H=[]; } };;
  FXS16A.save=function save(){ if(!FXS16A.HK) FXS16A.HK=FXS16A.rk(); ls(FXS16A.HK,JSON.stringify(FXS16A.H.slice(0,50))); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  FXS16A.finish=function finish(spec,mode,label,vals){ let r={l:label,t:Date.now()}, vi=0; if(spec.dtype) r.dt=spec.dtype;
    if(spec.dmg&&spec.damageParts&&FXS16A.packetResult){Object.assign(r,FXS16A.packetResult(spec.damageParts,mode,vals));r.k=mode==="crit"?"crit":"dmg";return r}
    if(spec.dmg){ let terms=FXS16A.parseDmg(spec.dmg), tot=0, parts=[], dice=[]; terms.forEach((q) =>{ if(q.f){ const n=q.n*(mode==="crit"?2:1); for(let i=0;i<n;i++){ const v=vals[vi++]; dice.push(v); tot+=q.s*v; } parts.push((q.s<0?"-":"")+n+"d"+q.f); } else { tot+=q.s*q.k; parts.push((q.s<0?"-":"+")+q.k); } });
      r.v=Math.max(0,tot); r.d="["+dice.join(", ")+"] "+parts.join("").replace(/^\+/,""); r.k=mode==="crit"?"crit":"dmg"; }
    else FXS16A.finishD20(r,spec,mode,vals);
    return r; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  FXS16A.after=function after(r){ const label=r.l;
    if(FXS16A.rk()!==FXS16A.HK) FXS16A.hload(); FXS16A.H.unshift(r); FXS16A.H=FXS16A.H.slice(0,50); FXS16A.save(); FXS16A.show(r); FXS16A.hist(); if(FXENV.__miJournal) FXENV.__miJournal.add("roll",label+": "+r.v+(r.k==="nat20"?" (natural 20)":r.k==="nat1"?" (natural 1)":"")); if(r.dt&&FXENV.__miRoll&&FXENV.__miRoll.fxDamage) setTimeout(() =>{ FXENV.__miRoll.fxDamage(r.dt); },650); };
  FXS16A.showHtml=function showHtml(r,big){ return (big&&FXENV.__artVig?FXENV.__artVig("moment",r.k==="nat20"?"natural-20":"natural-1",104):"")+(r.three?"":'<div class="dz">'+FXS16A.D20+'<b>'+(r.nat||"")+'</b></div>')+'<div class="rv"><small>'+esc(r.l)+'</small><strong>'+r.v+'</strong><em>'+esc(r.d)+'</em>'+(r.k==="nat20"?'<i>Natural 20</i>':r.k==="nat1"?'<i>Natural 1</i>':r.k==="crit"?'<i>Critical damage</i>':'')+'</div>'; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  FXS16A.show=function show(r){ FXS16A.play("dice"); const big=r.k==="nat20"||r.k==="nat1";
    if(FXS16A.calm()){ if(FXENV.__miToast) FXENV.__miToast(r.l+": "+r.v); return; }
    const o=fx("mi-roll-o mi-roll-"+r.k+(r.three?" mi-roll-3d":""),FXS16A.showHtml(r,big),2300);
    const dz=o.querySelector(".dz"), rv=o.querySelector(".rv");
    if(r.three) o.style.setProperty("top","20%","important");/* T11 D2: above the 3D dice, which land in the middle (the app layer sets top with !important) */
    if(dz) dz.animate([{transform:"translateY(-40vh) rotate(-540deg) scale(.5)",opacity:0},{transform:"translateY(12px) rotate(-20deg) scale(1.05)",opacity:1,offset:.6},{transform:"translateY(-6px) rotate(8deg)",offset:.78},{transform:"none",opacity:1}],{duration:820,easing:"cubic-bezier(.2,.8,.2,1)"});
    rv.animate([{opacity:0,transform:"translateY(14px) scale(.9)"},{opacity:1,transform:"none"}],{duration:380,delay:r.three?0:700,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"});
    o.animate([{opacity:1},{opacity:1,offset:.82},{opacity:0}],{duration:2100,easing:"linear"}).onfinish=function(){ rm(o); };
    if(r.k==="nat20"){ setTimeout(() =>{ FXS16A.play("crit"); MI.buzz("success"); if(FXENV.__miBurst) FXENV.__miBurst(innerWidth/2,innerHeight*.42,{n:28,colors:["#ffe7a3","#ffd166","#ffffff","#e2aa4c"],shape:"mi-star",dist:180,dur:1100}); },650); }
    if(r.k==="nat1"){ setTimeout(() =>{ FXS16A.play("fail"); MI.buzz("heavy"); o.animate([{transform:"none"},{transform:"translateX(-10px)"},{transform:"translateX(8px)"},{transform:"translateX(-4px)"},{transform:"none"}],{duration:380,easing:"ease-out"}); },650); }
    if(!big) MI.buzz("light"); };
  FXS16A.hist=function hist(){ if(!FXS16A.H.length) return; if(!FXS16A.hb){ FXS16A.hb=FXS16A.D.createElement("button"); FXS16A.hb.type="button"; FXS16A.hb.className="mi-rhb"; FXS16A.hb.setAttribute("aria-label","Roll history"); FXS16A.hb.innerHTML=FXS16A.DI+'<b></b>'; FXS16A.D.body.appendChild(FXS16A.hb); FXS16A.hb.addEventListener("click",(e) =>{ e.stopPropagation(); FXS16A.openH(); }); }
    FXS16A.hb.querySelector("b").textContent=FXS16A.H[0].v; if(FXS16A.dr&&FXS16A.dr.classList.contains("on")) FXS16A.fill(); };;
  FXS16A.fill=function fill(){ const l=FXS16A.dr.querySelector(".mi-rhl"); l.innerHTML=FXS16A.H.map((r) =>{ const tm=new Date(r.t); return '<div class="mi-rhr '+r.k+'"><b>'+r.v+'</b><span><i>'+esc(r.l)+'</i><small>'+esc(r.d)+' • '+("0"+tm.getHours()).slice(-2)+":"+("0"+tm.getMinutes()).slice(-2)+'</small></span></div>'; }).join(""); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  FXS16A.openH=function openH(){ if(FXS16A.rk()!==FXS16A.HK) FXS16A.hload(); if(!FXS16A.dr){ FXS16A.dr=FXS16A.D.createElement("div"); FXS16A.dr.className="mi-rh"; FXS16A.dr.setAttribute("role","dialog"); FXS16A.dr.setAttribute("aria-label","Roll history"); FXS16A.dr.innerHTML='<div class="mi-rhx"></div><div class="mi-rhp"><div class="mi-rhh"><b>Rolls</b><button type="button" class="mi-rhc" data-mrd="1">Dice</button><button type="button" class="mi-rhc" data-mrj="1">Journal</button><button type="button" class="mi-rhc" data-mrc="1">Clear</button><button type="button" class="mi-rhc" data-mrx="1">Done</button></div><div class="mi-rhl"></div></div>'; FXS16A.D.body.appendChild(FXS16A.dr);
      FXS16A.dr.addEventListener("click",(e) =>{ if(e.target.closest("[data-mrj]")){ jour(); e.stopPropagation(); return; } if(e.target.closest("[data-mre]")){ FXS16A.jexp(); e.stopPropagation(); return; } if(e.target.closest("[data-mrr]")){ FXS16A.closeH(); e.stopPropagation(); if(FXENV.__recapOpen) FXENV.__recapOpen(); return; } if(e.target.closest(".mi-rhx,[data-mrx]")) FXS16A.closeH(); else if(e.target.closest("[data-mrc]")){ FXS16A.H=[]; FXS16A.save(); FXS16A.closeH(); rm(FXS16A.hb); FXS16A.hb=null; } e.stopPropagation(); });
      ["pointerdown","touchstart","touchmove"].forEach((t) =>{ FXS16A.dr.addEventListener(t,(e) =>{ e.stopPropagation(); },{passive:true}); }); }
    FXS16A.fill(); FXS16A.dr.classList.add("on"); };;
  FXS16A.closeH=function closeH(){ if(FXS16A.dr) FXS16A.dr.classList.remove("on"); };;
  function jour(){ const J=FXENV.__miJournal, l=FXS16A.dr.querySelector(".mi-rhl"), hb=FXS16A.dr.querySelector(".mi-rhh b"), on=FXS16A.dr.classList.toggle("jr"); hb.textContent=on?"Journal":"Rolls"; FXS16A.dr.querySelector("[data-mrj]").textContent=on?"Rolls":"Journal";
    if(!on){ FXS16A.fill(); return; } let a=J?J.all():[], day=""; l.innerHTML=(a.length?a.map((x) =>{ const d=new Date(x.t), ds=d.toLocaleDateString(), h=(ds!==day?'<div class="mi-jd">'+esc(ds)+'</div>':""); day=ds; return h+'<div class="mi-jr mi-jr-'+esc(x.k)+'"><i>'+("0"+d.getHours()).slice(-2)+":"+("0"+d.getMinutes()).slice(-2)+'</i><span>'+esc(x.x)+'</span></div>'; }).join(""):'<p class="mi-jd">Nothing yet. Damage, healing, big rolls, rests and level ups are written here.</p>')+(a.length?'<button type="button" class="mi-rhc mi-jexp" data-mre="1">Save as text</button>'+(FXENV.__recapOpen?'<button type="button" class="mi-rhc mi-jexp" data-mrr="1">Session recap</button>':''):''); }
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  FXS16A.jexp=function jexp(){ const J=FXENV.__miJournal; if(!J) return; const c=st(), nm=(c&&c.C&&c.C.name)||"Character", t=nm+" \u2014 Journal\n\n"+J.all().slice().reverse().map((x) =>{ const d=new Date(x.t); return d.toLocaleString()+"  "+x.x; }).join("\n"); const b=new Blob([t],{type:"text/plain"}), u=URL.createObjectURL(b), a=FXS16A.D.createElement("a"); a.href=u; a.download=nm.replace(/[^\w\- ]+/g,"")+" journal.txt"; FXS16A.D.body.appendChild(a); a.click(); rm(a); setTimeout(() =>{ URL.revokeObjectURL(u); },4000); };;
  FXS16A.hcDesc=function hcDesc(t2){ let pp=null;
    [].some.call(t2.querySelectorAll("p"),(x) =>{ if(!x.classList.contains("rule")&&!x.classList.contains("bk-f")&&(x.textContent||"").trim().length>20){ pp=x; return true; } });
    let ds=pp?(pp.textContent||"").replace(/\s+/g," ").trim():""; if(ds.length>200) ds=ds.slice(0,197).replace(/\s+\S*$/,"")+"\u2026"; return ds; };
  FXS16A.rr=function rr(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r); g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); };;
  FXS16A.cardBg=function cardBg(g,W,Hh,rgb){
    const bg=g.createLinearGradient(0,0,0,Hh); bg.addColorStop(0,"#1b2127"); bg.addColorStop(1,"#0c0f12"); g.fillStyle=bg; g.fillRect(0,0,W,Hh);
    const rg=g.createRadialGradient(W/2,260,40,W/2,260,760); rg.addColorStop(0,"rgba("+rgb+",.45)"); rg.addColorStop(1,"rgba("+rgb+",0)"); g.fillStyle=rg; g.fillRect(0,0,W,Hh);
    g.strokeStyle="rgba(201,164,92,.8)"; g.lineWidth=3; FXS16A.rr(g,36,36,W-72,Hh-72,36); g.stroke(); g.strokeStyle="rgba("+rgb+",.6)"; g.lineWidth=1.5; FXS16A.rr(g,52,52,W-104,Hh-104,28); g.stroke(); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  FXS16A.cardPhoto=function cardPhoto(g,W,rgb,disp,C){
    const img=FXS16A.D.querySelector("#app .idcard .photo img"), px=W/2-150, py=120;
    g.save(); FXS16A.rr(g,px,py,300,300,40); g.clip(); g.fillStyle="#232a30"; g.fillRect(px,py,300,300); if(!(img&&img.complete&&img.naturalWidth)){ g.fillStyle="rgba("+rgb+",.9)"; g.font="700 170px "+disp; g.textAlign="center"; g.fillText((C.name||"?").trim().charAt(0).toUpperCase(),px+150,py+210); } if(img&&img.complete&&img.naturalWidth){ try{ const k=Math.max(300/img.naturalWidth,300/img.naturalHeight); g.drawImage(img,px+150-img.naturalWidth*k/2,py+150-img.naturalHeight*k/2,img.naturalWidth*k,img.naturalHeight*k); }catch(er){} } g.restore();
    g.strokeStyle="rgba("+rgb+",1)"; g.lineWidth=6; FXS16A.rr(g,px,py,300,300,40); g.stroke(); };;
  FXS16A.cardHead=function cardHead(g,W,disp,C){
    g.textAlign="center"; g.fillStyle="#ffffff"; g.font="700 76px "+disp; g.fillText(C.name||"",W/2,530);
    g.fillStyle="#c9a45c"; g.font="600 34px \"Barlow Condensed\",Arial,sans-serif"; g.fillText([C.species,C.cls+(C.level?" "+C.level:""),C.sub].filter(Boolean).join("  •  ").toUpperCase(),W/2,585); };;
  function cardStat(g,rgb,x,y,l,v){ g.fillStyle="rgba(255,255,255,.06)"; FXS16A.rr(g,x-110,y-70,220,140,24); g.fill(); g.strokeStyle="rgba("+rgb+",.5)"; g.lineWidth=2; FXS16A.rr(g,x-110,y-70,220,140,24); g.stroke(); g.fillStyle="#fff"; g.font="800 64px \"Barlow Condensed\",Arial,sans-serif"; g.fillText(v,x,y+16); g.fillStyle="#a7b1b9"; g.font="700 22px \"Barlow Condensed\",Arial,sans-serif"; g.fillText(l,x,y+50); }
  function cardTxt(sel){ const e=FXS16A.D.querySelector(sel); return e?(e.textContent||"").replace(/\s+/g,"").trim():"–"; }
  FXS16A.cardStats=function cardStats(g,W,rgb){ cardStat(g,rgb,W/2-360,720,"HIT POINTS",cardTxt("#hpMax")); cardStat(g,rgb,W/2-120,720,"ARMOR CLASS",cardTxt(".tile.ac .v")); cardStat(g,rgb,W/2+120,720,"INITIATIVE",cardTxt('.tile[data-bd="init"] .v')); cardStat(g,rgb,W/2+360,720,"PROFICIENCY",cardTxt('.tile[data-bd="pb"] .v')); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  FXS16A.cardAbs=function cardAbs(g,W){ const AB=["STR","DEX","CON","INT","WIS","CHA"]; AB.forEach((a,i) =>{ const e=FXS16A.D.querySelector('#abil .ab[data-bd="ab-'+a+'"]'), m=e?(e.querySelector(".m")||{}).textContent:"", sc=e?(e.querySelector(".s")||{}).textContent:"", x=W/2-375+i*150, y=1000, key=e&&e.classList.contains("key");
    g.beginPath(); g.arc(x,y,62,0,Math.PI*2); const cg=g.createRadialGradient(x,y-20,10,x,y,62); cg.addColorStop(0,key?"#4a3d22":"#3d4750"); cg.addColorStop(1,key?"#2b2416":"#242b31"); g.fillStyle=cg; g.fill(); g.lineWidth=5; g.strokeStyle=key?"#e2aa4c":"rgba(255,255,255,.35)"; g.stroke();
    g.fillStyle="#fff"; g.font="800 52px \"Barlow Condensed\",Arial,sans-serif"; g.fillText((m||"").trim(),x,y+18); g.fillStyle=key?"#ffd36b":"#a7b1b9"; g.font="700 24px \"Barlow Condensed\",Arial,sans-serif"; g.fillText(a,x,y-80); g.fillStyle="#d7dde2"; g.font="700 28px \"Barlow Condensed\",Arial,sans-serif"; g.fillText((sc||"").trim(),x,y+100); }); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  function cardShare(cv,C){ cv.toBlob((bl) =>{ if(!bl) return; let name=(C.name||"character").replace(/[^\w\- ]+/g,"").trim()||"character", f=null; try{ f=new File([bl],name+".png",{type:"image/png"}); }catch(er){}
    if(f&&navigator.canShare&&navigator.canShare({files:[f]})){ navigator.share({files:[f],title:C.name||"Character"}).catch(() =>{}); return; }
    const u=URL.createObjectURL(bl), a=FXS16A.D.createElement("a"); a.href=u; a.download=name+".png"; FXS16A.D.body.appendChild(a); a.click(); rm(a); setTimeout(() =>{ URL.revokeObjectURL(u); },4000); },"image/png"); }
  FXS16A.makeCard=function makeCard(){ const s=st(); if(!s||!s.C) return; const C=s.C, W=1080, Hh=1350, cv=FXS16A.D.createElement("canvas"); cv.width=W; cv.height=Hh; const g=cv.getContext("2d"); if(!g) return;
    const rgb=(getComputedStyle(FXS16A.D.documentElement).getPropertyValue("--pl-rgb")||"214,69,59").trim(), disp=(FXS16A.D.fonts&&FXS16A.D.fonts.check&&FXS16A.D.fonts.check('700 40px "Cinzel"'))?'"Cinzel",serif':'"Barlow Condensed",Arial,sans-serif';
    FXS16A.cardBg(g,W,Hh,rgb); FXS16A.cardPhoto(g,W,rgb,disp,C); FXS16A.cardHead(g,W,disp,C); FXS16A.cardStats(g,W,rgb); FXS16A.cardAbs(g,W);
    g.fillStyle="rgba(255,255,255,.35)"; g.font="600 22px \"Barlow Condensed\",Arial,sans-serif"; g.fillText("D&D SHEET",W/2,Hh-80);
    cardShare(cv,C); FXS16A.play("click"); };
  FXS16A.D=document; FXS16A.FINE=matchMedia("(hover: hover) and (pointer: fine)");
  FXS16A.full=function full(){ return MI.full(); };
  FXS16A.ctx=function ctx(){ return MI.ac(); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  function tone(f,t0,dur,type,vol,f2){ const c=FXS16A.ctx(); if(!c) return; const o=c.createOscillator(), g=c.createGain(), t=c.currentTime+t0; o.type=type||"sine"; o.frequency.setValueAtTime(f,t); if(f2) o.frequency.exponentialRampToValueAtTime(f2,t+dur); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol||.15,t+.012); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); o.connect(g); g.connect(c.destination); o.start(t); o.stop(t+dur+.02); }
  function noise(t0,dur,freq,vol){ const c=FXS16A.ctx(); if(!c) return; const n=Math.floor(c.sampleRate*dur), b=c.createBuffer(1,n,c.sampleRate), d=b.getChannelData(0); for(let i=0;i<n;i++) d[i]=(Math.random()*2-1)*(1-i/n);
    const s=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(), t=c.currentTime+t0; s.buffer=b; f.type="bandpass"; f.frequency.value=freq; f.Q.value=1.4; g.gain.value=vol||.25; s.connect(f); f.connect(g); g.connect(c.destination); s.start(t); }
  FXS16A.SND={
    dice:function(){ for(let i=0;i<6;i++) noise(i*.055+Math.random()*.02,.05,1800+Math.random()*2200,.22); },
    crit:function(){ [523,659,784,1047].forEach((f,i) =>{ tone(f,.5+i*.08,.5,"triangle",.12); }); tone(2093,.82,.7,"sine",.05); },
    fail:function(){ tone(320,.5,.55,"sawtooth",.06,70); tone(160,.55,.5,"sine",.12,50); },
    heal:function(){ tone(880,0,.6,"sine",.1); tone(1320,.08,.7,"sine",.07); tone(1760,.16,.6,"sine",.04); },
    hurt:function(){ tone(140,0,.35,"sine",.25,40); noise(0,.12,500,.25); },
    level:function(){ [392,523,659,784,1047].forEach((f,i) =>{ tone(f,i*.11,.6,"triangle",.11); }); },
    rest:function(){ tone(220,0,1.4,"sine",.06); tone(330,.1,1.3,"sine",.05); tone(440,.2,1.2,"sine",.03); },
    cast:function(){ tone(660,0,.45,"sine",.06,1320); tone(990,.05,.4,"triangle",.04,1980); },
    click:function(){ tone(1200,0,.05,"square",.02); },
    coin:function(){ tone(1980,0,.12,"triangle",.07); tone(2640,.06,.16,"triangle",.05); tone(1760,.12,.2,"sine",.04); },
    armor:function(){ noise(0,.09,2600,.25); tone(220,0,.18,"square",.03); noise(.05,.07,4200,.15); },
    blade:function(){ noise(0,.16,6000,.18); tone(1400,.02,.25,"sine",.03,2200); },
    chime:function(){ tone(1568,0,.6,"sine",.08); tone(2093,.07,.7,"sine",.05); },
    crystal:function(){ tone(2637,0,.25,"triangle",.06); tone(3520,.03,.3,"sine",.04); noise(0,.05,8000,.08); },
    cond:function(){ tone(330,0,.3,"triangle",.06,260); },
    heart:function(){ [0,.32,1,1.32].forEach((t) =>{ tone(60,t,.18,"sine",.35,40); }); },
    hover:function(){ tone(2400,0,.03,"sine",.012); },
    page:function(){ noise(0,.12,3200,.12); noise(.05,.1,1800,.08); }
  };;
  FXENV.__miSnd=FXS16A.play;
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-misnd]"); if(!b) return; ls("mi-snd",b.getAttribute("data-misnd"));
    Array.prototype.forEach.call(FXS16A.D.querySelectorAll("[data-misnd]"),(x) =>{ const on=x===b; x.classList.toggle("on",on); x.setAttribute("aria-pressed",on); }); if(b.getAttribute("data-misnd")==="on") FXS16A.play("heal"); },true);
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("#dmgBtn,#healBtn"); if(!b) return; const amt=+((FXS16A.D.getElementById("hpAmt")||{}).value||0); if(amt>0) FXS16A.play(b.id==="healBtn"?"heal":"hurt"); },true);
  FXS16A.W=FXENV.__miWow;
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
 if(FXS16A.W){ if(FXS16A.W.level){ const l0=FXS16A.W.level; FXS16A.W.level=function(){ l0.apply(this,arguments); FXS16A.play("level"); }; } if(FXS16A.W.rest){ const r0=FXS16A.W.rest; FXS16A.W.rest=function(){ r0.apply(this,arguments); FXS16A.play("rest"); }; } if(FXS16A.W.cast){ const c0=FXS16A.W.cast; FXS16A.W.cast=function(){ c0.apply(this,arguments); FXS16A.play("cast"); }; } }

  /* X2 rolls: the breakdown of a bonus or a damage gets Roll buttons. X3 natural 20 and natural 1 have their own moment. X4 the last 30 rolls stay in a drawer */
  FXS16A.last=null;
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-bd]"); if(b&&!b.closest("#sheet")) FXS16A.last={k:b.getAttribute("data-bd"),el:b,t:Date.now(),txt:(b.textContent||"").replace(/\s+/g," ")}; },true);
  FXS16A.rollSpec=function rollSpec(k,el,txt){ if(!k) return null;
    if(/^ad-/.test(k)){ const m=/(\d*d\d+(?:\s*[+−-]\s*\d*d?\d+)*)/.exec(txt); const sp=m?{dmg:m[1].replace(/−/g,"-").replace(/\s+/g,""),dtype:(FXENV.__miRoll&&FXENV.__miRoll.dtype)?FXENV.__miRoll.dtype(txt):""}:null;return FXS16A.sourceSpec(k,FXS16A.decorateAttack(el,sp)); }
    if(/^(ah-|save-|sk-|ab-|init$|spatk(?:$|-[A-Z]{3}$|-source-))/.test(k)){ let src=txt; if(/^ab-/.test(k)){ const mm=el&&el.querySelector(".m"); src=mm?mm.textContent:txt; } const n=/([+−-]\s?\d+)/.exec(src); const sp=n?{bon:parseInt(n[1].replace(/−/,"-").replace(/\s/,""),10)}:null;return FXS16A.sourceSpec(k,FXS16A.decorateAttack(el,sp)); }
    return null; };
})();
(function(){
  FXS16A.rollDice=function rollDice(spec,mode){ if(spec.dmg){ const L=[]; FXS16A.parseDmg(FXS16A.damageExpressionFor(spec,mode)).forEach((q) =>{ if(q.f){ const n=q.n*(mode==="crit"?2:1); for(let i=0;i<n;i++) L.push(q.f); } }); return L; } return mode?[20,20]:[20]; };
})();
(function(){
  FXS16A.rollAllowed=function rollAllowed(guard){try{return typeof guard!=="function"||guard()===true}catch(error){return false}};
  FXS16A.commitRollResult=function commitRollResult(r,cb,beforeCommit){if(beforeCommit!==undefined){let accepted=false;try{accepted=typeof beforeCommit==="function"&&beforeCommit(r)===true}catch(error){}if(!accepted)return null}FXS16A.after(r);if(cb)cb(r);return r};
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  function d(n){ const a=new Uint32Array(1); (FXENV.crypto||{getRandomValues:function(x){ x[0]=Math.random()*4294967295; return x; }}).getRandomValues(a); return 1+a[0]%n; };
  /* T11 G3 D3 Game Log: the rolls are kept per character (mi-rl-<character>, the last 50), not only for this visit. Every roll also
     goes to the journal of the character, so the journal is the full game log and can be saved as text */
  FXS16A.H=[]; FXS16A.HK="";;
  FXENV.__miRollKey=function(){ return FXS16A.HK||FXS16A.rk(); };
  /* T11 D2: the dice a roll needs, in order. With 3D dice (25-dice3d) the values are decided first and the dice on screen
     land on them. Without them (Motion off, Calm, no WebGL, the bundle failed) they come from crypto.getRandomValues as before */

  FXS16A.doRoll=function doRoll(spec,mode,label,cb,guard,beforeCommit){if(!FXS16A.rollAllowed(guard))return null;
    const need=FXS16A.rollDice(spec,mode),go=function(vals,three){if(!FXS16A.rollAllowed(guard))return null;const r=FXS16A.finish(spec,mode,label,vals);r.three=!!three;if(!FXS16A.rollAllowed(guard))return null;return FXS16A.commitRollResult(r,cb,beforeCommit)};
    if(FXENV.__dice3d&&!FXS16A.calm()&&need.length&&need.length<=12){ FXENV.__dice3d.roll(need).then((v) =>{ go(v&&v.length===need.length?v:need.map((f) =>{ return d(f); }),!!v); },() =>{ go(need.map((f) =>{ return d(f); }),false); }); return null; }
    if(!FXS16A.rollAllowed(guard))return null;const r=FXS16A.finish(spec,mode,label,need.map((f) =>{ return d(f); }));if(!FXS16A.rollAllowed(guard))return null;return FXS16A.commitRollResult(r,cb,beforeCommit)};;
  (FXENV.__miRoll=FXENV.__miRoll||{}).roll=FXS16A.doRoll;FXENV.__miRoll.commitHook=1;
  FXS16A.D20='<svg viewBox="0 0 100 100"><path d="M50 4l42 24v44L50 96 8 72V28z" class="o"/><path d="M50 4L29 40h42zM29 40L8 72M71 40l21 32M29 40l21 38 21-38M50 78L8 72M50 78l42-6M50 78v18" class="i"/></svg>';;
  FXS16A.barHtml=function barHtml(spec){ return spec.dmg?'<button type="button" class="mi-rb pri" data-mr="">'+FXS16A.DI+'Roll '+esc(spec.dmg)+'</button><button type="button" class="mi-rb" data-mr="crit">Critical</button>':'<button type="button" class="mi-rb pri" data-mr="">'+FXS16A.DI+'Roll d20 '+(spec.bon<0?"−"+(-spec.bon):"+"+spec.bon)+'</button><button type="button" class="mi-rb" data-mr="adv">Advantage</button><button type="button" class="mi-rb" data-mr="dis">Disadvantage</button>'; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  FXS16A.barHint=function barHint(spec){ let hint=(!spec.dmg&&FXENV.__miRoll&&FXENV.__miRoll.hint)?FXENV.__miRoll.hint(FXS16A.last.k):null, hh="";
    if(hint){ if(hint.fail.length) hh='<p class="mi-rhint bad">Automatic failure: '+esc(hint.fail.join(", "))+'</p>'; else hh='<p class="mi-rhint">'+(hint.mode==="dis"?"Disadvantage":hint.mode==="adv"?"Advantage":"Advantage and disadvantage cancel")+' from '+esc(hint.dis.concat(hint.adv).join(", "))+'</p>'; }
    return {hint:hint,hh:hh}; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  function bar(){ const sh=FXS16A.D.getElementById("sheet"), body=FXS16A.D.getElementById("sheetBody"); if(!sh||!body||!sh.classList.contains("on")||!FXS16A.last||Date.now()-FXS16A.last.t>4000) return; if(body.querySelector('.mi-roll,[data-roll-controls="own"]')) return;
    const spec=FXS16A.rollSpec(FXS16A.last.k,FXS16A.last.el,FXS16A.last.txt); if(!spec) return; const lab=((FXS16A.D.getElementById("sheetTitle")||{}).textContent||"Roll").replace(/\s+/g," ").trim().slice(0,60);
    let h=FXS16A.barHtml(spec);
    const bh=FXS16A.barHint(spec), hint=bh.hint, hh=bh.hh;
    h+='<button type="button" class="mi-rb" data-mrself="1">I rolled myself</button>';/* T11 D2: real dice at the table */
    const w=FXS16A.D.createElement("div"); w.className="mi-roll"; w.innerHTML=hh+'<div class="mi-rbs">'+h+'</div><div class="mi-rres" aria-live="polite"></div>'; w.__spec=spec; w.__lab=lab; w.__mode=hint?hint.mode:""; body.insertBefore(w,body.firstChild);
    if(w.__mode){ const pb=w.querySelector(".mi-rb.pri"); if(pb){ pb.setAttribute("data-mr",w.__mode); pb.innerHTML+=' <small>'+(w.__mode==="dis"?"with disadvantage":"with advantage")+'</small>'; } } }
  FXS16A.DI='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 2l9 5v10l-9 5-9-5V7z"/><path d="M12 2l-5 8h10zM7 10l5 9 5-9"/></svg>';
  const shE=FXS16A.D.getElementById("sheet"), shB=FXS16A.D.getElementById("sheetBody"), bq=0; function bQ(){ bar(); }
  if(shE&&shB){ new MutationObserver(bQ).observe(shE,{attributes:true,attributeFilter:["class"]}); new MutationObserver(bQ).observe(shB,{childList:true}); }
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  /* T11 D2 "I rolled myself": type what the real die showed (the d20, or the damage total), the bonus is added and it goes to the log like any roll */
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-mrself],[data-mrok]"); if(!b) return; const w=b.closest(".mi-roll"); if(!w) return; e.preventDefault(); e.stopPropagation(); const res=w.querySelector(".mi-rres"), sp=w.__spec;if(!FXS16A.barAllowed(w))return;
    if(b.hasAttribute("data-mrself")){ res.innerHTML='<label class="mi-self">'+(sp.dmg?'Damage total you rolled ('+esc(sp.dmg)+')':'The number on your d20')+' <input type="number" inputmode="numeric" min="'+(sp.dmg?0:1)+'" max="'+(sp.dmg?999:20)+'" data-mrin="1"></label><button type="button" class="mi-rb pri" data-mrok="1">Add it</button>'; const inp=res.querySelector("input"); if(inp) inp.focus(); return; }
    const v=parseInt((res.querySelector("[data-mrin]")||{}).value,10); if(!isFinite(v)||(!sp.dmg&&(v<1||v>20))||v<0){ const i2=res.querySelector("[data-mrin]"); if(i2) i2.focus(); return; }
    const r=FXS16A.handResult(w,sp,v);
    if(!FXS16A.barAllowed(w))return; FXS16A.after(r); res.innerHTML='<b class="'+r.k+'">'+r.v+'</b><span>'+esc(r.d)+'</span><button type="button" class="mi-rsh" data-mrs="1">Share</button>'; res.__r=r; },true);
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  FXS16A.rollShare=function rollShare(s){ var res=s.closest(".mi-rres"), r=res&&res.__r; if(!r) return; const c=st(), t=((c&&c.C&&c.C.name)||"I")+" rolled "+r.l+": "+r.v+" ("+r.d+")";
    if(navigator.share) navigator.share({text:t}).catch(() =>{}); else if(navigator.clipboard) navigator.clipboard.writeText(t).then(() =>{ s.textContent="Copied"; },() =>{}); };
  FXS16A.rollGo=function rollGo(e){ const b=e.target.closest&&e.target.closest(".mi-rb:not(.mi-4d6):not([data-cpr]):not([data-cpx]):not([data-mrself]):not([data-mrok])"); if(!b) return; e.preventDefault(); e.stopPropagation(); const w=b.closest(".mi-roll"); if(!w) return; var res=w.querySelector(".mi-rres"); if(w.__busy) return; w.__busy=1;
  FXS16A.doRoll(w.__spec,b.getAttribute("data-mr"),w.__lab,(r) =>{ w.__busy=0;
    res.innerHTML='<b class="'+r.k+'">'+r.v+'</b><span>'+esc(r.d)+'</span><button type="button" class="mi-rsh" data-mrs="1">Share</button>'; res.__r=r; res.animate([{opacity:0,transform:"translateY(6px)"},{opacity:1,transform:"none"}],{duration:300,delay:(FXS16A.calm()||r.three)?0:700,fill:"backwards",easing:"ease-out"}); },()=>FXS16A.barAllowed(w)); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  addEventListener("click",(e) =>{ const s=e.target.closest&&e.target.closest("[data-mrs]"); if(s){ e.preventDefault(); e.stopPropagation(); FXS16A.rollShare(s); return; }
    FXS16A.rollGo(e); },true);
  /* X4 drawer */
  FXS16A.hb=null; FXS16A.dr=null;;
  addEventListener("keydown",(e) =>{ if(e.key==="Escape"&&FXS16A.dr&&FXS16A.dr.classList.contains("on")){ FXS16A.closeH(); e.stopPropagation(); } },true);
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  setTimeout(() =>{ FXS16A.hload(); if(FXS16A.H.length) FXS16A.hist(); },0);

  /* H5 + H6 + H7 mouse only: a small card with the summary of a spell, item or feature, what an ability feeds, or how an attack adds up */
  FXS16A.hcCard=null; FXS16A.hcCur=null; FXS16A.hcTm=0;
  FXS16A.hcHide=function hcHide(){ clearTimeout(FXS16A.hcTm); FXS16A.hcCur=null; if(FXS16A.hcCard) FXS16A.hcCard.classList.remove("on"); };;
  function hcTxt(h){ const t=FXS16A.D.createElement("div"); t.innerHTML=h; Array.prototype.forEach.call(t.querySelectorAll(".dc-head,.dc-badge,svg,button,.bk-f"),(x) =>{ x.remove(); }); let parts=[], w=FXS16A.D.createTreeWalker(t,NodeFilter.SHOW_TEXT), n; while((n=w.nextNode())&&parts.join(" ").length<300){ const x=n.nodeValue.replace(/\s+/g," ").trim(); if(x) parts.push(x); } const s=parts.join(" \u00b7 ").replace(/ \u00b7 ([,.;:])/g,"$1"); return s.length>260?s.slice(0,257).replace(/\s+\S*$/,"")+"…":s; }
  FXS16A.hcInfo=function hcInfo(k){ const r=FXENV.__miInfo(k); if(!r||!r.h) return ""; const t2=FXS16A.D.createElement("div"); t2.innerHTML=r.h; let sub=t2.querySelector(".dc-sub"), cells=[].slice.call(t2.querySelectorAll(".dc-cell")).filter((c) =>{ const v=c.querySelector("b"); return v&&v.textContent.trim(); }).slice(0,4);
    let ds=FXS16A.hcDesc(t2);
    let h='<b>'+esc(r.t||"")+'</b>'+(sub?'<small>'+esc(sub.textContent.replace(/\s+/g," ").trim())+'</small>':'')+(cells.length?'<div class="mi-hcg">'+cells.map((c) =>{ return '<span><i>'+esc((c.querySelector("small")||{}).textContent||"")+'</i>'+esc(c.querySelector("b").textContent.replace(/\s+/g," ").trim())+'</span>'; }).join("")+'</div>':'')+(ds?'<p>'+esc(ds)+'</p>':''); if(!sub&&!cells.length&&!ds) return "";  return h; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  FXS16A.hcAb=function hcAb(b){ const ab=b.slice(3), rows=[]; Array.prototype.forEach.call(FXS16A.D.querySelectorAll("#skills .row"),(r) =>{ const a=r.querySelector(".ab3"); if(a&&a.textContent.trim()===ab){ const nmEl=r.querySelector(".nm"),nmC=nmEl?nmEl.cloneNode(true):null; if(nmC) [].forEach.call(nmC.querySelectorAll(".flag,svg"),(x) =>{ x.remove(); }); rows.push('<li><span>'+esc(nmC?nmC.textContent.trim():"")+'</span><em>'+esc(((r.querySelector(".bonus")||{}).textContent||"").trim())+'</em></li>'); } });
    const sv=FXS16A.D.querySelector('#saves [data-bd="save-'+ab+'"]'); const h='<b>'+esc(ab)+' feeds</b><ul>'+(sv?'<li><span>Saving throw</span><em>'+esc(sv.textContent.trim())+'</em></li>':"")+rows.join("")+'</ul>'; if(!rows.length&&!sv) return "";  return h; };;
  FXS16A.hcBd=function hcBd(b){ const bd=FXENV.__miBd(b); if(!bd||!bd.parts) return ""; const h='<b>'+(b[1]==="h"?"Attack roll":"Damage")+'</b><ul>'+bd.parts.map((p) =>{ return '<li><span>'+esc(p.l)+'</span><em>'+esc(p.raw?p.v:(p.v<0?"−"+(-p.v):"+"+p.v))+'</em></li>'; }).join("")+'</ul>';  return h; };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const {nf,rm,vis,esc,fx,ls,st}=FXH;
  ;
  FXS16A.hcBuild=function hcBuild(t){ let k=t.getAttribute("data-info")||"", b=t.getAttribute("data-bd")||"", h="";
    if(/^(sp|it|f):/.test(k)&&FXENV.__miInfo) h=FXS16A.hcInfo(k);
    else if(/^ab-/.test(b)) h=FXS16A.hcAb(b);
    else if(/^(ah|ad)-/.test(b)&&FXENV.__miBd) h=FXS16A.hcBd(b);
    return h; };
})();