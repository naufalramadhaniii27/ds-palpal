import {bindLive} from "./00a-reg-late-ports.js";import {env} from "./00-env.js";import {ABK,ABN,HB_CONDS,HB_SRC} from "./02-data-default-character.js";
import {exSpd,gName} from "./03-data-glossary.js";
import {C,S,clsLv} from "./04-logic-storage.js";
import {$,atkOn,eqOn,esc,fmtW,num,senseList,sg} from "./05-logic-helpers.js";
import {D,fill,richB} from "./06-logic-derivation.js";
import {langText} from "./08-ui-render-sheet-and-actions.js";
import {activeConds} from "./10-ui-conditions.js";
import {invWeight} from "./23b-ui-items-containers.js";import {COINS,coinsNow} from "./23c-ui-coins.js";
import {cuNm} from "./26-ui-customize.js";

bindLive("buildPrint",{get:function(){return buildPrint;}});
/* ================= PRINTABLE SHEET ================= */
function chk(n){let h="";for(let i=0;i<n;i++)h+='<span class="ps-chk"></span>';return h}
export function buildPrint(){
  const notes = S.notes||{};
  function note(k,l,h){ const v=(notes[k]||"").trim(); return '<div class="ps-box"><div class="ps-h">'+l.toUpperCase()+'</div><div class="ps-note'+(v?'':' e')+'" data-nk="'+k+'" style="min-height:'+(h||36)+'px">'+(v?esc(v):'')+'</div></div>'; }
  const title = esc(C.name)+", "+esc(C.species)+" "+esc(clsLv())+(C.sub?" ("+esc(C.sub)+")":"");
  const foot = function(n){ return '<div class="ps-foot"><span>'+title+'</span><span>Page '+n+' of 3</span></div>'; };
  const avStyle = (S.portrait&&/^(data:image\/|blob:|https?:)/.test(S.portrait)) ? ' style="background-image:url(\''+S.portrait+'\');color:transparent"' : '';
  const abil = ABK.map((k) =>{const key=!!(C.saves&&C.saves[k]); return '<div class="ps-ab'+(key?' k':'')+'"><div class="a">'+ABN[k].toUpperCase()+'</div><div class="m">'+sg(D.mod[k])+'</div><div class="s">'+D.score[k]+'</div></div>'}).join("");
  const stats = [["PROFICIENCY",sg(D.pb),"Bonus"],["SPEED",D.speed+" ft","Size "+esc(C.size)+["fly","swim","climb","burrow"].filter((k) =>{return (C.speeds||{})[k]}).map((k) =>{const x=C.speeds[k];return ", "+k.charAt(0).toUpperCase()+k.slice(1)+" "+(x.v==="walk"?D.speed:exSpd(num(x.v,0)))}).join("")],/* v20 M3 */["INITIATIVE",sg(D.init),"Dexterity"],["ARMOR CLASS",D.ac,esc(C.ac.baseSrc||"").split(",")[0]],["HIT POINT MAX",D.hpmax,"Current "+S.hp+(S.tmp?", temp "+S.tmp:"")],["GRAPPLE DC",D.dc,"Str or Dex save"]]
    .map((s) =>{return '<div class="ps-st"><div class="a">'+s[0]+'</div><div class="v">'+s[1]+'</div><div class="n">'+s[2]+'</div></div>'}).join("");
  const saves = ABK.map((k) =>{const on=!!(C.saves&&C.saves[k]); return '<div class="ps-r"><span class="d'+(on?' on':'')+'"></span><span class="t">'+ABN[k]+'</span><span class="b">'+sg(D.save[k])+'</span></div>'}).join("");
  const skills = C.skills.map((s,i) =>{const p=num(s.p,0), f=s.dis?' <span style="color:#b3342b;font-size:9px;font-weight:700">DIS</span>':(s.hb?' <span style="color:#9c650f;font-size:9px;font-weight:700">HB</span>':''); return '<div class="ps-r"><span class="d'+(p?' on':'')+'"></span><span class="g">'+s.ab+'</span><span class="t">'+esc(s.n)+f+'</span><span class="b">'+sg(D.skill[i])+'</span></div>'}).join("");
  const senses = [["Passive Perception",D.pas_per],["Passive Insight",D.pas_ins],["Passive Investigation",D.pas_inv]].concat(num(C.darkvision,0)?[["Darkvision",num(C.darkvision)+" ft"]]:[]).concat(senseList().map((x) =>{return [esc(x[0].n),num(x[0].v,0)+" ft"]})).map((s) =>{return '<div class="ps-r"><span class="t">'+s[0]+'</span><span class="b">'+s[1]+'</span></div>'}).join("");
  const ATK_MAX=7, atkAll=(C.attacks||[]).map((a,i) =>{return [a,i]}).filter((x) =>{return atkOn(x[0])});
  function atkRow(a,i){return '<tr><td><b>'+esc(cuNm("a:"+a.n,a.n))+'</b><div style="color:#808c84;font-size:9.5px">'+esc(a.sub||"")+'</div></td><td>'+esc(a.range||"")+'</td><td class="nb">'+sg(D.atk[i].hit)+'</td><td class="nb">'+esc(D.atk[i].dmg)+' <span style="font:400 9.5px Archivo,Arial;color:#535f57">'+esc(a.type||"")+'</span></td><td>'+(a.m?'<b>'+esc(a.m)+'</b>. ':'')+esc(a.note||"")+'</td></tr>'}
  const atk = atkAll.slice(0,ATK_MAX).map((x) =>{return atkRow(x[0],x[1])}).join("");
  const atkMore = atkAll.slice(ATK_MAX).map((x) =>{return atkRow(x[0],x[1])}).join("");
  const atkHead='<thead><tr><th>NAME</th><th>RANGE</th><th>HIT</th><th>DAMAGE</th><th>NOTES</th></tr></thead>';
  const extraAtkH = atkMore ? 60+(atkAll.length-ATK_MAX)*34 : 0;
  const res = '<div class="ps-p">'+D.res.map((r) =>{ return '<b>'+esc(r.n)+'</b> ('+r.max+') '+(r.pool?'left: ______':chk(r.max)); }).join(" &nbsp; ")+'</div>'+
            (C.actions||[]).filter((a) =>{return a.hb}).map((a) =>{ return '<div class="ps-p"><b>'+esc(a.n)+'.</b> '+esc(String(fill(a.d)).replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g,(m,k,l) =>{return l||k}))+'</div>'; }).join("")+/* v20 M3 */
            '<div class="ps-p"><b>Death Saves</b> successes '+chk(3)+' failures '+chk(3)+' &nbsp; <b>Heroic Inspiration</b> '+chk(1)+'</div>';
  const conds = activeConds();
  let condTxt = conds.length ? conds.map((c) =>{return c.k+(c.extra||"")}).join(", ") : "None";
  if(S.exh) condTxt += (conds.length?", ":"")+"Exhaustion "+S.exh;
  const alignTxt = (S.align||"").trim() ? esc(S.align.trim()) : "";
  const page1 =
    '<div class="ps-page">'+
      '<div class="ps-head"><div class="ps-av"'+avStyle+'>PHOTO</div><div><div class="ps-name">'+esc(C.name)+'</div><div class="ps-line"><b>'+esc(C.species)+'</b> &nbsp; <b>'+esc(clsLv())+'</b>'+(C.sub?' ('+esc(C.sub)+')':'')+' &nbsp; '+esc(C.bg)+(alignTxt?' &nbsp; '+alignTxt:'')+'</div></div><div class="ps-right">'+esc(C.office||"")+'<br>Silak Jenggala one-shot<br>D&amp;D 2024 with Retromistika Playtest</div></div>'+
      '<div class="ps-row" style="margin-top:12px">'+abil+'</div>'+
      '<div class="ps-row" style="margin-top:10px">'+stats+'</div>'+
      '<div class="ps-cols">'+
        '<div style="width:220px;flex:none">'+
          '<div class="ps-box"><div class="ps-h">SAVING THROWS</div>'+saves+(C.saveBonus||[]).concat(C.saveNotes||[]).map((x) =>{ return '<div class="ps-p" style="margin:3px 0 0;font-size:9.5px">'+(x.t?esc(x.t):sg(num(x.v))+(x.ab?' to '+x.ab+' saving throws':' to all saving throws'))+' ('+esc(x.s)+')</div>'; }).join('')+'</div>'+
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
  function featBox(g){ return '<div class="ps-box"><div class="ps-h">'+esc(gName(g.g)).toUpperCase()+'</div>'+(g.items||[]).map((f) =>{return '<div class="ps-ft"><h5>'+esc(f.n)+'<span>'+esc(f.s)+'</span></h5><p>'+richB(f.d)+'</p></div>'}).join("")+(g.next?'<p class="ps-p" style="color:#808c84;margin:2px 0 0">'+esc(g.next)+'</p>':'')+'</div>'; }
  const fs=C.features||[], left=[], right=[];
  function est(g,cpl){ return 40+(g.items||[]).reduce((t,f) =>{ return t+22+Math.ceil(String(f.d||"").length/cpl)*14; },0)+(g.next?28:0); }
  let hL=0, hR=60+(C.inv||[]).length*19 + extraAtkH;
  fs.forEach((g) =>{ const a=est(g,108), b=est(g,86); if(hL+a<=hR+b){ left.push(g); hL+=a+10; } else { right.push(g); hR+=b+10; } });
  const inv = (C.inv||[]).map((i) =>{const q=num(i.q,1),w=num(i.w,0); return '<div class="ps-r"><span class="t">'+esc(i.n)+(q>1?' ×'+q:'')+(eqOn(i)?' <span style="color:#2c7549;font-size:9px;font-weight:700">WORN</span>':'')+'</span><span class="b" style="font-weight:400;font-size:10.5px">'+(w?fmtW(q*w)+' lb':'—')+'</span></div>'}).join("");
  const totalW = invWeight();
  const hb = HB_CONDS.map((c) =>{return '<div class="ps-ft"><h5>'+c.k+'<span>'+HB_SRC+'</span></h5><p>'+c.d+'</p></div>'}).join("");
  const page2 =
    '<div class="ps-page grow">'+
      '<div class="ps-cols" style="margin-top:0">'+
        '<div style="flex:1.25;min-width:0">'+left.map(featBox).join("")+'</div>'+
        '<div style="flex:1;min-width:0">'+
          (atkMore?'<div class="ps-box"><div class="ps-h">ATTACKS (CONTINUED)</div><table class="ps-tbl">'+atkHead+'<tbody>'+atkMore+'</tbody></table></div>':'')+
          '<div class="ps-box"><div class="ps-h">EQUIPMENT</div>'+inv+'<div class="ps-p" style="margin:6px 0 0"><b>Coins</b> '+(function(c){ return COINS.filter((k) =>{return c[k[0]]}).map((k) =>{return c[k[0]]+' '+k[0].toUpperCase()}).join(', ')||'0 GP'; })(coinsNow())+' &nbsp; <b>Weight</b> '+fmtW(totalW)+' / '+D.carry+' lb'+((C.inv||[]).some((i) =>{return i.att})?' &nbsp; <b>Attuned</b> '+((C.inv||[]).filter((i) =>{return i.att&&eqOn(i)}).map((i) =>{return esc(i.n)}).join(', ')||'none')+' ('+Math.min(3,(C.inv||[]).filter((i) =>{return i.att&&eqOn(i)}).length)+'/3)':'')+(S.lifestyle?' &nbsp; <b>Lifestyle</b> '+esc(S.lifestyle):'')+'</div></div>'+
          right.map(featBox).join("")+
        '</div>'+
      '</div>'+
      foot(2)+
    '</div>';
  const page3 =
    '<div class="ps-page grow">'+
      '<div class="ps-head" style="padding:10px 16px"><div><div class="ps-name" style="font-size:20px">Character Notes</div><div class="ps-line">Languages: '+langText()+' &nbsp; Alignment: '+(alignTxt||'not set')+'</div></div></div>'+
      '<div class="ps-cols" style="margin-top:12px">'+HB_CONDS.map((c) =>{return '<div class="ps-box" style="flex:1;min-width:0;margin:0"><div class="ps-ft" style="margin:0"><h5>'+c.k+'<span>'+HB_SRC+'</span></h5><p>'+c.d+'</p></div></div>'}).join("")+'</div>'+
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
function psSplit(){ const ps=document.getElementById("ps"); if(!ps) return; const last=ps.lastElementChild, LIM=1123;
  if(last&&last.scrollHeight>LIM+1){ const nt=last.querySelector('.ps-note[data-nk="session"]'); if(nt&&nt.textContent){ const ln=nt.textContent.split("\n"), keep=ln.slice(), rest=[];
    while(last.scrollHeight>LIM&&keep.length>1){ rest.unshift(keep.pop()); nt.textContent=keep.join("\n"); }
    let title=(last.querySelector(".ps-foot span")||{}).textContent||"", txt=rest.join("\n"), guard=0;
    while(txt&&guard++<10){ const pg=document.createElement("div"); pg.className="ps-page grow"; pg.innerHTML='<div class="ps-box"><div class="ps-h">SESSION NOTES (CONTINUED)</div><div class="ps-note"></div></div><div class="ps-foot"><span>'+esc(title)+'</span><span></span></div>'; ps.appendChild(pg);
      const n2=pg.querySelector(".ps-note"); n2.textContent=txt; const l2=txt.split("\n"), k2=l2.slice(), r2=[]; while(pg.scrollHeight>LIM&&k2.length>1){ r2.unshift(k2.pop()); n2.textContent=k2.join("\n"); } txt=r2.join("\n"); } } }
  const all=Array.prototype.slice.call(ps.querySelectorAll(".ps-page")); all.forEach((p,i) =>{ const f=p.querySelectorAll(".ps-foot span"); if(f.length>1) f[f.length-1].textContent="Page "+(i+1)+" of "+all.length; }); }
