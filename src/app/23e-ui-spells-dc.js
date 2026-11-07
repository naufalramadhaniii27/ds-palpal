import {C} from "./04-logic-storage.js";
import {esc,num,sg} from "./05-logic-helpers.js";
import {B,D,part} from "./06-logic-derivation.js";
import {esArt} from "./08-ui-render-sheet-and-actions.js";
import {spEffH,spGrpLv,spRangeH,spRowLv} from "./22-ui-spell-data-and-slots.js";
import {__R} from "./00-reg.js";
import {env} from "./00-env.js";
import {ico,spSlotsH} from "./23-ui-uses-items-coins-rest-spell-dc.js";
Object.defineProperty(__R,"ordL",{get:function(){return ordL;},set:function(v){ordL=v;},configurable:true});
Object.defineProperty(__R,"renderSpells",{get:function(){return renderSpells;},set:function(v){renderSpells=v;},configurable:true});
Object.defineProperty(__R,"scAdj",{get:function(){return scAdj;},set:function(v){scAdj=v;},configurable:true});
Object.defineProperty(__R,"scOf",{get:function(){return scOf;},set:function(v){scOf=v;},configurable:true});
Object.defineProperty(__R,"spF",{get:function(){return spF;},set:function(v){spF=v;},configurable:true});
Object.defineProperty(__R,"spQ",{get:function(){return spQ;},set:function(v){spQ=v;},configurable:true});
export function ordL(n){return n===0?"Cantrip":n+(n===1?"st":n===2?"nd":n===3?"rd":"th")+" Level"}
var spQ="",spF="all";
/* Spells tab header: Modifier, Spell Attack, Save DC, then slots. Numbers come from C.spellcasting (builder).
   M9: C.spellcasting.by (2+ abilities, multiclass or species): one header per source, and each spell uses the numbers of its ability (C.spells[].ab) */
/* v19 RL44: spell attack shown with Exhaustion */
export function scAdj(sc){ if(!sc) return sc; const ex=D&&D.exhN?2*D.exhN:0, o={}; for(const k in sc) o[k]=sc[k]; if(ex) o.atk=num(sc.atk,0)-ex;
  const many=Array.isArray(sc.by)&&sc.by.length>1; if(Array.isArray(sc.by)) o.by=sc.by.map((b) =>{ const c={}; for(const j in b) c[j]=b[j]; if(ex) c.atk=num(b.atk,0)-ex; return many?scCu(c,"-"+b.ab,ex):scCu(c,"",ex,1); });
  return scCu(o,"",ex); }
/* v34 RU85: Spell Attack and Save DC set by you (S.cust "n:spatk", "n:spdc", one pair per ability when 2+ sources), with a breakdown */
function scCu(o,sf,ex,quiet){ const ak="n:spatk"+sf, dk="n:spdc"+sf, a=__R.cuK(ak), d=__R.cuK(dk), av=a?__R.cuNum(a.o):null, dv=d?__R.cuNum(d.o):null, m=num(o.mod,0), pb=D&&D.pb||2, oth=num(o.atk,0)+ex-m-pb, odc=num(o.dc,0)-8-m-pb, src=sf&&o.n?" ("+o.n+")":"";
  const pa=[part("Modifier ("+(o.ab||"")+")",m,"Your spellcasting ability"),part("Proficiency Bonus",pb,"")], pd=[{l:"Base",v:8,note:"",raw:true},part("Modifier ("+(o.ab||"")+")",m,"Your spellcasting ability"),part("Proficiency Bonus",pb,"")];
  if(oth) pa.push(part("Other bonuses",oth,"Items or features")); if(ex) pa.push(part("Exhaustion level "+(ex/2),-ex,"Every D20 Test is 2 lower for each Exhaustion level")); if(odc) pd.push(part("Other bonuses",odc,"Items or features"));
  if(av!=null){ __R.CU0[ak+"|o"]=o.atk; pa.push({l:"Set by you",v:sg(av),note:"Calculated value: "+sg(o.atk)+". Your number replaces it.",raw:true}); o.atk=av; }
  if(dv!=null){ __R.CU0[dk+"|o"]=o.dc; pd.push({l:"Set by you",v:String(dv),note:"Calculated value: "+o.dc+". Your number replaces it.",raw:true}); o.dc=dv; }
  if(B&&!quiet){ B["spatk"+sf]={t:"Spell Attack"+src,parts:pa,total:sg(o.atk),f:""}; B["spdc"+sf]={t:"Spell Save DC"+src,parts:pd,total:String(o.dc),f:"A creature makes its saving throw against this number when your spell asks for one."}; }
  return o; }
