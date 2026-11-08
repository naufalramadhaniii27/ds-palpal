import {bindLive,cuK,cuNm,cuNum,lateGet} from "./00a-reg-late-ports.js";/* Responsibility: spell attack and save DC, spell list and its render. Split out of the former single file in SOLID stage 3 (S); runs in the same order as before.
   Touches page globals only through env: __artIc. Shared names with other modules come from the imports below, late names through __R. */
import {C} from "./04-logic-storage.js";
import {esc,num,sg} from "./05-logic-helpers.js";
import {B,D,part} from "./06-logic-derivation.js";
import {esArt} from "./08c-ui-render-inventory-features-notes.js";
import {spEffH,spGrpLv,spRangeH,spRowLv} from "./22-ui-spell-data-and-slots.js";

import {env} from "./00-env.js";
import {ico,spSlotsH} from "./23-ui-uses-items-coins-rest-spell-dc.js";import {spUpMax} from "./25-ui-settings-appearance.js";import {spUpOk} from "./25-ui-settings-appearance.js";import {spUpOn} from "./25-ui-settings-appearance.js";
bindLive("ordL",{get:function(){return ordL;}});
bindLive("renderSpells",{get:function(){return renderSpells;}});
bindLive("scAdj",{get:function(){return scAdj;}});
bindLive("scOf",{get:function(){return scOf;}});
bindLive("spF",{get:function(){return spF;},set:function(v){spF=v;}});
bindLive("spQ",{get:function(){return spQ;},set:function(v){spQ=v;}});
export function ordL(n){return n===0?"Cantrip":n+(n===1?"st":n===2?"nd":n===3?"rd":"th")+" Level"}
var spQ="",spF="all";
/* Spells tab header: Modifier, Spell Attack, Save DC, then slots. Numbers come from C.spellcasting (builder).
   M9: C.spellcasting.by (2+ abilities, multiclass or species): one header per source, and each spell uses the numbers of its ability (C.spells[].ab) */
/* v19 RL44: spell attack shown with Exhaustion */
export function scAdj(sc){ if(!sc) return sc; const ex=D&&D.exhN?2*D.exhN:0, o={}; for(const k in sc) o[k]=sc[k]; if(ex) o.atk=num(sc.atk,0)-ex;
  const many=Array.isArray(sc.by)&&sc.by.length>1; if(Array.isArray(sc.by)) o.by=sc.by.map((b) =>{ const c={}; for(const j in b) c[j]=b[j]; if(ex) c.atk=num(b.atk,0)-ex; return many?scCu(c,"-"+b.ab,ex):scCu(c,"",ex,1); });
  return scCu(o,"",ex); }
/* v34 RU85: Spell Attack and Save DC set by you (S.cust "n:spatk", "n:spdc", one pair per ability when 2+ sources), with a breakdown */
function scCu(o,sf,ex,quiet){ const ak="n:spatk"+sf, dk="n:spdc"+sf, a=cuK(ak), d=cuK(dk), av=a?cuNum(a.o):null, dv=d?cuNum(d.o):null, m=num(o.mod,0), pb=D&&D.pb||2, oth=num(o.atk,0)+ex-m-pb, odc=num(o.dc,0)-8-m-pb, src=sf&&o.n?" ("+o.n+")":"";
  const pa=[part("Modifier ("+(o.ab||"")+")",m,"Your spellcasting ability"),part("Proficiency Bonus",pb,"")], pd=[{l:"Base",v:8,note:"",raw:true},part("Modifier ("+(o.ab||"")+")",m,"Your spellcasting ability"),part("Proficiency Bonus",pb,"")];
  if(oth) pa.push(part("Other bonuses",oth,"Items or features")); if(ex) pa.push(part("Exhaustion level "+(ex/2),-ex,"Every D20 Test is 2 lower for each Exhaustion level")); if(odc) pd.push(part("Other bonuses",odc,"Items or features"));
  if(av!=null){ lateGet("CU0")[ak+"|o"]=o.atk; pa.push({l:"Set by you",v:sg(av),note:"Calculated value: "+sg(o.atk)+". Your number replaces it.",raw:true}); o.atk=av; }
  if(dv!=null){ lateGet("CU0")[dk+"|o"]=o.dc; pd.push({l:"Set by you",v:String(dv),note:"Calculated value: "+o.dc+". Your number replaces it.",raw:true}); o.dc=dv; }
  if(B&&!quiet){ B["spatk"+sf]={t:"Spell Attack"+src,parts:pa,total:sg(o.atk),f:""}; B["spdc"+sf]={t:"Spell Save DC"+src,parts:pd,total:String(o.dc),f:"A creature makes its saving throw against this number when your spell asks for one."}; }
  return o; }
