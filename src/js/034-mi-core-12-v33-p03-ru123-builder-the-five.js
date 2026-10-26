/* v33 p03 (RU123 builder): the five coins the sheet shows after Apply when the starting gold is g (same data and rule as coinsNow) */
window.__coinsFor=function(g,mine){ g=num(g,0); if(!mine||!S.coins) return {pp:0,gp:g,ep:0,sp:0,cp:0}; var c={}; COINS.forEach(function(k){ c[k[0]]=num(S.coins[k[0]],0); }); c.gp=Math.max(0,c.gp+g-num(S.coinBase,g)); return c; };
window.__coinTotal=coinTotal; window.__ico=ico; window.__icoCls=icoCls; window.__icoItem=icoItem; window.__icoText=icoText;
function ordL(n){return n===0?"Cantrip":n+(n===1?"st":n===2?"nd":n===3?"rd":"th")+" Level"}
var spQ="",spF="all";
/* Spells tab header: Modifier, Spell Attack, Save DC, then slots. Numbers come from C.spellcasting (builder).
   M9: C.spellcasting.by (2+ abilities, multiclass or species): one header per source, and each spell uses the numbers of its ability (C.spells[].ab) */
/* v19 RL44: spell attack shown with Exhaustion */
function scAdj(sc){ if(!sc) return sc; var ex=D&&D.exhN?2*D.exhN:0, o={}; for(var k in sc) o[k]=sc[k]; if(ex) o.atk=num(sc.atk,0)-ex;
  var many=Array.isArray(sc.by)&&sc.by.length>1; if(Array.isArray(sc.by)) o.by=sc.by.map(function(b){ var c={}; for(var j in b) c[j]=b[j]; if(ex) c.atk=num(b.atk,0)-ex; return many?scCu(c,"-"+b.ab,ex):scCu(c,"",ex,1); });
  return scCu(o,"",ex); }
/* v34 RU85: Spell Attack and Save DC set by you (S.cust "n:spatk", "n:spdc", one pair per ability when 2+ sources), with a breakdown */
function scCu(o,sf,ex,quiet){ var ak="n:spatk"+sf, dk="n:spdc"+sf, a=cuK(ak), d=cuK(dk), av=a?cuNum(a.o):null, dv=d?cuNum(d.o):null, m=num(o.mod,0), pb=D&&D.pb||2, oth=num(o.atk,0)+ex-m-pb, odc=num(o.dc,0)-8-m-pb, src=sf&&o.n?" ("+o.n+")":"";
  var pa=[part("Modifier ("+(o.ab||"")+")",m,"Your spellcasting ability"),part("Proficiency Bonus",pb,"")], pd=[{l:"Base",v:8,note:"",raw:true},part("Modifier ("+(o.ab||"")+")",m,"Your spellcasting ability"),part("Proficiency Bonus",pb,"")];
  if(oth) pa.push(part("Other bonuses",oth,"Items or features")); if(ex) pa.push(part("Exhaustion level "+(ex/2),-ex,"Every D20 Test is 2 lower for each Exhaustion level")); if(odc) pd.push(part("Other bonuses",odc,"Items or features"));
  if(av!=null){ CU0[ak+"|o"]=o.atk; pa.push({l:"Set by you",v:sg(av),note:"Calculated value: "+sg(o.atk)+". Your number replaces it.",raw:true}); o.atk=av; }
  if(dv!=null){ CU0[dk+"|o"]=o.dc; pd.push({l:"Set by you",v:String(dv),note:"Calculated value: "+o.dc+". Your number replaces it.",raw:true}); o.dc=dv; }
  if(B&&!quiet){ B["spatk"+sf]={t:"Spell Attack"+src,parts:pa,total:sg(o.atk),f:""}; B["spdc"+sf]={t:"Spell Save DC"+src,parts:pd,total:String(o.dc),f:"A creature makes its saving throw against this number when your spell asks for one."}; }
  return o; }
