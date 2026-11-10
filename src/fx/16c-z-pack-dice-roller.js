/* Dice roller: any number of one kind of die plus a typed modifier. The 3D dice (25-dice3d) land on values decided first,
   or the player types what real dice showed ("I rolled myself"). The total is worked out here and goes to the roll history
   and the journal like every other roll. The history itself is shared through FXS16A (16-z-pack-dice-sound-hover.js).
   A row of colour buttons sets the colour of the 3D dice (Galaxy, Ocean, Ember, or any colour). The panel is built with DOM calls,
   not markup strings (N44 gate). State and helpers are shared between the blocks below through FXS16C, the way FXS16A is shared. */
const FXS16C={S:{n:1,f:20,mod:0,busy:0,hand:0},KINDS:[4,6,8,10,12,20,100],MAXN:99,MAXM:999,MANUAL_MAX:20,P:null};
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const C=FXS16C, S=C.S;
  C.rnd=function rnd(n){ const a=new Uint32Array(1), c=FXENV.crypto, lim=4294967296-(4294967296%n);
    for(let g=0;g<64;g++){ if(c&&c.getRandomValues) c.getRandomValues(a); else a[0]=Math.floor(Math.random()*4294967296); if(a[0]<lim) return 1+a[0]%n; }
    return 1+a[0]%n; };
  C.clamp=function clamp(v,lo,hi){ v=parseInt(v,10); return isFinite(v)?Math.max(lo,Math.min(hi,v)):null; };
  C.modTxt=function modTxt(m,sp){ return m?(sp?(m<0?" − ":" + "):(m<0?"−":"+"))+Math.abs(m):""; };
  C.spec=function spec(){ return S.n+"d"+S.f+C.modTxt(S.mod,false); };
  C.dieList=function dieList(){ const L=[]; for(let i=0;i<S.n;i++) L.push(S.f); return L; };
  C.can3d=function can3d(){ return !!FXENV.__dice3d&&!FXS16A.calm()&&S.n*(S.f===100?2:1)<=12; };
  /* a small element builder: tag, class, attributes, children (strings become text) */
  C.mk=function mk(tag,cls,attrs,kids){ const e=document.createElement(tag); if(cls) e.className=cls; Object.keys(attrs||{}).forEach((k) =>{ e.setAttribute(k,attrs[k]); });
    (kids||[]).forEach((k) =>{ e.appendChild(typeof k==="string"?document.createTextNode(k):k); }); return e; };
  C.btn=function btn(cls,attrs,kids){ return C.mk("button",cls,Object.assign({type:"button"},attrs),kids); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const C=FXS16C, S=C.S, mk=C.mk;
  /* one history record, the shape the Rolls drawer reads (l label, v total, d detail, k class) */
  C.record=function record(vals,hand){ let sum=0; vals.forEach((v) =>{ sum+=v; });
    const r={l:C.spec(),t:Date.now(),v:sum+S.mod,k:"dice",vals:vals.slice()};
    r.d="["+vals.join(", ")+"] "+(S.mod?sum+C.modTxt(S.mod,true):String(sum))+(hand?" (rolled by hand)":"");
    if(S.n===1&&S.f===20&&!S.mod){ r.nat=vals[0]; r.k=vals[0]===20?"nat20":vals[0]===1?"nat1":"d20"; }
    if(hand) r.hand=1; return r; };
  C.log=function log(r){ if(FXS16A.rk()!==FXS16A.HK) FXS16A.hload(); FXS16A.H.unshift(r); FXS16A.H=FXS16A.H.slice(0,50); FXS16A.save(); FXS16A.hist();
    if(FXENV.__miJournal) FXENV.__miJournal.add("roll",r.l+": "+r.v+(r.hand?" (by hand)":"")); FXS16A.play("dice"); MI.buzz(r.k==="nat20"?"success":"light"); };
  C.showRes=function showRes(r){ const el=C.P.querySelector(".mi-dres"); let sum=0; r.vals.forEach((v) =>{ sum+=v; });
    const chips=mk("div","mi-dch",{},r.vals.map((v) =>{ return mk("i",v===S.f?"mx":v===1?"mn":"",{},[String(v)]); }));
    const note=mk("small","",{},[r.l+" = "+(S.mod?sum+C.modTxt(S.mod,true):sum)+(r.hand?" · rolled by hand":"")]);
    el.replaceChildren(mk("strong","",{},[String(r.v)]),mk("div","",{},[chips,note]),C.btn("mi-rsh",{"data-dsh":"1"},["Share"]));
    el.__r=r; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); };
  C.finish=function finish(vals,hand){ S.busy=0; if(C.P) C.P.classList.remove("rolling"); const r=C.record(vals,hand); C.log(r); if(C.P) C.showRes(r); C.sync(); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const C=FXS16C, S=C.S;
  C.roll=function roll(){ if(S.busy||!C.P) return; S.busy=1; C.P.classList.add("rolling"); const L=C.dieList(), n=L.length, flat=() =>{ return L.map(() =>{ return C.rnd(S.f); }); };
    if(C.can3d()) FXENV.__dice3d.roll(L).then((v) =>{ C.finish(v&&v.length===n?v:flat(),false); },() =>{ C.finish(flat(),false); });
    else C.finish(flat(),false); };
  C.rollBtn=function rollBtn(){ S.hand=0; C.P.querySelector(".mi-dman").hidden=true; C.roll(); };
  C.share=function share(c){ const r=C.P.querySelector(".mi-dres").__r; if(!r) return; const cs=FXH.st&&FXH.st(), tx=((cs&&cs.C&&cs.C.name)||"I")+" rolled "+r.l+": "+r.v+" ("+r.d+")";
    if(navigator.share) navigator.share({text:tx}).catch(() =>{}); else if(navigator.clipboard) navigator.clipboard.writeText(tx).then(() =>{ c.textContent="Copied"; },() =>{}); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const C=FXS16C, S=C.S, mk=C.mk;
  /* "I rolled myself": one box per die (up to 20 dice, one box for the sum above that) */
  function field(attrs){ return mk("input","",Object.assign({type:"number",inputmode:"numeric"},attrs)); }
  C.manualBoxes=function manualBoxes(){ const box=C.P.querySelector(".mi-dman"); let body;
    if(S.n>C.MANUAL_MAX) body=mk("label","mi-dl",{},["Sum of the "+S.n+"d"+S.f,field({min:S.n,max:S.n*S.f,"data-dmv":"1"})]);
    else { body=mk("div","mi-dbx"); for(let i=0;i<S.n;i++) body.appendChild(field({min:1,max:S.f,placeholder:"d"+S.f,"aria-label":"Die "+(i+1),"data-dmv":i})); }
    box.replaceChildren(body,mk("div","mi-rbs",{},[C.btn("mi-dbtn pri",{"data-dadd":"1"},["Add it"])]),mk("p","mi-dhint")); box.hidden=false;
    const f=box.querySelector("input"); if(f) f.focus(); };
  function whole(el,lo,hi){ const raw=String(el.value).trim(), v=parseInt(raw,10); return /^\d+$/.test(raw)&&v>=lo&&v<=hi?v:null; }
  function closeBox(){ const box=C.P.querySelector(".mi-dman"); box.hidden=true; box.replaceChildren(); S.hand=0; }
  function manualSum(ins,hint){ const t=whole(ins[0],S.n,S.n*S.f); if(t===null){ hint.textContent="Type a whole number from "+S.n+" to "+(S.n*S.f)+"."; ins[0].focus(); return; }
    const r=C.record([t],true); r.d="["+t+"] "+(S.mod?t+C.modTxt(S.mod,true):String(t))+" (sum, rolled by hand)"; closeBox(); C.log(r); C.showRes(r); C.sync(); }
  function manualEach(ins,hint){ const vals=[]; for(let i=0;i<ins.length;i++){ const v=whole(ins[i],1,S.f); if(v===null){ hint.textContent="Die "+(i+1)+" needs a whole number from 1 to "+S.f+"."; ins[i].focus(); return; } vals.push(v); }
    closeBox(); C.finish(vals,true); }
  C.manualDone=function manualDone(){ const box=C.P.querySelector(".mi-dman"), hint=box.querySelector(".mi-dhint"), ins=[].slice.call(box.querySelectorAll("[data-dmv]"));
    if(S.n>C.MANUAL_MAX) manualSum(ins,hint); else manualEach(ins,hint); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const C=FXS16C, S=C.S, mk=C.mk;
  function stepper(label,attrs,dn){ const inp=mk("input","",Object.assign({type:"number",inputmode:"numeric"},attrs)), b=(sign,txt) =>{ const a={"aria-label":label+(sign<0?" down":" up")}; a[dn]=String(sign); return C.btn("",a,[txt]); };
    return mk("div","mi-dfd",{},[mk("span","",{},[label]),mk("div","mi-st",{},[b(-1,"−"),inp,b(1,"+")])]); }
  function kinds(){ return mk("div","mi-dk",{role:"radiogroup","aria-label":"Kind of die"},C.KINDS.map((k) =>{ return C.btn("",{role:"radio","aria-checked":"false","data-df":k},["d"+k]); })); }
  function head(){ return mk("div","mi-dph",{},[mk("b","",{},["Dice"]),C.btn("mi-rhc",{"data-dh":"1"},["Rolls"]),C.btn("mi-rhc",{"data-dx":"1"},["Done"])]); }
  C.panel=function panel(){ const fields=mk("div","mi-dr2",{},[stepper("Dice",{min:1,max:C.MAXN,"aria-label":"Number of dice","data-dni":"1"},"data-dn"),stepper("Modifier",{min:-C.MAXM,max:C.MAXM,"aria-label":"Modifier","data-dmi":"1"},"data-dm")]);
    const acts=mk("div","mi-rbs",{},[C.btn("mi-dbtn pri",{"data-droll":"1"},["Roll"]),C.btn("mi-dbtn",{"data-dself":"1"},["I rolled myself"])]);
    const body=mk("div","mi-dpb",{},[kinds(),fields,mk("div","mi-dsp",{"aria-live":"polite"}),acts,mk("div","mi-dman",{hidden:""}),mk("div","mi-dres",{"aria-live":"polite"}),C.skinRow()]);
    return mk("div","mi-dp",{role:"dialog","aria-label":"Dice roller"},[mk("div","mi-dpx",{"data-dx":"1"}),mk("div","mi-dpp",{},[head(),body])]); };
  C.sync=function sync(){ const P=C.P; if(!P) return; P.querySelectorAll("[data-df]").forEach((b) =>{ const on=+b.getAttribute("data-df")===S.f; b.setAttribute("aria-checked",on?"true":"false"); b.classList.toggle("on",on); });
    const ni=P.querySelector("[data-dni]"), mi=P.querySelector("[data-dmi]"); if(document.activeElement!==ni) ni.value=S.n; if(document.activeElement!==mi) mi.value=S.mod;
    C.preview(); P.querySelector("[data-droll]").disabled=!!S.busy; };
  C.preview=function preview(){ C.P.querySelector(".mi-dsp").textContent=C.spec().replace("+"," + ").replace("−"," − "); };
  C.setN=function setN(v){ const c=C.clamp(v,1,C.MAXN); if(c===null) return; if(c!==S.n){ S.n=c; if(S.hand) C.manualBoxes(); } C.sync(); };
  C.setM=function setM(v){ const c=C.clamp(v,-C.MAXM,C.MAXM); if(c===null) return; S.mod=c; C.sync(); };
  C.setF=function setF(f){ if(S.f===f) return; S.f=f; if(S.hand) C.manualBoxes(); C.sync(); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const C=FXS16C, mk=C.mk;
  /* dice colours: one round button per colour set, each showing a 20 in its own number colour on its own ring, so the choice shows
     the number stays readable. The last one opens the colour picker. The choice is stored (mi-dsk) and used by every 3D die of the app. */
  function paint(b,id){ const r=FXENV.__dice3d.res(id), st=b.style; st.setProperty("--c1",r.c1); st.setProperty("--c2",r.c2); st.setProperty("--ink",r.ink); st.setProperty("--hal",r.hal); }
  C.skinRow=function skinRow(){ const d=FXENV.__dice3d; if(!d||!d.skins) return mk("div"); const row=mk("div","mi-dcr",{role:"group","aria-label":"Dice color"},[mk("span","mi-dcl",{},["Dice color"])]);
    d.skins().forEach((s) =>{ row.appendChild(C.btn("mi-dsw",{"data-dsk":s.id,"aria-label":s.n+" dice","aria-pressed":"false"},[mk("b","",{},["20"]),mk("small","",{},[s.n])])); });
    row.appendChild(mk("label","mi-dsw mi-dswc",{"data-dsk":"custom","aria-label":"Custom dice color"},[mk("input","",{type:"color","data-dsc":"1","aria-label":"Custom dice color",value:"#7a3fd0"}),mk("b","",{},["20"]),mk("small","",{},["Custom"])]));
    return row; };
  C.skinPaint=function skinPaint(){ const d=FXENV.__dice3d, P=C.P; if(!d||!d.skin||!P) return; const cur=d.skin(), cust=P.querySelector("[data-dsc]");
    P.querySelectorAll("[data-dsk]").forEach((b) =>{ const id=b.getAttribute("data-dsk"), isC=id==="custom", on=isC?/^custom:/.test(cur):id===cur; if(isC&&/^custom:/.test(cur)) cust.value=cur.slice(7);
      paint(b,isC?"custom:"+cust.value:id); b.classList.toggle("on",on); b.setAttribute("aria-pressed",on?"true":"false"); }); };
  C.skinSet=function skinSet(id){ const d=FXENV.__dice3d; if(!d||!d.skin) return; d.skin(id==="custom"?"custom:"+C.P.querySelector("[data-dsc]").value:id); C.skinPaint(); };
  C.onSkinInput=function onSkinInput(e){ const t=e.target; if(t.hasAttribute&&t.hasAttribute("data-dsc")) C.skinSet("custom"); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const C=FXS16C, S=C.S, SEL="[data-dx],[data-dh],[data-df],[data-dn],[data-dm],[data-droll],[data-dself],[data-dadd],[data-dsh],button[data-dsk]";
  const ACT={ dx:() =>{ C.close(); }, dh:() =>{ C.close(); FXS16A.openH(); }, df:(c) =>{ C.setF(+c.getAttribute("data-df")); }, dn:(c) =>{ C.setN(S.n+(+c.getAttribute("data-dn"))); },
    dm:(c) =>{ C.setM(S.mod+(+c.getAttribute("data-dm"))); }, droll:() =>{ C.rollBtn(); }, dself:() =>{ S.hand=1; C.manualBoxes(); }, dadd:() =>{ C.manualDone(); }, dsh:(c) =>{ C.share(c); }, dsk:(c) =>{ C.skinSet(c.getAttribute("data-dsk")); } };
  C.onClick=function onClick(e){ const c=e.target.closest&&e.target.closest(SEL); if(!c) return; e.stopPropagation(); const k=Object.keys(ACT).filter((a) =>{ return c.hasAttribute("data-"+a); })[0]; if(k) ACT[k](c); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const C=FXS16C, S=C.S;
  C.onInput=function onInput(e){ const t=e.target, n=t.hasAttribute&&t.hasAttribute("data-dni"), m=t.hasAttribute&&t.hasAttribute("data-dmi"); if(!n&&!m) return;
    const v=n?C.clamp(t.value,1,C.MAXN):C.clamp(t.value,-C.MAXM,C.MAXM); if(v===null) return; if(n){ if(v!==S.n){ S.n=v; if(S.hand) C.manualBoxes(); } } else S.mod=v; C.preview(); };
  C.onChange=function onChange(e){ const t=e.target, n=t.hasAttribute&&t.hasAttribute("data-dni"), m=t.hasAttribute&&t.hasAttribute("data-dmi"); if(!n&&!m) return; if(t.value==="") S[n?"n":"mod"]=n?1:0; C.sync(); };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const C=FXS16C;
  C.onKey=function onKey(e){ if(e.key==="Escape"){ e.stopPropagation(); C.close(); return; } if(e.key!=="Enter") return; const t=e.target, has=(a) =>{ return t.hasAttribute&&t.hasAttribute(a); };
    if(has("data-dmv")){ e.preventDefault(); C.manualDone(); } else if(has("data-dni")||has("data-dmi")){ e.preventDefault(); t.blur(); C.rollBtn(); } };
})();
(function(){
  const MI=FXENV.__MI;
  if(!MI||!document.body.animate) return;
  const C=FXS16C, S=C.S;
  C.build=function build(){ const P=C.panel(); C.P=P; document.body.appendChild(P);
    P.addEventListener("click",C.onClick); P.addEventListener("input",C.onInput); P.addEventListener("input",C.onSkinInput); P.addEventListener("change",C.onChange); P.addEventListener("keydown",C.onKey);
    ["pointerdown","touchstart","touchmove"].forEach((t) =>{ P.addEventListener(t,(e) =>{ e.stopPropagation(); },{passive:true}); }); };
  C.open=function open(){ if(!C.P) C.build(); if(FXENV.__moreSet) FXENV.__moreSet(false); C.sync(); C.skinPaint(); C.P.classList.add("on"); const b=C.P.querySelector("[data-droll]"); try{ b.focus({preventScroll:true}); }catch(e){} };
  C.close=function close(){ if(C.P) C.P.classList.remove("on"); };
  FXENV.__miDice={open:C.open,close:C.close,state:function(){ return {n:S.n,f:S.f,mod:S.mod,open:!!(C.P&&C.P.classList.contains("on"))}; }};
  /* the More menu button, and the "Dice" button of the Rolls drawer */
  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("#diceBtn,[data-mrd]"); if(!b) return; e.preventDefault(); e.stopPropagation(); if(b.hasAttribute("data-mrd")) FXS16A.closeH(); C.open(); },true);
})();
