/* T11 Learn logic: progress, language, dice and the sheet spotlight (U41 Anchor Spotlight).
   Saved under cs-learn-v1 only ({v, lang, done:{stop:{t,skip}}, xp, quiz:{best,t}, last}). No other key is read or changed,
   and Learn never writes to a character. The key follows the person to other devices through the cloud settings (PF_KEYS in 43). */
var LRN_KEY="cs-learn-v1";
function lrnGet(){ var o={}; try{ o=JSON.parse(lsGet(LRN_KEY)||"{}")||{}; }catch(e){ o={}; } if(!o||typeof o!=="object") o={};
  if(!o.done||typeof o.done!=="object"||Array.isArray(o.done)) o.done={}; o.lang=o.lang==="id"?"id":"en"; o.xp=Math.max(0,+o.xp||0); return o; }
function lrnPut(o){ o.v=1; try{ lsSet(LRN_KEY,JSON.stringify(o)); }catch(e){} }
var LRN=lrnGet();
function lrnL(t){ return t?(t[LRN.lang]||t.en||""):""; }
/* a text with {name} slots filled */
function lrnF(t,o){ return lrnL(t).replace(/\{(\w+)\}/g,function(m,k){ return o&&o[k]!=null?o[k]:m; }); }
function lrnCore(){ return LEARN.places.filter(function(p){ return p.core; }); }
function lrnCoreDone(){ return lrnCore().filter(function(p){ return LRN.done[p.id]; }).length; }
/* XP never goes down. A stop done in full gives 100, "I know this" gives 25, a later full run tops it up to 100 */
function lrnFinish(id,skip){ var d=LRN.done[id], had=d?(d.skip?25:100):0, get=skip?25:100;
  if(!d||(d.skip&&!skip)) LRN.done[id]={t:Date.now(),skip:skip?1:0}; var add=Math.max(0,get-had); LRN.xp+=add; LRN.last=id; lrnPut(LRN); return add; }
function lrnQuizDone(n){ var q=LRN.quiz||{}; if(!(q.best>=n)) q.best=n; q.t=Date.now(); LRN.quiz=q; if(!q.xp){ q.xp=1; LRN.xp+=100; } lrnPut(LRN); }

/* U4 and U49 Crumbling Bridge: a new set of questions on each run, made from the "why" steps of every stop and the final check.
   One question from each of the five first stops is always in, three more come from the rest, answers in a new order each time */
function lrnShuffle(a){ for(var i=a.length-1;i>0;i--){ var j=lrnD(i+1)-1, t=a[i]; a[i]=a[j]; a[j]=t; } return a; }
function lrnExam(){ var core=[], rest=[];
  LEARN.places.forEach(function(p){ if(p.kind) return; var qs=p.steps.filter(function(s){ return s.t==="why"; }).map(function(s){ var ord=lrnShuffle(s.opts.map(function(o,k){ return k; })), ok=-1;
      var q={q:s.q,opts:ord.map(function(k,j){ if(s.opts[k].ok) ok=j; return s.opts[k].x; }),fb:s.opts.filter(function(o){ return o.ok; })[0].fb}; q.a=ok; return q; });
    if(!qs.length) return; lrnShuffle(qs); (p.core?core:rest).push(qs[0]); if(qs[1]) rest.push(qs[1]); });
  return lrnShuffle(core.concat(lrnShuffle(rest).slice(0,3))); }

/* dice: the 3D dice of the sheet (vendor/dice) when effects are on, numbers from crypto otherwise. Always answers, never throws */
function lrnD(n){ var a=new Uint32Array(1); try{ crypto.getRandomValues(a); }catch(e){ a[0]=Math.floor(Math.random()*4294967295); } return 1+a[0]%n; }
function lrnCalm(){ var M=window.__MI; return !M||(M.rm&&M.rm())||M.mode==="off"; }
function lrnRoll(list){ var flat=function(){ return list.map(lrnD); };
  if(window.__dice3d&&!lrnCalm()&&!window.__lrnFlat) return window.__dice3d.roll(list).then(function(v){ return v&&v.length===list.length?{v:v,three:1}:{v:flat()}; },function(){ return {v:flat()}; });
  return Promise.resolve({v:flat()}); }

/* the character's numbers, from the same derivation the sheet shows (D in 06) */
function lrnSkillI(n){ var C=A.C&&A.C(), s=(C&&C.skills)||[]; for(var i=0;i<s.length;i++) if(s[i].n===n) return i; return -1; }
function lrnBonus(spec){ if(typeof spec==="number") return spec; var m=/^skill:(.+)$/.exec(spec||""); var D=A.D&&A.D(); if(m&&D&&D.skill){ var i=lrnSkillI(m[1]); if(i>=0&&typeof D.skill[i]==="number") return D.skill[i]; } return 3; }
function lrnHasChar(){ var C=A.C&&A.C(); return !!(C&&C.name!=null&&!(A.frozen&&A.frozen())); }