/* v26 RU38 no. 2: a spell with its own save DC or spell attack (Customize) */
function scOf(x){ var r=scOf0(x), c=x&&cuK("s:"+x.n); if(c&&(cuNum(c.dc)!=null||cuNum(c.atk)!=null)){ r=Object.assign({},r); if(cuNum(c.dc)!=null) r.dc=cuNum(c.dc); if(cuNum(c.atk)!=null) r.atk=cuNum(c.atk); } return r; }
function scOf0(x){ var sc=scAdj(C.spellcasting||{}); if(x&&x.itc&&(x.itc.dc!=null||x.itc.atk!=null)){ sc=Object.assign({},sc); if(x.itc.dc!=null) sc.dc=x.itc.dc; if(x.itc.atk!=null) sc.atk=x.itc.atk; return sc; } if(x&&x.ab&&Array.isArray(sc.by)){ var b=sc.by.filter(function(q){return q.ab===x.ab})[0]; if(b) return b; } return sc; }
function spHeadBy(sc){ return sc.by.map(function(b){ var sf="-"+b.ab; return '<p class="sp-src">'+esc(b.n)+'</p><div class="sp-head"><div><b>'+sg(b.mod)+'</b><span>Modifier ('+b.ab+')</span></div><div class="bd" data-bd="spatk'+sf+'" role="button" tabindex="0"><b>'+sg(b.atk)+'</b><span>Spell Attack</span></div><div class="bd" data-bd="spdc'+sf+'" role="button" tabindex="0"><b>'+b.dc+'</b><span>Save DC</span></div></div>'; }).join(""); }
function spHead(sc){sc=scAdj(sc);var h=Array.isArray(sc.by)&&sc.by.length>1?spHeadBy(sc):'<div class="sp-head"><div><b>'+sg(sc.mod)+'</b><span>Modifier ('+sc.ab+')</span></div><div class="bd" data-bd="spatk" role="button" tabindex="0"><b>'+sg(sc.atk)+'</b><span>Spell Attack</span></div><div class="bd" data-bd="spdc" role="button" tabindex="0"><b>'+sc.dc+'</b><span>Save DC</span></div></div>';
 var sl=[];(sc.slots||[]).forEach(function(n,i){sl.push(ordL(i+1).replace(" Level","")+" \u00d7"+n)});if(sc.pact)sl.push("Pact \u00d7"+sc.pact.n+" (level "+sc.pact.lvl+")");if(sl.length)h+='<p class="sp-slots">Slots: '+sl.join(", ")+'. Tick the boxes at each spell level, or in Limited Use on the Actions tab.</p>';
 return h}
