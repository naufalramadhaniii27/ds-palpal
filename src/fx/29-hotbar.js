/* === Brief stage 5: attack hotbar above the HP/AC bar, and a quick-action button (Rest, Level Up).
   The hotbar mirrors the attack rows of the Actions tab (#actBody .arow with a To hit box). A tap rolls the attack with the
   existing roller (__miRoll.roll: 3D dice, toast, history), then opens the existing damage card, which offers Roll and Critical.
   The quick-action items carry data-rest="menu" and data-lvup="1", so the existing delegated handlers do the work. === */
(function(){
  const D=document, R=D.documentElement, vb=D.getElementById("vbar"); if(!vb) return;
  const hb=D.createElement("div"); hb.className="xhot"; hb.setAttribute("role","toolbar"); hb.setAttribute("aria-label","Attack hotbar"); vb.appendChild(hb);/* always shown on the sheet: the quick-action button docks at its right end */
  const hit=(a) =>{ return (a.firstChild&&a.firstChild.textContent||"").trim(); };
  /* where the docked bars start, measured from the bottom of the screen: the quick-action button docks beside it, the roll-history badge sits above it */
  function place(){ const top=hb.getBoundingClientRect().top, on=!!vb.offsetParent;
    R.style.setProperty("--hb-b",Math.max(0,R.clientHeight-top)+"px"); R.classList.toggle("xhot-on",on); R.classList.toggle("qfab-on",on); }
  function item(r){ const a=r.querySelector('.abox[data-bd^="ah-"]'), t=r.querySelector(".tx"), ic=r.querySelector(".aki"), n=(t?t.textContent:"").trim(), b=D.createElement("button"), s=D.createElement("span"), h=D.createElement("b");
    b.type="button"; b.className="xhot-i"; b.setAttribute("data-xhot",a.getAttribute("data-bd").slice(3)); b.setAttribute("aria-label","Roll "+n+" attack, "+hit(a)+" to hit");
    s.className="xhot-n"; s.textContent=n; h.textContent=hit(a); if(ic) b.appendChild(ic.cloneNode(true)); b.append(s,h); return b; }
  let sig="";
  function build(){ const rows=[...D.querySelectorAll('#actBody .arow')].filter((r) =>{ return r.querySelector('.abox[data-bd^="ah-"]'); }).slice(0,10);
    const s=rows.map((r) =>{ return r.textContent; }).join("|"); if(s!==sig){ sig=s; hb.replaceChildren(...rows.map(item)); }
    place(); }
  hb.addEventListener("click",(e) =>{ const b=e.target.closest(".xhot-i"); if(!b) return; const i=b.getAttribute("data-xhot"), RL=FXENV.__miRoll;
    const a=D.querySelector('#actBody .abox[data-bd="ah-'+i+'"]'); if(!a) return;
    if(!RL||!RL.roll){ a.click(); return; }/* no roller (fx off): the existing card with its roll buttons */
    const bon=parseInt(hit(a).replace("−","-"),10)||0;
    RL.roll({bon:bon},"",b.querySelector(".xhot-n").textContent+": attack roll",(r) =>{ if(r&&r.k==="nat1") return; const d=D.querySelector('#actBody .abox[data-bd="ad-'+i+'"]'); if(d) setTimeout(() =>{ d.click(); },700); }); });
  /* off the tap path (resp_budget): rebuild a moment after the Actions list changes, re-measure a moment after a tap */
  let q=0, qp=0; function kick(){ if(!q) q=setTimeout(() =>{ q=0; build(); },250); } function kickP(){ if(!qp) qp=setTimeout(() =>{ qp=0; place(); },400); }
  const ab=D.getElementById("actBody"); if(ab) new FXENV.MutationObserver(kick).observe(ab,{childList:true,subtree:true,characterData:true});
  FXENV.addEventListener("resize",kickP); D.addEventListener("click",kickP,true);/* Home and sheet switch by taps: re-measure after each */
  build();
})();
(function(){
  const D=document;
  const btn=(t,k,v) =>{ const b=D.createElement("button"); b.type="button"; b.textContent=t; if(k) b.setAttribute(k,v); return b; };
  const fab=D.createElement("div"), fm=D.createElement("div"), fb=btn("","aria-label","Quick actions");
  fab.className="qfab"; fm.className="qfab-m"; fm.id="qfabM"; fm.hidden=true; fm.append(btn("Rest","data-rest","menu"),btn("Level Up","data-lvup","1"));
  fb.className="qfab-b"; fb.setAttribute("aria-expanded","false"); fb.setAttribute("aria-controls","qfabM"); fab.append(fm,fb); const vb=D.getElementById("vbar"); if(vb) vb.appendChild(fab);/* docked: moves and hides with the HP/AC bar */
  function menu(open){ fm.hidden=!open; fb.setAttribute("aria-expanded",String(open)); fab.classList.toggle("on",open); D.documentElement.classList.toggle("qfab-open",open); if(open) fm.firstChild.focus(); }
  fb.addEventListener("click",() =>{ menu(fm.hidden); });
  fm.addEventListener("click",() =>{ menu(false); });/* the delegated Rest and Level Up handlers still see the click */
  fab.addEventListener("keydown",(e) =>{ if(e.key==="Escape"&&!fm.hidden){ menu(false); fb.focus(); } });
  D.addEventListener("click",(e) =>{ if(!fm.hidden&&!fab.contains(e.target)) menu(false); });
})();
