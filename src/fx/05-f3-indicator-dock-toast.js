/* === F3: sliding indicator, Dock, staggered More menu, swipe toast with fuse === */
(function(){
  if(!document.body.animate) return; var EASE="cubic-bezier(.2,.8,.2,1)";
  /* filter and section chips: the chosen chip springs into place by itself (pure CSS, see .ifb.on). Here only a light tick. Nothing is added over the app, so nothing can be left behind */
  MI.on("click",function(e){ var b=e.target.closest&&e.target.closest(".ifb,.cmb-tab,.ed-sec"); if(b&&!b.classList.contains("on")) MI.buzz("light"); },true);

  /* Dock: on phones the pressed icon in the bottom bar swells and its neighbours lift a little */
  var dk=[];
  function undock(){ dk.forEach(function(x){ x.classList.remove("mi-dock","mi-dock1"); }); dk=[]; }
  MI.on("pointerdown",function(e){ if(MI.rm()) return; var b=e.target.closest&&e.target.closest(".bnav button"); if(!b) return; undock(); b.classList.add("mi-dock"); dk.push(b); },true);
  MI.on("pointerup",function(){ setTimeout(undock,120); },true); MI.on("pointercancel",undock,true);

  /* More menu: items come in one after another */
  var mm=document.getElementById("moreMenu");
  if(mm) new MutationObserver(function(){ if(!mm.classList.contains("open")||MI.rm()) return; Array.prototype.forEach.call(mm.children,function(c,i){ c.animate([{opacity:0,transform:"translateY(-8px) scale(.96)"},{opacity:1,transform:"none"}],{duration:240,delay:i*35,easing:EASE,fill:"backwards"}); }); }).observe(mm,{attributes:true,attributeFilter:["class"]});

  /* toast: a fuse burns down for the time it stays; swipe it down to dismiss */
  var t=document.getElementById("toast"), fz=null;
  function fuse(){ if(!t||!t.classList.contains("on")||MI.rm()) return; var f=t.querySelector(".mi-fuse"); if(!f){ f=document.createElement("i"); f.className="mi-fuse"; f.setAttribute("aria-hidden","true"); t.appendChild(f); }
    if(fz) fz.cancel(); fz=f.animate([{transform:"scaleX(1)"},{transform:"scaleX(0)"}],{duration:t.classList.contains("act")?6000:2400,easing:"linear",fill:"forwards"}); }
  if(t){ var key=""; new MutationObserver(function(){ var k=t.className+"|"+(t.firstChild?t.textContent:""); if(k===key) return; key=k; if(t.classList.contains("on")) fuse(); t.style.translate=""; }).observe(t,{attributes:true,attributeFilter:["class"],childList:true});
    var sw=null;
    MI.on("pointerdown",function(e){ if(!t.classList.contains("on")||!t.contains(e.target)||e.target.closest(".tundo")) return; sw={y:e.clientY,dy:0,id:e.pointerId}; try{ t.setPointerCapture(e.pointerId); }catch(er){} },true);
    MI.on("pointermove",function(e){ if(!sw||e.pointerId!==sw.id) return; sw.dy=Math.max(0,e.clientY-sw.y); t.style.translate="0 "+sw.dy+"px"; t.style.opacity=String(Math.max(.2,1-sw.dy/120)); });
    var up=function(){ if(!sw) return; var s=sw; sw=null; t.style.opacity="";
      if(s.dy>40){ t.animate([{translate:"0 "+s.dy+"px",opacity:.6},{translate:"0 90px",opacity:0}],{duration:180,easing:"ease-in"}).onfinish=function(){ t.classList.remove("on","act"); t.style.translate=""; }; setTimeout(function(){ t.style.translate=""; },400); MI.buzz("light"); }
      else { t.animate([{translate:"0 "+s.dy+"px"},{translate:"0 0"}],{duration:220,easing:EASE}); t.style.translate=""; } };
    MI.on("pointerup",up,true); MI.on("pointercancel",up,true); }
})();