function renderSpells(){var el=document.getElementById("spBody");if(!el)return;var L=C.spells||[],sc=C.spellcasting;
 /* RU20: a caster with no spells chosen still sees Modifier, Spell Attack, Save DC and slots (C.spellcasting), then the note */
 var MB='<div class="spm-bar">'+(L.length?'<button type="button" class="btn press spm-open" data-spcards="1">Print Cards</button>':'')+'<button type="button" class="btn press spm-open" data-spman="1">'+ico("spellbook","ibt")+'Manage Spells</button></div>';/* v27 RU68 *//* v25 RU38 no. 3 */
 if(!L.length){el.innerHTML=(sc?spHead(sc):'')+'<div class="empty-note empty-st">'+ico("tab-spells","es-i")+'<b>No spells yet</b><span>'+(sc?'Add the cantrips and spells your class can cast. They show here with their slots.':'Spells from your class, species, feats, or magic items show up here.')+'</span><button type="button" class="btn pri press spm-open" data-spman="1">'+ico("tab-spells","ibt")+'Manage Spells</button></div>';return}/* v31 C5 */
 var h=(sc?spHead(sc):'')+MB;
 h+='<input class="sp-q" id="spQ" type="search" placeholder="Search Spell Names, Casting Times, Damage Types" value="'+esc(spQ)+'">';
 var lvs=[],UP=spUpOn(),UPX=spUpMax();L.forEach(function(x){var g=spGrpLv(x);if(lvs.indexOf(g)<0)lvs.push(g);if(UP&&spUpOk(x))for(var u=g+1;u<=UPX;u++)if(lvs.indexOf(u)<0)lvs.push(u)});lvs.sort(function(a,b){return a-b});/* v25 RU38 no. 6 */
 h+='<div class="ifil">'+[["all","All"]].concat(lvs.map(function(l){return [String(l),l?ordL(l).replace(" Level","").toUpperCase():"-0-"]})).concat([["conc","Conc."],["rit","Ritual"]]).map(function(f){return '<button type="button" class="ifb'+(spF===f[0]?' on':'')+'" data-spf="'+f[0]+'">'+f[1]+'</button>'}).join("")+'</div>';
 var q=spQ.toLowerCase(),lv=lvs.slice();
 lv.forEach(function(l){var rows=L.map(function(x,i){return [x,i]}).filter(function(p){var x=p[0];return (spGrpLv(x)===l||(UP&&spUpOk(x)&&l>spGrpLv(x)&&l<=UPX))&&(spF==="all"||spF===String(l)||(spF==="conc"&&x.conc)||(spF==="rit"&&x.rit))&&(!q||(x.n+" "+x.ct+" "+x.sum+" "+x.src).toLowerCase().indexOf(q)>=0)&&!(x.use==="Prepared"&&L.some(function(y){return y!==x&&y.n===x.n&&y.use==="Always prepared"}))/* v22 T1: sheets saved before v22 */}).sort(function(a,b){return a[0].n<b[0].n?-1:a[0].n>b[0].n?1:a[1]-b[1]});if(!rows.length)return;
  h+='<h3 class="sp-lv"><span>'+ordL(l)+'</span>'+spSlotsH(l,rows)+'</h3><div class="sp-tbl"><div class="sp-r sp-th"><span></span><span>Name</span><span>Time</span><span>Range</span><span>Hit / DC</span><span>Effect</span></div>'+rows.map(function(p){var x=p[0],xs=scOf(x),hd=x.sv==="ATK"?sg(xs.atk):x.sv?x.sv+" "+xs.dc:"\u2014";
   var badge=/At will|Cantrip/i.test(x.use)||!x.l?'<span class="sp-b" data-qcast="'+p[1]+'" title="Cast '+esc(x.n)+'" aria-hidden="true">AT<br>WILL</span>':/1\/Long/.test(x.use)?'<span class="sp-b use" data-qcast="'+p[1]+'" title="Use '+esc(x.n)+'" aria-hidden="true">USE</span>':'<span class="sp-b cast" data-qcast="'+p[1]+'" title="Cast '+esc(x.n)+'" aria-hidden="true">CAST</span>';
   return '<button type="button" class="sp-r" data-info="sp:'+p[1]+'"'+(x.sch?' data-sch="'+esc(x.sch)+'"':'')+'>'+badge+'<span class="sp-n"><b>'+esc(cuNm("s:"+x.n,x.n))+(x.conc?' <i class="sp-c">C</i>':'')+(x.rit?' <i class="sp-c rit">R</i>':'')+'</b><small><span class="sp-u">'+esc(x.use)+' \u2022 </span><span class="sp-s">'+esc(x.src||"")+'</span>'+(l>spGrpLv(x)?'<span class="sp-w"> \u2022 with a '+ordL(l).replace(" Level","")+' slot</span>':'')+'</small></span><span class="sp-t">'+esc(x.ct.replace("Bonus Action","1BA").replace("Reaction","1R").replace("Action","1A"))+'</span><span class="sp-g">'+spRangeH(x.r,x)+'</span><span class="sp-hd'+(hd==="\u2014"?" sp-no":"")+'">'/* v36 p13 */+esc(hd)+'</span><span>'+spEffH(x,l>spGrpLv(x)?l:spRowLv(x))+'</span></button><button type="button" class="spk" data-qcast="'+p[1]+'">'+(/1\/Long/.test(x.use)?"Use ":"Cast ")+esc(x.n)+'</button>'}).join("")+'</div>'});/* v21 m4 */
 el.innerHTML=h}

/* ================= v25: MANAGE SPELLS (RU38 no. 3) =================
   The Spells tab opens a panel that adds, prepares, and removes spells of the character's spellcasting classes, with the cantrip and prepared limits.
   Build mode: the sheet matches its build (__bldDiff empty). Changes go to the build, the sheet is rebuilt (toSheet), numbers come from the builder.
   Sheet mode: the sheet has its own edits, or no build. C.spells changes directly, and the build of the same character follows (no rebuild), as Inventory does (N2). */
var spmCls="", spmQ="", spmLv="all";
function spmRec(n){ if(typeof SPELLS==="undefined") return null; for(var i=0;i<SPELLS.length;i++) if(SPELLS[i][0]===n) return SPELLS[i]; return null; }
function spmMode(){ var I=null, d=[]; try{ I=window.__bldSpInfo?window.__bldSpInfo():null; }catch(er){ I=null; }
  if(I){ try{ d=window.__bldDiff?window.__bldDiff(C)||[]:[]; }catch(er){ d=[]; } } return {b:!!I&&!d.length, I:I}; }
