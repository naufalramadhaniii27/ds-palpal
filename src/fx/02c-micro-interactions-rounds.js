/* --- v55 round 3: XP, coins, number bumps, level up fanfare, concentration, spotlight --- */
(function(){
  if(!document.body||!document.body.animate) return;
  
  const FINE=!!(FXENV.matchMedia&&matchMedia("(hover: hover) and (pointer: fine)").matches);
  const burst=FXENV.__miBurst||function(){}, ring=FXENV.__miRing||function(){};
  function C(el){ const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; }
  function floatTxt(x,y,txt,col){ if(MI.rm()) return; const e=document.createElement("i"); e.className="mi-float"; e.textContent=txt; e.style.color=col; e.setAttribute("aria-hidden","true"); document.body.appendChild(e);
    const an=e.animate([{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(.6)",opacity:0},{transform:"translate("+x+"px,"+(y-16)+"px) translate(-50%,-50%) scale(1.1)",opacity:1,offset:.25},{transform:"translate("+x+"px,"+(y-58)+"px) translate(-50%,-50%) scale(1)",opacity:0}],{duration:1150,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
    an.onfinish=function(){ e.remove(); }; setTimeout(() =>{ e.remove(); },1600); }
  FXENV.__miFloat=floatTxt;

  /* Add XP: the amount rises in gold, stars, and a shine runs along the XP bar */
  MI.on("click",(e) =>{ const t=e.target.closest&&e.target.closest('[data-xpadd="1"]'); if(!t) return; const inp=document.querySelector("[data-xpamt]"), v=inp?Math.floor(+inp.value||0):0; if(v<=0) return; const p=C(t);
    floatTxt(p.x,p.r.top,"+"+v.toLocaleString("en-US")+" XP","#ffd166"); burst(p.x,p.y,{n:8,colors:["#ffd166","#fff3b0"],shape:"mi-star",dist:36,dur:650});
    if(MI.rm()) return; setTimeout(() =>{ Array.prototype.forEach.call(document.querySelectorAll(".xpbar"),(b) =>{ b.classList.remove("mi-shine"); void b.offsetWidth; b.classList.add("mi-shine"); setTimeout(() =>{ b.classList.remove("mi-shine"); },1000); }); },60); },true);

  /* Manage Coin, Add: gold coins spill out and the amount rises */
  MI.on("click",(e) =>{ const t=e.target.closest&&e.target.closest('[data-coin="add"],[data-coin="rem"]'); if(!t) return; const add=t.getAttribute("data-coin")==="add", parts=[];
    Array.prototype.forEach.call(document.querySelectorAll("#coinDlg [data-camt]"),(i) =>{ const v=Math.floor(+i.value||0); if(v>0) parts.push((add?"+":"−")+v+" "+i.getAttribute("data-camt")); }); if(!parts.length) return; const p=C(t);
    floatTxt(p.x,p.r.top,parts.join("  "),add?"#ffc93c":"#e5a04b"); if(add&&MI.full()) burst(p.x,p.y,{n:12,shape:"mi-coin",colors:["#ffc93c"],dist:70,dur:950,grav:true}); },true);

  /* level up fanfare */
  function levelFx(lv){ if(!MI.full()) return; const x=innerWidth/2, y=innerHeight*.38; ring(x,y,"#ffc93c",220); if(FXENV.__miWow) FXENV.__miWow.level(x,y);
    burst(x,y,{n:26,colors:["#ffd166","#ffc93c","#fff3b0","#ffffff"],shape:"mi-star",dist:190,dur:1500,scale:1.4,grav:true});
    setTimeout(() =>{ burst(x,y,{n:18,colors:["#ffd166","#7cb6ff","#ffffff"],shape:"mi-spark",dist:150,dur:1100}); },250);
    const b=document.createElement("div"); b.className="mi-lv"; b.setAttribute("aria-hidden","true"); b.innerHTML=(FXENV.__artVig?FXENV.__artVig("moment",lv>=20?"level-20":"level-up",120):"")+"<b>Level "+lv+"</b><span>Level up!</span>"; document.body.appendChild(b);
    const sz=Math.min(84,Math.max(40,innerWidth*.09)); particleText("LEVEL "+lv,x,y-sz*.1,sz);
    const an=b.animate([{transform:"translate(-50%,-50%) scale(.96)",opacity:0},{transform:"translate(-50%,-50%) scale(.96)",opacity:0,offset:.3},{transform:"translate(-50%,-50%) scale(1)",opacity:1,offset:.42},{transform:"translate(-50%,-50%) scale(1)",opacity:1,offset:.8},{transform:"translate(-50%,-62%) scale(1)",opacity:0}],{duration:2600,easing:"cubic-bezier(.2,.8,.2,1)",fill:"forwards"});
    an.onfinish=function(){ b.remove(); flipLevel(); }; setTimeout(() =>{ b.remove(); },3100); }
  /* Particle Text: dots gather into the words, then hand over to the crisp banner. The canvas is used once to sample the letters */
  function particleText(txt,cx,cy,size){ const cv=document.createElement("canvas"), ctx=cv.getContext("2d"); if(!ctx) return; const w=Math.ceil(size*txt.length*.66), h=Math.ceil(size*1.2); cv.width=w; cv.height=h;
    ctx.font="900 "+size+"px "+(getComputedStyle(document.body).fontFamily||"sans-serif"); ctx.textAlign="center"; ctx.textBaseline="middle"; ctx.fillStyle="#000"; ctx.fillText(txt,w/2,h/2);
    const d=ctx.getImageData(0,0,w,h).data, step=Math.max(4,Math.round(size/11)), P=[]; for(let yy=0;yy<h;yy+=step) for(let xx=0;xx<w;xx+=step) if(d[(yy*w+xx)*4+3]>140) P.push([xx,yy]);
    while(P.length>150) P.splice((Math.random()*P.length)|0,1);
    P.forEach((q) =>{ const e=document.createElement("i"); e.className="mi-fx mi-dot"; e.setAttribute("aria-hidden","true"); e.style.background=Math.random()<.3?"#fff3b0":"#ffc93c"; e.style.width=e.style.height=Math.max(3,step-1)+"px"; document.body.appendChild(e);
      const tx=cx-w/2+q[0], ty=cy-h/2+q[1], fx=cx+(Math.random()-.5)*innerWidth*.9, fy=cy+(Math.random()-.5)*innerHeight*.7, dl=Math.random()*220;
      const a=e.animate([{transform:"translate("+fx+"px,"+fy+"px) scale(.3)",opacity:0},{transform:"translate("+tx+"px,"+ty+"px) scale(1)",opacity:1,offset:.45},{transform:"translate("+tx+"px,"+ty+"px) scale(1)",opacity:1,offset:.7},{transform:"translate("+tx+"px,"+(ty-10)+"px) scale(.4)",opacity:0}],{duration:1500,delay:dl,easing:"cubic-bezier(.2,.8,.2,1)",fill:"both"});
      a.onfinish=function(){ e.remove(); }; setTimeout(() =>{ e.remove(); },2200); }); }
  /* Split Flap: after the banner, the level number on the sheet flips over */
  function flipLevel(){ const el=document.querySelector("#xpBox .xph b"); if(!el||MI.rm()) return; el.style.display="inline-block";
    el.animate([{transform:"perspective(300px) rotateX(-90deg)",opacity:.2},{transform:"perspective(300px) rotateX(18deg)",opacity:1,offset:.6},{transform:"perspective(300px) rotateX(-6deg)",offset:.8},{transform:"none"}],{duration:620,easing:"cubic-bezier(.3,1.5,.5,1)"}).onfinish=function(){ el.style.display=""; }; MI.buzz("success"); }
  FXENV.__miLevel=levelFx;

  /* one light watcher: a changed stat bumps, a higher level celebrates, Concentration starting rings */
  let prev={}, who=null, pend=false, concWas=null;
  function ssGet(k){ try{ return sessionStorage.getItem(k); }catch(e){ return null; } }
  function ssSet(k,v){ try{ sessionStorage.setItem(k,v); }catch(e){} }
  function scan(){ pend=false;
    const nm=document.getElementById("idName"), name=nm?nm.textContent.trim():"", lvb=document.querySelector("#xpBox .xph b"), m=lvb&&/(\d+)/.exec(lvb.textContent), lv=m?+m[1]:null;
    const same=name===who; who=name; const cur={};
    Array.prototype.forEach.call(document.querySelectorAll("#abil .ab, #tiles .tile"),(el) =>{ const k=el.querySelector(".k"), v=el.querySelector(".m, .v"); if(!k||!v) return; const key=k.textContent.trim(), val=FXENV.__miOdoVal?FXENV.__miOdoVal(v):v.textContent.trim(); cur[key]=val;
      if(same&&!MI.rm()&&prev[key]!=null&&prev[key]!==val&&!v.getAttribute("data-miv")&&FXENV.__miOdo&&prev[key].length===val.length){ v.setAttribute("data-miv",prev[key]); v.textContent=prev[key]; FXENV.__miOdo(v,val); } });
    prev=same?Object.assign(prev,cur):cur;
    if(name&&lv!=null){ const sk="mi-lv:"+name, was=+(ssGet(sk)||0); if(was&&lv>was) setTimeout(() =>{ levelFx(lv); },350); ssSet(sk,String(lv)); }
    const vc=document.getElementById("vbConc"), on=!!(vc&&!vc.hidden);
    if(FXENV.__miAmb) FXENV.__miAmb();
    if(concWas===true&&!on&&FXENV.__miWow&&FXENV.__miWow.concBreak) FXENV.__miWow.concBreak();
    if(concWas===false&&on&&FXENV.__miBell){ FXENV.__miBell(vc,"#8fb8ff"); const cc=document.querySelector("#conds .chip.conc"); if(cc) FXENV.__miBell(cc,"#8fb8ff"); } concWas=on; }
  new MutationObserver(() =>{ if(!pend){ pend=true; requestAnimationFrame(scan); } }).observe(document.getElementById("app")||document.body,{childList:true,subtree:true,characterData:true});/* the sheet only, so particles added to body do not wake it */
  requestAnimationFrame(scan);

  /* cursor spotlight position for ability scores and stat tiles */
  if(FINE&&!MI.rm()) MI.on("pointermove",(e) =>{ if(e.pointerType!=="mouse"||MI.rm()) return; const t=e.target.closest&&e.target.closest(".ab,.tiles .tile"); if(!t) return; const r=t.getBoundingClientRect();
    t.style.setProperty("--mx",(e.clientX-r.left)+"px"); t.style.setProperty("--my",(e.clientY-r.top)+"px"); },{passive:true});
})();
/* --- v55 round 5: search results, new inventory items, conditions with their own motion --- */
(function(){
  if(!document.body||!document.body.animate) return;
  
  const burst=FXENV.__miBurst||function(){}, ring=FXENV.__miRing||function(){};
  function C(el){ const r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2,r:r}; }
  function rise(x,y,cols,n){ if(MI.rm()) return; for(let i=0;i<(n||6);i++){ const e=document.createElement("i"), s=5+Math.random()*5; e.className="mi-fx mi-dot"; e.setAttribute("aria-hidden","true"); e.style.background=cols[i%cols.length]; e.style.width=e.style.height=s+"px"; document.body.appendChild(e);
      var dx=(Math.random()-.5)*30, dy=-(26+Math.random()*30), an=e.animate([{transform:"translate("+x+"px,"+y+"px) translate(-50%,-50%) scale(.5)",opacity:.9},{transform:"translate("+(x+dx)+"px,"+(y+dy)+"px) translate(-50%,-50%) scale(1.5)",opacity:0}],{duration:850+Math.random()*300,delay:i*45,easing:"cubic-bezier(.2,.7,.3,1)",fill:"both"});
      (function(e){ an.onfinish=function(){ e.remove(); }; setTimeout(() =>{ e.remove(); },1700); })(e); } }
  function who(){ const n=document.getElementById("idName"); return n?n.textContent.trim():""; }

  /* 1. Search: results drop in one after another when Search opens, and the letters you typed are marked in each result */
  let lastQ=null;
  function mark(b,q){ let tn=null, k; for(k=b.childNodes.length-1;k>=0;k--){ const c=b.childNodes[k]; if(c.nodeType===3&&c.nodeValue.trim()){ tn=c; break; } } if(!tn) return;
    let s=tn.nodeValue, lo=s.toLowerCase(), qt=q.trim().toLowerCase(), qq=qt.replace(/\s+/g,""), on=[], i, j=0; if(!qq) return;
    const at=lo.indexOf(qt); if(at>=0){ for(i=at;i<at+qt.length;i++) on[i]=1; } else { for(i=0;i<s.length&&j<qq.length;i++) if(lo[i]===qq[j]){ on[i]=1; j++; } if(j<qq.length) return; }
    let f=document.createDocumentFragment(), buf="", m=false;
    function flush(){ if(!buf) return; if(m){ const e=document.createElement("mark"); e.textContent=buf; f.appendChild(e); } else f.appendChild(document.createTextNode(buf)); buf=""; }
    for(i=0;i<s.length;i++){ const w=!!on[i]; if(w!==m){ flush(); m=w; } buf+=s[i]; } flush(); const wrap=document.createElement("span"); wrap.appendChild(f); tn.parentNode.replaceChild(wrap,tn); }/* one span: the row lays its parts out with a gap */
  const sb=document.getElementById("sheetBody");
  if(sb) new MutationObserver(() =>{ const q=document.getElementById("gsQ"); if(!q){ lastQ=null; return; }
      const rows=sb.querySelectorAll(".gs-r"), fresh=q!==lastQ; lastQ=q;
      Array.prototype.forEach.call(rows,(r) =>{ const b=r.querySelector("b"); if(b&&q.value.trim()) mark(b,q.value); });
      if(fresh&&!MI.rm()) Array.prototype.slice.call(sb.querySelectorAll(".gs-c, .gs-r, .info-h"),0,16).forEach((r,i) =>{ r.animate([{opacity:0,transform:"translateY(6px)"},{opacity:1,transform:"none"}],{duration:240,delay:i*18,easing:"cubic-bezier(.2,.8,.2,1)",fill:"backwards"}); });
    }).observe(sb,{childList:true});

  /* 2. Inventory: an item that just arrived flashes softly and slides into place */
  let ib=document.getElementById("invBody"), invPrev=null, invKey="";
  if(ib) new MutationObserver(() =>{ const fb=ib.querySelector(".ifb.on"), key=who()+"|"+(fb?fb.getAttribute("data-invf"):""), cnt={}, rows=ib.querySelectorAll(".irow");
      Array.prototype.forEach.call(rows,(r) =>{ const b=r.querySelector(".iname b"); if(!b) return; const n=b.textContent.trim(); cnt[n]=(cnt[n]||0)+1; });
      if(invPrev&&key===invKey&&!MI.rm()){ const seen={}; for(let i=rows.length-1;i>=0;i--){ const b=rows[i].querySelector(".iname b"); if(!b) continue; const n=b.textContent.trim(); seen[n]=(seen[n]||0)+1;
          if(seen[n]<=(cnt[n]-(invPrev[n]||0))){ const r=rows[i]; r.classList.remove("mi-new"); void r.offsetWidth; r.classList.add("mi-new"); r.animate([{opacity:.3,transform:"translateX(-10px)"},{opacity:1,transform:"none"}],{duration:320,easing:"cubic-bezier(.2,.8,.2,1)"}); (function(r){ setTimeout(() =>{ r.classList.remove("mi-new"); },1300); })(r); } } }
      invPrev=cnt; invKey=key; }).observe(ib,{childList:true});

  /* 3. Conditions: each one arrives with its own motion */
  const CFX={Poisoned:["rise",["#7bd389","#3fa34d"]],Frightened:["shake",["#c7b8ff"]],Charmed:["burst",["#ff8fc7","#ffc2e0"]],Paralyzed:["spark",["#ffe066","#fff3b0"]],Stunned:["ring",["#ffe066"]],
    Blinded:["rise",["#555a60","#8a9096"]],Deafened:["ring",["#9fb3b3"]],Invisible:["fade",["#cfe8ff"]],Prone:["drop",["#c9a27a"]],Grappled:["squeeze",["#d0a060"]],Restrained:["squeeze",["#d0a060"]],
    Incapacitated:["ring",["#aaaaaa"]],Petrified:["burst",["#9a9a9a","#6b6b6b"]],Unconscious:["rise",["#8aa0c8","#c3d0e8"]],Exhaustion:["ring",["#e5534b"]]};
  function condFx(el,name){ if(MI.rm()) return; const p=C(el); if(!p.r.width||p.r.bottom<0||p.r.top>innerHeight) return; const base=name.replace(/\s*\d+$/,"").trim(), f=CFX[base]||(/rag/i.test(name)?["burst",["#ff6b3d","#ffb26b"]]:["burst",[getComputedStyle(el).backgroundColor]]), k=f[0], c=f[1], E="cubic-bezier(.2,.8,.2,1)";
    el.animate([{transform:"scale(.6)",opacity:0},{transform:"scale(1.1)",opacity:1,offset:.6},{transform:"none",opacity:1}],{duration:280,easing:E});
    if(FXENV.__miWow) FXENV.__miWow.stamp(el,c[0]);
    if(k==="rise") rise(p.x,p.y-6,c,7);
    else if(k==="burst") burst(p.x,p.y,{n:10,colors:c,dist:34,dur:600});
    else if(k==="spark") burst(p.x,p.y,{n:10,colors:c,shape:"mi-spark",dist:30,dur:500});
    else if(k==="ring") ring(p.x,p.y,c[0],70);
    else if(k==="shake") el.animate([{transform:"translateX(0)"},{transform:"translateX(-4px)"},{transform:"translateX(4px)"},{transform:"translateX(-3px)"},{transform:"translateX(3px)"},{transform:"translateX(0)"}],{duration:420,delay:300,easing:"linear"});
    else if(k==="fade") el.animate([{opacity:1},{opacity:.25},{opacity:.9},{opacity:.35},{opacity:1}],{duration:900,delay:300,easing:"ease-in-out"});
    else if(k==="drop") el.animate([{transform:"translateY(-14px)"},{transform:"translateY(0)",offset:.5},{transform:"translateY(-4px)",offset:.7},{transform:"none"}],{duration:520,delay:200,easing:"ease-out"});
    else if(k==="squeeze") el.animate([{transform:"scaleX(1)"},{transform:"scaleX(.8)"},{transform:"scaleX(1.06)"},{transform:"none"}],{duration:480,delay:300,easing:E}); }
  let cd=document.getElementById("conds"), cPrev=null, cWho="";
  if(cd) new MutationObserver(() =>{ const now={}, els={}; Array.prototype.forEach.call(cd.querySelectorAll(".chip.on"),(c) =>{ let k=(c.getAttribute("data-info")||"").replace(/^g:/,"")||c.textContent.trim(); if(c.classList.contains("exh-c")) k="Exhaustion"; now[k]=1; els[k]=c; });
      if(FXENV.__miAmb) FXENV.__miAmb();
      const w=who(); if(cPrev&&w===cWho) Object.keys(now).forEach((k) =>{ if(!cPrev[k]) condFx(els[k],k==="Exhaustion"?"Exhaustion":els[k].textContent.trim()||k); }); cPrev=now; cWho=w; }).observe(cd,{childList:true});
})();
