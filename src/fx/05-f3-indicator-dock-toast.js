/* === F3: sliding indicator, Dock, staggered More menu, swipe toast with fuse === */
const FXS05A={};
(function(){
  if(!document.body.animate) return;
 FXS05A.EASE="cubic-bezier(.2,.8,.2,1)";
  /* filter and section chips: the chosen chip springs into place by itself (pure CSS, see .ifb.on). Here only a light tick. Nothing is added over the app, so nothing can be left behind */
  MI.on("click",(e) =>{ const b=e.target.closest&&e.target.closest(".ifb,.cmb-tab,.ed-sec"); if(b&&!b.classList.contains("on")) MI.buzz("light"); },true);

  /* Dock: on phones the pressed icon in the bottom bar swells and its neighbours lift a little */
  let dk=[];
  function undock(){ dk.forEach((x) =>{ x.classList.remove("mi-dock","mi-dock1"); }); dk=[]; }
  MI.on("pointerdown",(e) =>{ if(MI.rm()) return; const b=e.target.closest&&e.target.closest(".bnav button"); if(!b) return; undock(); b.classList.add("mi-dock"); dk.push(b); },true);
  MI.on("pointerup",() =>{ setTimeout(undock,120); },true); MI.on("pointercancel",undock,true);

  /* More menu: items come in one after another */
  const mm=document.getElementById("moreMenu");
  if(mm) new MutationObserver(() =>{ if(!mm.classList.contains("open")||MI.rm()) return; Array.prototype.forEach.call(mm.children,(c,i) =>{ c.animate([{opacity:0,transform:"translateY(-8px) scale(.96)"},{opacity:1,transform:"none"}],{duration:240,delay:i*35,easing:FXS05A.EASE,fill:"backwards"}); }); }).observe(mm,{attributes:true,attributeFilter:["class"]});

  /* toast: a fuse burns down for the time it stays; swipe it down to dismiss */
  FXS05A.t=document.getElementById("toast"); let fz=null;
  FXS05A.fuse=function fuse(){ if(!FXS05A.t||!FXS05A.t.classList.contains("on")||MI.rm()) return; let f=FXS05A.t.querySelector(".mi-fuse"); if(!f){ f=document.createElement("i"); f.className="mi-fuse"; f.setAttribute("aria-hidden","true"); FXS05A.t.appendChild(f); }
    if(fz) fz.cancel(); fz=f.animate([{transform:"scaleX(1)"},{transform:"scaleX(0)"}],{duration:FXS05A.t.classList.contains("act")?6000:2400,easing:"linear",fill:"forwards"}); };
})();
(function(){
  if(!document.body.animate) return;
  ;
  if(FXS05A.t){ let key=""; new MutationObserver(() =>{ const k=FXS05A.t.className+"|"+(FXS05A.t.firstChild?FXS05A.t.textContent:""); if(k===key) return; key=k; if(FXS05A.t.classList.contains("on")) FXS05A.fuse(); FXS05A.t.style.translate=""; }).observe(FXS05A.t,{attributes:true,attributeFilter:["class"],childList:true});
    let sw=null;
    MI.on("pointerdown",(e) =>{ if(!FXS05A.t.classList.contains("on")||!FXS05A.t.contains(e.target)||e.target.closest(".tundo")) return; sw={y:e.clientY,dy:0,id:e.pointerId}; try{ FXS05A.t.setPointerCapture(e.pointerId); }catch(er){} },true);
    MI.on("pointermove",(e) =>{ if(!sw||e.pointerId!==sw.id) return; sw.dy=Math.max(0,e.clientY-sw.y); FXS05A.t.style.translate="0 "+sw.dy+"px"; FXS05A.t.style.opacity=String(Math.max(.2,1-sw.dy/120)); });
    const up=function(){ if(!sw) return; const s=sw; sw=null; FXS05A.t.style.opacity="";
      if(s.dy>40){ FXS05A.t.animate([{translate:"0 "+s.dy+"px",opacity:.6},{translate:"0 90px",opacity:0}],{duration:180,easing:"ease-in"}).onfinish=function(){ FXS05A.t.classList.remove("on","act"); FXS05A.t.style.translate=""; }; setTimeout(() =>{ FXS05A.t.style.translate=""; },400); MI.buzz("light"); }
      else { FXS05A.t.animate([{translate:"0 "+s.dy+"px"},{translate:"0 0"}],{duration:220,easing:FXS05A.EASE}); FXS05A.t.style.translate=""; } };
    MI.on("pointerup",up,true); MI.on("pointercancel",up,true); }
})();
