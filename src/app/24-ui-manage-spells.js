import {bindLive,clsLvls,renderAll,srcPg,toastU,undoMark} from "./00a-reg-late-ports.js";import {C,FROZEN,saveC} from "./04-logic-storage.js";
import {$,esc,num,toast} from "./05-logic-helpers.js";
import {D,richP} from "./06-logic-derivation.js";
import {__set_navStack,navStack,openSheet,sheetMode} from "./12-ui-bottom-sheet-modal.js";
import {tileH,tileS} from "./13-ui-detail-cards.js";
import {spCompH,spRangeH} from "./22-ui-spell-data-and-slots.js";
import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";import {ordL} from "./23e-ui-spells-dc.js";
import {env} from "./00-env.js";
bindLive("spmCls",{get:function(){return spmCls;},set:function(v){spmCls=v;}});
bindLive("spmHTML",{get:function(){return spmHTML;}});
bindLive("spmLv",{get:function(){return spmLv;},set:function(v){spmLv=v;}});
bindLive("spmRefresh",{get:function(){return spmRefresh;}});
bindLive("spmToggle",{get:function(){return spmToggle;}});
bindLive("spnHTML",{get:function(){return spnHTML;}});
/* ================= v25: MANAGE SPELLS (RU38 no. 3) =================
   The Spells tab opens a panel that adds, prepares, and removes spells of the character's spellcasting classes, with the cantrip and prepared limits.
   Build mode: the sheet matches its build (__bldDiff empty). Changes go to the build, the sheet is rebuilt (toSheet), numbers come from the builder.
   Sheet mode: the sheet has its own edits, or no build. C.spells changes directly, and the build of the same character follows (no rebuild), as Inventory does (N2). */
export var spmCls="", spmQ="", spmLv="all";
function spmRec(n){ if(typeof SPELLS==="undefined") return null; for(let i=0;i<SPELLS.length;i++) if(SPELLS[i][0]===n) return SPELLS[i]; return null; }
function spmMode(){ let I=null, d=[]; try{ I=env.__bldSpInfo?env.__bldSpInfo():null; }catch(er){ I=null; }
  if(I){ try{ d=env.__bldDiff?env.__bldDiff(C)||[]:[]; }catch(er){ d=[]; } } return {b:!!I&&!d.length, I:I}; }
/* limits worked out from the sheet when there is no build: class levels (clsLabel), cantrips and prepared spells from the class tables */
function isThird3(x){ if(env.THIRD_SUBS&&env.THIRD_SUBS[x]) return true; /* fx engine v4 */ return x==="Eldritch Knight"||x==="Arcane Trickster"||x==="Eldritch Knight (2014)"||x==="Arcane Trickster (2014)"; }/* v101: the sheet script has no access to the builder helper of the same name, so a sheet without a build could not open Manage Spells */
function spmLocal(){ const lv=clsLvls(), out=[]; if(typeof CLASSES==="undefined") return out;
  Object.keys(lv).forEach((cls) =>{ const c=CLASSES[cls], L=lv[cls]||0, third=isThird3(C.sub)&&cls===C.cls&&L>=3; if(!c||!L||(!c.caster&&!third)) return;
    let ct=0, pr=0, mx=0;    if(third){ ct=((env.THIRD_SUBS&&env.THIRD_SUBS[C.sub]&&env.THIRD_SUBS[C.sub].cant!=null)?env.THIRD_SUBS[C.sub].cant:(/^Arcane Trickster/.test(C.sub)?3:2))+(L>=10?1:0); pr=THIRD[L-3]||0; mx=(SLOTS_FULL[Math.ceil(L/3)-1]||[]).length; }
    else { const cc=CANT[cls]; ct=cc?cc[0]+(L>=cc[1]?1:0)+(L>=cc[2]?1:0):0; if(cls==="Sorcerer") ct=4+(L>=4?1:0)+(L>=10?1:0); pr=(PREP[cls]||[])[L-1]||0;
      if(C.rs==="2014"){ if((cls==="Paladin"||cls==="Ranger")&&L<2) return; const q14=pr14(cls,L,(typeof D!=="undefined"&&D.mod&&D.mod[c.cast])||0); if(q14) pr=q14.pr; }/* v92 */
      mx=c.caster==="pact"?(PACT[L-1]||[0,0])[1]:(c.caster==="full"?SLOTS_FULL[L-1]:c.caster==="half"?SLOTS_FULL[Math.ceil(L/2)-1]:SLOTS_FULL[Math.ceil(L/3)-1]||[]).length; }
    const list=third?"Wizard":cls;
    out.push({cls:cls, ct:ct, pr:pr, max:mx, lists:[list], taken:(C.spells||[]).filter((x) =>{ return x.src===cls&&/^(Prepared|Cantrip)$/.test(x.use); }).map((x) =>{ return x.n; })}); });
  return out; }
