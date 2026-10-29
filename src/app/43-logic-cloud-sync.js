/* T8 stage 3: cloud backup and sync of characters (Cloudflare Pages Functions /api + D1).
   Off unless /api answers (local files, tests and other hosts keep working as before). Data stays on the device first, the server holds a copy.
   No popups for routine events: one small cloud button shows the state, its text appears when tapped.
   Unit of sync = one roster entry (name, sub, B, C, S and the rest), the open character taken live. Hash of that text decides what changed.
   Conflict (both sides changed): this device wins, the server keeps the other copy as a version ("other-device"). Nothing is lost.
   Deleted here: the server moves it to a 30-day recycle bin. Deleted elsewhere and unchanged here: removed here too (not the open one).
   Stage 4: an uploaded portrait travels on its own (PUT pic/:id). The character text carries "cloud:<hash>" in its place, so a small edit does not send the picture again.
   Settings in PF_KEYS follow the person to every device, newest wins. */
var SYKEY="cs-sync-v1", SY={on:false, st:"off", busy:false, mode:"normal", last:0, pull:0, push:0, first:true, me:null, err:""};
function syLog(m){ var a=SY.log; if(!a){ try{ a=JSON.parse(sessionStorage.getItem("cs-sync-log")||"[]"); }catch(e){ a=[]; } SY.log=a; } a.push(new Date().toISOString().slice(14,23)+" "+m); if(a.length>40) a.shift(); try{ sessionStorage.setItem("cs-sync-log",JSON.stringify(a)); }catch(e){} }
function syGet(){ try{ var o=JSON.parse(__store.getItem(SYKEY)||"null"); return o&&typeof o==="object"&&o.c?o:{c:{}}; }catch(e){ return {c:{}}; } }
function sySet(o){ try{ __store.setItem(SYKEY,JSON.stringify(o)); }catch(e){} }
function syText(e){ var k=Object.keys(e).filter(function(x){ return x!=="t"; }).sort(), o={}; k.forEach(function(x){ o[x]=e[x]; }); return JSON.stringify(o); }
/* every real character on this device as {id:{text,h,name,sub}}. The open one is read live, without saving */
function syLocal(){ var r=rGet(), out={}; if(!r||!r.chars) return out;
  Object.keys(r.chars).forEach(function(id){ var e=r.chars[id]; if(!e||e.ph) return; e=Object.assign({},e);
    /* the open character is read from its stored slots, not from memory: right after a switch the memory still holds the previous one */
    if(id===r.active&&!FROZEN){ try{ var c2=lsGet(CKEY), s2=lsGet(KEY), cc=JSON.parse(c2||"null"); if(cc){ e.name=cc.name||e.name; e.sub=(cc.species||"")+" "+(cc.clsLabel||((cc.cls||"")+" "+(cc.level||1))); } e.B=lsGet(BKEY); e.C=c2; e.S=s2; }catch(x){} }
    var pic="", ph="", sum={};
    try{ var so=JSON.parse(e.S||"null"); if(so&&typeof so.portrait==="string"){ if(/^data:image\//.test(so.portrait)){ pic=so.portrait; ph=hashS(pic); so.portrait="cloud:"+ph; e.S=JSON.stringify(so); sum.ph=ph; } else if(so.portrait) sum.por=so.portrait.slice(0,120); } }catch(x){}
    try{ var c3=JSON.parse(e.C||"null")||{}; sum.lv=+c3.level||1; sum.cls=String(c3.clsLabel||((c3.cls||"")+" "+(c3.level||1))).slice(0,80); sum.sp=String(c3.species||"").split(" (")[0].slice(0,40); }catch(x){}
    var t=syText(e); out[id]={text:t,h:hashS(t),name:e.name||"",sub:e.sub||"",pic:pic,ph:ph,sum:JSON.stringify(sum)}; });
  return out; }
function syApi(path,opt){ opt=opt||{}; opt.credentials="same-origin"; opt.cache="no-store"; opt.redirect="manual";
  return fetch("/api/"+path,opt).then(function(res){ if(res.type==="opaqueredirect"||res.status===0) throw {signin:1};
    var ct=res.headers.get("content-type")||""; if(ct.indexOf("application/json")<0) throw {noapi:1};
    return res.json().then(function(j){ if(!res.ok){ j=j||{}; j._st=res.status; throw j; } return j; }); }); }
function syState(st){ if(SY.st===st) return; SY.st=st; syIcon(); }
function syPut(id,L,base,force){ syLog("put "+id+" base "+base+(force?" force":"")); return syApi("chars/"+encodeURIComponent(id)+"?base="+(base||0)+"&t="+Date.now()+(force?"&force=1":""),
  {method:"PUT",headers:{"content-type":"text/plain;charset=UTF-8","x-name":encodeURIComponent(L.name.slice(0,80)),"x-sub":encodeURIComponent(L.sub.slice(0,120)),"x-sum":encodeURIComponent(L.sum||"")},body:L.text}); }
/* a portrait is sent after its character, only when it changed */
function syPic(id,L,sy){ sy.p=sy.p||{}; if(!L.ph||sy.p[id]===L.ph||L.pic.length>600000) return Promise.resolve();
  return syApi("pic/"+encodeURIComponent(id)+"?h="+L.ph,{method:"PUT",headers:{"content-type":"text/plain;charset=UTF-8"},body:L.pic}).then(function(){ sy.p[id]=L.ph; }); }
/* puts the picture back in place of "cloud:<hash>". Without an answer the reference stays, so nothing is sent back without it */
function syPicIn(owner,id,text){ var m=/"portrait\\?":\\?"cloud:([a-z0-9]+)/.exec(text); if(!m) return Promise.resolve(text);
  return syApi("pic/"+owner+"/"+encodeURIComponent(id)).then(function(p){ try{ var e=JSON.parse(text), so=JSON.parse(e.S); if(so.portrait==="cloud:"+p.h||/^cloud:/.test(so.portrait)){ so.portrait=p.data; e.S=JSON.stringify(so); } return JSON.stringify(e); }catch(x){ return text; } },function(){ return text; }); }
/* writes a server copy into the roster. Returns "reload" when the open character changed */
function syTake(id,text,r){ var e; try{ e=JSON.parse(text); }catch(x){ return ""; } if(!e||typeof e!=="object") return ""; e.t=Date.now();
  if(e.B!=null) e.B=fixCid(e.B,id); r.chars[id]=e; return id===r.active?"reload":"ok"; }
function syRun(why){
  if(SY.on&&SY.busy&&why!=="tick"){ SY.again=why; return; }
  if(!SY.on||SY.busy||FROZEN) return; if(!navigator.onLine){ syState("offline"); return; }
  SY.busy=true; var sy=syGet(), L=syLocal(), now=Date.now(); syLog("run "+why);
  /* a copy taken from the cloud is stored again by the app as it loads (version stamps, derived values). That first local form counts as the synced one */
  Object.keys(sy.c).forEach(function(id){ var k=sy.c[id]; if(k.fresh&&L[id]&&SY.first){ k.h=L[id].h; delete k.fresh; } }); sySet(sy);
  var dirty=Object.keys(L).some(function(id){ return !sy.c[id]||sy.c[id].h!==L[id].h; })||Object.keys(sy.c).some(function(id){ return !L[id]; });
  var gap=SY.mode==="save"?60000:10000, needPull=why==="start"||why==="show"||now-SY.pull>300000;
  if(SY.mode==="pause"||(!needPull&&(!dirty||now-SY.push<gap))){ SY.busy=false; if(!dirty&&SY.st!=="wait") syState("ok"); return; }
  syState("busy");
  syApi("chars").then(function(list){ SY.pull=Date.now(); SY.mode=list.mode||"normal"; var srv={}; (list.chars||[]).forEach(function(c){ srv[c.id]=c; });
    var r=rGet()||{active:null,chars:{}}; r.chars=r.chars||{}; var hadNone=!Object.keys(L).length, jobs=[], changedR=false, reload=false;
    Object.keys(srv).forEach(function(id){ var s=srv[id], k=sy.c[id], l=L[id];
      if(s.deleted){ if(k&&s.rev>k.rev&&l&&l.h===k.h&&id!==r.active){ delete r.chars[id]; changedR=true; delete sy.c[id]; } else if(k&&!l) delete sy.c[id]; return; }
      if(k&&s.rev===k.rev) return; syLog("newer "+id+" "+(k&&k.rev)+">"+s.rev+" local "+(l?(k&&l.h===k.h?"same":"changed"):"none"));
      if(l&&k&&l.h!==k.h) return; /* both changed: handled by the push below with force */
      if(id===r.active&&l&&!(SY.first||document.hidden||why==="show")) return; /* the open character is replaced only when the app starts or comes back to the screen */
      jobs.push(syApi("chars/"+encodeURIComponent(id)).then(function(full){ var h=hashS(full.data);
        if(l&&l.h===h){ sy.c[id]={rev:full.rev,h:h}; return; }
        if(l&&!k){ sy.c[id]={rev:full.rev,h:"remote:"+h}; return; } /* same id, different content, never synced here: push wins below with force */
        return syPicIn(SY.me.id,id,full.data).then(function(text){ var ph=/"portrait\\?":\\?"cloud:([a-z0-9]+)/.exec(full.data);
          var res=syTake(id,text,r); if(!res) return; changedR=true; if(res==="reload") reload=true; sy.c[id]={rev:full.rev,h:h,fresh:1}; if(ph&&text!==full.data){ sy.p=sy.p||{}; sy.p[id]=ph[1]; } }); }));
    });
    return Promise.all(jobs).then(function(){
      if(changedR){ window.__publicFresh=0; /* the builder must not blank the sheet of a character that just came from the cloud */ if(!r.active||!r.chars[r.active]||r.chars[r.active].ph){ var ids=Object.keys(r.chars).filter(function(x){ return !r.chars[x].ph; }); r.active=ids[0]||r.active; reload=!!ids.length; }
        if(!rSave(r)) throw {local:1}; }
      sySet(sy);
      /* the open character changes: stop here. The live sheet in memory is the old one, so nothing may be sent until the page has reloaded */
      if(reload&&r.active){ SY.on=false; SY.busy=false; rLoad(rGet(),r.active,false); return "stop"; }
      if(changedR&&typeof homeCards==="function"){ var g=document.getElementById("hgrid"); if(g) g.innerHTML=homeCards(true); }
      /* push: changed here, new here, deleted here */
      var L2=syLocal(), pushes=[];
      Object.keys(L2).forEach(function(id){ var k=sy.c[id], s=srv[id], l=L2[id]; if(k&&k.h===l.h&&s&&!s.deleted) return;
        var force=!!(s&&(!k||s.rev!==k.rev||/^remote:/.test(k.h))); pushes.push(function(){ return syPut(id,l,k?k.rev:(s?s.rev:0),force).then(function(o){ sy.c[id]={rev:o.rev,h:l.h}; return syPic(id,l,sy); }); }); });
      Object.keys(L2).forEach(function(id){ var k=sy.c[id], l=L2[id]; if(k&&k.h===l.h&&l.ph&&(sy.p||{})[id]!==l.ph) pushes.push(function(){ return syPic(id,l,sy); }); });
      Object.keys(sy.c).forEach(function(id){ if(L2[id]) return; var s=srv[id]; if(!s||s.deleted){ delete sy.c[id]; return; }
        pushes.push(function(){ return syApi("chars/"+encodeURIComponent(id),{method:"DELETE"}).then(function(){ delete sy.c[id]; }); }); });
      SY.push=Date.now();
      return pushes.reduce(function(p,f){ return p.then(f); },Promise.resolve()).then(function(){ sySet(sy); });
    });
  }).then(function(x){ if(x==="stop") return "stop"; return needPull?pfRun():null; }).then(function(x){ if(x==="stop") return; SY.first=false; SY.busy=false; SY.err=""; SY.last=Date.now(); var q=syGet(); q.ok=SY.last; sySet(q); syState(SY.mode==="pause"?"wait":"ok"); syBanners(); syAgain(); },
  function(e){ SY.busy=false; SY.first=false; e=e||{}; syLog("error "+JSON.stringify(e).slice(0,120));
    if(e.noapi||e._st===404){ SY.on=false; syState("off"); return; }
    if(e._st===409){ SY.pull=0; SY.again=SY.again||"show"; syAgain(); return; } /* the cloud moved on between reading and writing: read again */
    if(e.error==="quota"){ SY.mode="pause"; syState("wait"); return; }
    if(e.error==="full"||e.error==="too-many"||e.error==="too-big"){ SY.err=e.error; syState("full"); return; }
    if(e.signin){ syState("signin"); return; }
    syState("offline"); syBanners(); syAgain(); });
}
/* settings that follow the person: only these keys, newest wins */
var PF_KEYS=["mi-fx","mi-bz","mi-snd","mi-clsart","cs-ui-remind","cs-learn-v1"];/* T11: Learn progress and language */
function pfLocal(){ var o={}; PF_KEYS.forEach(function(k){ var v=lsGet(k); if(v!=null) o[k]=v; }); return JSON.stringify(o); }
function pfRun(){ var sy=syGet(), pf=sy.pf||{}, t=pfLocal(), h=hashS(t), here=h!==pf.h;
  var me=SY.me||{}; if(!(me.prefsT>(pf.t||0))||(here&&pf.h)){ if(!here) return null; var at=Date.now(); return syApi("prefs?t="+at,{method:"PUT",headers:{"content-type":"text/plain;charset=UTF-8"},body:t}).then(function(){ var q=syGet(); q.pf={h:h,t:at}; sySet(q); me.prefsT=at; }); }
  return syApi("prefs").then(function(j){ var o={}; try{ o=JSON.parse(j.data||"{}")||{}; }catch(x){} PF_KEYS.forEach(function(k){ if(o[k]!=null&&lsGet(k)!==o[k]) try{ __store.setItem(k,String(o[k])); }catch(x){} });
    var q=syGet(); q.pf={h:hashS(pfLocal()),t:j.t||0}; sySet(q); }); }
/* banners only for a real risk of loss, each at most once a day, closable */
function syBanners(){ var sy=syGet(), day=new Date().toISOString().slice(0,10), L=syLocal(), dirty=Object.keys(L).some(function(id){ return !sy.c[id]||sy.c[id].h!==L[id].h; });
  if(dirty&&sy.ok&&Date.now()-sy.ok>3*864e5&&sy.banOld!==day) syBan("old","Changes on this device have not been backed up for more than 3 days. Go online with the app open to back them up.");
  var me=SY.me||{}, lim=(me.limits||{}).bytes||0; if(lim&&me.bytes>=lim*.9&&sy.banFull!==day) syBan("full","Your cloud space is "+Math.round(me.bytes/lim*100)+"% full. Delete characters you no longer need, or new changes will stay only on this device."); }
function syBan(k,msg){ if(document.getElementById("syBan")) return; var b=document.createElement("div"); b.id="syBan"; b.className="sy-ban"; b.setAttribute("role","status");
  b.innerHTML='<span>'+esc(msg)+'</span><button type="button" aria-label="Close">\u00d7</button>'; document.body.appendChild(b);
  b.querySelector("button").onclick=function(){ b.remove(); var q=syGet(); q[k==="old"?"banOld":"banFull"]=new Date().toISOString().slice(0,10); sySet(q); }; }
function syAgain(){ var w=SY.again; if(w){ SY.again=""; setTimeout(function(){ syRun(w); },0); } }
var SY_ICO={ok:'<path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 9.1 4.5 4.5 0 0 0 7 18z"/><path d="m9.5 13.5 2 2 3.5-3.5"/>',
  busy:'<path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 9.1 4.5 4.5 0 0 0 7 18z"/><path d="M12 11v4m0-4-1.6 1.6M12 11l1.6 1.6"/>',
  offline:'<path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 9.1 4.5 4.5 0 0 0 7 18z"/><path d="M4 4l16 16"/>',
  wait:'<path d="M7 18h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.2 9.1 4.5 4.5 0 0 0 7 18z"/><path d="M12 11.5V14l1.5 1"/>'};
SY_ICO.signin=SY_ICO.offline; SY_ICO.full=SY_ICO.wait;
function syMsg(){ return {ok:SY.last?"Saved and backed up.":"Saved on this device.",busy:"Backing up…",offline:"Saved on this device. Backup resumes when online.",
  signin:"Saved on this device. Open the app again to sign in, then backup resumes.",wait:"Saved on this device. Backup resumes at 07:00.",
  full:"Saved on this device. Your cloud space is full, so new changes are not backed up. Delete characters you no longer need."}[SY.st]||""; }
function syBtn(){ var b=document.createElement("button"); b.type="button"; b.className="bb ic press sy-b"; b.setAttribute("data-sync","1"); return b; }
function syIcon(){ var on=SY.on&&SY.st!=="off";
  [["#moreBtn",0],[".hhead h1",1]].forEach(function(p){ var a=document.querySelector(p[0]); if(!a) return; var host=a.parentNode, b=host.querySelector(":scope > .sy-b");
    if(!on){ if(b) b.remove(); return; } if(!b){ b=syBtn(); if(p[1]) a.insertAdjacentElement("afterend",b); else host.insertBefore(b,a); }
    if(b.getAttribute("data-st")===SY.st&&b.firstChild) return; b.setAttribute("data-st",SY.st); b.setAttribute("aria-label","Cloud backup: "+syMsg());
    b.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(SY_ICO[SY.st]||SY_ICO.ok)+'</svg>'; }); }
/* cloud dialog: state, characters in the cloud, recycle bin, versions. Restoring always makes a new character, nothing is overwritten */
function syOpen(){ var old=document.getElementById("bkp"); if(old) old.remove(); var w=document.createElement("div"); w.id="bkp"; w.className="bkp sy-dlg"; w.setAttribute("role","dialog"); w.setAttribute("aria-modal","true"); w.setAttribute("aria-labelledby","bkpT");
  w.innerHTML='<div class="bkpb"><div class="bkph"><b id="bkpT">Cloud backup</b><button type="button" class="bkpx" data-syx="1" aria-label="Close">×</button></div><p class="sy-st">'+esc(syMsg())+'</p><div class="sy-list"><p class="sy-note">Loading…</p></div></div>';
  document.body.appendChild(w); var box=w.querySelector(".sy-list");
  function when(t){ try{ return new Date(t).toLocaleString(undefined,{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}); }catch(e){ return ""; } }
  function list(){ syApi("chars").then(function(j){ var a=(j.chars||[]).filter(function(c){ return !c.deleted; }), d=(j.chars||[]).filter(function(c){ return c.deleted; });
      box.innerHTML=(a.length?'<b class="sy-h">In the cloud</b>'+a.map(function(c){ return '<div class="sy-row"><span><b>'+esc(c.name||"Unnamed")+'</b><small>'+esc(c.sub||"")+' · '+esc(when(c.t))+'</small></span><button type="button" class="btn press" data-syv="'+esc(c.id)+'">Versions</button></div>'; }).join(""):'<p class="sy-note">No characters in the cloud yet.</p>')+
        (d.length?'<b class="sy-h">Recently deleted (kept 30 days)</b>'+d.map(function(c){ return '<div class="sy-row"><span><b>'+esc(c.name||"Unnamed")+'</b><small>Deleted '+esc(when(c.deleted))+'</small></span><button type="button" class="btn press" data-syr="'+esc(c.id)+'">Restore</button></div>'; }).join(""):""); },
    function(){ box.innerHTML='<p class="sy-note">The cloud cannot be reached now. Everything is still saved on this device.</p>'; }); }
  function vers(id){ box.innerHTML='<p class="sy-note">Loading…</p>'; syApi("chars/"+encodeURIComponent(id)+"/versions").then(function(j){ var v=j.versions||[];
      box.innerHTML='<button type="button" class="btn press" data-syb="1">← All characters</button>'+(v.length?'<b class="sy-h">Earlier versions</b>'+v.map(function(x){ return '<div class="sy-row"><span><b>'+esc(x.name||"Unnamed")+'</b><small>'+esc(when(x.t))+(x.why==="other-device"?" · from another device":"")+'</small></span><button type="button" class="btn press" data-syc="'+esc(id)+'" data-rev="'+x.rev+'">Restore as copy</button></div>'; }).join(""):'<p class="sy-note">No earlier versions yet. A version is kept at most once an hour while you edit.</p>'); },
    function(){ box.innerHTML='<p class="sy-note">The cloud cannot be reached now.</p>'; }); }
  function copy(text,label){ var e; try{ e=JSON.parse(text); }catch(x){ toast("This copy could not be read."); return; } var r=rSnap(rEnsure()), nid=newId(r);
    e.B=fixCid(e.B==null?null:e.B,nid); e.name=(e.name||"Character")+(label?" ("+label+")":""); try{ var cc=JSON.parse(e.C); cc.name=e.name; e.C=JSON.stringify(cc); }catch(x){}
    e.created=Date.now(); e.t=Date.now(); delete e.ph; r.chars[nid]=e; if(!rSave(r)) return; w.remove(); toast("Restored as a new character: "+e.name+"."); var g=document.getElementById("hgrid"); if(g&&typeof homeCards==="function") g.innerHTML=homeCards(true); }
  w.addEventListener("click",function(e){ var t=e.target;
    if(t===w||t.closest("[data-syx]")){ w.remove(); return; }
    var b=t.closest("[data-syv],[data-syr],[data-syc],[data-syb]"); if(!b) return;
    if(b.hasAttribute("data-syb")){ list(); return; }
    if(b.hasAttribute("data-syv")){ vers(b.getAttribute("data-syv")); return; }
    if(b.hasAttribute("data-syr")){ syApi("chars/"+encodeURIComponent(b.getAttribute("data-syr"))).then(function(c){ return syPicIn(SY.me.id,c.id,c.data).then(function(t){ copy(t,""); }); },function(){ toast("The cloud cannot be reached now."); }); return; }
    if(b.hasAttribute("data-syc")){ var cid=b.getAttribute("data-syc"); syApi("chars/"+encodeURIComponent(cid)+"/versions/"+b.getAttribute("data-rev")).then(function(v){ return syPicIn(SY.me.id,cid,v.data).then(function(t){ copy(t,"restored"); }); },function(){ toast("The cloud cannot be reached now."); }); } });
  list(); }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-sync]"); if(!b) return; e.preventDefault(); toast(syMsg()); syOpen(); });
/* pushes changed small characters while the page closes (keepalive allows about 64 KB) */
function syFlush(){ if(Date.now()-(SY.fl||0)<1500) return; SY.fl=Date.now(); syLog("flush"); if(!SY.on||SY.mode==="pause"||!navigator.onLine||FROZEN) return; var sy=syGet(), L=syLocal();
  Object.keys(L).forEach(function(id){ var k=sy.c[id], l=L[id]; if(!k||k.h===l.h||l.text.length>60000) return;
    try{ fetch("/api/chars/"+encodeURIComponent(id)+"?base="+k.rev+"&t="+Date.now(),{method:"PUT",keepalive:true,credentials:"same-origin",headers:{"content-type":"text/plain;charset=UTF-8","x-name":encodeURIComponent(l.name.slice(0,80)),"x-sub":encodeURIComponent(l.sub.slice(0,120)),"x-sum":encodeURIComponent(l.sum||"")},body:l.text}); }catch(x){} }); }
function syStart(){ if(SY.on||!/^https?:$/.test(location.protocol)||window.__noSync) return;
  syApi("me").then(function(me){ var sy=syGet(); if(sy.u&&sy.u!==me.id){ SY.on=false; return; } if(!sy.u){ sy.u=me.id; sySet(sy); }
      SY.me=me; SY.mode=me.mode||"normal"; SY.on=true; syState("busy"); syRun("start");
      setInterval(function(){ syRun("tick"); },10000);
      document.addEventListener("visibilitychange",function(){ if(document.hidden){ syFlush(); return; } syRun("show"); });
      window.addEventListener("online",function(){ syRun("show"); }); window.addEventListener("offline",function(){ syState("offline"); });
      window.addEventListener("pagehide",syFlush);
      if(window.MutationObserver){ var watch=function(){ var hv=document.getElementById("homeV"); if(hv&&!hv.__syo){ hv.__syo=1; new MutationObserver(syIcon).observe(hv,{childList:true,subtree:true}); } syIcon(); };
        new MutationObserver(watch).observe(document.body,{childList:true}); watch(); } },
    function(){ SY.on=false; });
}
window.__sync=SY; window.__syncRun=syRun; window.__syncBanners=syBanners; window.__syncLocal=function(){ var L=syLocal(), o={}; Object.keys(L).forEach(function(k){ o[k]=L[k].h; }); return o; };
/* starts after the builder has loaded: it may store the open character once more while it starts, and that must not look like an edit */
(function(){ var go=function(){ setTimeout(syStart,800); }; if(window.__deferDone) go(); else { document.addEventListener("bldready",go,{once:true}); setTimeout(function(){ if(!SY.on) syStart(); },20000); } })();
