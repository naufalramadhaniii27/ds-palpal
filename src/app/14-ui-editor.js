import {ABK,ABN} from "./02-data-default-character.js";
import {C,FROZEN,lsSave,lsSet} from "./04-logic-storage.js";
import {$,$$,eqOn,esc,num,sg} from "./05-logic-helpers.js";
import {D} from "./06-logic-derivation.js";
import {__set_navStack,navStack,openSheet,sheetMode} from "./12-ui-bottom-sheet-modal.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"BKEY",{get:function(){return BKEY;},set:function(v){BKEY=v;},configurable:true});
Object.defineProperty(__R,"rGet",{get:function(){return rGet;},set:function(v){rGet=v;},configurable:true});
/* ================= EDITOR ================= */
export var edTab="id";
const ED_TABS=[["id","Identity"],["ab","Abilities"],["sk","Skills"],["cb","Combat"],["at","Attacks"],["iv","Inventory"],["lu","Limited Use"],["ac","Actions"],["ft","Features"]];
function inp(path,val,o){
  o=o||{};
  const t=o.t||"s", type=o.type||(t==="n"?"number":"text");
  if(type==="textarea") return '<textarea class="ed-in" data-p="'+path+'" data-t="'+t+'" rows="'+(o.rows||3)+'"'+(o.ph?' placeholder="'+esc(o.ph)+'"':'')+'>'+esc(val)+'</textarea>';
  if(type==="select") return '<select class="ed-in'+(o.cls?' '+o.cls:'')+'" data-p="'+path+'" data-t="'+t+'">'+o.opts.map((op) =>{ return '<option value="'+esc(op[0])+'"'+(String(op[0])===String(val)?' selected':'')+'>'+esc(op[1])+'</option>'; }).join("")+'</select>';
  if(type==="check") return '<label class="ed-ck"><input type="checkbox" data-p="'+path+'" data-t="b"'+(val?' checked':'')+'>'+esc(o.label||"")+'</label>';
  return '<input class="ed-in'+(o.cls?' '+o.cls:'')+'" type="'+type+'" data-p="'+path+'" data-t="'+t+'" value="'+esc(val)+'"'+(o.ph?' placeholder="'+esc(o.ph)+'"':'')+(t==="n"?' inputmode="decimal" step="any"':'')+'>';
}
function fld(label,html,cls){ return '<label class="ed-f'+(cls?' '+cls:'')+'"><span>'+label+'</span>'+html+'</label>'; }
function bonusList(path,arr,addLabel){
  return (arr||[]).map((b,i) =>{ return '<div class="ed-bon">'+inp(path+'.'+i+'.s',b.s,{ph:"Source"})+inp(path+'.'+i+'.v',b.v,{t:"n"})+'<button type="button" class="ed-x" data-act="del" data-list="'+path+'" data-i="'+i+'" aria-label="Remove">✕</button></div>'; }).join("")+
    '<button type="button" class="ed-mini" data-act="add" data-list="'+path+'" data-tpl="bonus">+ '+addLabel+'</button>';
}
const ABOPTS=ABK.map((k) =>{return [k,k]});
function edHTML(){
  let {h}=edHTMLStep1();
  ({h}=edHTMLStep2(h));
  return h;
}
function edHTMLStep1(){
  let h='<div class="ed-nav">'+ED_TABS.map((t) =>{return '<button type="button" data-edtab="'+t[0]+'" class="'+(edTab===t[0]?'on':'')+'">'+t[1]+'</button>'}).join("")+'</div>';
  h+='<div class="ed-sec'+(edTab==="id"?' on':'')+'" data-sec="id"><p class="ed-help">Every change applies right away and is saved on this device. Level drives Proficiency Bonus, Hit Points, and Hit Dice automatically.</p><div class="ed-grid">'+
    fld("Name",inp("name",C.name),"w2")+fld("Species",inp("species",C.species))+fld("Size",inp("size",C.size))+
    fld("Class",inp("cls",C.cls))+fld("Subclass",inp("sub",C.sub))+fld("Background",inp("bg",C.bg))+
    fld("Level",inp("level",C.level,{t:"n"}))+fld("Hit Die",inp("hitDie",C.hitDie,{type:"select",t:"n",opts:[[6,"d6"],[8,"d8"],[10,"d10"],[12,"d12"]]}))+
    fld("Title on ID card",inp("office",C.office),"w2")+fld("Record number (optional)",inp("cardNo",C.cardNo))+
    fld("Roll record",inp("rolledNote",C.rolledNote),"full")+'</div></div>';
  h+='<div class="ed-sec'+(edTab==="ab"?' on':'')+'" data-sec="ab"><p class="ed-help">Rolled score plus every bonus, each with its source. Tick Saving Throw for proficient saves.</p><div class="ed-ab">'+ABK.map((k) =>{
    const a=C.abilities[k], sv=C.saves&&C.saves[k];
    return '<div class="ed-card"><div class="ed-ct"><b>'+ABN[k]+'</b><span class="ed-res"><em>'+D.score[k]+'</em>'+sg(D.mod[k])+'</span></div>'+
      fld("Rolled score",inp("abilities."+k+".base",a.base,{t:"n"}))+
      '<div class="ed-f" style="margin-top:8px"><span>Bonuses</span></div>'+bonusList("abilities."+k+".bonus",a.bonus,"Add bonus")+
      '<label class="ed-ck" style="margin-top:6px"><input type="checkbox" data-act="save" data-k="'+k+'"'+(sv?' checked':'')+'>Saving Throw proficiency</label>'+
      (sv?inp("saves."+k,sv,{ph:"Source of save proficiency"}):'')+'</div>';
  }).join("")+'</div></div>';
  h+='<div class="ed-sec'+(edTab==="sk"?' on':'')+'" data-sec="sk"><p class="ed-help">Set proficiency, where it comes from, and any Disadvantage note.</p>'+C.skills.map((s,i) =>{
    return '<div class="ed-sk"><b>'+esc(s.n)+'<small>'+s.ab+' \u00b7 '+sg(D.skill[i])+'</small></b>'+
      inp("skills."+i+".p",num(s.p,0),{type:"select",t:"n",opts:[[0,"None"],[1,"Proficient"],[2,"Expertise"]]})+
      inp("skills."+i+".src",s.src||"",{ph:"Source, e.g. Soldier background",cls:"src"})+
      inp("skills."+i+".dis",s.dis||"",{ph:"Disadvantage from",cls:"src"})+'</div>';
  }).join("")+'</div>';
  h+='<div class="ed-sec'+(edTab==="cb"?' on':'')+'" data-sec="cb"><div class="ed-grid">'+
    fld("Base AC",inp("ac.base",C.ac.base,{t:"n"}))+fld("Base AC source",inp("ac.baseSrc",C.ac.baseSrc),"w2")+
    fld("Dexterity to AC",inp("ac.dex",C.ac.dex,{type:"select",opts:[["none","None (Heavy armor)"],["max2","Up to +2 (Medium)"],["max3","Up to +3 (Medium Armor Master)"],["full","Full (Light or none)"]]}))+
    '</div><div class="ed-f" style="margin-top:10px"><span>AC bonuses</span></div>'+bonusList("ac.bonus",C.ac.bonus,"Add AC bonus")+
    '<div class="ed-grid" style="margin-top:14px">'+fld("Speed (ft)",inp("speed",C.speed,{t:"n"}))+fld("Speed source",inp("speedSrc",C.speedSrc),"w2")+
    fld("Darkvision (ft)",inp("darkvision",C.darkvision,{t:"n"}))+fld("Darkvision source",inp("darkSrc",C.darkSrc),"w2")+'</div>'+
    '<div class="ed-f" style="margin-top:14px"><span>Initiative bonuses (Dexterity is added automatically)</span></div>'+bonusList("initBonus",C.initBonus,"Add Initiative bonus")+
    '<div class="ed-f" style="margin-top:14px"><span>Hit Point bonuses, e.g. Tough feat</span></div>'+bonusList("hpBonus",C.hpBonus,"Add HP bonus")+
    '<div class="ed-grid" style="margin-top:14px">'+fld("Armor proficiencies",inp("profs.armor",C.profs.armor),"full")+fld("Weapon proficiencies",inp("profs.weapons",C.profs.weapons),"full")+fld("Tool proficiencies",inp("profs.tools",C.profs.tools),"full")+'</div></div>';
  h+='<div class="ed-sec'+(edTab==="at"?' on':'')+'" data-sec="at"><p class="ed-help">Hit is calculated from the ability and Proficiency Bonus. Damage adds the ability modifier to the die.</p>'+(C.attacks||[]).map((a,i) =>{
    const p="attacks."+i;
    return '<div class="ed-card"><div class="ed-ct"><b>'+esc(a.n||"Attack")+' <span style="color:var(--stamp)">'+sg(D.atk[i].hit)+' / '+esc(D.atk[i].dmg)+'</span></b><button type="button" class="ed-del" data-act="del" data-list="attacks" data-i="'+i+'">Remove</button></div><div class="ed-grid">'+
      fld("Name",inp(p+".n",a.n))+fld("Properties",inp(p+".sub",a.sub),"w2")+fld("Ability",inp(p+".ab",a.ab,{type:"select",opts:ABOPTS}))+
      fld("Damage die",inp(p+".die",a.die))+fld("Die source",inp(p+".dieSrc",a.dieSrc),"w2")+fld("Damage type",inp(p+".type",a.type))+
      fld("Range",inp(p+".range",a.range))+fld("Mastery",inp(p+".m",a.m))+fld("Other hit bonus",inp(p+".misc",a.misc||0,{t:"n"}))+fld("Bonus source",inp(p+".miscSrc",a.miscSrc||""))+
      fld("Notes",inp(p+".note",a.note),"full")+'<div class="ed-f">'+inp(p+".prof",a.prof,{type:"check",label:"Proficient"})+'</div></div></div>';
  }).join("")+'<button type="button" class="ed-add" data-act="add" data-list="attacks" data-tpl="attack">+ Add attack</button></div>';
  h+='<div class="ed-sec'+(edTab==="iv"?' on':'')+'" data-sec="iv"><div class="ed-grid" style="margin-bottom:12px">'+fld("Gold (GP)",inp("wallet.gp",__R.coinsNow().gp,{t:"n"}))+fld("Equipment note",inp("equipNote",C.equipNote),"full")+'</div>'+(C.inv||[]).map((it,i) =>{
    const p="inv."+i;
    return '<div class="ed-card"><div class="ed-ct"><b>'+esc(it.n||"Item")+'</b><button type="button" class="ed-del" data-act="del" data-list="inv" data-i="'+i+'">Remove</button></div><div class="ed-grid">'+
      fld("Name",inp(p+".n",it.n),"w2")+fld("Quantity",inp(p+".q",it.q,{t:"n"}))+fld("Weight each (lb)",inp(p+".w",it.w,{t:"n"}))+
      fld("Description",inp(p+".d",it.d||""),"full")+'<div class="ed-f">'+inp(p+".eq",eqOn(it),{type:"check",label:"Worn"})+'</div></div></div>';
  }).join("")+'<button type="button" class="ed-add" data-act="add" data-list="inv" data-tpl="item">+ Add item</button></div>';
  return /** @type {any} */ ({h});
}
function edHTMLStep2(h){
  h+='<div class="ed-sec'+(edTab==="lu"?' on':'')+'" data-sec="lu"><p class="ed-help">Hit Dice follow your level. A multiclass character has one Hit Dice row per die type. Short Rest options: all uses back, or one use back (like Second Wind).</p>'+(C.res||[]).map((r,i) =>{
    const p="res."+i;
    return '<div class="ed-card"><div class="ed-ct"><b>'+esc(r.n||"Resource")+'</b><button type="button" class="ed-del" data-act="del" data-list="res" data-i="'+i+'">Remove</button></div><div class="ed-grid">'+
      fld("Name",inp(p+".n",r.n))+(r.auto==="level"?fld("Uses","<span class='ed-in' style='display:flex;align-items:center'>Equal to level ("+D.level+")</span>"):fld("Uses",inp(p+".max",r.max,{t:"n"})))+
      (r.auto==="level"||r.die?'':fld("Label",inp(p+".tag",r.tag)))+
      fld("Recovers on",inp(p+".reset",r.reset,{type:"select",opts:[["short","Short or Long Rest (all)"],["short1","Short Rest: 1, Long Rest: all"],["long","Long Rest only"],["none","Never (consumable)"]]}))+'</div></div>';
  }).join("")+'<button type="button" class="ed-add" data-act="add" data-list="res" data-tpl="res">+ Add limited use</button></div>';
  h+='<div class="ed-sec'+(edTab==="ac"?' on':'')+'" data-sec="ac"><p class="ed-help">Use **bold** for bold text and [[Term]] to link a rules term. Tokens update by themselves: {dc} Grapple DC, {level} level, {pb} Proficiency Bonus, {unarmed} Unarmed Strike damage.</p>'+(C.actions||[]).map((a,i) =>{
    const p="actions."+i;
    return '<div class="ed-card"><div class="ed-ct"><b>'+esc(a.n||"Action")+'</b><button type="button" class="ed-del" data-act="del" data-list="actions" data-i="'+i+'">Remove</button></div><div class="ed-grid">'+
      fld("Name",inp(p+".n",a.n),"w2")+fld("Type",inp(p+".c",a.c,{type:"select",opts:[["Actions","Action"],["Bonus Actions","Bonus Action"],["Reactions","Reaction"],["Other","Other"]]}))+fld("Tag",inp(p+".t",a.t))+
      fld("Description",inp(p+".d",a.d,{type:"textarea",rows:3}),"full")+'</div></div>';
  }).join("")+'<button type="button" class="ed-add" data-act="add" data-list="actions" data-tpl="action">+ Add action</button></div>';
  h+='<div class="ed-sec'+(edTab==="ft"?' on':'')+'" data-sec="ft"><p class="ed-help">Write the source the way D&amp;D Beyond does, e.g. "PHB-2024, Fighter 5". Use **bold** for bold text and [[Term]] to link a rules term, e.g. [[Grappled]] or [[Advantage]].</p>'+(C.features||[]).map((g,gi) =>{
    const gp="features."+gi;
    return '<div class="ed-card"><div class="ed-ct"><b>Group</b><button type="button" class="ed-del" data-act="del" data-list="features" data-i="'+gi+'">Remove group</button></div><div class="ed-grid">'+fld("Group name",inp(gp+".g",g.g),"full")+'</div>'+
      (g.items||[]).map((f,fi) =>{ const p=gp+".items."+fi; return '<div class="ed-card" style="margin-top:10px;background:var(--panel)"><div class="ed-ct"><b>'+esc(f.n||"Feature")+'</b><button type="button" class="ed-del" data-act="del" data-list="'+gp+'.items" data-i="'+fi+'">Remove</button></div><div class="ed-grid">'+
        fld("Name",inp(p+".n",f.n))+fld("Source",inp(p+".s",f.s),"w2")+fld("Description",inp(p+".d",f.d,{type:"textarea",rows:3}),"full")+'</div></div>'; }).join("")+
      '<button type="button" class="ed-mini" data-act="add" data-list="'+gp+'.items" data-tpl="feature">+ Add feature to this group</button></div>';
  }).join("")+'<button type="button" class="ed-add" data-act="add" data-list="features" data-tpl="group">+ Add group</button></div>';
  h+='<div class="ed-card" style="margin-top:14px"><div class="ed-ct"><b>Import build</b></div><p class="ed-help">Paste the text from PHB 2024 Builder (Export), then tap Apply. This replaces the build. Notes, HP, and conditions stay.</p><textarea id="impTxt" class="ed-in" rows="4" style="width:100%;font-family:var(--f-type);font-size:12px" placeholder="Paste exported build here"></textarea><div style="display:flex;gap:8px;margin-top:8px"><button type="button" class="btn press" data-act="impApply" style="flex:1">Apply import</button><button type="button" class="btn press" data-act="impCopy" style="flex:1">Copy current build</button></div></div>';
  h+='<div class="ed-foot"><p>Saved automatically on this device.</p><button type="button" class="btn warn press" data-act="reset">Clear Build</button></div>';
  return /** @type {any} */ ({h});
}
export var TPL={
  bonus:function(){return {s:"",v:1}},
  attack:function(){return {n:"New attack",sub:"",ab:"STR",prof:true,die:"1d6",dieSrc:"",type:"",range:"5 ft",m:"",note:""}},
  item:function(){return {n:"New item",q:1,w:0,eq:false,d:""}},
  res:function(){return {k:"r"+Date.now().toString(36),n:"New resource",tag:"",max:1,reset:"long"}},
  action:function(){return {c:"Actions",n:"New action",t:"",d:""}},
  feature:function(){return {n:"New feature",s:"",d:""}},
  group:function(){return {g:"New group",items:[]}}
};
export function getPath(o,path){ return path.split(".").reduce((a,k) =>{ return a==null?a:a[k]; },o); }
export function setPath(o,path,v){ const ks=path.split("."), last=ks.pop(), t=ks.reduce((a,k) =>{ if(a[k]==null) a[k]={}; return a[k]; },o); t[last]=v; }
let rT2=null;
export function scheduleRender(){ clearTimeout(rT2); rT2=setTimeout(() =>{ __R.renderAll(); refreshEdLive(); },90); }
function refreshEdLive(){
  if(sheetMode!=="edit") return;
  $$("#sheetBody .ed-card").forEach(() =>{});
  const body=$("#sheetBody"), st=body.scrollTop, a=document.activeElement, ap=a&&a.getAttribute&&a.getAttribute("data-p"), sel=a&&a.selectionStart;
  /* only update the live result labels, never the field being typed in */
  const tmp=document.createElement("div"); tmp.innerHTML=edHTML();
  const fresh=$$(".ed-res, .ed-ct b, .ed-sk>b small",tmp), old=$$(".ed-res, .ed-ct b, .ed-sk>b small",body);
  if(fresh.length===old.length) old.forEach((el,i) =>{ if(el.innerHTML!==fresh[i].innerHTML) el.innerHTML=fresh[i].innerHTML; });
  body.scrollTop=st;
}
export function rerenderEditor(){ const body=$("#sheetBody"), st=body.scrollTop; body.innerHTML=edHTML(); body.scrollTop=st; }
export function openEditor(){ __set_navStack([]); openSheet("Edit "+C.name, edHTML(), "edit", true); }

export var RKEY="cs-roster-v1",BKEY="phb24-builder-v1";
export function rGet(){try{return JSON.parse(__store.getItem(RKEY))}catch(e){return null}}
export function rSave(r){return lsSave(RKEY,r)}/* v18 RU61: failure shows the caution bar */
export function setOrDel(k,v){if(FROZEN)return;if(v==null){try{__store.removeItem(k)}catch(e){}}else lsSet(k,v)}
export function rEnsure(){let r=rGet();if(!r||!r.chars||!r.chars[r.active]){const id="c"+Date.now();r={active:id,chars:{}};r.chars[id]=__R.PUBLIC_FRESH?{name:"New Character",ph:1,created:Date.now(),t:Date.now()}:{name:C.name};}return r}

export function __set_edTab(v){ return edTab=v; }