/* ===== U41 Anchor Spotlight: one engine that points at a part of the screen. Learn uses it for "Find it on your sheet".
   The ring follows the element with CSS anchor positioning where the browser has it (Baseline 2026), and with a measured
   position (resize, scroll) where it does not. The label card sits beside the ring. window.__lrnNoAnchor forces the fallback (tests) */
var SPOT=null;
function spotAnchor(){ return !window.__lrnNoAnchor&&window.CSS&&CSS.supports&&CSS.supports("anchor-name","--a")&&CSS.supports("top","anchor(--a bottom)"); }
function spotShow(el,html,onClose){ spotHide(true); var ring=document.createElement("div"), card=document.createElement("div"), r0=el.getBoundingClientRect(), tall=r0.height>innerHeight*.45, anc=spotAnchor()&&!tall;/* a part taller than half the screen: the card waits at the bottom */
  ring.id="spotR"; ring.className="spot-r"+(anc?" spot-anc":""); ring.setAttribute("aria-hidden","true");
  card.id="lrnSpot"; card.className="spot-c noico"+(anc?" spot-anc":""); card.setAttribute("role","dialog"); card.setAttribute("aria-label",(el.getAttribute("aria-label")||"")); card.innerHTML=html;
  document.body.appendChild(ring); document.body.appendChild(card);
  if(anc){ el.style.setProperty("anchor-name","--spot"); }
  var place=function(){ if(anc) return; var r=el.getBoundingClientRect(), p=6; ring.style.left=(r.left-p)+"px"; ring.style.top=(r.top-p)+"px"; ring.style.width=(r.width+2*p)+"px"; ring.style.height=(r.height+2*p)+"px";
    if(tall){ card.style.left=Math.max(12,(innerWidth-card.offsetWidth)/2)+"px"; card.style.top=Math.max(12,innerHeight-card.offsetHeight-96)+"px"; return; }
    var below=r.bottom+180<innerHeight; card.style.left=Math.max(12,Math.min(innerWidth-card.offsetWidth-12,r.left+r.width/2-card.offsetWidth/2))+"px"; card.style.top=(below?r.bottom+14:Math.max(12,r.top-card.offsetHeight-14))+"px"; };
  if(window.__topLayer){ window.__topLayer(ring); window.__topLayer(card); }
  place(); addEventListener("resize",place); addEventListener("scroll",place,true);
  SPOT={el:el,ring:ring,card:card,place:place,onClose:onClose};
  var b=card.querySelector("button"); if(b) try{ b.focus({preventScroll:true}); }catch(e){} return SPOT; }
function spotHide(quiet){ var s=SPOT; if(!s) return; SPOT=null; removeEventListener("resize",s.place); removeEventListener("scroll",s.place,true);
  try{ s.el.style.removeProperty("anchor-name"); }catch(e){} s.ring.remove(); s.card.remove(); if(!quiet&&s.onClose) s.onClose(); }
window.__spot={show:spotShow,hide:spotHide,on:function(){ return !!SPOT; },find:function(s){ return lrnFind(s); }};

/* finds the element a stop points at on the sheet, and turns to its page or tab first. Answers null when it is not on this sheet */
function lrnVisible(el){ if(!el||!el.isConnected) return false; var r=el.getBoundingClientRect(); return r.width>0&&r.height>0&&r.right>0&&r.left<innerWidth&&getComputedStyle(el).visibility!=="hidden"; }/* a page of the phone pager beside the screen does not count */
function lrnFindAll(spec){ var m;
  if((m=/^sel:(.+)$/.exec(spec))) return Array.prototype.slice.call(document.querySelectorAll(m[1]));
  if(spec==="name") return ["#idName","#miniName","#officeName"].map(function(s){ return document.querySelector(s); }).filter(Boolean);
  if((m=/^skill:(.+)$/.exec(spec))){ var i=lrnSkillI(m[1]); return i<0?[]:Array.prototype.slice.call(document.querySelectorAll('[data-bd="sk-'+i+'"]')); }
  if((m=/^bd:(.+)$/.exec(spec))) return Array.prototype.slice.call(document.querySelectorAll('[data-bd="'+m[1]+'"]'));
  if((m=/^text:(.+)$/.exec(spec))){ var want=m[1].toLowerCase(), out=[]; Array.prototype.forEach.call(document.querySelectorAll("#app button, #app .tile, #app [data-info]"),function(e){ if((e.textContent||"").replace(/\s+/g," ").trim().toLowerCase().indexOf(want)>=0) out.push(e); }); return out.sort(function(a,b){ return a.textContent.length-b.textContent.length; }); }
  return []; }
function lrnFind(spec){ var all=lrnFindAll(spec), v=all.filter(lrnVisible)[0]; if(v) return v; var el=all[0]; if(!el) return null;
  var pg=el.closest&&el.closest('[id^="p-"]'); if(pg&&A.pages){ var k=A.pages.indexOf(pg.id); if(k>=0){ if(A.narrow()){ A.goPage(k,false); } else if(pg.hidden) A.setTab(pg.id,false,true); } }
  v=lrnFindAll(spec).filter(lrnVisible)[0]; return v||null; }