/* limits worked out from the sheet when there is no build: class levels (clsLabel), cantrips and prepared spells from the class tables */
function isThird3(x){ return x==="Eldritch Knight"||x==="Arcane Trickster"||x==="Eldritch Knight (2014)"||x==="Arcane Trickster (2014)"; }/* v101: the sheet script has no access to the builder helper of the same name, so a sheet without a build could not open Manage Spells */
function spmLocal(){ var lv=clsLvls(), out=[]; if(typeof CLASSES==="undefined") return out;
  Object.keys(lv).forEach(function(cls){ var c=CLASSES[cls], L=lv[cls]||0, third=isThird3(C.sub)&&cls===C.cls&&L>=3; if(!c||!L||(!c.caster&&!third)) return;
    var ct=0, pr=0, mx=0;    if(third){ ct=(/^Arcane Trickster/.test(C.sub)?3:2)+(L>=10?1:0); pr=THIRD[L-3]||0; mx=(SLOTS_FULL[Math.ceil(L/3)-1]||[]).length; }
    else { var cc=CANT[cls]; ct=cc?cc[0]+(L>=cc[1]?1:0)+(L>=cc[2]?1:0):0; if(cls==="Sorcerer") ct=4+(L>=4?1:0)+(L>=10?1:0); pr=(PREP[cls]||[])[L-1]||0;
      if(C.rs==="2014"){ if((cls==="Paladin"||cls==="Ranger")&&L<2) return; var q14=pr14(cls,L,(typeof D!=="undefined"&&D.mod&&D.mod[c.cast])||0); if(q14) pr=q14.pr; }/* v92 */
      mx=c.caster==="pact"?(PACT[L-1]||[0,0])[1]:(c.caster==="full"?SLOTS_FULL[L-1]:c.caster==="half"?SLOTS_FULL[Math.ceil(L/2)-1]:SLOTS_FULL[Math.ceil(L/3)-1]||[]).length; }
    var list=third?"Wizard":cls;
    out.push({cls:cls, ct:ct, pr:pr, max:mx, lists:[list], taken:(C.spells||[]).filter(function(x){ return x.src===cls&&/^(Prepared|Cantrip)$/.test(x.use); }).map(function(x){ return x.n; })}); });
  return out; }
/* the caster parts the panel shows: from the build when the build is this character's, else from the sheet. Sheet mode lists what the sheet has */
function spmParts(M){ if(M.I&&M.b) return M.I.parts; var P=M.I?M.I.parts.map(function(p){ var q=JSON.parse(JSON.stringify(p)); q.taken=(C.spells||[]).filter(function(x){ return x.src===p.cls&&/^(Prepared|Cantrip)$/.test(x.use); }).map(function(x){ return x.n; }); return q; }):spmLocal(); return P; }
function spmAlways(){ return (C.spells||[]).filter(function(x){ return x.use==="Always prepared"; }).map(function(x){ return x.n; }); }
function spmCount(p){ var nc=0, np=0; p.taken.forEach(function(n){ var x=spmRec(n); if(!x) return; if(x[1]) np++; else nc++; }); return {nc:nc, np:np}; }
function spmMeta(x){ return (x[1]?ordL(x[1]):"Cantrip")+" • "+esc(x[2])+(x[8]?" • Concentration":"")+(x[9]?" • Ritual":""); }
function spmRow(x,on,full,cls){ var lbl=on?"Remove":(x[1]&&!spKn(cls,C.sub,C.rs)?"Prepare":"Learn");
  return '<div class="spm-r'+(on?' on':'')+'"><button type="button" class="spm-n" data-info="spn:'+esc(x[0])+'"><b>'+esc(x[0])+(x[8]?' <i class="sp-c">C</i>':'')+(x[9]?' <i class="sp-c rit">R</i>':'')+'</b><small>'+spmMeta(x)+'</small></button>'+
    '<button type="button" class="btn sm spm-t'+(on?' rm':'')+'" data-spmt="'+esc(x[0])+'" data-spmc="'+esc(cls)+'"'+(!on&&full?' disabled aria-disabled="true"':'')+' aria-label="'+lbl+' '+esc(x[0])+'">'+lbl+'</button></div>'; }
