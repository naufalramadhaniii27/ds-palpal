/* SOLID stage 14: continuation of fx/02-micro-interactions.js (state shared through the FXS02 objects). */
(function(){
  if(!document.body||!document.body.animate) return;
  if(FXS02C.sb) new MutationObserver(() =>{ const q=document.getElementById("gsQ"); if(!q){ FXS02C.lastQ=null; return; }
      const rows=FXS02C.sb.querySelectorAll(".gs-r"), fresh=q!==FXS02C.lastQ; FXS02C.lastQ=q;
      Array.prototype.forEach.call(rows,(r) =>{ const b=r.querySelector("b"); if(b&&q.value.trim()) FXS02C.mark(b,q.value); });
      if(fresh&&!MI.rm()) Array.prototype.slice.call(FXS02C.sb.querySelectorAll(".gs-c, .gs-r, .info-h"),0,16).forEach((r,i) =>{ r.animate([{opacity:0,transform:"translateY(6px)"},{opacity:1,transform:"none"}],{duration:240,delay:i*18,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); });
    }).observe(FXS02C.sb,{childList:true});

  /* 2. Inventory: an item that just arrived flashes softly and slides into place */
  let ib=document.getElementById("invBody"), invPrev=null, invKey="";
  if(ib) new MutationObserver(() =>{ const fb=ib.querySelector(".ifb.on"), key=FXS02C.who()+"|"+(fb?fb.getAttribute("data-invf"):""), cnt={}, rows=ib.querySelectorAll(".irow");
      Array.prototype.forEach.call(rows,(r) =>{ const b=r.querySelector(".iname b"); if(!b) return; const n=b.textContent.trim(); cnt[n]=(cnt[n]||0)+1; });
      if(invPrev&&key===invKey&&!MI.rm()){ const seen={}; for(let i=rows.length-1;i>=0;i--){ const b=rows[i].querySelector(".iname b"); if(!b) continue; const n=b.textContent.trim(); seen[n]=(seen[n]||0)+1;
          if(seen[n]<=(cnt[n]-(invPrev[n]||0))){ const r=rows[i]; r.classList.remove("mi-new"); void r.offsetWidth; r.classList.add("mi-new"); r.animate([{opacity:.3,transform:"translateX(-10px)"},{opacity:1,transform:"none"}],{duration:320,easing:"cubic-bezier(.2,.8,.2,1)"}); (function(r){ setTimeout(() =>{ r.classList.remove("mi-new"); },1300); })(r); } } }
      invPrev=cnt; invKey=key; }).observe(ib,{childList:true});

  /* 3. Conditions: each one arrives with its own motion */
  FXS02C.CFX={Poisoned:["rise",["#7bd389","#3fa34d"]],Frightened:["shake",["#c7b8ff"]],Charmed:["burst",["#ff8fc7","#ffc2e0"]],Paralyzed:["spark",["#ffe066","#fff3b0"]],Stunned:["ring",["#ffe066"]],
    Blinded:["rise",["#555a60","#8a9096"]],Deafened:["ring",["#9fb3b3"]],Invisible:["fade",["#cfe8ff"]],Prone:["drop",["#c9a27a"]],Grappled:["squeeze",["#d0a060"]],Restrained:["squeeze",["#d0a060"]],
    Incapacitated:["ring",["#aaaaaa"]],Petrified:["burst",["#9a9a9a","#6b6b6b"]],Unconscious:["rise",["#8aa0c8","#c3d0e8"]],Exhaustion:["ring",["#e5534b"]]};
})();
(function(){
  if(!document.body||!document.body.animate) return;
  FXS02C.condFx=function condFx(el,name){ if(MI.rm()) return; const p=FXS02C.C(el); if(!p.r.width||p.r.bottom<0||p.r.top>innerHeight) return; const base=name.replace(/\s*\d+$/,"").trim(), f=FXS02C.CFX[base]||(/rag/i.test(name)?["burst",["#ff6b3d","#ffb26b"]]:["burst",[getComputedStyle(el).backgroundColor]]), k=f[0], c=f[1], E="cubic-bezier(.2,.8,.2,1)";
    el.animate([{transform:"scale(.6)",opacity:0},{transform:"scale(1.1)",opacity:1,offset:.6},{transform:"none",opacity:1}],{duration:280,easing:E});
    if(FXENV.__miWow) FXENV.__miWow.stamp(el,c[0]);
    if(k==="rise") FXS02C.rise(p.x,p.y-6,c,7);
    else if(k==="burst") FXS02C.burst(p.x,p.y,{n:10,colors:c,dist:34,dur:600});
    else if(k==="spark") FXS02C.burst(p.x,p.y,{n:10,colors:c,shape:"mi-spark",dist:30,dur:500});
    else if(k==="ring") FXS02C.ring(p.x,p.y,c[0],70);
    else if(k==="shake") el.animate([{transform:"translateX(0)"},{transform:"translateX(-4px)"},{transform:"translateX(4px)"},{transform:"translateX(-3px)"},{transform:"translateX(3px)"},{transform:"translateX(0)"}],{duration:420,delay:300,easing:"linear"});
    else if(k==="fade") el.animate([{opacity:1},{opacity:.25},{opacity:.9},{opacity:.35},{opacity:1}],{duration:900,delay:300,easing:"ease-in-out"});
    else if(k==="drop") el.animate([{transform:"translateY(-14px)"},{transform:"translateY(0)",offset:.5},{transform:"translateY(-4px)",offset:.7},{transform:"none"}],{duration:520,delay:200,easing:"ease-out"});
    else if(k==="squeeze") el.animate([{transform:"scaleX(1)"},{transform:"scaleX(.8)"},{transform:"scaleX(1.06)"},{transform:"none"}],{duration:480,delay:300,easing:E}); };;
  FXS02C.cd=document.getElementById("conds"); FXS02C.cPrev=null; FXS02C.cWho="";
})();
(function(){
  if(!document.body||!document.body.animate) return;
  if(FXS02C.cd) new MutationObserver(() =>{ const now={}, els={}; Array.prototype.forEach.call(FXS02C.cd.querySelectorAll(".chip.on"),(c) =>{ let k=(c.getAttribute("data-info")||"").replace(/^g:/,"")||c.textContent.trim(); if(c.classList.contains("exh-c")) k="Exhaustion"; now[k]=1; els[k]=c; });
      if(FXENV.__miAmb) FXENV.__miAmb();
      const w=FXS02C.who(); if(FXS02C.cPrev&&w===FXS02C.cWho) Object.keys(now).forEach((k) =>{ if(!FXS02C.cPrev[k]) FXS02C.condFx(els[k],k==="Exhaustion"?"Exhaustion":els[k].textContent.trim()||k); }); FXS02C.cPrev=now; FXS02C.cWho=w; }).observe(FXS02C.cd,{childList:true});
})();
/* --- v55: ambience for every condition and for Concentration, Rage and the other modes, low Hit Points, and dying --- */
const FXS02D={};
(function(){
  /* e: side edges, t/b: top or bottom edge, v: vignette, f: frame, h: hatching; a: strength; t: pulse seconds;
     p: [particle, count, colour]; m: extra motion; beat: heartbeat timing */
  FXS02D.AMB={
    Poisoned:{e:"76,194,122",a:.22,t:3.6,p:["bubble",8,"123,211,137"]},
    Blinded:{v:"0,0,0",a:.72,t:5.5,e2:"0,0,0",p:["wisp",7,"40,40,46"]},
    Charmed:{e:"255,110,185",a:.24,t:3.2,p:["heart",9,"255,143,199"]},
    Deafened:{e:"140,160,175",a:.22,t:4.5,p:["wave",4,"185,200,210"]},
    Exhaustion:{v:"45,22,8",a:.32,t:6.5,e2:"200,120,60",p:["ash",9,"150,140,130"]},
    Frightened:{e:"120,70,200",a:.26,t:2.6,m:"shiver",v2:"25,10,45",p:["wisp",7,"120,80,190"]},
    Grappled:{e:"175,120,65",a:.26,t:3,m:"squeeze",p:["dust",7,"200,160,110"]},
    Restrained:{e:"175,120,65",a:.26,t:3,m:"squeeze",h:"160,110,60",p:["link",7,"190,140,85"]},
    Incapacitated:{e:"150,150,160",a:.24,t:5,v2:"20,20,25",p:["mote",9,"190,190,200"]},
    Invisible:{e:"160,210,255",a:.22,t:2.8,p:["mote",14,"200,230,255"]},
    Paralyzed:{e:"255,215,80",a:.22,t:1.8,p:["bolt",8,"255,230,120"]},
    Petrified:{e:"150,150,150",a:.28,t:7,h:"125,125,125",p:["ash",8,"165,165,165"]},
    Prone:{b:"175,130,85",a:.34,t:4,p:["dust",12,"200,165,120"]},
    Stunned:{t2:"255,215,80",a:.28,t:2.4,e2:"255,215,80",p:["star",10,"255,224,102"]},
    Unconscious:{v:"10,15,45",a:.62,t:6,p:["z",6,"170,190,235"]},
    conc:{f:"110,170,255",a:.7,t:3.2,p:["mote",8,"150,195,255"]},
    rage:{e:"255,85,35",a:.28,t:1.6,p:["ember",14,"255,140,60"]},
    sacred:{f:"255,215,120",a:.6,t:3,p:["mote",8,"255,225,150"]},
    radiance:{e:"255,240,200",a:.22,t:3,p:["mote",12,"255,240,200"]},
    wings:{e:"255,240,200",a:.22,t:3,p:["mote",12,"255,240,200"]},
    shroud:{v:"30,0,40",a:.5,t:4,p:["wisp",8,"150,90,190"]},
    insp:{e:"255,200,70",a:.12,t:4.2,p:["star",6,"255,214,102"],r:1},
    tmp:{f:"90,160,230",a:.45,t:4,r:1},
    combat:{f:"230,70,50",a:.42,t:2.2,e2:"230,70,50"},/* no particles: they would sit over the Combat View content */
    wildshape:{e:"90,160,70",a:.2,t:4,p:["leaf",10,"120,170,70"]},
    noslots:{e:"120,80,170",a:.16,t:5,p:["wisp",6,"130,100,170"]},
    stable:{v:"40,140,90",a:.38,t:5,p:["mote",9,"150,230,180"]},
    dead:{v:"12,12,15",a:.78,t:8,p:["ash",8,"150,150,155"]},
    low:{e:"229,83,75",a:.22,t:1.05,beat:1},
    dying:{v:"130,0,0",a:.5,t:1.05,beat:1}
  };
  FXS02D.HEART='<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.3 5 6.8 5c2 0 3.6 1.1 5.2 3 1.6-1.9 3.2-3 5.2-3 3.5 0 5.6 3.6 4.3 6.8C19.5 16.4 12 21 12 21z"/></svg>';
  FXS02D.box=null; FXS02D.last="";
  FXS02D.seeded=function seeded(k,i){ const x=Math.sin((k.length*31+i*97.3))*43758.5453; return x-Math.floor(x); };;
  FXS02D.pcAsh=function pcAsh(c){ if(c.type!=="ash") return false; c.cls+=" fall"; c.st+=c.pos+";--s:"+(3+Math.round(c.r2*4))+"px;--d:"+(11+c.r2*7).toFixed(1)+"s;--dl:-"+(c.r1*14).toFixed(1)+"s;--w:"+(c.side?8:-8)+"px"; return true; };;
  FXS02D.pcLeaf=function pcLeaf(c){ if(c.type!=="leaf") return false; c.st+=c.pos+";--s:"+(12+Math.round(c.r2*8))+"px;--d:"+(10+c.r2*6).toFixed(1)+"s;--dl:-"+(c.r1*14).toFixed(1)+"s;--w:"+(c.side?6:-6)+"px"; return true; };;
  FXS02D.riseSize=function riseSize(type,r2){ return type==="z"?12+Math.round(r2*8):type==="ember"?4+Math.round(r2*4):type==="heart"?12+Math.round(r2*8):type==="link"?12+Math.round(r2*6):type==="star"?7+Math.round(r2*5):type==="wisp"?10+Math.round(r2*8):6+Math.round(r2*6); };
})();
(function(){
  ;
  FXS02D.pcRise=function pcRise(c){ const type=c.type; if(!(type==="bubble"||type==="ember"||type==="heart"||type==="z"||type==="wisp"||type==="link"||(type==="star"&&FXS02D.AMB[c.k].r))) return false;
    c.cls+=" rise"; if(type==="star") c.cls=c.cls.replace("p star","p star rise"); const s=FXS02D.riseSize(type,c.r2);
    c.st+=c.pos+";--s:"+s+"px;--d:"+(type==="ember"?4.5+c.r2*3:9+c.r2*6).toFixed(1)+"s;--dl:-"+(c.r1*10).toFixed(1)+"s;--w:"+(c.side?6:-6)+"px";
    if(type==="heart") c.inner=FXS02D.HEART; if(type==="z") c.inner="z"; return true; };;
  FXS02D.pcTwinkle=function pcTwinkle(c){ const type=c.type, r1=c.r1, r2=c.r2; if(!(type==="mote"||type==="star")) return false; c.cls+=" tw"; c.st+=(type==="star"?"left:"+(4+r1*92).toFixed(1)+"%;top:"+(6+r2*34).toFixed(0)+"px":c.pos+";top:"+(8+r2*84).toFixed(1)+"%")+";--s:"+(type==="star"?8+Math.round(r2*6):5+Math.round(r2*5))+"px;--d:"+(2.4+r2*2.6).toFixed(1)+"s;--dl:-"+(r1*4).toFixed(1)+"s"; return true; };;
  FXS02D.pcBolt=function pcBolt(c){ const r2=c.r2, pc=c.pc; if(c.type!=="bolt") return false; c.cls="p spark bolt "+(c.side?"sl":"sr"); c.st+=c.pos+";top:"+(6+r2*84).toFixed(1)+"%;--d:"+(1.4+r2*2.2).toFixed(1)+"s;--dl:-"+(c.r1*3).toFixed(1)+"s;width:26px;height:44px;background:none;box-shadow:none;transform:rotate("+(Math.round(r2*50)-25)+"deg)";
    c.inner='<svg viewBox="0 0 26 44" width="26" height="44" style="display:block;overflow:visible"><path d="M15 1 4 22h8L8 43l14-26h-8z" fill="rgba('+pc+',.85)" stroke="#fff" stroke-width="1" stroke-linejoin="round" style="filter:drop-shadow(0 0 4px rgba('+pc+',.9))"/></svg>'; return true; };;
  FXS02D.pcSpark=function pcSpark(c){ if(c.type!=="spark") return false; c.st+=c.pos+";top:"+(8+c.r2*84).toFixed(1)+"%;--s:"+(10+Math.round(c.r1*10))+"px;--d:"+(1.6+c.r2*2.4).toFixed(1)+"s;--dl:-"+(c.r1*3).toFixed(1)+"s;transform:rotate("+(Math.round(c.r2*60)-30)+"deg)"; return true; };
})();
(function(){
  ;
  function pcDust(c){ if(c.type!=="dust") return false; c.st+="left:"+(4+c.r1*92).toFixed(1)+"%;--s:"+(3+Math.round(c.r2*4))+"px;--d:"+(2.5+c.r2*2.5).toFixed(1)+"s;--dl:-"+(c.r1*4).toFixed(1)+"s;--w:"+(Math.round(c.r2*30)-15)+"px"; return true; }
  function pcWave(c){ if(c.type!=="wave") return false; c.st+=(c.side?"left:0":"right:0")+";--d:3.8s;--dl:-"+(c.i*1.9).toFixed(1)+"s"; return true; }
  const PIECE=[FXS02D.pcAsh,FXS02D.pcLeaf,FXS02D.pcRise,FXS02D.pcTwinkle,FXS02D.pcBolt,FXS02D.pcSpark,pcDust,pcWave];/* the first that fits the type draws the piece */
  function partOne(k,i,type,pc){ let r1=FXS02D.seeded(k,i), r2=FXS02D.seeded(k,i+50), side=i%2===0, edge=6+Math.round(r1*38), pos=(side?"left":"right")+":"+edge+"px", st="--pc:"+pc+";", cls="p "+type+(side?" sl":" sr"), inner="";
    const c={k:k,i:i,type:type,pc:pc,r1:r1,r2:r2,side:side,pos:pos,st:st,cls:cls,inner:inner};
    for(let j=0;j<PIECE.length;j++) if(PIECE[j](c)) break;
    return '<i class="'+c.cls+'" style="'+c.st+'">'+c.inner+'</i>'; }
  FXS02D.parts=function parts(k,P){ let type=P[0], n=P[1], pc=P[2], h="";
    for(let i=0;i<n;i++) h+=partOne(k,i,type,pc);
    return h; };
})();
(function(){
  ;
  FXS02D.layer=function layer(k){ let c=FXS02D.AMB[k], h="", m=c.m?" "+c.m:"", bt=c.beat?" beat":"";
    if(c.e) h+='<i class="e l'+m+bt+'"></i><i class="e r'+m+bt+'"></i>';
    if(c.h) h+='<i class="e l h" style="--hc:'+c.h+'"></i><i class="e r h" style="--hc:'+c.h+'"></i>';
    if(c.t2) h+='<i class="e t'+bt+'" style="--c:'+c.t2+'"></i>';
    if(c.b) h+='<i class="e b'+bt+'" style="--c:'+c.b+'"></i>';
    if(c.v) h+='<i class="v'+bt+'"></i>';
    if(c.v2) h+='<i class="v" style="--c:'+c.v2+';--a:.3"></i>';
    if(c.e2) h+='<i class="e l" style="--c:'+c.e2+';--a:.12"></i><i class="e r" style="--c:'+c.e2+';--a:.12"></i>';
    if(c.f) h+='<i class="f"></i>';
    if(c.p) h+=FXS02D.parts(k,c.p);
    const d=document.createElement("div"); d.className="ma"; d.setAttribute("data-k",k);
    d.style.cssText="--c:"+(c.e||c.v||c.f||c.t2||c.b)+";--a:"+c.a+";--t:"+c.t+"s"; d.innerHTML=h; FXS02D.box.appendChild(d); void d.offsetWidth; return d; };
})();
(function(){
  ;
  FXS02D.stateConds=function stateConds(st){ const cd=document.getElementById("conds");
    if(cd) Array.prototype.forEach.call(cd.querySelectorAll(".chip.on"),(c) =>{ const di=(c.getAttribute("data-info")||"").replace(/^g:/,""), md=c.getAttribute("data-mode");
      if(c.classList.contains("exh-c")){ const n=/(\d+)/.exec(c.textContent); st.Exhaustion=n?+n[1]:1; }
      else if(c.classList.contains("conc")) st.conc=1;
      else if(md){ if(FXS02D.AMB[md]) st[md]=1; else if(/rage/i.test(md)) st.rage=1; }
      else if(FXS02D.AMB[di]) st[di]=1; }); };;
  FXS02D.stateVitals=function stateVitals(st){ const hb=document.getElementById("hpBox"), bar=document.getElementById("hpBar");
    if(hb&&hb.classList.contains("hp0")){ const vt=document.querySelector(".vitals"), ok=document.querySelectorAll('#dsS .pip[aria-pressed="true"]').length;
        if(vt&&vt.classList.contains("dead")) st.dead=1; else if(ok>=3) st.stable=1; else st.dying=1; }
    else if(bar&&bar.getAttribute("data-lv")==="low") st.low=1; };
})();
(function(){
  ;
  function state(){ const st={}; FXS02D.stateConds(st);
    const ip=document.getElementById("insp")||document.getElementById("vbInsp"); if(ip&&ip.getAttribute("aria-pressed")==="true") st.insp=1;
    const tm=document.getElementById("hpTmp"); if(tm&&tm.classList.contains("on")) st.tmp=1;
    FXS02D.stateVitals(st);
    if(document.querySelector("#sheet.on #cbv")) st.combat=1;
    const sl=document.querySelectorAll("#p-spells .spsl .bx"); if(sl.length&&!document.querySelector('#p-spells .spsl .bx[aria-pressed="false"]')) st.noslots=1;
    return st; }
  FXENV.__miAmb=function(force){ const st=MI.rm()?{}:state(), key=JSON.stringify(st); if(key===FXS02D.last&&!force) return; FXS02D.last=key;
    if(!FXS02D.box){ if(key==="{}") return; FXS02D.box=document.createElement("div"); FXS02D.box.id="miAmb"; FXS02D.box.setAttribute("aria-hidden","true"); document.body.appendChild(FXS02D.box); }
    Object.keys(FXS02D.AMB).forEach((k) =>{ let el=FXS02D.box.querySelector('.ma[data-k="'+k+'"]'), on=!!st[k];
      if(on&&!el) el=FXS02D.layer(k);
      if(el){ el.classList.toggle("on",on); if(k==="Exhaustion"&&on) el.style.setProperty("--a",(0.18+Math.min(6,st[k])*0.07).toFixed(2)); } }); };
  requestAnimationFrame(FXENV.__miAmb);
  let sh=document.getElementById("sheet"); FXS02D.sbd=document.getElementById("sheetBody"); let q=0; FXS02D.kick=function(){ if(!q){ q=1; requestAnimationFrame(() =>{ q=0; FXENV.__miAmb(); }); } };
  if(sh) new MutationObserver(FXS02D.kick).observe(sh,{attributes:true,attributeFilter:["class"]});
})();
(function(){
  if(FXS02D.sbd) new MutationObserver(FXS02D.kick).observe(FXS02D.sbd,{childList:true});
})();
/* --- v55: Peek Rating on slot rows (spell slots, limited uses, death saves) --- */
const FXS02E={};
(function(){
  if(!document.body||!document.body.animate) return;
  
  const FINE=!!(FXENV.matchMedia&&matchMedia("(hover: hover) and (pointer: fine)").matches);
  FXS02E.SEL='.bx[data-k],#dsS .pip,#dsF .pip';
  FXS02E.row=function row(b){ const k=b.getAttribute("data-k"); return Array.prototype.filter.call(b.parentNode.children,(x) =>{ return x.matches&&x.matches(FXS02E.SEL)&&x.getAttribute("data-k")===k; }); };;
  FXS02E.on=function on(b){ return b.getAttribute("aria-pressed")==="true"; };;
  function clear(L){ L.forEach((x) =>{ x.classList.remove("mi-peek","mi-ghost","mi-unghost"); x.style.transitionDelay=""; }); }
  let cur=null;
  if(FINE&&!MI.rm()){
    MI.on("pointerover",(e) =>{ if(e.pointerType!=="mouse"||MI.rm()) return; const b=e.target.closest&&e.target.closest(FXS02E.SEL); if(!b){ if(cur){ clear(cur); cur=null; } return; }
      const L=FXS02E.row(b), i=L.indexOf(b), used=L.filter(FXS02E.on).length, to=(used===i+1)?i:i+1; if(cur&&cur!==L) clear(cur); cur=L;
      L.forEach((x,j) =>{ const lift=j<=i, will=j<to; x.style.transitionDelay=(lift?j*28:0)+"ms"; x.classList.toggle("mi-peek",lift);
        x.classList.toggle("mi-ghost",will&&!FXS02E.on(x)); x.classList.toggle("mi-unghost",!will&&FXS02E.on(x)); }); },{passive:true});
    document.documentElement.addEventListener("mouseleave",() =>{ if(cur){ clear(cur); cur=null; } });
  }
})();
(function(){
  if(!document.body||!document.body.animate) return;
  /* click: remember the row before, pop what changed after the sheet redraws it */
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest(FXS02E.SEL); if(!b||MI.rm()) return; const L=FXS02E.row(b), before=L.map(FXS02E.on), i=L.indexOf(b), r=b.getBoundingClientRect(), par=b.parentNode, k=b.getAttribute("data-k");
    requestAnimationFrame(() =>{ const h=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2), nb=(h&&h.closest&&h.closest(FXS02E.SEL))||b; if(!nb.isConnected) return; let N=FXS02E.row(nb), n=0;
      N.forEach((x,j) =>{ if(before[j]===undefined||before[j]===FXS02E.on(x)) return; const d=(FXS02E.on(x)?j:(N.length-1-j))*38; n++;
        x.animate([{transform:"translateY(0) scale(1)"},{transform:"translateY(-7px) scale(1.28)",offset:.45},{transform:"translateY(0) scale(.94)",offset:.75},{transform:"none"}],{duration:420,delay:d,easing:"cubic-bezier(.2,.8,.2,1)"}); }); }); },true);
})();
/* Immersive Effects and vibration buttons in Settings */
MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-mifx],[data-mibz]"); if(!b) return;
  if(b.hasAttribute("data-mifx")) MI.set("mode",b.getAttribute("data-mifx")); else MI.set("bz",b.getAttribute("data-mibz")); MI.buzz("light"); },true);
