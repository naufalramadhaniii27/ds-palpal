import {CKEY,FROZEN,KEY,lsGet,lsSet} from "./04-logic-storage.js";
import {$,__set_toastT,esc,toast,toastT} from "./05-logic-helpers.js";
import {__set_navStack,navStack,openSheet} from "./12-ui-bottom-sheet-modal.js";
import {closeSheet} from "./13-ui-detail-cards.js";
import {BKEY,rGet,rSave} from "./14-ui-editor.js";
import {ico} from "./23-ui-uses-items-coins-rest-spell-dc.js";
import {syText} from "./43-logic-cloud-sync.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"mgNotice",{get:function(){return mgNotice;},set:function(v){mgNotice=v;},configurable:true});
Object.defineProperty(__R,"mgSet",{get:function(){return mgSet;},set:function(v){mgSet=v;},configurable:true});
Object.defineProperty(__R,"syBaseGet",{get:function(){return syBaseGet;},set:function(v){syBaseGet=v;},configurable:true});
Object.defineProperty(__R,"syBaseSet",{get:function(){return syBaseSet;},set:function(v){syBaseSet=v;},configurable:true});
Object.defineProperty(__R,"syMerge",{get:function(){return syMerge;},set:function(v){syMerge=v;},configurable:true});
/* T11 G3 N12 Merge per part. When this device and the cloud both changed one character since the last sync, the app compares three
   copies like git does: the last synced copy (base, kept per character under cs-sync-base-<id>), this device, and the cloud.
   A part changed on one side only is taken from that side. A part changed on both sides in different ways keeps this device's value,
   the cloud copy is still kept as a version by the server (as before), and the person can pick the other device's value per part later.
   Parts are the keys of the build (B), the character (C) and the sheet state (S), and one level deeper for objects such as notes.
   The open list of such parts is kept under cs-sync-mg-<id> until the person chooses or dismisses it. */
var SYB="cs-sync-base-", SYM="cs-sync-mg-";
function syBaseSet(id,text){ try{ if(text==null) __store.removeItem(SYB+id); else __store.setItem(SYB+id,text); }catch(e){} }
function syBaseGet(id){ try{ return __store.getItem(SYB+id); }catch(e){ return null; } }
function mgPlain(o){ return o&&typeof o==="object"&&!Array.isArray(o); }
function mgJ(v){ return v===undefined?undefined:JSON.stringify(v); }
/* three objects to one. Changes on one side are taken, the same change on both is taken once, different changes keep "l" and are listed */
function mgObj(b,l,r,path,out,depth){ var m={}, seen={};
  [l,r,b].forEach(function(o){ if(mgPlain(o)) Object.keys(o).forEach(function(k){ seen[k]=1; }); });
  Object.keys(seen).forEach(function(k){ var bv=mgPlain(b)?b[k]:undefined, lv=l[k], rv=r[k], bj=mgJ(bv), lj=mgJ(lv), rj=mgJ(rv), v;
    if(lj===rj) v=lv; else if(lj===bj) v=rv; else if(rj===bj) v=lv;
    else if(depth<2&&mgPlain(lv)&&mgPlain(rv)) v=mgObj(mgPlain(bv)?bv:{},lv,rv,path.concat(k),out,depth+1);
    else { v=lv; out.push({p:path.concat(k),r:rj}); }
    if(v!==undefined) m[k]=v; });
  return m; }