function spmHTML(){ if(window.__sp14Set&&(document.getElementById("bld")||{hidden:true}).hidden)window.__sp14Set(C.rs==="2014");/* v92 */ var M=spmMode(), P=spmParts(M);
  if(!P.length) return '<p class="info-d">'+(C.cls?esc(C.cls)+' has no Spellcasting at level '+D.level+'.':'Build this character first: choose a class in the builder.')+' Spells from species, feats, and items are added by the builder.</p>';
  var p=P.filter(function(q){ return q.cls===spmCls; })[0]||P[0]; spmCls=p.cls;
  var h=P.length>1?'<div class="ifil spm-cls" role="tablist">'+P.map(function(q){ return '<button type="button" role="tab" class="ifb'+(q===p?' on':'')+'" aria-selected="'+(q===p)+'" data-spmcls="'+esc(q.cls)+'">'+esc(q.cls)+'</button>'; }).join("")+'</div>':'';
  var n=spmCount(p), fc=n.nc>=p.ct, fp=n.np>=p.pr;
  var cnt=function(lab,a,b){ return '<div class="spm-c'+(a!==b?' short':'')+'"><b>'+a+' / '+b+'</b><span>'+lab+(a<b?' • '+(b-a)+' to choose':a>b?' • '+(a-b)+' too many':'')+'</span></div>'; };
  h+='<div class="spm-cnt">'+cnt("Cantrips",n.nc,p.ct)+cnt(spKn(p.cls,C.sub,C.rs)?"Spells Known":"Prepared Spells",n.np,p.pr)+'</div>';
  h+='<p class="info-d spm-how">'+(M.b?'Changes go to the build and the sheet is updated right away.':M.I?'This sheet has its own edits, so only the spell list changes. The build follows.':'This sheet has no build. The spell list on the sheet changes.')+'</p>';
  var mine=p.taken.map(spmRec).filter(Boolean).sort(function(a,b){ return a[1]-b[1]||(a[0]<b[0]?-1:1); });
  h+='<div class="info-h">'+(P.length>1?esc(p.cls)+' ':'')+'Spells ('+mine.length+')</div>'+(mine.length?mine.map(function(x){ return spmRow(x,true,false,p.cls); }).join(""):'<p class="info-d">None yet. Add them below.</p>');
  var al=spmAlways(); if(al.length) h+='<p class="info-d spm-al">Always prepared, not counted: '+al.map(esc).join(", ")+'.</p>';
  h+='<div class="info-h">Add Spells</div><input class="sp-q" id="spmQ" type="search" placeholder="Search spell names" aria-label="Search spell names" value="'+esc(spmQ)+'">';
  h+='<div class="ifil spm-lv">'+[["all","All"]].concat(Array.apply(null,{length:p.max+1}).map(function(_,i){ return [String(i),i?ordL(i).replace(" Level",""):"Cantrip"]; })).map(function(f){ return '<button type="button" class="ifb'+(String(spmLv)===f[0]?' on':'')+'" data-spml="'+f[0]+'">'+f[1]+'</button>'; }).join("")+'</div>';
  if(fp||fc) h+='<p class="info-d spm-full">'+(fc&&fp?'Cantrips and prepared spells are full':fc?'Cantrips are full':'Prepared spells are full')+'. Remove one to pick another.</p>';
  var q=spmQ.toLowerCase(), av=(typeof SPELLS==="undefined"?[]:SPELLS).filter(function(x){ return p.lists.some(function(l){ return x[3].indexOf(l)>=0; })&&(!p.book||!x[1]||p.book.indexOf(x[0])>=0||num(p.bookO,0)<num(p.bookN,0))/* v32: Wizard spellbook */&&x[1]<=p.max&&p.taken.indexOf(x[0])<0&&al.indexOf(x[0])<0&&(spmLv==="all"||String(x[1])===String(spmLv))&&(!q||x[0].toLowerCase().indexOf(q)>=0); })
    .sort(function(a,b){ return a[1]-b[1]||(a[0]<b[0]?-1:1); });
  h+=av.length?av.map(function(x){ return spmRow(x,false,x[1]?fp:fc,p.cls); }).join(""):'<p class="info-d">No spells match.</p>';
  return '<div class="spm">'+h+'</div>'; }
