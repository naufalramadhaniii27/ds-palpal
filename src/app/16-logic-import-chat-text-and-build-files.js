import {bindLive,coinsClean,dnaRead,lateGet,statusLine,uiGet,rEnsure,rGet,rSave} from "./00a-reg-late-ports.js";import {APP_VER,CKEY,KEY} from "./04-logic-storage.js";import {ask,num,toast} from "./05-logic-helpers.js";import {bkpCheck,bkpCount,bkpRestore} from "./15b-logic-backup.js";import {cOf,fixCid,fmtT,newId,rawHash,uiSet,zUnpack} from "./15c-logic-file-state-compress.js";import {homeCards,rLoad,rSnap} from "./15-logic-roster-backup-files-snapshots.js";import {snTake} from "./15d-logic-snapshots-character-files.js";import {env} from "./00-env.js";
bindLive("impText",{get:function(){return impText;}});
export function jsonLoose(t){ try{ return JSON.parse(t); }catch(e){} let s=String(t).replace(/```[a-zA-Z]*\s*/g,"").replace(/```/g,""), i=s.indexOf("{"), j=s.lastIndexOf("}"); if(i<0||j<i) return null; s=s.slice(i,j+1);
  try{ return JSON.parse(s); }catch(e){} s=s.replace(/[\u201c\u201d]/g,'"').replace(/,\s*([}\]])/g,"$1"); try{ return JSON.parse(s); }catch(e){ return null; } }