/* v26 RU38 no. 2: a spell with its own save DC or spell attack (Customize) */
export function scOf(x){ let r=scOf0(x), c=x&&__R.cuK("s:"+x.n); if(c&&(__R.cuNum(c.dc)!=null||__R.cuNum(c.atk)!=null)){ r=Object.assign({},r); if(__R.cuNum(c.dc)!=null) r.dc=__R.cuNum(c.dc); if(__R.cuNum(c.atk)!=null) r.atk=__R.cuNum(c.atk); } return r; }
function scOf0(x){ let sc=scAdj(C.spellcasting||{}); if(x&&x.itc&&(x.itc.dc!=null||x.itc.atk!=null)){ sc=Object.assign({},sc); if(x.itc.dc!=null) sc.dc=x.itc.dc; if(x.itc.atk!=null) sc.atk=x.itc.atk; return sc; } if(x&&x.ab&&Array.isArray(sc.by)){ const b=sc.by.filter((q) =>{return q.ab===x.ab})[0]; if(b) return b; } return sc; }
function spHeadBy(sc){ return sc.by.map((b) =>{ const sf="-"+b.ab; return '<p class="sp-src">'+esc(b.n)+'</p><div class="sp-head"><div><b>'+sg(b.mod)+'</b><span>Modifier ('+b.ab+')</span></div><div class="bd" data-bd="spatk'+sf+'" role="button" tabindex="0"><b>'+sg(b.atk)+'</b><span>Spell Attack</span></div><div class="bd" data-bd="spdc'+sf+'" role="button" tabindex="0"><b>'+b.dc+'</b><span>Save DC</span></div></div>'; }).join(""); }
function spHead(sc){sc=scAdj(sc);let h=Array.isArray(sc.by)&&sc.by.length>1?spHeadBy(sc):'<div class="sp-head"><div><b>'+sg(sc.mod)+'</b><span>Modifier ('+sc.ab+')</span></div><div class="bd" data-bd="spatk" role="button" tabindex="0"><b>'+sg(sc.atk)+'</b><span>Spell Attack</span></div><div class="bd" data-bd="spdc" role="button" tabindex="0"><b>'+sc.dc+'</b><span>Save DC</span></div></div>';
 const sl=[];(sc.slots||[]).forEach((n,i) =>{sl.push(ordL(i+1).replace(" Level","")+" \u00d7"+n)});if(sc.pact)sl.push("Pact \u00d7"+sc.pact.n+" (level "+sc.pact.lvl+")");if(sl.length)h+='<p class="sp-slots">Slots: '+sl.join(", ")+'. Tick the boxes at each spell level, or in Limited Use on the Actions tab.</p>';
 return h}