function spClsJ(x){ return x[3].filter(function(c){ return !/^(Mark of |Aberrant Dragonmark)/.test(c); }).join(", "); }/* v58: Dragonmark pseudo lists stay out of the class line */
function spmEntry(x,cls){ var o={n:x[0],l:x[1],sch:x[2],ct:x[4],r:x[5],cmp:x[6],dur:x[7],conc:x[8],rit:x[9],sv:x[10],sum:x[11]||"",full:(typeof SPELL_FULL!=="undefined"&&SPELL_FULL[x[0]])||"",cls:spClsJ(x),use:x[1]?"Prepared":"Cantrip",src:cls};
  var F=typeof SPELL_FX!=="undefined"&&SPELL_FX[x[0]]; if(F){ var f=JSON.parse(JSON.stringify(F)); if(f.mat){ o.mat=f.mat; delete f.mat; } if(Object.keys(f).length) o.fx=f; }
  if(typeof BOOKPG!=="undefined"&&BOOKPG.phb&&BOOKPG.phb.spell&&BOOKPG.phb.spell[x[0]]) o.pg=BOOKPG.phb.spell[x[0]]; return o; }
function spmToggle(n,cls){ var M=spmMode(), P=spmParts(M), p=P.filter(function(q){ return q.cls===cls; })[0], x=spmRec(n); if(!p||!x||FROZEN) return;
  var on=p.taken.indexOf(n)<0, c=spmCount(p);
  if(on&&(x[1]?c.np>=p.pr:c.nc>=p.ct)){ toast((x[1]?"Prepared spells":"Cantrips")+" are full. Remove one first."); return; }
  undoMark((on?"Add ":"Remove ")+n);
  if(M.b){ if(!window.__bldSpSet(n,cls,on,true)) return; }
  else { var L=C.spells=C.spells||[]; if(on) L.push(spmEntry(x,cls)); else { for(var i=L.length-1;i>=0;i--) if(L[i].n===n&&L[i].src===cls&&/^(Prepared|Cantrip)$/.test(L[i].use)){ L.splice(i,1); break; } }
    if(M.I&&window.__bldSpSet){ try{ window.__bldSpSet(n,cls,on,false); }catch(er){} } saveC(); renderAll(); }
  spmRefresh(); toastU((on?(x[1]?"Prepared ":"Learned "):"Removed ")+n+"."); }
function spmRefresh(){ if(sheetMode!=="spman") return; var b=$("#sheetBody"), st=b.scrollTop, qf=document.activeElement&&document.activeElement.id==="spmQ", sel=qf?document.activeElement.selectionStart:0;
  b.innerHTML=spmHTML(); b.scrollTop=st; if(qf){ var q=$("#spmQ"); if(q){ q.focus({preventScroll:true}); q.setSelectionRange(sel,sel); } } }
function openSpMan(){ spmQ=""; spmLv="all"; navStack=[{type:"spman"}]; openSheet("Manage Spells", spmHTML(), "spman", true); }
/* a spell that is not on the sheet yet: the rules text and the basic lines */
function spnHTML(n){ var x=spmRec(n); if(!x) return {t:n, h:'<p class="info-d">Not found.</p>'};
  var o=spmEntry(x,""), full=o.full||o.sum;
  var h='<p class="info-d">'+ico("school-"+String(x[2]).toLowerCase(),"isch")+'<i>'+(x[1]?ordL(x[1])+" ":"")+esc(x[2])+(x[1]?"":" cantrip")+'</i> • '+esc(spClsJ(x))+'</p>'+
    '<div class="info-k">'+tileS("Casting Time",x[4]+(x[9]?" or Ritual":""))+tileH("Range",spRangeH(x[5],o))+tileH("Components",spCompH(x[6],o))+tileS("Duration",(x[8]?"Concentration, ":"")+x[7])+'</div><p class="info-d">'+richP(full)+'</p>';
  if(o.pg) h+='<p class="bk-f">'+esc(srcPg("PHB-2024",o.pg))+'</p>';
  return {t:n, h:h}; }

/* ================= v25: SETTINGS AND APPEARANCE (RU38 no. 6, no. 7) =================
   S.set (optional): enc "off" (weight not tracked), ab "score" (score big, modifier small), spUp 1 (a spell that gains from a higher slot is listed again
   under each higher slot level). S.frame and S.bdrop (optional): portrait frame and backdrop. Hit Points fixed or rolled stay in the build (B.hpMode). */
