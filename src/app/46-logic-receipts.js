/* T11 G3 N3 Number receipts. The derivation already keeps where each number comes from (B, the breakdowns). Here every main number is
   kept as a receipt (label, total, parts). Two receipts compare into "what changed and why": after an app update (N3), before Apply
   in the builder (N16) and before a restore (N13). Kept per character under cs-rcpt-v1 (new key, small, never synced) */
var RCPT_KEYS=/^(ac|hp|init|speed|pb|spdc|spatk|dc|pas-per|save-|sk-|ab-|ah-|ad-)/;
function rcptNow(){ var o={}; Object.keys(B).forEach(function(k){ if(!RCPT_KEYS.test(k)) return; var b=B[k]; if(!b||!b.parts||b.total==null||b.total==="undefined") return;
    var l=/^ab-/.test(k)?ABN[k.slice(3)]+" score":String(b.t||k); o[k]={l:l,v:String(b.total),p:b.parts.map(function(p){ return [String(p.l),String(p.v)]; })}; });
  return o; }
/* the receipt of another build (a C from the builder or a backup), worked out with the same derivation and then put back */
function rcptFor(c){ var C0=C, D0=D, B0=B, out=null; try{ C=JSON.parse(JSON.stringify(c)); B={}; derive(); out=rcptNow(); }catch(e){ out=null; } C=C0; D=D0; B=B0; try{ derive(); }catch(e){} return out; }
function rcptDiff(a,b){ var out=[]; if(!a||!b) return out; Object.keys(b).forEach(function(k){ var x=a[k], y=b[k];
    if(!x){ if(/^(ah-|ad-)/.test(k)) out.push({k:k,l:y.l,from:"",to:y.v,why:["New"]}); return; }
    if(x.v===y.v) return; var why=[], am={}, bm={}; x.p.forEach(function(p){ am[p[0]]=p[1]; }); y.p.forEach(function(p){ bm[p[0]]=p[1]; });
    y.p.forEach(function(p){ if(!(p[0] in am)) why.push("Now: "+p[0]+" ("+p[1]+")"); else if(am[p[0]]!==p[1]) why.push(p[0]+": "+am[p[0]]+" → "+p[1]); });
    x.p.forEach(function(p){ if(!(p[0] in bm)) why.push("Gone: "+p[0]+" ("+p[1]+")"); });
    out.push({k:k,l:y.l,from:x.v,to:y.v,why:why}); });
  Object.keys(a).forEach(function(k){ if(!b[k]&&/^(ah-|ad-)/.test(k)) out.push({k:k,l:a[k].l,from:a[k].v,to:"",why:["Gone"]}); });
  return out; }
function rcptHTML(list,empty){ if(!list.length) return '<p class="rc-none">'+esc(empty||"No numbers change.")+'</p>';
  return '<ul class="rcpt">'+list.map(function(d){ return '<li><div class="rc-h"><b>'+esc(d.l)+'</b><span>'+(d.from?esc(d.from):"")+(d.from&&d.to?' → ':'')+(d.to?'<strong>'+esc(d.to)+'</strong>':'')+'</span></div>'+(d.why.length?'<small>'+d.why.map(esc).join("<br>")+'</small>':'')+'</li>'; }).join("")+'</ul>'; }
window.__rcptPreview=function(newC){ if(FROZEN||!newC) return ""; var a=rcptNow(), b=rcptFor(newC); return b?rcptHTML(rcptDiff(a,b),"Nothing changes on your sheet."):""; };
window.__rcptDiffFor=function(c){ var b=rcptFor(c); return b?rcptDiff(rcptNow(),b):[]; };
window.__rcptRestoreText=function(c){ var l=window.__rcptDiffFor(c); if(!l.length) return ""; return l.slice(0,6).map(function(d){ return d.l+": "+(d.from||"-")+" → "+(d.to||"-"); }).join("\n")+(l.length>6?"\n…and "+(l.length-6)+" more":""); };
/* N3 after an update: the numbers of this character are compared with the ones kept by the last app version */
var RCPT_LAST=null;
function rcptCheck(){ if(FROZEN||!C) return; var id=(rGet()||{}).active||"", st={}; try{ st=JSON.parse(lsGet("cs-rcpt-v1")||"{}")||{}; }catch(e){ st={}; }
  var now=rcptNow(), old=st[id]; st[id]={ver:APP_VER,r:now};
  Object.keys(st).forEach(function(k){ if(!(rGet()||{chars:{}}).chars[k]) delete st[k]; });
  try{ __store.setItem("cs-rcpt-v1",JSON.stringify(st)); }catch(e){}
  if(!old||old.ver===APP_VER) return; var d=rcptDiff(old.r,now); if(!d.length) return; RCPT_LAST={ver:old.ver,list:d};
  setTimeout(function(){ var t=$("#toast"); if(!t) return; t.innerHTML=ico("toast-ok","tico")+'<span>After the update, '+d.length+' number'+(d.length>1?"s":"")+' changed.</span><button type="button" class="tundo" data-rcpt="1">See why</button>'; t.classList.add("on","act"); if(window.__topLayer) window.__topLayer(t); clearTimeout(toastT); toastT=setTimeout(function(){ t.classList.remove("on","act"); },9000); },1500); }
function rcptShow(){ var l=RCPT_LAST?RCPT_LAST.list:[]; navStack=[]; openSheet("What changed",'<p class="bk-f">Numbers of this character that changed with the last app update, and the reason for each.</p>'+rcptHTML(l,"Nothing changed with the last update."),"rcpt"); }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-rcpt]"); if(!b) return; $("#toast").classList.remove("on","act"); rcptShow(); });
window.__rcptNow=rcptNow; window.__rcptShow=rcptShow; window.__rcptCheck=rcptCheck;
setTimeout(function(){ try{ rcptCheck(); }catch(e){} },2500);