export function renderSpells(){const el=document.getElementById("spBody");if(!el)return;const L=C.spells||[],sc=C.spellcasting;
 /* RU20: a caster with no spells chosen still sees Modifier, Spell Attack, Save DC and slots (C.spellcasting), then the note */
 const MB='<div class="spm-bar">'+(L.length?'<button type="button" class="btn press spm-open" data-spcards="1">Print Cards</button>':'')+'<button type="button" class="btn press spm-open" data-spman="1">'+ico("spellbook","ibt")+'Manage Spells</button></div>';/* v27 RU68 *//* v25 RU38 no. 3 */
 if(!L.length){el.innerHTML=(sc?spHead(sc):'')+'<div class="empty-note empty-st">'+esArt("book")+'<b>No spells yet</b><span>'+(sc?'Add the cantrips and spells your class can cast. They show here with their slots.':'Spells from your class, species, feats, or magic items show up here.')+'</span><button type="button" class="btn pri press spm-open" data-spman="1">'+ico("tab-spells","ibt")+'Manage Spells</button></div>';return}/* v31 C5 */
 let h=(sc?spHead(sc):'')+MB;
 h+='<input class="sp-q" id="spQ" type="search" placeholder="Search Spell Names, Casting Times, Damage Types" value="'+esc(spQ)+'">';
 const lvs=[],UP=__R.spUpOn(),UPX=__R.spUpMax();L.forEach((x) =>{const g=spGrpLv(x);if(lvs.indexOf(g)<0)lvs.push(g);if(UP&&__R.spUpOk(x))for(let u=g+1;u<=UPX;u++)if(lvs.indexOf(u)<0)lvs.push(u)});lvs.sort((a,b) =>{return a-b});/* v25 RU38 no. 6 */
 h+='<div class="ifil">'+[["all","All"]].concat(lvs.map((l) =>{return [String(l),l?ordL(l).replace(" Level","").toUpperCase():"-0-"]})).concat([["conc","Conc."],["rit","Ritual"]]).map((f) =>{return '<button type="button" class="ifb'+(spF===f[0]?' on':'')+'" data-spf="'+f[0]+'">'+f[1]+'</button>'}).join("")+'</div>';
 const q=spQ.toLowerCase(),lv=lvs.slice();
 lv.forEach((l) =>{const rows=L.map((x,i) =>{return [x,i]}).filter((p) =>{const x=p[0];return (spGrpLv(x)===l||(UP&&__R.spUpOk(x)&&l>spGrpLv(x)&&l<=UPX))&&(spF==="all"||spF===String(l)||(spF==="conc"&&x.conc)||(spF==="rit"&&x.rit))&&(!q||(x.n+" "+x.ct+" "+x.sum+" "+x.src).toLowerCase().indexOf(q)>=0)&&!(x.use==="Prepared"&&L.some((y) =>{return y!==x&&y.n===x.n&&y.use==="Always prepared"}))/* v22 T1: sheets saved before v22 */}).sort((a,b) =>{return a[0].n<b[0].n?-1:a[0].n>b[0].n?1:a[1]-b[1]});if(!rows.length)return;
  h+='<h3 class="sp-lv"><span>'+ordL(l)+'</span>'+spSlotsH(l,rows)+'</h3><div class="sp-tbl"><div class="sp-r sp-th"><span></span><span>Name</span><span>Time</span><span>Range</span><span>Hit / DC</span><span>Effect</span></div>'+rows.map((p) =>{const x=p[0],xs=scOf(x),hd=x.sv==="ATK"?sg(xs.atk):x.sv?x.sv+" "+xs.dc:"\u2014";
   const badge=/At will|Cantrip/i.test(x.use)||!x.l?'<span class="sp-b" data-qcast="'+p[1]+'" title="Cast '+esc(x.n)+'" aria-hidden="true">AT<br>WILL</span>':/1\/Long/.test(x.use)?'<span class="sp-b use" data-qcast="'+p[1]+'" title="Use '+esc(x.n)+'" aria-hidden="true">USE</span>':'<span class="sp-b cast" data-qcast="'+p[1]+'" title="Cast '+esc(x.n)+'" aria-hidden="true">CAST</span>';
   return '<button type="button" class="sp-r" data-info="sp:'+p[1]+'"'+(x.sch?' data-sch="'+esc(x.sch)+'"':'')+'>'+badge+'<span class="sp-n"><b>'+(env.__artIc?env.__artIc("spell",x.n):"")+esc(__R.cuNm("s:"+x.n,x.n))+(x.conc?' <i class="sp-c">C</i>':'')+(x.rit?' <i class="sp-c rit">R</i>':'')+'</b><small><span class="sp-u">'+esc(x.use)+' \u2022 </span><span class="sp-s">'+esc(x.src||"")+'</span>'+(l>spGrpLv(x)?'<span class="sp-w"> \u2022 with a '+ordL(l).replace(" Level","")+' slot</span>':'')+'</small></span><span class="sp-t">'+esc(x.ct.replace("Bonus Action","1BA").replace("Reaction","1R").replace("Action","1A"))+'</span><span class="sp-g">'+spRangeH(x.r,x)+'</span><span class="sp-hd'+(hd==="\u2014"?" sp-no":"")+'">'/* v36 p13 */+esc(hd)+'</span><span>'+spEffH(x,l>spGrpLv(x)?l:spRowLv(x))+'</span></button><button type="button" class="spk" data-qcast="'+p[1]+'">'+(/1\/Long/.test(x.use)?"Use ":"Cast ")+esc(x.n)+'</button>'}).join("")+'</div>'});/* v21 m4 */
 el.innerHTML=h}
export function __set_renderSpells(v){ return renderSpells=v; }