/* base, local and cloud texts of one roster entry. Answers {text, parts} or null when a text cannot be read */
function syMerge(bt,lt,rt){ var b,l,r; try{ b=JSON.parse(bt); l=JSON.parse(lt); r=JSON.parse(rt); }catch(e){ return null; }
  if(!mgPlain(b)||!mgPlain(l)||!mgPlain(r)) return null; var parts=[], out={};
  var keys={}; [b,l,r].forEach(function(o){ Object.keys(o).forEach(function(k){ keys[k]=1; }); });
  Object.keys(keys).forEach(function(k){ var bv=b[k], lv=l[k], rv=r[k];
    if(lv===rv){ if(lv!==undefined) out[k]=lv; return; } if(lv===bv){ if(rv!==undefined) out[k]=rv; return; } if(rv===bv){ if(lv!==undefined) out[k]=lv; return; }
    if(k==="name"||k==="sub"){ out[k]=lv; return; }/* the card text follows C, which is merged below */
    var bo=null, lo=null, ro=null; try{ bo=JSON.parse(bv||"null"); lo=JSON.parse(lv||"null"); ro=JSON.parse(rv||"null"); }catch(e){}
    if(mgPlain(lo)&&mgPlain(ro)){ var pp=[]; out[k]=JSON.stringify(mgObj(mgPlain(bo)?bo:{},lo,ro,[k],pp,0)); parts=parts.concat(pp); }
    else { out[k]=lv; parts.push({p:[k],r:rv===undefined?undefined:JSON.stringify(rv)}); } });
  try{ var c=JSON.parse(out.C||"null"); if(c&&c.name) out.name=c.name; }catch(e){}
  return {text:syText(out),parts:parts}; }
/* words for a part, plain enough for the choice list */
var MG_S={hp:"Hit points",tmp:"Temporary HP",used:"Used uses and slots",insp:"Heroic Inspiration",ds:"Death saves",cond:"Conditions",exh:"Exhaustion",notes:"Notes",lang:"Languages",portrait:"Portrait",coins:"Coins",align:"Alignment",theme:"Look",color:"Colour",lifestyle:"Lifestyle"};
var MG_C={name:"Name",level:"Level",abilities:"Ability scores",inv:"Inventory",gp:"Gold",attacks:"Attacks",features:"Features",skills:"Skills",saves:"Saving throws",profs:"Proficiencies",ac:"Armor Class",actions:"Actions",res:"Resources",equipNote:"Equipment note"};
function mgLabel(p){ var s=p[0], k=p[1], k2=p[2];
  if(s==="S"){ var w=MG_S[k]||("Sheet: "+k); return k2!=null?w+": "+k2:w; }
  if(s==="C") return (MG_C[k]||("Character: "+k))+(k2!=null?": "+k2:"");
  if(s==="B") return "Builder choices"; return String(p.join(" ")); }
function mgGet(id){ try{ var o=JSON.parse(__store.getItem(SYM+id)||"null"); return o&&o.parts&&o.parts.length?o:null; }catch(e){ return null; } }
function mgSet(id,o){ try{ if(!o||!o.parts.length) __store.removeItem(SYM+id); else __store.setItem(SYM+id,JSON.stringify(o)); }catch(e){} }
/* the other device's value of one part, written into the character. The open character is written to its slots and the page reloads */
function mgUse(id,i){ var o=mgGet(id); if(!o) return; var q=o.parts[i]; if(!q) return; var r=rGet(); if(!r||!r.chars||!r.chars[id]) return;
  var act=id===r.active&&!FROZEN, slot={B:BKEY,C:CKEY,S:KEY}[q.p[0]], cur;
  try{ cur=act&&slot?JSON.parse(lsGet(slot)||"null"):JSON.parse(r.chars[id][q.p[0]]||"null"); }catch(e){ cur=null; }
  if(q.p.length===1){ cur=q.r===undefined?null:JSON.parse(q.r); }
  else { if(!mgPlain(cur)) return; var o2=cur; for(var j=1;j<q.p.length-1;j++){ if(!mgPlain(o2[q.p[j]])) o2[q.p[j]]={}; o2=o2[q.p[j]]; } var last=q.p[q.p.length-1]; if(q.r===undefined) delete o2[last]; else o2[last]=JSON.parse(q.r); }
  o.parts.splice(i,1); mgSet(id,o);
  if(act&&slot){ if(cur==null) lsSet(slot,""); else lsSet(slot,JSON.stringify(cur)); location.reload(); return true; }
  r.chars[id][q.p[0]]=cur==null?null:JSON.stringify(cur); rSave(r); return false; }
