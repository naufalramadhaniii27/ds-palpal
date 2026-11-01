import {ABK,ABN,HB_CONDS,HB_SRC} from "./02-data-default-character.js";
import {exSpd,gName} from "./03-data-glossary.js";
import {C,S,clsLv} from "./04-logic-storage.js";
import {$,atkOn,eqOn,esc,fmtW,num,senseList,sg} from "./05-logic-helpers.js";
import {D,fill,richB} from "./06-logic-derivation.js";
import {langText} from "./08-ui-render-sheet-and-actions.js";
import {activeConds} from "./10-ui-conditions.js";
import {COINS,coinsNow,invWeight} from "./23-ui-uses-items-coins-rest-spell-dc.js";
import {cuNm} from "./26-ui-customize.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"buildPrint",{get:function(){return buildPrint;},set:function(v){buildPrint=v;},configurable:true});
/* ================= PRINTABLE SHEET ================= */
function chk(n){var h="";for(var i=0;i<n;i++)h+='<span class="ps-chk"></span>';return h}
export function buildPrint(){
  var notes = S.notes||{};
  function note(k,l,h){ var v=(notes[k]||"").trim(); return '<div class="ps-box"><div class="ps-h">'+l.toUpperCase()+'</div><div class="ps-note'+(v?'':' e')+'" data-nk="'+k+'" style="min-height:'+(h||36)+'px">'+(v?esc(v):'')+'</div></div>'; }
  var title = esc(C.name)+", "+esc(C.species)+" "+esc(clsLv())+(C.sub?" ("+esc(C.sub)+")":"");
  var foot = function(n){ return '<div class="ps-foot"><span>'+title+'</span><span>Page '+n+' of 3</span></div>'; };
  var avStyle = (S.portrait&&/^(data:image\/|blob:|https?:)/.test(S.portrait)) ? ' style="background-image:url(\''+S.portrait+'\');color:transparent"' : '';
  var abil = ABK.map(function(k){var key=!!(C.saves&&C.saves[k]); return '<div class="ps-ab'+(key?' k':'')+'"><div class="a">'+ABN[k].toUpperCase()+'</div><div class="m">'+sg(D.mod[k])+'</div><div class="s">'+D.score[k]+'</div></div>'}).join("");
  var stats = [["PROFICIENCY",sg(D.pb),"Bonus"],["SPEED",D.speed+" ft","Size "+esc(C.size)+["fly","swim","climb","burrow"].filter(function(k){return (C.speeds||{})[k]}).map(function(k){var x=C.speeds[k];return ", "+k.charAt(0).toUpperCase()+k.slice(1)+" "+(x.v==="walk"?D.speed:exSpd(num(x.v,0)))}).join("")],/* v20 M3 */["INITIATIVE",sg(D.init),"Dexterity"],["ARMOR CLASS",D.ac,esc(C.ac.baseSrc||"").split(",")[0]],["HIT POINT MAX",D.hpmax,"Current "+S.hp+(S.tmp?", temp "+S.tmp:"")],["GRAPPLE DC",D.dc,"Str or Dex save"]]
    .map(function(s){return '<div class="ps-st"><div class="a">'+s[0]+'</div><div class="v">'+s[1]+'</div><div class="n">'+s[2]+'</div></div>'}).join("");
  var saves = ABK.map(function(k){var on=!!(C.saves&&C.saves[k]); return '<div class="ps-r"><span class="d'+(on?' on':'')+'"></span><span class="t">'+ABN[k]+'</span><span class="b">'+sg(D.save[k])+'</span></div>'}).join("");
  var skills = C.skills.map(function(s,i){var p=num(s.p,0), f=s.dis?' <span style="color:#b3342b;font-size:9px;font-weight:700">DIS</span>':(s.hb?' <span style="color:#9c650f;font-size:9px;font-weight:700">HB</span>':''); return '<div class="ps-r"><span class="d'+(p?' on':'')+'"></span><span class="g">'+s.ab+'</span><span class="t">'+esc(s.n)+f+'</span><span class="b">'+sg(D.skill[i])+'</span></div>'}).join("");
  var senses = [["Passive Perception",D.pas_per],["Passive Insight",D.pas_ins],["Passive Investigation",D.pas_inv]].concat(num(C.darkvision,0)?[["Darkvision",num(C.darkvision)+" ft"]]:[]).concat(senseList().map(function(x){return [esc(x[0].n),num(x[0].v,0)+" ft"]})).map(function(s){return '<div class="ps-r"><span class="t">'+s[0]+'</span><span class="b">'+s[1]+'</span></div>'}).join("");
  var ATK_MAX=7, atkAll=(C.attacks||[]).map(function(a,i){return [a,i]}).filter(function(x){return atkOn(x[0])});
  function atkRow(a,i){return '<tr><td><b>'+esc(cuNm("a:"+a.n,a.n))+'</b><div style="color:#808c84;font-size:9.5px">'+esc(a.sub||"")+'</div></td><td>'+esc(a.range||"")+'</td><td class="nb">'+sg(D.atk[i].hit)+'</td><td class="nb">'+esc(D.atk[i].dmg)+' <span style="font:400 9.5px Archivo,Arial;color:#535f57">'+esc(a.type||"")+'</span></td><td>'+(a.m?'<b>'+esc(a.m)+'</b>. ':'')+esc(a.note||"")+'</td></tr>'}
  var atk = atkAll.slice(0,ATK_MAX).map(function(x){return atkRow(x[0],x[1])}).join("");
  var atkMore = atkAll.slice(ATK_MAX).map(function(x){return atkRow(x[0],x[1])}).join("");
  var atkHead='<thead><tr><th>NAME</th><th>RANGE</th><th>HIT</th><th>DAMAGE</th><th>NOTES</th></tr></thead>';
  var extraAtkH = atkMore ? 60+(atkAll.length-ATK_MAX)*34 : 0;
  var res = '<div class="ps-p">'+D.res.map(function(r){ return '<b>'+esc(r.n)+'</b> ('+r.max+') '+(r.pool?'left: ______':chk(r.max)); }).join(" &nbsp; ")+'</div>'+
            (C.actions||[]).filter(function(a){return a.hb}).map(function(a){ return '<div class="ps-p"><b>'+esc(a.n)+'.</b> '+esc(String(fill(a.d)).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,function(m,k,l){return l||k}))+'</div>'; }).join("")+/* v20 M3 */
            '<div class="ps-p"><b>Death Saves</b> successes '+chk(3)+' failures '+chk(3)+' &nbsp; <b>Heroic Inspiration</b> '+chk(1)+'</div>';
  var conds = activeConds();
  var condTxt = conds.length ? conds.map(function(c){return c.k+(c.extra||"")}).join(", ") : "None";
  if(S.exh) condTxt += (conds.length?", ":"")+"Exhaustion "+S.exh;
  var alignTxt = (S.align||"").trim() ? esc(S.align.trim()) : "";
  var page1 =
    '<div class="ps-page">'+
      '<div class="ps-head"><div class="ps-av"'+avStyle+'>PHOTO</div><div><div class="ps-name">'+esc(C.name)+'</div><div class="ps-line"><b>'+esc(C.species)+'</b> &nbsp; <b>'+esc(clsLv())+'</b>'+(C.sub?' ('+esc(C.sub)+')':'')+' &nbsp; '+esc(C.bg)+(alignTxt?' &nbsp; '+alignTxt:'')+'</div></div><div class="ps-right">'+esc(C.office||"")+'<br>Silak Jenggala one-shot<br>D&amp;D 2024 with Retromistika Playtest</div></div>'+
      '<div class="ps-row" style="margin-top:12px">'+abil+'</div>'+
      '<div class="ps-row" style="margin-top:10px">'+stats+'</div>'+
      '<div class="ps-cols">'+
        '<div style="width:220px;flex:none">'+
          '<div class="ps-box"><div class="ps-h">SAVING THROWS</div>'+saves+(C.saveBonus||[]).concat(C.saveNotes||[]).map(function(x){ return '<div class="ps-p" style="margin:3px 0 0;font-size:9.5px">'+(x.t?esc(x.t):sg(num(x.v))+' to all saving throws')+' ('+esc(x.s)+')</div>'; }).join('')+'</div>'+
          '<div class="ps-box"><div class="ps-h">SENSES</div>'+senses+'</div>'+
          '<div class="ps-box"><div class="ps-h">PROFICIENCIES</div>'+
            '<div class="ps-p"><b>Armor</b> '+esc(C.profs.armor)+'</div><div class="ps-p"><b>Weapons</b> '+esc(C.profs.weapons)+'</div><div class="ps-p"><b>Tools</b> '+esc(C.profs.tools)+'</div>'+
            '<div class="ps-p" style="margin:0"><b>Languages</b> '+langText()+'</div></div>'+
        '</div>'+
        '<div style="flex:1;min-width:0">'+
          '<div class="ps-box"><div class="ps-h">SKILLS</div><div style="column-count:2;column-gap:16px">'+skills+'</div></div>'+
          '<div class="ps-box"><div class="ps-h">LIMITED USE</div>'+res+'<div class="ps-p" style="margin:0"><b>Conditions</b> '+condTxt+'</div></div>'+
        '</div>'+
      '</div>'+
      '<div class="ps-box" style="margin-top:12px"><div class="ps-h">ATTACKS</div><table class="ps-tbl"><thead><tr><th>NAME</th><th>RANGE</th><th>HIT</th><th>DAMAGE</th><th>NOTES</th></tr></thead><tbody>'+atk+'</tbody></table></div>'+
      foot(1)+
    '</div>';
  function featBox(g){ return '<div class="ps-box"><div class="ps-h">'+esc(gName(g.g)).toUpperCase()+'</div>'+(g.items||[]).map(function(f){return '<div class="ps-ft"><h5>'+esc(f.n)+'<span>'+esc(f.s)+'</span></h5><p>'+richB(f.d)+'</p></div>'}).join("")+(g.next?'<p class="ps-p" style="color:#808c84;margin:2px 0 0">'+esc(g.next)+'</p>':'')+'</div>'; }
  var fs=C.features||[], left=[], right=[];
  function est(g,cpl){ return 40+(g.items||[]).reduce(function(t,f){ return t+22+Math.ceil(String(f.d||"").length/cpl)*14; },0)+(g.next?28:0); }
  var hL=0, hR=60+(C.inv||[]).length*19 + extraAtkH;
  fs.forEach(function(g){ var a=est(g,108), b=est(g,86); if(hL+a<=hR+b){ left.push(g); hL+=a+10; } else { right.push(g); hR+=b+10; } });
  var inv = (C.inv||[]).map(function(i){var q=num(i.q,1),w=num(i.w,0); return '<div class="ps-r"><span class="t">'+esc(i.n)+(q>1?' ×'+q:'')+(eqOn(i)?' <span style="color:#2c7549;font-size:9px;font-weight:700">WORN</span>':'')+'</span><span class="b" style="font-weight:400;font-size:10.5px">'+(w?fmtW(q*w)+' lb':'—')+'</span></div>'}).join("");
  var totalW = invWeight();
  var hb = HB_CONDS.map(function(c){return '<div class="ps-ft"><h5>'+c.k+'<span>'+HB_SRC+'</span></h5><p>'+c.d+'</p></div>'}).join("");
  var page2 =
    '<div class="ps-page grow">'+
      '<div class="ps-cols" style="margin-top:0">'+
        '<div style="flex:1.25;min-width:0">'+left.map(featBox).join("")+'</div>'+
        '<div style="flex:1;min-width:0">'+
          (atkMore?'<div class="ps-box"><div class="ps-h">ATTACKS (CONTINUED)</div><table class="ps-tbl">'+atkHead+'<tbody>'+atkMore+'</tbody></table></div>':'')+
          '<div class="ps-box"><div class="ps-h">EQUIPMENT</div>'+inv+'<div class="ps-p" style="margin:6px 0 0"><b>Coins</b> '+(function(c){ return COINS.filter(function(k){return c[k[0]]}).map(function(k){return c[k[0]]+' '+k[0].toUpperCase()}).join(', ')||'0 GP'; })(coinsNow())+' &nbsp; <b>Weight</b> '+fmtW(totalW)+' / '+D.carry+' lb'+((C.inv||[]).some(function(i){return i.att})?' &nbsp; <b>Attuned</b> '+((C.inv||[]).filter(function(i){return i.att&&eqOn(i)}).map(function(i){return esc(i.n)}).join(', ')||'none')+' ('+Math.min(3,(C.inv||[]).filter(function(i){return i.att&&eqOn(i)}).length)+'/3)':'')+(S.lifestyle?' &nbsp; <b>Lifestyle</b> '+esc(S.lifestyle):'')+'</div></div>'+
          right.map(featBox).join("")+
        '</div>'+
      '</div>'+
      foot(2)+
    '</div>';
  var page3 =
    '<div class="ps-page grow">'+
      '<div class="ps-head" style="padding:10px 16px"><div><div class="ps-name" style="font-size:20px">Character Notes</div><div class="ps-line">Languages: '+langText()+' &nbsp; Alignment: '+(alignTxt||'not set')+'</div></div></div>'+
      '<div class="ps-cols" style="margin-top:12px">'+HB_CONDS.map(function(c){return '<div class="ps-box" style="flex:1;min-width:0;margin:0"><div class="ps-ft" style="margin:0"><h5>'+c.k+'<span>'+HB_SRC+'</span></h5><p>'+c.d+'</p></div></div>'}).join("")+'</div>'+
      '<div style="margin-top:10px">'+note("backstory","Backstory",200)+'</div>'+
      '<div class="ps-cols" style="margin-top:10px">'+
        '<div style="flex:1;min-width:0">'+note("personality","Personality",88)+note("appearance","Appearance",88)+'</div>'+
        '<div style="flex:1;min-width:0">'+note("ideal","Ideals",44)+note("bond","Bonds",44)+note("flaw","Flaws",44)+'</div>'+
      '</div>'+
      '<div style="margin-top:10px">'+note("session","Session Notes",130)+'</div>'+
      foot(3)+
    '</div>';
  $("#ps").innerHTML = page1 + page2 + page3; psFit(); psSplit();/* v38 p12 */
}
/* v38 p12: Session Notes that do not fit page 3 go on continuation pages; the footers get the right "Page n of N" */
function psSplit(){ var ps=document.getElementById("ps"); if(!ps) return; var last=ps.lastElementChild, LIM=1123;
  if(last&&last.scrollHeight>LIM+1){ var nt=last.querySelector('.ps-note[data-nk="session"]'); if(nt&&nt.textContent){ var ln=nt.textContent.split("\n"), keep=ln.slice(), rest=[];
    while(last.scrollHeight>LIM&&keep.length>1){ rest.unshift(keep.pop()); nt.textContent=keep.join("\n"); }
    var title=(last.querySelector(".ps-foot span")||{}).textContent||"", txt=rest.join("\n"), guard=0;
    while(txt&&guard++<10){ var pg=document.createElement("div"); pg.className="ps-page grow"; pg.innerHTML='<div class="ps-box"><div class="ps-h">SESSION NOTES (CONTINUED)</div><div class="ps-note"></div></div><div class="ps-foot"><span>'+esc(title)+'</span><span></span></div>'; ps.appendChild(pg);
      var n2=pg.querySelector(".ps-note"); n2.textContent=txt; var l2=txt.split("\n"), k2=l2.slice(), r2=[]; while(pg.scrollHeight>LIM&&k2.length>1){ r2.unshift(k2.pop()); n2.textContent=k2.join("\n"); } txt=r2.join("\n"); } } }
  var all=Array.prototype.slice.call(ps.querySelectorAll(".ps-page")); all.forEach(function(p,i){ var f=p.querySelectorAll(".ps-foot span"); if(f.length>1) f[f.length-1].textContent="Page "+(i+1)+" of "+all.length; }); }