/* v26 RU38 no. 2: a spell with its own save DC or spell attack (Customize) */
export function scOf(x){ let r=scOf0(x), c=x&&cuK("s:"+x.n); if(c&&(cuNum(c.dc)!=null||cuNum(c.atk)!=null)){ r=Object.assign({},r); if(cuNum(c.dc)!=null) r.dc=cuNum(c.dc); if(cuNum(c.atk)!=null) r.atk=cuNum(c.atk); } return r; }
function scOf0(x){ let sc=scAdj(C.spellcasting||{}); if(x&&x.itc&&(x.itc.dc!=null||x.itc.atk!=null)){ sc=Object.assign({},sc); if(x.itc.dc!=null) sc.dc=x.itc.dc; if(x.itc.atk!=null) sc.atk=x.itc.atk; return sc; } if(x&&x.ab&&Array.isArray(sc.by)){ const b=sc.by.filter((q) =>{return q.ab===x.ab})[0]; if(b) return b; } return sc; }
function spHeadBy(sc){ return sc.by.map((b) =>{ const sf="-"+b.ab; return '<p class="sp-src">'+esc(b.n)+'</p><div class="sp-head"><div><b>'+sg(b.mod)+'</b><span>Modifier ('+b.ab+')</span></div><div class="bd" data-bd="spatk'+sf+'" role="button" tabindex="0"><b>'+sg(b.atk)+'</b><span>Spell Attack</span></div><div class="bd" data-bd="spdc'+sf+'" role="button" tabindex="0"><b>'+b.dc+'</b><span>Save DC</span></div></div>'; }).join(""); }
function spHead(sc){sc=scAdj(sc);let h=Array.isArray(sc.by)&&sc.by.length>1?spHeadBy(sc):'<div class="sp-head"><div><b>'+sg(sc.mod)+'</b><span>Modifier ('+sc.ab+')</span></div><div class="bd" data-bd="spatk" role="button" tabindex="0"><b>'+sg(sc.atk)+'</b><span>Spell Attack</span></div><div class="bd" data-bd="spdc" role="button" tabindex="0"><b>'+sc.dc+'</b><span>Save DC</span></div></div>';
 const sl=[];(sc.slots||[]).forEach((n,i) =>{sl.push(ordL(i+1).replace(" Level","")+" \u00d7"+n)});if(sc.pact)sl.push("Pact \u00d7"+sc.pact.n+" (level "+sc.pact.lvl+")");if(sl.length)h+='<p class="sp-slots">Slots: '+sl.join(", ")+'. Tick the boxes at each spell level, or in Limited Use on the Actions tab.</p>';
 return h}
export function renderSpells(){
const {el}=renderSpellsStep1();if(!el)return;
const {L, sc, MB}=renderSpellsStep2();
 if(!L.length){el.innerHTML=(sc?spHead(sc):'')+'<div class="empty-note empty-st">'+esArt("book")+'<b>No spells yet</b><span>'+(sc?'Add the cantrips and spells your class can cast. They show here with their slots.':'Spells from your class, species, feats, or magic items show up here.')+'</span><button type="button" class="btn pri press spm-open" data-spman="1">'+ico("tab-spells","ibt")+'Manage Spells</button></div>';return}/* v31 C5 */
 const _renderSpellsStep3=renderSpellsStep3(sc, MB, L);
 const {UP, UPX, q, lv}=_renderSpellsStep3;
 let {h}=_renderSpellsStep3;
 lv.forEach((l) =>{const rows=L.map((x,i) =>{return [x,i]}).filter((p) => renderSpellsFn1(l, UP, UPX, q, L, p)).sort((a,b) =>{return a[0].n<b[0].n?-1:a[0].n>b[0].n?1:a[1]-b[1]});if(!rows.length)return;
  h+='<h3 class="sp-lv"><span>'+ordL(l)+'</span>'+spSlotsH(l,rows)+'</h3><div class="sp-tbl"><div class="sp-r sp-th"><span></span><span>Name</span><span>Time</span><span>Range</span><span>Hit / DC</span><span>Effect</span></div>'+rows.map((p) => renderSpellsFn2(l, p)).join("")+'</div>'});/* v21 m4 */
 renderSpellsStep4(el, h);}