export function impText(txt){ const dm=/#build=([A-Za-z0-9_-]{20,})/.exec(String(txt||"")); if(dm&&typeof lateGet("dnaRead")==="function") txt=dnaRead(dm[1]);/* T11 N11: a build link, pasted or scanned */ if(typeof lateGet("statusLine")==="function"&&statusLine(txt)){ toast("This is a status line from a chat, not a character: "+String(txt).trim().slice(0,140)); return; } zUnpack(txt).then((t) =>{ const o=jsonLoose(t); if(!o){ toast("This text is not a character, a backup, or a build. Check that all of it was pasted."); return; } impObj(o); },(e) =>{ toast((e&&e.message)||"This text could not be unpacked."); }); }
function impObj(o){ if(o&&o.kind==="character") return impChar(o); if(o&&typeof o==="object"&&(o.kind==="build"||(!o.kind&&!o.keys&&typeof o.C!=="string"&&(o.cls||o["class"])))) return impBuild(o.kind==="build"?(o.B||o):o, o);/* v22 RU80 */ const err=bkpCheck(o); if(err){ toast(err); return; }
  if((+o.appVer||0)>APP_VER) toast("This backup was made with a newer version of the app. Parts this version does not know are kept.");
  const n=bkpCount(o), m=Object.keys((rGet()||{chars:{}}).chars||{}).length;
  ask("Replace the "+m+" character"+(m===1?"":"s")+" on this device with the "+n+" character"+(n===1?"":"s")+" in this backup (made "+(o.created?fmtT(Date.parse(o.created)).slice(0,10):"at an unknown date")+")? Characters that are not in the backup will be removed. Add to This Device keeps them and adds the characters from the backup.","Restore",() =>{ bkpRestore(o); },["Add to This Device",function(){ bkpMerge(o); }]); }
/* RU42: merge. A character with a new id is added. The same id with the same data is skipped. The same id with other data is added as another character */
function bkpMerge(o){
 const _bkpMergeStep1=bkpMergeStep1(o);
 const {list, r}=_bkpMergeStep1;
 let {add, same}=_bkpMergeStep1;
  ({add, same}=bkpMergeStep2(list, r, add, same));
  if(!rSave(r)) return;
 bkpMergeStep3(r, add, same); }
function bkpMergeStep1(o){
let src=null; try{ src=JSON.parse(o.keys["cs-roster-v1"]||"null"); }catch(e){}
  const list=[]; if(src&&src.chars) Object.keys(src.chars).forEach((id) =>{ list.push([id,src.chars[id]]); });
  else if(o.keys[CKEY]) list.push(["c"+Date.now(),{name:cOf(o.keys[CKEY]).name||"Character",C:o.keys[CKEY],S:o.keys[KEY]||null,B:o.keys[lateGet("BKEY")]||null}]);
  let r=rSnap(rEnsure()), add=0, same=0;
  return /** @type {any} */ ({list, r, add, same});
}
function bkpMergeStep2(list, r, add, same){
  list.forEach((p) =>{ const id=p[0], ch=p[1]||{}; if(ch.C==null) return; const ex=r.chars[id];
    if(ex&&ex.C===ch.C&&(ex.S||null)===(ch.S||null)&&(ex.B||null)===(ch.B||null)){ same++; return; }
    const nid=ex?newId(r):id, e=structuredClone(/** @type {any} */(ch)); e.B=fixCid(ch.B==null?null:ch.B,nid); e.created=ch.created||Date.now(); e.t=Date.now(); r.chars[nid]=e; add++; });
  return /** @type {any} */ ({add, same});
}
function bkpMergeStep3(r, add, same){
const g=document.getElementById("hgrid"); if(g) g.innerHTML=homeCards(true); const hs=document.querySelector("#homeV .hslots b"); if(hs) hs.textContent=Object.keys(r.chars).length;
  const bk=document.getElementById("bkp"); if(bk) bk.remove();
  toast(add?"Added "+add+" character"+(add===1?"":"s")+(same?". "+same+" already on this device":""):"All characters in this backup are already on this device");
}
/* v22 RU80: a build file. The builder works out the sheet. The character is added, then the builder opens to show what is missing or breaks a rule */
function impBuild(b,o){
 ({b}=impBuild2Step1(b)); if(!b||typeof b!=="object"||!(b.cls||b["class"])){ toast("This build has no class, so it cannot be opened."); return; }
  if(!(o&&"_coins" in o)){ const cz=b.coins&&typeof b.coins==="object"?b.coins:(typeof b.gp==="number"||/^\d+(\.\d+)?$/.test(String(b.gp==null?"":b.gp))?{gp:+b.gp}:null); o=Object.assign({},o||{},{_coins:cz?coinsClean(cz):null}); }/* v34 p06 */
  impBuild2Step2(b);
 impBuild2Step3(b);
  if(!env.__bldSheetFor||!env.__bldNorm){ toast("The builder is still loading. Try again in a moment."); return; }
  if(!(o&&o._ok)){ const nm0=env.__bldNorm(b); if(nm0.err.length){ toast("This build cannot be opened: "+nm0.err.join(". ")+"."); return; }/* v22 RU80b, Q1, Q2 */
    b=nm0.b; const chk=env.__bldCheck?env.__bldCheck(b):{err:[]}; if(chk.err.length){ toast("This build cannot be opened: "+chk.err.join(". ")+"."); return; }
    let still=[]; try{ still=(env.__bldChoiceList?env.__bldChoiceList(b):[]).filter((c) =>{ return !c.done; }).map((c) =>{ return c.title; }); }catch(er){ still=[]; }/* v34 p07 */
    if(nm0.notes.length||still.length){ const bb=b; ask("Open this build?"+(nm0.notes.length?" To fit the app and the 2024 rules, these changes are made:\n"+nm0.notes.map((x) =>{ return "\u2022 "+x+"."; }).join("\n"):"")+(still.length?"\nStill to choose ("+still.length+"): "+still.join(", ")+".":"")+"\nThe builder opens next and marks anything still missing.","Open Build",() =>{ impBuild(bb,Object.assign({},o||{},{_ok:1})); }); return; } }
  const {C2}=impBuild2Step4(b); if(!C2||!C2.abilities){ toast("This build could not be read. Check the class, species, and background names."); return; }
  const nm=String(b.name||(o&&o.name)||C2.name||"Character");
 impBuild2Step5(b, nm);
 impBuild2Step6(C2, nm);
  const {r, nid}=impBuild2Step7(); r.chars[nid]={created:Date.now(),name:nm,sub:(C2.species||"")+" "+(C2.clsLabel||((C2.cls||"")+" "+(C2.level||1))),B:JSON.stringify(b),C:JSON.stringify(C2),S:o&&o._coins?JSON.stringify({coins:o._coins,coinBase:num(C2.gp,0)}):null,t:Date.now()};
  if(!rSave(r)) return;
 impBuild2Step8(r, nid); }
function impBuild2Step1(b){
 ({b}=impBuildStep1(b));
  return /** @type {any} */ ({b});
}
function impBuild2Step2(b){
  impBuildStep2(b);
}
function impBuild2Step3(b){
 impBuildStep3(b);
}
function impBuild2Step4(b){
  let {C2}=impBuildStep4(b);
  return /** @type {any} */ ({C2});
}
function impBuild2Step5(b, nm){
 impBuildStep5(b, nm);
}
function impBuild2Step6(C2, nm){
 impBuildStep6(C2, nm);
}
function impBuild2Step7(){
  const {r, nid}=impBuildStep7();
  return /** @type {any} */ ({r, nid});
}
function impBuild2Step8(r, nid){
 impBuildStep8(r, nid);
}
function impBuildStep1(b){
if(typeof b==="string"){ try{ b=JSON.parse(b); }catch(e){ b=null; } }
  return /** @type {any} */ ({b});
}
function impBuildStep2(b){
  delete b.coins;
}
function impBuildStep3(b){
if(typeof b.gp!=="undefined") delete b.gp;
}
function impBuildStep4(b){
  let C2=null; try{ C2=env.__bldSheetFor(b); }catch(e){ C2=null; }
  return /** @type {any} */ ({C2});
}
function impBuildStep5(b, nm){
b.name=nm;
}
function impBuildStep6(C2, nm){
C2.name=nm;
}
function impBuildStep7(){
  const r=rSnap(rEnsure()), nid=newId(r);
  return /** @type {any} */ ({r, nid});
}
function impBuildStep8(r, nid){
try{ __store.setItem("cs-edit","1"); }catch(e){} sessionStorage.setItem("cs-skip","1"); rLoad(r,nid,false);
}
export function chCheck(o){ if(!o||o.kind!=="character"||typeof o.C!=="string") return "This is not a character file from this app.";
  try{ const c=JSON.parse(o.C); if(!c||!c.abilities) throw 0; if(o.S!=null){ const s=JSON.parse(o.S); if(s!==null&&typeof s!=="object") throw 0; } if(o.B!=null){ const b=JSON.parse(o.B); if(b!==null&&typeof b!=="object") throw 0; } }catch(e){ return "The character file is damaged."; } return ""; }
function impChar(o){ const err=chCheck(o); if(err){ toast(err); return; }
  const {r, id, ex, nm, go}=impCharStep1(o);
  if(ex){ if(ex.C===o.C&&(ex.S||null)===(o.S||null)&&(ex.B||null)===(o.B||null)){ toast(nm+" is already on this device, unchanged"); return; }
    ask(nm+" is already on this device. Replace it with the file (saved "+(o.saved?fmtT(Date.parse(o.saved)):"at an unknown date")+"), or add the file as another character? A snapshot of the current one is kept before replacing.","Replace",() =>{ go(id,true); },["Add as New",function(){ go(newId(r),false); }]); return; }
  go(id,false); }
function impCharStep1(o){
  if((+o.appVer||0)>APP_VER) toast("This file was made with a newer version of the app. Parts this version does not know are kept.");
  const r=rSnap(rEnsure()), id=o.id&&/^[A-Za-z0-9_-]{1,40}$/.test(o.id)?o.id:newId(r), ex=r.chars[id], nm=o.name||cOf(o.C).name||"Character";
  const go=function(nid,replace){ if(replace) snTake(nid,"Before Open Character",r); const e=replace?r.chars[nid]:{created:Date.now()}, cc=cOf(o.C);
    e.name=nm; e.sub=(cc.species||"")+" "+(cc.clsLabel||((cc.cls||"")+" "+(cc.level||1))); e.B=fixCid(o.B==null?null:o.B,nid); e.C=o.C; e.S=o.S==null?null:o.S; e.t=Date.now(); r.chars[nid]=e;
    if(!rSave(r)) return; const f=uiGet("cs-ui-files"); f[nid]={h:rawHash({B:e.B,C:e.C,S:e.S}),t:Date.now()}; uiSet("cs-ui-files",f);
    sessionStorage.setItem("cs-skip","1"); rLoad(r,nid,false); };
  return /** @type {any} */ ({r, id, ex, nm, go});
}
