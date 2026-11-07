/* Fase 1.3: error summaries from the field. Sent only on https (or when cs-err-test=1 is set, for the local tests) and never when cs-err-off=1 is set.
   A report holds: app version, kind (error, promise, csp, crash), the message cut to 160 characters, and file:line. No URL, no character data, no name, no email.
   The server (functions/api, POST /api/err) removes anything that looks like an email or a long number and counts the same report once per day and version.
   At most 10 reports per page load here and 50 per day per device on the server (the device id is a random text kept in cs-err-dev). */
(function(){
  let SENT=0, SEEN={}, LS=null; try{ LS=BootEnv.localStorage; }catch(e){}
  function get(k){ try{ return (BootEnv.__store||LS).getItem(k); }catch(e){ return null; } }
  function on(){ if(get("cs-err-off")==="1") return false; if(location.protocol==="https:") return true; return get("cs-err-test")==="1"; }
  function dev(){ let d=get("cs-err-dev"); if(d&&/^[a-z0-9]{8,24}$/.test(d)) return d; d=""; try{ const a=new Uint8Array(10); crypto.getRandomValues(a); for(let i=0;i<a.length;i++) d+=(a[i]%36).toString(36); }catch(e){ d=Math.random().toString(36).slice(2,12); } try{ (BootEnv.__store||LS).setItem("cs-err-dev",d); }catch(e){} return d; }
  function send(kind,msg,src){ if(SENT>=10||!on()) return; msg=String(msg||"").slice(0,160); src=String(src||"").split("?")[0].split("#")[0].split("/").pop().slice(0,60); const key=kind+"|"+msg+"|"+src; if(SEEN[key]) return; SEEN[key]=1; SENT++;
    try{ const body=JSON.stringify({v:String(BootEnv.__appLabel||"?"),k:kind,m:msg,s:src,d:dev()}); fetch("/api/err",{method:"POST",body:body,headers:{"content-type":"text/plain"},keepalive:true,credentials:"omit"}).catch(() =>{}); }catch(e){} }
  BootEnv.__errReport=send;
  addEventListener("error",(e) =>{ if(e&&e.target&&!BootEnv.isWindow(e.target)) return; send("error",e.message,(e.filename||"")+":"+(e.lineno||"")); });
  addEventListener("unhandledrejection",(e) =>{ const r=e&&e.reason; send("promise",(r&&r.message)||r,(r&&r.stack&&String(r.stack).split("\n")[1])||""); });
  addEventListener("securitypolicyviolation",(e) =>{ send("csp",(e.violatedDirective||"")+" "+(e.blockedURI||"").split("?")[0].slice(0,60),(e.sourceFile||"")+":"+(e.lineNumber||"")); });
  try{ if(BootEnv.ReportingObserver) new ReportingObserver(((l) =>{ l.forEach((r) =>{ if(r.type==="crash"||r.type==="intervention") send("crash",r.type+" "+((r.body&&(r.body.reason||r.body.message))||""),""); }); }),{types:["crash","intervention"],buffered:true}).observe(); }catch(e){}
})();