/* v24 M3: a page whose content runs a little past the page gets tighter, so nothing is cut and no extra sheet comes out */
function psFit(){ Array.prototype.slice.call(document.querySelectorAll("#ps .ps-page")).forEach(function(p){ var lim=function(){ return p.classList.contains("grow")?1123:p.clientHeight; }; if(p.scrollHeight<=lim()) return;/* R2-3: a growing page must fit one A4 sheet too */
  p.style.paddingTop="20px"; p.style.paddingBottom="20px"; var n=+((/ps-t(\d)/.exec(p.className)||[0,0])[1]); while(p.scrollHeight>lim()&&n<6){ p.classList.remove("ps-t"+n); n++; p.classList.add("ps-t"+Math.min(n,4)); Array.prototype.slice.call(p.querySelectorAll(".ps-note")).forEach(function(x){ var h=parseFloat(x.style.minHeight)||0; if(h>28) x.style.minHeight=Math.round(h*.82)+"px"; }); }/* writing space shrinks a little too */ });
  if(!psFit.w&&document.fonts&&document.fonts.status!=="loaded"&&document.fonts.ready){ psFit.w=1; document.fonts.ready.then(function(){ psFit(); }); } }
window.addEventListener("beforeprint",function(){ try{ psFit(); }catch(e){} });/* fonts that load late make the text taller */
