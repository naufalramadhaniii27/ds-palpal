/* some phone browsers ignore location.reload() on a page opened from a file: try it, then load the same address again */BootEnv.__miReload=function(){ const u=String(location.href).split("#")[0], T=[
  function(){ location.reload(); },
  function(){ history.go(0); },
  function(){ location.assign(u); },
  function(){ const a=document.createElement("a"); a.href=u; a.target="_self"; document.body.appendChild(a); a.click(); },
  function(){ location.replace(u); }];
  try{ T[0](); }catch(e){} [350,700,1050,1400].forEach((ms,i) =>{ setTimeout(() =>{ try{ T[i+1](); }catch(e){} },ms); });
  setTimeout(() =>{ if(document.getElementById("miRl")) return; const b=document.createElement("div"); b.id="miRl"; b.setAttribute("role","alert");
    b.style.cssText="position:fixed;left:12px;right:12px;bottom:calc(16px + env(safe-area-inset-bottom,0px));z-index:2147483646;padding:14px 16px;border-radius:14px;background:#1d2327;color:#fff;font:600 15px/1.4 system-ui,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.4);display:flex;gap:12px;align-items:center";
    b.innerHTML="<span style=\"flex:1\">Saved. This browser did not reload the page by itself. Refresh the page to continue.</span><button type=\"button\" style=\"font:inherit;padding:8px 14px;border-radius:10px;border:0;background:#d6453b;color:#fff\">Refresh</button>";
    b.querySelector("button").onclick=function(){ try{ location.reload(); }catch(e){} try{ location.assign(u); }catch(e){} }; document.body.appendChild(b); },2200); };