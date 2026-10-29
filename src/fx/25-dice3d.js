/* T11 D1 and D2: 3D dice with physics. dice-box 1.1.4 rebuilt on BabylonJS 9.32.1 and Havok 1.3.14 (src/dice, built into vendor/dice).
   Nothing loads with the app: the bundle comes with the first roll, or earlier when the app is idle on a fast connection without
   data saving. The service worker keeps the files, so after one roll the dice also work offline. window.__dice3d.roll([20,20]) rolls
   the dice on screen and gives their values in the same order. If WebGL is missing or loading fails, it answers null and the
   caller uses crypto random numbers as before. Motion off and Calm never call it (16-z-pack). */
(function(){
  var D=document, BASE=new URL("vendor/dice/",location.href), box=null, loading=null, tray=null, hideT=0, queue=Promise.resolve();
  function webgl(){ try{ var c=D.createElement("canvas"); return !!(c.getContext("webgl2")||c.getContext("webgl")); }catch(e){ return false; } }
  /* dice colour: garnet resin, the same in every skin (the skin accent was a grey green that hid the numbers). A skin can set --dice */
  function acc(){ var v=getComputedStyle(D.documentElement).getPropertyValue("--dice").trim(); return /^#[0-9a-f]{6}$/i.test(v)?v:"#a3182b"; }
  function weak(){ return (navigator.hardwareConcurrency||8)<=4||(navigator.deviceMemory||8)<=2; }
  function trayEl(){ if(tray) return tray; tray=D.createElement("div"); tray.id="diceTray"; tray.setAttribute("aria-hidden","true"); D.body.appendChild(tray); return tray; }
  function load(){ if(loading) return loading; if(!webgl()) return Promise.resolve(null);
    trayEl();
    loading=import(BASE.href+"dice-box.js").then(function(m){ var DB=m.default;
      box=new DB({container:"#diceTray",assetPath:BASE.pathname,origin:location.origin,theme:"default",themeColor:acc(),scale:innerWidth<600?5:6,dpr:Math.min(window.devicePixelRatio||1,weak()?1.5:2),enableShadows:!weak(),settleTimeout:4000,offscreen:true,delay:10});
      return box.init().then(function(){ return box; }); });
    loading.catch(function(){ loading=null; box=null; }); return loading; }
  function values(res,list){ var by={}; (res||[]).forEach(function(g){ var r=g.rolls; if(r===undefined){ r=[g]; } r=Array.isArray(r)?r:Object.keys(r||{}).map(function(k){ return r[k]; }); /* roll() gives one entry per die, getRollResults() gives groups */ (by[g.sides]=by[g.sides]||[]).push.apply(by[g.sides],r.map(function(x){ return x.value; })); });
    var out=[]; for(var i=0;i<list.length;i++){ var q=by[list[i]]; if(!q||!q.length) return null; out.push(q.shift()); } return out; }
  function run(list){ return load().then(function(b){ if(!b) return null; clearTimeout(hideT); b.clear(); tray.classList.add("on");
      var cnt={}, order=[]; list.forEach(function(f){ if(!cnt[f]){ cnt[f]=0; order.push(f); } cnt[f]++; });
      try{ b.updateConfig({themeColor:acc()}); }catch(e){}
      return b.roll(order.map(function(f){ return cnt[f]+"d"+f; })).then(function(res){ hideT=setTimeout(function(){ tray.classList.remove("on"); setTimeout(function(){ if(!tray.classList.contains("on")) b.clear(); },300); },1800); return values(res,list); }); })
      .catch(function(){ if(tray) tray.classList.remove("on"); return null; }); }
  window.__dice3d={ roll:function(list){ var p=queue.then(function(){ return run(list); }); queue=p.catch(function(){}); return p; }, preload:load, state:function(){ return {loaded:!!box,loading:!!loading}; } };
  /* idle preload: only on a fast connection that does not save data, a few seconds after the app is on screen */
  var con=navigator.connection||{}; if(!con.saveData&&(!con.effectiveType||con.effectiveType==="4g")) (window.requestIdleCallback||setTimeout)(function(){ setTimeout(function(){ if(!(window.__MI&&window.__MI.rm&&window.__MI.rm())) load().catch(function(){}); },6000); });
})();