/* the caster parts the panel shows: from the build when the build is this character's, else from the sheet. Sheet mode lists what the sheet has */
function spmParts(M){ if(M.I&&M.b) return M.I.parts; const P=M.I?M.I.parts.map((p) =>{ const q=structuredClone(p); q.taken=(C.spells||[]).filter((x) =>{ return x.src===p.cls&&/^(Prepared|Cantrip)$/.test(x.use); }).map((x) =>{ return x.n; }); return q; }):spmLocal(); return P; }
function spmAlways(){ return (C.spells||[]).filter((x) =>{ return x.use==="Always prepared"; }).map((x) =>{ return x.n; }); }
function spmCount(p){ let nc=0, np=0; p.taken.forEach((n) =>{ const x=spmRec(n); if(!x) return; if(x[1]) np++; else nc++; }); return {nc:nc, np:np}; }
function spmMeta(x){ return (x[1]?ordL(x[1]):"Cantrip")+" • "+esc(x[2])+(x[8]?" • Concentration":"")+(x[9]?" • Ritual":""); }
function spmRow(x,on,full,cls){ const lbl=on?"Remove":(x[1]&&!spKn(cls,C.sub,C.rs)?"Prepare":"Learn");
  return '<div class="spm-r'+(on?' on':'')+'"><button type="button" class="spm-n" data-info="spn:'+esc(x[0])+'"><b>'+esc(x[0])+(x[8]?' <i class="sp-c">C</i>':'')+(x[9]?' <i class="sp-c rit">R</i>':'')+'</b><small>'+spmMeta(x)+'</small></button>'+
    '<button type="button" class="btn sm spm-t'+(on?' rm':'')+'" data-spmt="'+esc(x[0])+'" data-spmc="'+esc(cls)+'"'+(!on&&full?' disabled aria-disabled="true"':'')+' aria-label="'+lbl+' '+esc(x[0])+'">'+lbl+'</button></div>'; }
function spmHTML(){ if(env.__sp14Set&&(document.getElementById("bld")||{hidden:true}).hidden)env.__sp14Set(C.rs==="2014");/* v92 */ const M=spmMode(), P=spmParts(M);
  if(!P.length) return '<p class="info-d">'+(C.cls?esc(C.cls)+' has no Spellcasting at level '+D.level+'.':'Build this character first: choose a class in the builder.')+' Spells from species, feats, and items are added by the builder.</p>';
  const p=P.filter((q) =>{ return q.cls===spmCls; })[0]||P[0]; spmCls=p.cls;
  let h=P.length>1?'<div class="ifil spm-cls" role="tablist">'+P.map((q) =>{ return '<button type="button" role="tab" class="ifb'+(q===p?' on':'')+'" aria-selected="'+(q===p)+'" data-spmcls="'+esc(q.cls)+'">'+esc(q.cls)+'</button>'; }).join("")+'</div>':'';
  const n=spmCount(p), fc=n.nc>=p.ct, fp=n.np>=p.pr;
  const cnt=function(lab,a,b){ return '<div class="spm-c'+(a!==b?' short':'')+'"><b>'+a+' / '+b+'</b><span>'+lab+(a<b?' • '+(b-a)+' to choose':a>b?' • '+(a-b)+' too many':'')+'</span></div>'; };
  h+='<div class="spm-cnt">'+cnt("Cantrips",n.nc,p.ct)+cnt(spKn(p.cls,C.sub,C.rs)?"Spells Known":"Prepared Spells",n.np,p.pr)+'</div>';
  h+='<p class="info-d spm-how">'+(M.b?'Changes go to the build and the sheet is updated right away.':M.I?'This sheet has its own edits, so only the spell list changes. The build follows.':'This sheet has no build. The spell list on the sheet changes.')+'</p>';
  const mine=p.taken.map(spmRec).filter(Boolean).sort((a,b) =>{ return a[1]-b[1]||(a[0]<b[0]?-1:1); });
  h+='<div class="info-h">'+(P.length>1?esc(p.cls)+' ':'')+'Spells ('+mine.length+')</div>'+(mine.length?mine.map((x) =>{ return spmRow(x,true,false,p.cls); }).join(""):'<p class="info-d">None yet. Add them below.</p>');
  const al=spmAlways(); if(al.length) h+='<p class="info-d spm-al">Always prepared, not counted: '+al.map(esc).join(", ")+'.</p>';
  h+='<div class="info-h">Add Spells</div><input class="sp-q" id="spmQ" type="search" placeholder="Search spell names" aria-label="Search spell names" value="'+esc(spmQ)+'">';
  h+='<div class="ifil spm-lv">'+[["all","All"]].concat(Array.apply(null,{length:p.max+1}).map((_,i) =>{ return [String(i),i?ordL(i).replace(" Level",""):"Cantrip"]; })).map((f) =>{ return '<button type="button" class="ifb'+(String(spmLv)===f[0]?' on':'')+'" data-spml="'+f[0]+'">'+f[1]+'</button>'; }).join("")+'</div>';
  if(fp||fc) h+='<p class="info-d spm-full">'+(fc&&fp?'Cantrips and prepared spells are full':fc?'Cantrips are full':'Prepared spells are full')+'. Remove one to pick another.</p>';
  const q=spmQ.toLowerCase(), av=(typeof SPELLS==="undefined"?[]:SPELLS).filter((x) =>{ return p.lists.some((l) =>{ return x[3].indexOf(l)>=0; })&&(!p.book||!x[1]||p.book.indexOf(x[0])>=0||num(p.bookO,0)<num(p.bookN,0))/* v32: Wizard spellbook */&&x[1]<=p.max&&p.taken.indexOf(x[0])<0&&al.indexOf(x[0])<0&&(spmLv==="all"||String(x[1])===String(spmLv))&&(!q||x[0].toLowerCase().indexOf(q)>=0); })
    .sort((a,b) =>{ return a[1]-b[1]||(a[0]<b[0]?-1:1); });
  h+=av.length?av.map((x) =>{ return spmRow(x,false,x[1]?fp:fc,p.cls); }).join(""):'<p class="info-d">No spells match.</p>';
  return '<div class="spm">'+h+'</div>'; }
