/* ?debug=1 shows errors and taps at the bottom of the screen, for browsers we cannot test */(function(){ if(!/[?&]debug=1/.test(location.search)) return; var L=[];
function show(){ var d=document.getElementById("miDbg"); if(!d){ if(!document.body) return; d=document.createElement("pre"); d.id="miDbg"; d.style.cssText="position:fixed;left:0;right:0;bottom:0;max-height:45vh;overflow:auto;margin:0;padding:6px;font:11px/1.3 monospace;background:rgba(0,0,0,.85);color:#7fff9f;z-index:2147483647;pointer-events:none;white-space:pre-wrap"; document.body.appendChild(d); } d.textContent=L.slice(-25).join("\n"); }
function log(s){ L.push(s); show(); } function nm(x){ if(!x||!x.tagName) return String(x); var c=x.getAttribute&&x.getAttribute("class"); return x.tagName.toLowerCase()+(x.id?"#"+x.id:"")+(c?"."+c.split(" ").slice(0,2).join("."):""); }
log("UA "+navigator.userAgent);
addEventListener("error",function(e){ log("ERR "+(e.message||nm(e.target))+" @"+String(e.filename||"").split("/").pop()+":"+(e.lineno||"")+":"+(e.colno||"")); },true);
addEventListener("unhandledrejection",function(e){ log("REJ "+(e.reason&&e.reason.message||e.reason)); });
["pointerdown","pointerup","pointercancel","click"].forEach(function(t){ addEventListener(t,function(e){ log(t+" "+nm(e.target)+(e.pointerType?" "+e.pointerType:"")); },true); });
addEventListener("click",function(e){ if(e.defaultPrevented) log("  click was cancelled"); },false);
var lt=0; try{ new PerformanceObserver(function(l){ l.getEntries().forEach(function(e){ lt+=e.duration; log("  busy "+Math.round(e.duration)+"ms"); }); }).observe({type:"longtask"}); }catch(e){}
var fr=0, worst=0, last=0, t0=0; (function f(t){ if(last){ fr++; worst=Math.max(worst,t-last); } last=t; if(!t0) t0=t; if(t-t0>=1000){ if(fr<52||worst>40) log("fps "+fr+" worst "+Math.round(worst)+"ms"); fr=0; worst=0; t0=t; } requestAnimationFrame(f); })(0);
addEventListener("load",function(){ var top=document.elementFromPoint(innerWidth/2,innerHeight/2); log("loaded homeV="+!!document.getElementById("homeV")+" vt="+!!document.startViewTransition+" fine="+matchMedia("(hover: hover) and (pointer: fine)").matches+" centre="+nm(top)); });
})();