function renderSpellsFn1(l, UP, UPX, q, L, p){const x=p[0];return (spGrpLv(x)===l||(UP&&spUpOk(x)&&l>spGrpLv(x)&&l<=UPX))&&(spF==="all"||spF===String(l)||(spF==="conc"&&x.conc)||(spF==="rit"&&x.rit))&&(!q||(x.n+" "+x.ct+" "+x.sum+" "+x.src).toLowerCase().indexOf(q)>=0)&&!(x.use==="Prepared"&&L.some((y) =>{return y!==x&&y.n===x.n&&y.use==="Always prepared"}))/* v22 T1: sheets saved before v22 */}
function renderSpellsFn2(l, p){const x=p[0],xs=scOf(x),hd=x.sv==="ATK"?sg(xs.atk):x.sv?x.sv+" "+xs.dc:"\u2014";
   const badge=/At will|Cantrip/i.test(x.use)||!x.l?'<span class="sp-b" data-qcast="'+p[1]+'" title="Cast '+esc(x.n)+'" aria-hidden="true">AT<br>WILL</span>':/1\/Long/.test(x.use)?'<span class="sp-b use" data-qcast="'+p[1]+'" title="Use '+esc(x.n)+'" aria-hidden="true">USE</span>':'<span class="sp-b cast" data-qcast="'+p[1]+'" title="Cast '+esc(x.n)+'" aria-hidden="true">CAST</span>';
   return '<button type="button" class="sp-r" data-info="sp:'+p[1]+'"'+(x.sch?' data-sch="'+esc(x.sch)+'"':'')+'>'+badge+'<span class="sp-n"><b>'+(env.__artIc?env.__artIc("spell",x.n):"")+esc(cuNm("s:"+x.n,x.n))+(x.conc?' <i class="sp-c">C</i>':'')+(x.rit?' <i class="sp-c rit">R</i>':'')+'</b><small><span class="sp-u">'+esc(x.use)+' \u2022 </span><span class="sp-s">'+esc(x.src||"")+'</span>'+(l>spGrpLv(x)?'<span class="sp-w"> \u2022 with a '+ordL(l).replace(" Level","")+' slot</span>':'')+'</small></span><span class="sp-t">'+esc(x.ct.replace("Bonus Action","1BA").replace("Reaction","1R").replace("Action","1A"))+'</span><span class="sp-g">'+spRangeH(x.r,x)+'</span><span class="sp-hd'+(hd==="\u2014"?" sp-no":"")+'">'/* v36 p13 */+esc(hd)+'</span><span>'+spEffH(x,l>spGrpLv(x)?l:spRowLv(x))+'</span></button><button type="button" class="spk" data-qcast="'+p[1]+'">'+(/1\/Long/.test(x.use)?"Use ":"Cast ")+esc(x.n)+'</button>'}
function renderSpellsStep1(){
const el=document.getElementById("spBody");
  return /** @type {any} */ ({el});
}
function renderSpellsStep2(){
const L=C.spells||[],sc=C.spellcasting;
 /* RU20: a caster with no spells chosen still sees Modifier, Spell Attack, Save DC and slots (C.spellcasting), then the note */
 const MB='<div class="spm-bar">'+(L.length?'<button type="button" class="btn press spm-open" data-spcards="1">Print Cards</button>':'')+'<button type="button" class="btn press spm-open" data-spman="1">'+ico("spellbook","ibt")+'Manage Spells</button></div>';/* v27 RU68 *//* v25 RU38 no. 3 */
  return /** @type {any} */ ({L, sc, MB});
}
function renderSpellsStep3(sc, MB, L){
 let h=(sc?spHead(sc):'')+MB;
 h+='<input class="sp-q" id="spQ" type="search" placeholder="Search Spell Names, Casting Times, Damage Types" value="'+esc(spQ)+'">';
 const lvs=[],UP=spUpOn(),UPX=spUpMax();L.forEach((x) =>{const g=spGrpLv(x);if(lvs.indexOf(g)<0)lvs.push(g);if(UP&&spUpOk(x))for(let u=g+1;u<=UPX;u++)if(lvs.indexOf(u)<0)lvs.push(u)});lvs.sort((a,b) =>{return a-b});/* v25 RU38 no. 6 */
 h+='<div class="ifil">'+[["all","All"]].concat(lvs.map((l) =>{return [String(l),l?ordL(l).replace(" Level","").toUpperCase():"-0-"]})).concat([["conc","Conc."],["rit","Ritual"]]).map((f) =>{return '<button type="button" class="ifb'+(spF===f[0]?' on':'')+'" data-spf="'+f[0]+'">'+f[1]+'</button>'}).join("")+'</div>';
 const q=spQ.toLowerCase(),lv=lvs.slice();
  return /** @type {any} */ ({h, UP, UPX, q, lv});
}
function renderSpellsStep4(el, h){
 el.innerHTML=h
}
export function __set_renderSpells(v){ return renderSpells=v; }