export function spClsJ(x){ return x[3].filter((c) =>{ return !/^(Mark of |Aberrant Dragonmark)/.test(c); }).join(", "); }/* v58: Dragonmark pseudo lists stay out of the class line */
function spmEntry(x,cls){ const o={n:x[0],l:x[1],sch:x[2],ct:x[4],r:x[5],cmp:x[6],dur:x[7],conc:x[8],rit:x[9],sv:x[10],sum:x[11]||"",full:(typeof SPELL_FULL!=="undefined"&&SPELL_FULL[x[0]])||"",cls:spClsJ(x),use:x[1]?"Prepared":"Cantrip",src:cls};
  const F=typeof SPELL_FX!=="undefined"&&SPELL_FX[x[0]]; if(F){ const f=structuredClone(F); if(f.mat){ o.mat=f.mat; delete f.mat; } if(Object.keys(f).length) o.fx=f; }
  if(typeof BOOKPG!=="undefined"&&BOOKPG.phb&&BOOKPG.phb.spell&&BOOKPG.phb.spell[x[0]]) o.pg=BOOKPG.phb.spell[x[0]]; return o; }
function spmToggle(n,cls){ const M=spmMode(), P=spmParts(M), p=P.filter((q) =>{ return q.cls===cls; })[0], x=spmRec(n); if(!p||!x||FROZEN) return;
  const on=p.taken.indexOf(n)<0, c=spmCount(p);
  if(on&&(x[1]?c.np>=p.pr:c.nc>=p.ct)){ toast((x[1]?"Prepared spells":"Cantrips")+" are full. Remove one first."); return; }
  undoMark((on?"Add ":"Remove ")+n);
  if(M.b){ if(!env.__bldSpSet(n,cls,on,true)) return; }
  else { const L=C.spells=C.spells||[]; if(on) L.push(spmEntry(x,cls)); else { for(let i=L.length-1;i>=0;i--) if(L[i].n===n&&L[i].src===cls&&/^(Prepared|Cantrip)$/.test(L[i].use)){ L.splice(i,1); break; } }
    if(M.I&&env.__bldSpSet){ try{ env.__bldSpSet(n,cls,on,false); }catch(er){} } saveC(); renderAll(); }
  spmRefresh(); toastU((on?(x[1]?"Prepared ":"Learned "):"Removed ")+n+"."); }
export function spmRefresh(){ if(sheetMode!=="spman") return; const b=$("#sheetBody"), st=b.scrollTop, qf=document.activeElement&&document.activeElement.id==="spmQ", sel=qf?document.activeElement.selectionStart:0;
  b.innerHTML=spmHTML(); b.scrollTop=st; if(qf){ const q=$("#spmQ"); if(q){ q.focus({preventScroll:true}); q.setSelectionRange(sel,sel); } } }
export function openSpMan(){ spmQ=""; spmLv="all"; __set_navStack([{type:"spman"}]); openSheet("Manage Spells", spmHTML(), "spman", true); }
/* a spell that is not on the sheet yet: the rules text and the basic lines */
export function spnHTML(n){ const x=spmRec(n)||(env.__wxSpRow&&env.__wxSpRow(n)); if(!x) return {t:n, h:'<p class="info-d">Not found.</p>'};
  const o=spmEntry(x,""), full=o.full||o.sum;
  let h='<p class="info-d">'+ico("school-"+String(x[2]).toLowerCase(),"isch")+'<i>'+(x[1]?ordL(x[1])+" ":"")+esc(x[2])+(x[1]?"":" cantrip")+'</i> • '+esc(spClsJ(x))+'</p>'+
    '<div class="info-k">'+tileS("Casting Time",x[4]+(x[9]?" or Ritual":""))+tileH("Range",spRangeH(x[5],o))+tileH("Components",spCompH(x[6],o))+tileS("Duration",(x[8]?"Concentration, ":"")+x[7])+'</div><p class="info-d">'+richP(full)+'</p>';
  if(o.pg) h+='<p class="bk-f">'+esc(srcPg("PHB-2024",o.pg))+'</p>';
  return {t:n, h:h}; }


export function __set_spmQ(v){ return spmQ=v; }
