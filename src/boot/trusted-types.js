/* T11 A1: Trusted Types. The page has a Content-Security-Policy (made by build.py) that asks the browser to accept HTML, scripts and
   script URLs only through these policies. All app HTML is built with esc() already, so the default policy passes it on. If a piece of
   HTML ever carries a script tag, an inline event handler or a javascript: link (data from a friend, an import), those parts are removed
   and the event is kept in window.__ttLog (shown in Report a Problem). The deferred builder parts use the cs-loader policy. */
(function(){ if(!window.trustedTypes||!trustedTypes.createPolicy) return;
  const BAD=/<\s*\/?\s*(script|iframe|object|embed|base|meta)\b|\son[a-z]+\s*=|javascript\s*:/i;
  const log=function(k,s){ try{ const L=window.__ttLog=window.__ttLog||[]; L.push({k:k,s:String(s).slice(0,160),t:Date.now()}); if(L.length>20) L.shift(); }catch(e){} };
  const strip=function(s){ return s.replace(/<\s*(script|iframe|object|embed)\b[\s\S]*?<\s*\/\s*\1\s*>/gi,"").replace(/<\s*\/?\s*(script|iframe|object|embed|base|meta)\b[^>]*>/gi,"").replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,"").replace(/javascript\s*:/gi,"blocked:"); };
  const here=location.origin;
  try{ trustedTypes.createPolicy("default",{
    createHTML:function(s){ s=String(s); if(!BAD.test(s)) return s; log("html",s); return strip(s); },
    createScript:function(s){ log("script",s); return null; },
    createScriptURL:function(u){ let x; try{ x=new URL(String(u),location.href); }catch(e){ return null; } if(x.origin===here||x.protocol==="blob:") return x.href; log("url",u); return null; }
  }); }catch(e){}
  try{ window.__ttLoader=trustedTypes.createPolicy("cs-loader",{createScript:function(s){ return s; }}); }catch(e){}
})();