function setOf(k){ return S.set&&S.set[k]!=null?String(S.set[k]):""; }
function setPut(k,v){ S.set=S.set&&typeof S.set==="object"?S.set:{}; if(v===""||v==null) delete S.set[k]; else S.set[k]=k==="spUp"?1:v; if(!Object.keys(S.set).length) delete S.set; }
var FRAMES=[["","Plain"],["round","Round"],["double","Double line"],["gilded","Gilded"],["outline","Outline"],["none","No border"]];
var BDROPS=[["","None"],["dusk","Dusk"],["stars","Night sky"],["parchment","Parchment"],["stone","Stone wall"],["waves","Waves"],["leaves","Woodland"]];
function setBtn(k,v,label){ var on=setOf(k)===v; return '<button type="button" class="thb'+(on?" on":"")+'" data-set="'+k+':'+v+'" aria-pressed="'+on+'">'+label+'</button>'; }
function lookBtn(attr,cur,v,label,extra){ var on=(cur||"")===v; return '<button type="button" class="thb'+(on?" on":"")+'" data-'+attr+'="'+v+'" aria-pressed="'+on+'">'+(extra||"")+label+'</button>'; }
function settingsHTML(){ var h='<h3 class="set-h">Appearance</h3>'+themeHTML();
  h+='<div class="info-h">Portrait Frame</div><div class="thg">'+FRAMES.map(function(f){ return lookBtn("thf",S.frame,f[0],f[1],'<span class="frsw" data-fr="'+f[0]+'" aria-hidden="true"></span>'); }).join("")+'</div>';
  h+='<div class="info-h">Backdrop</div><div class="thg">'+BDROPS.map(function(f){ return lookBtn("thd",S.bdrop,f[0],f[1],'<span class="bdsw" data-bd0="'+f[0]+'" aria-hidden="true"></span>'); }).join("")+'</div><p class="info-d">The backdrop sits behind the sheet. It is not printed.</p>';
  h+='<h3 class="set-h">Rules</h3><div class="info-h">Carrying Capacity</div><div class="thg">'+setBtn("enc","","Track weight")+setBtn("enc","off","Do not track")+'</div><p class="info-d">Your capacity is your Strength score times 15 pounds for a Small or Medium creature (half for Tiny, double for each size above Medium). Powerful Build counts as one size larger. Do not track hides the weight warning in Inventory.</p>';
  var hm=null; try{ hm=window.__bldHpMode?window.__bldHpMode():null; }catch(er){ hm=null; }
  h+='<div class="info-h">Hit Points</div>'+(hm?'<div class="thg"><button type="button" class="thb'+(hm!=="roll"?" on":"")+'" data-hpm="avg" aria-pressed="'+(hm!=="roll")+'">Fixed (average)</button><button type="button" class="thb'+(hm==="roll"?" on":"")+'" data-hpm="roll" aria-pressed="'+(hm==="roll")+'">Rolled</button></div><p class="info-d">'+(hm==="roll"?'Enter each roll in the builder. Empty rolls count as the average. <button type="button" class="lk" data-hpgo="1">Enter rolls</button>':'Each level after the first adds the average of your Hit Die plus your Constitution modifier.')+'</p>':'<p class="info-d">This sheet has no build, so its Hit Points are typed in. Change them with Edit.</p>');
  h+='<h3 class="set-h">Display</h3><div class="info-h">Ability Scores</div><div class="thg">'+setBtn("ab","","Modifier on top")+setBtn("ab","score","Score on top")+'</div>';
  h+='<div class="info-h">Spells</div><div class="thg">'+setBtn("spUp","","Each spell once")+setBtn("spUp","1","Also at higher slot levels")+'</div><p class="info-d">With higher slot levels on, a spell that gets stronger with a higher slot is listed again under each higher level you have slots for, with its effect at that level.</p>';
  var wk=!!(navigator.wakeLock&&typeof navigator.wakeLock.request==="function");/* v30 p11 RU131 */
  h+='<div class="info-h">Screen</div><div class="thg">'+setBtnI("wake","","Normal","ui-moon")+setBtnI("wake","1","Keep screen on","ui-sun")+'</div><p class="info-d">'+(wk?'Keep screen on stops the screen from dimming or locking while the sheet is open. It uses more battery.':'This browser cannot keep the screen on. The setting is saved and works in a browser that can.')+'</p>';
  h+='<div class="info-h">One-handed mode</div><div class="thg">'+setBtnI("oneh","","Off","ui-close")+setBtnI("oneh","1","On","ui-hand")+'</div><p class="info-d">On phones, a bar above the page buttons holds the amount, Heal, Damage, Rest, and Search, where your thumb reaches.</p>';
  /* v32 p27 RU110, RU113 */
  h+='<div class="info-h">Text Size</div><div class="thg tsg">'+[["90","90%"],["","100%"],["115","115%"],["130","130%"]].map(function(x){ var on=setOf("fs")===x[0]; return '<button type="button" class="thb tsb'+(on?" on":"")+'" data-set="fs:'+x[0]+'" aria-pressed="'+on+'"><svg class="tsa" viewBox="0 0 44 26" aria-hidden="true"><text x="22" y="20" text-anchor="middle" font-size="'+(x[0]?Math.round(17*x[0]/100):17)+'" font-weight="700" fill="currentColor">Aa</text></svg>'+x[1]+'</button>'; }).join("")+'</div><p class="info-d">Makes the text of the sheet and the builder smaller or larger. Buttons and boxes keep their places.</p>';
  h+='<div class="info-h">Color-blind Mode</div><div class="thg">'+setBtnI("cb","","Off","ui-close")+setBtnI("cb","1","On","ui-eye")+'</div><p class="info-d">For red and green color blindness. Good and bad use blue and orange, low Hit Points get a striped bar, and failed death saves show a cross, so color is never the only sign.</p>';
  h+='<div class="info-h">High Contrast</div><div class="thg">'+hcBtn("auto","Auto","ui-auto")+hcBtn("on","On","ui-contrast")+hcBtn("off","Off","ui-close")+'</div><p class="info-d" id="hcNote">'+hcNote()+'</p>'+miSetH();/* v35 p01, v55 */
  h+='<div class="info-h">Keyboard</div><div class="thg thgw"><button type="button" class="thb thbi" data-keysopen="1">'+ico("ui-keys")+'Keyboard Shortcuts</button></div><p class="info-d">On a computer: 1 to 7 switch tabs, H heals, D takes damage, R rests, and / searches. Press ? on the sheet to see them all.</p>';
  h+=snSetH();/* v32 p33 */
  return h; }