/* the value of a part here, for the choice list. Short plain values are shown, longer ones are described */
function mgCur(id,p){ var r=rGet(), act=r&&id===r.active&&!FROZEN, slot={B:BKEY,C:CKEY,S:KEY}[p[0]], o;
  try{ o=act&&slot?JSON.parse(lsGet(slot)||"null"):JSON.parse(((r&&r.chars&&r.chars[id])||{})[p[0]]||"null"); }catch(e){ return undefined; }
  for(var j=1;j<p.length;j++){ if(!o||typeof o!=="object") return undefined; o=o[p[j]]; } return o; }
function mgShow(v){ if(v===undefined||v===null||v==="") return "empty"; if(typeof v==="number"||typeof v==="boolean") return String(v);
  if(typeof v==="string") return v.length>40?v.slice(0,38)+"…":v; return null; }
function mgOpen(id){ var o=mgGet(id); if(!o){ if(typeof closeSheet==="function") closeSheet(); return; }
  var row=function(q,i){ var here=mgShow(mgCur(id,q.p)), there=mgShow(q.r===undefined?undefined:JSON.parse(q.r));
    return '<div class="mg-row"><span><b>'+esc(mgLabel(q.p))+'</b><small>'+(here!=null&&there!=null?'This device: '+esc(here)+'. Other device: '+esc(there)+'.':'Changed differently on both devices.')+'</small></span><button type="button" class="btn press" data-mgu="'+i+'" data-mgid="'+esc(id)+'">Use other device</button></div>'; };
  __set_navStack([]); openSheet((o.name||"Character")+": changed on two devices",'<p class="bk-f">Everything else was combined. For these parts, this device\'s value is kept. Pick the other device\'s value where you want it. The full other copy also stays in the cloud history.</p>'+o.parts.map(row).join("")+'<p><button type="button" class="btn press" data-mgx="'+esc(id)+'">Keep this device for all</button></p>',"mg"); }
/* after a sync: one quiet notice per character that has parts to choose, the same toast shape as the update receipts */
function mgNotice(){ var r=rGet(); if(!r||!r.chars) return; var ids=Object.keys(r.chars).filter(function(id){ return mgGet(id); }); if(!ids.length) return;
  var id=ids.indexOf(r.active)>=0?r.active:ids[0], o=mgGet(id); if(o.shown) return; o.shown=1; mgSet(id,o);
  setTimeout(function(){ var t=$("#toast"); if(!t) return; t.innerHTML=ico("toast-ok","tico")+'<span>Combined changes from your other device. '+o.parts.length+(o.parts.length===1?' part was':' parts were')+' changed on both.</span><button type="button" class="tundo" data-mgo="'+esc(id)+'">Choose</button>'; t.classList.add("on","act"); if(window.__topLayer) window.__topLayer(t); clearTimeout(toastT); __set_toastT(setTimeout(function(){ t.classList.remove("on","act"); },9000)); },1200); }
document.addEventListener("click",function(e){ var b=e.target.closest&&e.target.closest("[data-mgo],[data-mgu],[data-mgx]"); if(!b) return;
  if(b.hasAttribute("data-mgo")){ $("#toast").classList.remove("on","act"); mgOpen(b.getAttribute("data-mgo")); return; }
  if(b.hasAttribute("data-mgx")){ mgSet(b.getAttribute("data-mgx"),null); closeSheet(); return; }
  var id=b.getAttribute("data-mgid"); if(mgUse(id,+b.getAttribute("data-mgu"))) return; if(mgGet(id)) mgOpen(id); else { closeSheet(); toast("Done. Both devices will match after the next backup."); } });
window.__syMerge={merge:syMerge,open:mgOpen,get:mgGet,base:syBaseGet};