/* v24 M3: a page whose content runs a little past the page gets tighter, so nothing is cut and no extra sheet comes out */
function psFit(){ Array.prototype.slice.call(document.querySelectorAll("#ps .ps-page")).forEach((p) =>{ const lim=function(){ return p.classList.contains("grow")?1123:p.clientHeight; }; if(p.scrollHeight<=lim()) return;/* R2-3: a growing page must fit one A4 sheet too */
  p.style.paddingTop="20px"; p.style.paddingBottom="20px"; let n=+((/ps-t(\d)/.exec(p.className)||[0,0])[1]); while(p.scrollHeight>lim()&&n<6){ p.classList.remove("ps-t"+n); n++; p.classList.add("ps-t"+Math.min(n,4)); Array.prototype.slice.call(p.querySelectorAll(".ps-note")).forEach((x) =>{ const h=parseFloat(x.style.minHeight)||0; if(h>28) x.style.minHeight=Math.round(h*.82)+"px"; }); }/* writing space shrinks a little too */ });
  if(!psFit.w&&document.fonts&&document.fonts.status!=="loaded"&&document.fonts.ready){ psFit.w=1; document.fonts.ready.then(() =>{ psFit(); }); } }
env.addEventListener("beforeprint",() =>{ try{ psFit(); }catch(e){} });/* fonts that load late make the text taller */