function setBtnI(k,v,label,ik){ var on=setOf(k)===v; return '<button type="button" class="thb thbi'+(on?" on":"")+'" data-set="'+k+':'+v+'" aria-pressed="'+on+'">'+ico(ik)+label+'</button>'; }
function applyLook2(){ var R=document.documentElement; [["data-frame",S.frame],["data-bdrop",S.bdrop],["data-abtop",setOf("ab")],["data-oneh",setOf("oneh")],["data-tsize",setOf("fs")],["data-cb",setOf("cb")]].forEach(function(a){ if(a[1]) R.setAttribute(a[0],a[1]); else R.removeAttribute(a[0]); }); try{ wakeApply(); }catch(er){} }
/* carrying capacity by size (PHB 2024 Rules Glossary), Powerful Build one size larger */
function hasFeatN(n){ return (C.features||[]).some(function(g){ return (g.items||[]).some(function(f){ return f.n===n; }); }); }
function carryOf(str){ var SIZES=["Tiny","Small","Medium","Large","Huge","Gargantuan"], SIZE_MUL={Tiny:7.5,Small:15,Medium:15,Large:30,Huge:60,Gargantuan:120}, sz=String(C.size||""), s=SIZES.filter(function(z){ return sz.indexOf(z)>=0; })[0]||"Medium", pb=hasFeatN("Powerful Build"), s2=pb?SIZES[Math.min(5,SIZES.indexOf(s)+1)]:s;
  var bear=(C.features||[]).some(function(g){ return (g.items||[]).some(function(i){ return i.n==="Aspect of the Beast"&&/\*\*Your choice\.\*\*\s*Bear/.test(String(i.d||"")); }); }), mul=bear?2:1;/* v102: Totem Warrior (2014), Aspect of the Beast: Bear doubles carrying capacity */
  return {v:SIZE_MUL[s2]*mul*str, m:SIZE_MUL[s2]*mul, s:s, pb:pb, bear:bear}; }
/* spells listed again at higher slot levels */
function spUpOn(){ return setOf("spUp")==="1"; }
function spUpMax(){ return ((C.spellcasting||{}).slots||[]).length; }
function spUpOk(x){ return !!x.l&&!x.itc&&!spPact(x)&&!/Long Rest|At will/.test(x.use||"")&&/Higher-Level Spell Slot/.test(x.full||""); }

