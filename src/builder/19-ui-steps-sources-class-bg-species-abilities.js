import {ABK,ABN,esc,mod,sg} from "./01-logic-core-helpers.js";
import {htText,un} from "./03-logic-magic-item-effects.js";
import {B} from "./04-logic-storage.js";
import {CL,R14,RS14_ON} from "./05-logic-choice-model-ruleset.js";
import {CLS14} from "./06-data-2014-classes.js";
import {sdn,subLbl} from "./08-logic-2014-rules.js";
import {bgFeatN,choices,linNote,sbWx} from "./09-logic-feats-and-choices.js";
import {isDone} from "./10-logic-v17-additions.js";
import {abil} from "./11-logic-derivation.js";
import {PACK_TEMPLATE,allPacks} from "./13-logic-sources-and-packs.js";
import {MCL,TL,hpCalc,mcReqFail} from "./14-logic-multiclass-hp-shop.js";
import {card,choiceBody,metaOf,nC,ord,pickCls,pickSp,rt,rtp} from "./17-ui-step-builder.js";
import {choiceStep,clsTab,hbSubs,renderSpells,spellCounts} from "./18-ui-spells.js";
import {__R} from "./00-reg.js";
/* ---------- step: home (sources) ---------- */
export var showTpl=false,packTxt="",lgOpen=false;
/* v98: quick select for the Sources list. Sets of WotC sources, homebrew never included */
function srcSets(){const W=window.WX?WX.src:[],lg=W.filter((q) =>{return q.legacy&&!q.tp}).map((q) =>{return q.id}),n24=W.filter((q) =>{return !q.legacy&&!q.tp}).map((q) =>{return q.id}),tp=W.filter((q) =>{return q.tp}).map((q) =>{return q.id});/* third party books are never switched on by All or 2024 */n24.unshift("mom");if(window.EFA_CLS&&window.EFA_READY)n24.splice(1,0,"efa");n24.push("dmg");return {b14:lg,b24:n24,tp:tp,all:lg.concat(n24)}}
export function srcAll(k){const S=srcSets(),ids=k==="none"?(R14()?S.b14:S.all):(k==="14"?S.b14:k==="24"?S.b24:S.all),on=k!=="none";B.src=B.src||{core:true,dmg:true};ids.forEach((id) =>{B.src[id]=on});if(k==="none")S.tp.forEach((id) =>{B.src[id]=false});if(R14())B.src.phb14=true;else if(k==="none")B.src.dmg=true}/* the 2014 build keeps its core book, the 2024 build keeps the Dungeon Master's Guide */
function wx14(id){return (window.WX?WX.src:[]).filter((q) =>{return q.id===id})[0]||{}}/* v96 */
/* v49: what each source adds. Counts first, names of the small lists under a fold */
const MOM_SP=["Aarakocra","Bugbear","Centaur","Changeling","Deep Gnome","Duergar","Eladrin","Fairy","Firbolg","Air Genasi","Earth Genasi","Fire Genasi","Water Genasi","Githyanki","Githzerai","Goblin","Harengon","Hobgoblin","Kenku","Kobold","Lizardfolk","Minotaur","Satyr","Sea Elf","Shadar-kai","Shifter","Tabaxi","Tortle","Triton","Yuan-ti","Orc (MoM)"];
function srcLists(id){let L=[];
 if(id==="core"&&R14()){const a=wx14("phb14");L=[["Classes",Object.keys(CLS14).filter((c) =>{return c!=="Artificer"})],["Subclasses",a.subs||[]],["Races",a.species||[]],["Backgrounds",a.backgrounds||[]],["Feats",a.feats||[]],["Spells",null,SPELLS.filter((x) =>{return !x[12]}).length]];if((a.gear||[]).length)L.push(["Gear",a.gear])}/* v96: the 2014 book row lists what the 2014 book gives */
 else if(id==="dmg"&&R14()){const d=wx14("dmg14");L=[["Magic items",null,DMGI.length]];if((d.subs||[]).length)L.push(["Subclasses",d.subs]);if((d.species||[]).length)L.push(["Races",d.species]);if((d.gear||[]).length)L.push(["Gear",d.gear])}
 else if(id==="core"){const sub=[];Object.keys(CLASSES).forEach((c) =>{Object.keys(CLASSES[c].subs||{}).forEach((n) =>{if(!sbWx(n,c))sub.push(n)})});
  L=[["Classes",Object.keys(CLASSES)],["Subclasses",sub],["Species",Object.keys(SPECIES).filter((k) =>{return !SPECIES[k].hb})],["Backgrounds",Object.keys(BACKGROUNDS).filter((k) =>{return !BACKGROUNDS[k].hb})],["Feats",Object.keys(FEATS).filter((k) =>{return !FEATS[k].hb})],["Spells",null,SPELLS.filter((x) =>{return !x[12]}).length]]}
 else if(id==="dmg")L=[["Magic items",null,DMGI.length]];
 else if(id==="mom")L=[["Species",MOM_SP]];
 else if(id==="efa"){const N=window.EFA_NAMES||{subs:[],species:[],feats:[]};L=[["Classes",["Artificer"]],["Subclasses",N.subs],["Species",N.species],["Feats",N.feats],["Backgrounds",N.bgs||[]],["Spells",null,SPELLS.filter((x) =>{return x[3].indexOf("Artificer")>=0}).length]]}/* v56 */
 else if(window.WX&&WX.src.some((q) =>{return q.id===id})){const q=WX.src.filter((q) =>{return q.id===id})[0];L=(q.feats||[]).length?[["Feats",q.feats]]:[];if((q.subs||[]).length)L.push(["Subclasses",q.subs]);if(q.spells.length)L.push(["Spells",q.spells]);if((q.items||[]).length)L.push(["Magic items",q.items]);if((q.species||[]).length)L.unshift(["Species",q.species]);if((q.backgrounds||[]).length)L.push(["Backgrounds",q.backgrounds]);if((q.gear||[]).length)L.push(["Gear",q.gear])}/* v62 */
 else{const p=allPacks().filter((x) =>{return x.id===id})[0]||{},ks=function(o){return o?Object.keys(o):[]},sb=[];ks(p.subclasses).forEach((c) =>{const v=p.subclasses[c];(Array.isArray(v)?v.map((x) =>{return x.name||x}):ks(v)).forEach((n) =>{sb.push(n)})});
  if(ks(p.species).length)L.push(["Species",ks(p.species)]);if(sb.length)L.push(["Subclasses",sb]);if(Array.isArray(p.feats)&&p.feats.length)L.push(["Feats",p.feats.map((x) =>{return x.name||x})]);if(Array.isArray(p.items)&&p.items.length)L.push(["Items",null,p.items.length]);if(ks(p.skills).length)L.push(["Skills",ks(p.skills)])}
 return L}
function srcContents(id){const L=srcLists(id);if(!L.length)return "";
 return '<details class="srcc"><summary>Contents <span>'+L.map((x) =>{return (x[2]!=null?x[2]:x[1].length)+" "+x[0].toLowerCase()}).join(", ")+'</span></summary>'+L.map((x) =>{return '<p><b>'+esc(x[0])+' ('+(x[2]!=null?x[2]:x[1].length)+')</b>'+(x[1]?'<br>'+x[1].map(esc).join(", "):'')+'</p>'}).join("")+'</details>'}
let srcFq="",srcFqT=0;
function applySrcF(){const i=document.getElementById("srcfq");if(!i)return;const q=i.value.toLowerCase().trim();srcFq=i.value;let any=0;
 document.querySelectorAll("#srcfq ~ .srcw, #srcfq ~ details.srcg").forEach((n) =>{ if(n.tagName==="DETAILS"){ let rows=n.querySelectorAll(".srcw"),hit=0; rows.forEach((r) =>{ const m=!q||r0(r).indexOf(q)>=0; r.style.display=m?"":"none"; if(m)hit++ }); n.style.display=(!q||hit)?"":"none"; if(q&&hit&&n.id!=="hbList")n.open=true; any+=hit }
  else { const m=!q||(r0(n)).indexOf(q)>=0; n.style.display=m?"":"none"; if(m)any++ } });
 let no=document.getElementById("srcfno"); if(q&&!any){ if(!no){ no=document.createElement("p"); no.id="srcfno"; no.className="fd bhint"; no.textContent="No book matches."; i.insertAdjacentElement("afterend",no) } } else if(no) no.remove(); }
function r0(n){ const l=n.querySelector(".srcrow"),b=l&&l.querySelector("b"),sm=l&&l.querySelector("small"); return ((b?b.textContent:"")+" "+(sm?sm.textContent.split(".")[0]:"")).toLowerCase() }
document.addEventListener("input",(e) =>{ if(e.target&&e.target.id==="srcfq") applySrcF() });
new MutationObserver(() =>{ if(srcFq&&document.getElementById("srcfq")&&!srcFqT){ srcFqT=requestAnimationFrame(() =>{ srcFqT=0; applySrcF() }) } }).observe(document.body,{childList:true,subtree:true});
let hbQ="";
function hbMatch(){const L=window.HBIDX||[],q=hbQ.toLowerCase().trim();return L.filter((s) =>{return B.src[s.id]||(q&&(s.name+" "+s.desc+" "+s.tag).toLowerCase().indexOf(q)>=0)}).slice(0,60)}
function hbRows(){return hbMatch().map((q) =>{return '<div class="srcw"><label class="srcrow"><input type="checkbox" data-srcck="'+esc(q.id)+'"'+(B.src[q.id]?" checked":"")+'><span><b>'+esc(q.name)+'</b><small>'+esc(q.desc)+'</small></span></label></div>'}).join("")||'<p class="fd bhint">No match.</p>'}
function hbSection(){const L=window.HBIDX||[];if(!L.length)return "";const on=L.filter((s) =>{return B.src[s.id]}).length;return '<details class="srcg"'+(on||hbQ?" open":"")+'><summary class="sph">Homebrew Library <small>'+L.length+' sources'+(on?", "+on+" on":"")+'</small></summary><p class="fd bhint">Community homebrew from open data. The Library shows facts such as level, school, rarity and stat blocks. Text is not copied. Search for a title or author, then switch a source on.</p><input type="search" class="btx" id="hbq" placeholder="Search title or author" value="'+esc(hbQ)+'" autocomplete="off"><div id="hbList">'+hbRows()+'</div></details>'}
document.addEventListener("input",(e) =>{const t=e.target;if(t&&t.id==="hbq"){hbQ=t.value;const l=document.getElementById("hbList");if(l)l.innerHTML=hbRows()}});
export function renderHome(){B.src=B.src||{core:true,dmg:true};let h=__R.qbCard()+'<h2 class="ttl">Character Preferences</h2>'+(RS14_ON?'<h3 class="sph">Rules edition</h3><p class="fd bhint">Choose the rules this character follows. The builder and the sheet change their words, numbers and lists to match.</p><div class="radios h" data-keep="1">'+[["2024","2024 rules","Species, Origin feat, Weapon Mastery"],["2014","2014 rules","Race, ability scores from race, no Weapon Mastery"]].map((r) =>{return '<button type="button" class="rad'+((R14()?"2014":"2024")===r[0]?" on":"")+'" data-rs="'+r[0]+'"><b>'+r[1]+'</b><span>'+r[2]+'</span></button>'}).join("")+'</div>':"")+'<h3 class="sph">Sources</h3><p class="fd bhint">Only enabled sources show up, here and on the sheet.</p><input type="search" class="btx" id="srcfq" placeholder="Search books" value="'+esc(srcFq)+'" autocomplete="off">'+(function(){const S=srcSets(),on=function(a){return a.length&&a.every((id) =>{return B.src[id]!==false&&(B.src[id]||id==="dmg")})},bt=function(k,t,a){return '<button type="button" class="bdg add'+(a?" on":"")+'" data-srcall="'+k+'">'+t+'</button>'};return '<div class="eqact srcquick">'+(R14()?bt("14","All 2014 books ("+S.b14.length+")",on(S.b14)):bt("24","All 2024 books ("+S.b24.length+")",on(S.b24))+bt("all","All WotC books ("+S.all.length+")",on(S.all)))+bt("none","Turn all off",false)+'</div>'})();
 function row(id,name,desc,on,lock,del){return '<div class="srcw">'+row0(id,name,desc,on,lock,del)+srcContents(id)+'</div>'}
 function row0(id,name,desc,on,lock,del){return '<label class="srcrow"><input type="checkbox" data-srcck="'+esc(id)+'"'+(on?" checked":"")+(lock?" disabled":"")+'><span><b>'+esc(name)+'</b><small>'+esc(desc)+'</small></span>'+(del?'<button type="button" class="rmv" data-packdel="'+esc(id)+'">\u2715 Remove</button>':'')+'</label>'}
 h+=R14()?row("core","5e Core Rules: Player's Handbook (2014)","Classes, subclasses, races, backgrounds, feats, spells, and equipment. Required to build a character.",true,true):row("core","5.5e Core Rules: Player's Handbook (2024)","Classes, subclasses, species, backgrounds, feats, spells, and equipment. Required to build a character.",true,true);
 h+=R14()?row("dmg","5e Core Rules: Dungeon Master's Guide (2014)","Magic items such as Belt of Giant Strength, Ring of Protection, and Flame Tongue, plus the book's extra races and subclasses.",B.src.dmg!==false,false):row("dmg","5.5e Core Rules: Dungeon Master's Guide (2024)","Magic items such as Belt of Giant Strength, Ring of Protection, and Flame Tongue.",B.src.dmg!==false,false); let hid=0,show24=function(id){if(!R14()||B.src[id])return true;hid++;return false};/* v96: in a 2014 build the sources made for the 2024 rules stay out of the list, unless one is already on, so it can be turned off */
 if(show24("mom"))h+=row("mom","Mordenkainen Presents: Monsters of the Multiverse (2022)","31 more species, such as Aarakocra, Centaur, Eladrin, Tortle, and Yuan-ti.",!!B.src.mom,false);/* v38 p13 */
 if(window.EFA_CLS&&window.EFA_READY&&show24("efa"))h+=row("efa","Eberron: Forge of the Artificer (2025)","The Artificer class with five subclasses, five Eberron species, and the Dragonmark feats.",!!B.src.efa,false);/* v56 */
 (window.WX?WX.src:[]).filter((q) =>{return !q.legacy&&!q.tp}).forEach((q) =>{if(show24(q.id))h+=row(q.id,q.name,q.desc,!!B.src[q.id],false)});/* v62 */
 if(hid)h+='<p class="fd bhint">'+hid+' sources made for the 2024 rules are hidden while you play by the 2014 rules. Switch to the 2024 rules to see them.</p>';
 const LG=(window.WX?WX.src:[]).filter((q) =>{return q.legacy&&!q.tp&&!(R14()&&(q.id==="phb14"||q.id==="dmg14"))});if(LG.length){const lgOn=LG.filter((q) =>{return B.src[q.id]}).length;h+='<details class="srcg"'+(lgOpen||lgOn?" open":"")+'><summary class="sph" data-lgsum="1">'+(R14()?"More 2014 Books":"Older Books (2014)")+' <small>'+LG.length+' sources'+(lgOn?", "+lgOn+" on":"")+'</small></summary><p class="fd bhint">'+(R14()?"Races, backgrounds, subclasses, spells and items from the other 2014 books. Each source is off until you turn it on.":"Content from the 2014 books. It plays with the 2024 rules, and each source is off until you turn it on.")+'</p>';LG.forEach((q) =>{h+=row(q.id,q.name,q.desc,!!B.src[q.id],false)});h+='</details>'}/* v69 v96 */ const TPL=(window.WX?WX.src:[]).filter((q) =>{return q.tp&&!q.hb});if(TPL.length){const tpOn=TPL.filter((q) =>{return B.src[q.id]}).length;h+='<details class="srcg"'+(tpOn?" open":"")+'><summary class="sph">Third Party Books <small>'+TPL.length+' source'+(TPL.length>1?"s":"")+(tpOn?", "+tpOn+" on":"")+'</small></summary><p class="fd bhint">Books by other publishers, added from community data and written in our own words. Each book is off until you turn it on. Not official Wizards of the Coast content.</p>';TPL.forEach((q) =>{h+=row(q.id,q.name,(q.pub?"By "+q.pub+". ":"")+q.desc,!!B.src[q.id],false)});h+='</details>'}/* third party */ h+=hbSection(row);if(allPacks().length)h+='<h3 class="sph">Homebrew Sources</h3>';/* v96 */
 allPacks().forEach((p) =>{const bi=!!HB_BUILTIN[p.id];h+=row(p.id,p.name,(p.desc||"Homebrew")+(bi?"":" (added by you)"),!!B.src[p.id],false,!bi);if(p.lore&&p.lore.length)h+='<button type="button" class="link lorebtn" data-lore="'+esc(p.id)+'">Read: '+esc(p.name.replace(/ \(Homebrew\)$/,""))+', '+esc(p.loreLabel||"Public Lore")+'</button>'});
 h+='<h3 class="sph">Create Homebrew</h3><p class="fd bhint">Your own species, feats, and magic items go into the My Homebrew source above.</p>'+__R.hbForm();/* v26 RU38 no. 8 */
 h+='<h3 class="sph">Add Homebrew Source</h3><p class="fd bhint">Paste a pack (JSON) and tap Add Source. It shows up as a new source above.</p><textarea class="btx" id="packtxt" rows="5" placeholder="{ &quot;id&quot;: &quot;my-homebrew&quot;, &quot;name&quot;: ... }">'+esc(packTxt)+'</textarea><div class="eqact"><button type="button" class="bdg add" data-packadd="1">Add Source</button><button type="button" class="link" data-tpl="1">'+(showTpl?"Hide":"Show")+' pack template</button></div>'+
  (showTpl?'<textarea class="btx" rows="12" readonly style="font:12px monospace">'+esc(JSON.stringify(PACK_TEMPLATE,null,1))+'</textarea>':'');
 return h}

/* ---------- step: class ---------- */
const FEAT_FOR={clsk:"core",wm:"Weapon Mastery",sub:"Subclass",p1opt:1,p7opt:1};
/* v49: level table of the class. The row of the character level is highlighted */
function lvTable(c,L){let rows="";for(var n=1;n<=20;n++){const fs=c.f.filter((f) =>{return f[0]===n}).map((f) =>{return esc(f[1])}).join(", ");rows+='<tr'+(n===L?' class="cur" aria-current="true"':'')+'><td>'+n+'</td><td>+'+(2+Math.floor((n-1)/4))+'</td><td>'+(fs||'\u2014')+'</td></tr>'}
 return '<details class="lvtab"><summary>Level table</summary><div class="lvwrap"><table><thead><tr><th>Level</th><th>Prof. Bonus</th><th>Features</th></tr></thead><tbody>'+rows+'</tbody></table></div></details>'}
export function renderClass(){let c=CL(),L=B.level,a=abil(),h="";
 if(pickCls||un("cls")){h+='<h2 class="ttl">Choose a Class</h2>'+Object.keys(CLASSES).map((n) =>{const x=CLASSES[n];return '<button type="button" class="pickrow" data-setcls="'+n+'"><b>'+n+'</b><span>d'+x.hd+' Hit Die \u2022 Primary '+(ABN[x.prim]||x.prim)+' \u2022 Saves '+x.saves.join(", ")+'</span></button>'}).join("");return h}
 const H=hpCalc(),hp=H.max,others=TL()-L;
 h+='<div class="lvrow"><b>Character Level: '+TL()+'</b><span>Milestone Advancement</span></div>';
 h+='<div class="hprow"><div><p><b>Max Hit Points:</b> '+hp+'</p><p><b>Hit Dice:</b> '+[L+'d'+c.hd].concat(MCL().map((m) =>{return m.lv+'d'+CLASSES[m.cls].hd})).join(' + ')+'</p></div><label class="hpm">HP<select class="dd sm" data-b="hpMode"><option value="avg"'+(B.hpMode!=="roll"?' selected':'')+'>Fixed (average)</option><option value="roll"'+(B.hpMode==="roll"?' selected':'')+'>Rolled</option></select></label></div>'+(B.hpMode==="roll"?hpRollUI(H):'');
 h+='<div class="clsrow"><div><small>'+esc(B.sub&&B.sub!=="__custom"?B.sub:B.sub==="__custom"?(B.cSub||"Homebrew"):"")+'</small><b>'+B.cls+'</b></div><label>Level<select class="dd sm" data-lvsel="1">'+Array.from({length:20-others},(_,i) =>{return '<option'+(i+1===L?" selected":"")+'>'+(i+1)+'</option>'}).join("")+'</select></label><button type="button" class="bxbtn" data-chgcls="1" aria-label="Change class">\u2715</button></div>';
 h+='<div class="subtabs"><button type="button" class="'+(clsTab==="feat"?"on":"")+'" data-ctab="feat">Class Features</button><button type="button" class="'+(clsTab==="spell"?"on":"")+'" data-ctab="spell">Spells'+(spellCounts().length?'<i class="tdot" role="img" aria-label="Spells to choose"></i>':'')+'</button></div>';
 if(clsTab==="spell")return h+renderSpells();
 h+=lvTable(c,L);
 /* build cards */
 const cs=choices(),used={},cards=[];
 const core='<p class="fd"><b>Hit Die:</b> d'+c.hd+'. <b>Saving Throws:</b> '+c.saves.map((k) =>{return ABN[k]}).join(", ")+'. <b>Armor:</b> '+(c.armor||"None")+'. <b>Weapons:</b> '+c.weapons+'.'+(c.tools?' <b>Tools:</b> '+c.tools+'.':'')+'</p>';
 const ck=cs.filter((x) =>{return x.key==="clsk"})[0],ctl=cs.filter((x) =>{return x.key==="clsTool"})[0];used.clsk=1;if(ctl)used.clsTool=1;
 /* v32 RL49: choices inside a feat go in the card of that feat (fk = the feat's choice key) */
 const subOf=function(list){const o=[];list.forEach((x) =>{cs.forEach((y) =>{if(y.fk&&y.fk===x.key&&!used[y.key]){used[y.key]=1;o.push(y)}})});return o},subH=function(L){return L.map((y) =>{return '<h4>'+esc(y.title)+'</h4>'+choiceBody(y)}).join("")};
 cards.push({id:"core",t:"Core "+B.cls+" Traits",l:1,n:ck.n+(ctl?ctl.n:0),todo:!isDone(ck)||(ctl&&!isDone(ctl)),b:core+'<h4>Skill Proficiencies</h4>'+choiceBody(ck)+(ctl?'<h4>Tool Proficiencies</h4>'+choiceBody(ctl):"")});
 c.f.forEach((f) =>{if(f[0]>L)return;
  let mine=cs.filter((x) =>{if(used[x.key])return false;if(x.inv&&x.mc==null)return f[1]==="Eldritch Invocations";/* v32 RL50: any level */if(x.lvl!==f[0])return false;
   if(x.key==="bwc")return f[1]==="Fighting Style";
   if(x.key==="wm")return f[1]==="Weapon Mastery";
   if(x.t==="sub")return /Subclass$/.test(f[1]);
   if(x.t==="fs")return f[1]==="Fighting Style";
   if(x.t==="opt")return f[1]===x.list;
   if(x.t==="exp")return /Expertise|Deft Explorer|Scholar/.test(f[1]);
   if(x.t==="multi"&&((x.list===INVOCATIONS&&f[1]==="Eldritch Invocations")||(x.list===METAMAGIC&&f[1]==="Metamagic")))return true;/* v32: other multi choices match by feature below */
   if(x.key==="p3skill")return f[1]==="Primal Knowledge";
   if(x.key==="langRogue")return f[1]==="Thieves' Cant";
   if(x.key==="langRanger")return f[1]==="Deft Explorer";
   if(x.key==="feat19")return f[1]==="Epic Boon";if(x.feature&&x.feature===f[1]&&x.mc==null)return true;/* v32 RL50: mc 0 is a multiclass too *//* v20 RD24 */return false});
  mine.forEach((x) =>{used[x.key]=1});const fs2=subOf(mine);
  let body='<p class="fd">'+rtp((CF_FULL[B.cls+"|"+f[1]]||f[2])+(/Subclass$/.test(f[1])?hbSubs(B.cls):""))+'</p>'+mine.map((x) =>{return (mine.length>1?'<h4>'+esc(x.title)+'</h4>':'')+choiceBody(x)}).join("")+subH(fs2);mine=mine.concat(fs2);
  if(/Subclass$/.test(f[1])&&B.sub&&B.sub!=="__custom")body+='';
  cards.push({id:"f"+f[0]+f[1],t:f[1],l:f[0],n:mine.reduce((t,x) =>{return t+nC(x)},0),todo:mine.some((x) =>{return !isDone(x)}),b:body})});
 if(B.sub&&B.sub!=="__custom")c.subs[B.sub].forEach((f) =>{if(f[0]>L)return;const mine=cs.filter((x) =>{return !used[x.key]&&x.mc==null&&x.lvl===f[0]&&((x.t==="multi"&&x.list===MANEUVERS&&f[1]==="Combat Superiority")||(x.t==="fs"&&f[1]==="Additional Fighting Style")||(x.feature&&x.feature===f[1]))});mine.forEach((x) =>{used[x.key]=1});
  cards.push({id:"s"+f[0]+f[1],t:f[1],l:f[0],n:mine.reduce((t,x) =>{return t+nC(x)},0),todo:mine.some((x) =>{return !isDone(x)}),b:'<p class="fd">'+rtp(SUB_FULL[B.sub+"|"+f[1]]||f[2])+'</p>'+mine.map((x) =>{return (mine.length>1?'<h4>'+esc(x.title)+'</h4>':'')+choiceBody(x)}).join("")})});
 cs.forEach((x) =>{if(used[x.key]||x.mc!=null||choiceStep(x)!=="class"||x.fk)return;used[x.key]=1;
  const t=x.t==="feat"?x.lvl+": Ability Score Improvement":x.title,fs3=subOf([x]);
  cards.push({id:x.key,t:t,l:x.lvl,n:nC(x)+fs3.reduce((t2,y) =>{return t2+nC(y)},0),todo:!isDone(x)||fs3.some((y) =>{return !isDone(y)}),b:(x.t==="feat"?'<p class="fd bhint">Take Ability Score Improvement or another feat you qualify for.</p>':'')+choiceBody(x)+subH(fs3)})});
 cards.sort((p,q) =>{return p.l-q.l});
 h+=cards.map((k) =>{return card(k.id,k.t,metaOf(k.n,k.l),k.b,{todo:k.todo})}).join("");
 if(TL()<20){let nx=c.f.filter((f) =>{return f[0]===L+1}).map((f) =>{return f[1]});if(B.sub&&B.sub!=="__custom")nx=nx.concat(c.subs[B.sub].filter((f) =>{return f[0]===L+1}).map((f) =>{return f[1]}));
  h+='<button type="button" class="lvup" data-lvup="1">Level Up to '+(L+1)+'<small>'+esc(nx.join(", ")||"Hit Points")+'</small></button>'}
 h+=MCL().map((m,i) =>{return mcBlock(m,i)}).join("");
 if(TL()<20)h+='<div class="addcls"><select class="dd" data-addcls="1"><option value="">+ Add Another Class (multiclass)</option>'+Object.keys(CLASSES).filter((n) =>{return n!==B.cls&&!MCL().some((m) =>{return m.cls===n})}).map((n) =>{const why=mcReqFail(n)||mcReqFail(B.cls);return '<option value="'+n+'">'+n+(why?' (needs '+why+')':'')+'</option>'}).join("")+'</select><p class="fd bhint">Needs 13 in the primary ability of each class you have and the new one.</p></div>';
 return h}
function hpRollUI(H){return '<div class="hproll"><p class="fd bhint">Enter each roll, or tap Roll. Empty boxes use the average.</p>'+H.list.map((e) =>{return '<label><span>'+esc(e.c)+' (d'+e.hd+')</span><input class="btx c" type="number" min="1" max="'+e.hd+'" data-hpr="'+e.key+'" value="'+(B.hpr[e.key]||'')+'"><button type="button" class="sbtn" data-roll="'+e.key+'" data-hd="'+e.hd+'">Roll</button></label>'}).join("")+'</div>'}
function mcBlock(m,i){let c=CLASSES[m.cls],others=TL()-m.lv,h='<div class="mcblk"><div class="clsrow"><div><small>'+esc(m.sub||"")+'</small><b>'+m.cls+'</b></div><label>Level<select class="dd sm" data-mclv="'+i+'">'+Array.from({length:20-others},(_,k) =>{return '<option'+(k+1===m.lv?" selected":"")+'>'+(k+1)+'</option>'}).join("")+'</select></label><button type="button" class="bxbtn" data-mcdel="'+i+'" aria-label="Remove class">\u2715</button></div>';
 const why=[mcReqFail(B.cls)?B.cls+" needs "+mcReqFail(B.cls):"",mcReqFail(m.cls)?m.cls+" needs "+mcReqFail(m.cls):""].filter(Boolean).join(", ");if(why)h+='<div class="caution">\u26a0 Multiclass prerequisite not met: '+esc(why)+'. Multiclassing needs 13 in the primary ability of your current class and of the new class. Your DM can allow it anyway.</div>';
 const g=MC_GRANT[m.cls]||{};h+=card("mcg"+i,"Multiclass Proficiencies","",'<p class="fd">'+([g.armor?"Armor: "+g.armor:"",g.weapons?"Weapons: "+g.weapons:"",g.tools?"Tools: "+g.tools:"",g.sk?"One skill":""].filter(Boolean).join(". ")||"None")+'. You don\'t gain this class\'s saving throws.</p>');
 const cs=choices().filter((x) =>{return x.mc===i});
 const feats=c.f.filter((f) =>{return f[0]<=m.lv}).map((f) =>{return {l:f[0],t:f[1],d:f[2]}});
 if(m.sub&&c.subs[m.sub])c.subs[m.sub].forEach((f) =>{if(f[0]<=m.lv)feats.push({l:f[0],t:f[1],d:SUB_FULL[m.sub+"|"+f[1]]||f[2]})});
 const items=feats.map((f) =>{return {l:f.l,html:card("mc"+i+f.l+f.t,f.t,ord(f.l)+" level",'<p class="fd">'+rtp(CF_FULL[m.cls+"|"+f.t]||f.d)+'</p>')}});
 const mcSub=function(x){return cs.filter((y) =>{return y.fk&&y.fk===x.key})};/* v32 RL49 */
 cs.forEach((x) =>{if(x.fk&&cs.some((y) =>{return y.key===x.fk}))return;const xs=mcSub(x),body=x.t==="mcsub"?'<select class="dd" data-mcsub="'+i+'"><option value="">- Choose a '+subLbl(m.cls)+' -</option>'+Object.keys(c.subs).map((s) =>{return '<option value="'+esc(s)+'"'+(m.sub===s?" selected":"")+'>'+esc(sdn(s))+'</option>'}).join("")+'</select>':(x.t==="feat"?'<p class="fd bhint">Take Ability Score Improvement or another feat you qualify for.</p>':'')+choiceBody(x)+xs.map((y) =>{return '<h4>'+esc(y.title)+'</h4>'+choiceBody(y)}).join("");
  items.push({l:x.lvl,html:card(x.key,x.t==="feat"?m.cls+" "+x.lvl+": Ability Score Improvement":x.title,metaOf(nC(x)+xs.reduce((t,y) =>{return t+nC(y)},0),x.lvl),body,{todo:!isDone(x)||xs.some((y) =>{return !isDone(y)})})})});
 items.sort((p,q) =>{return p.l-q.l});
 return h+items.map((x) =>{return x.html}).join("")+'</div>'}

/* ---------- step: background ---------- */
/* v49: a strip of key facts at the top of a Species or Background page */
function bStrip(a){return '<div class="bstrip">'+a.map((x) =>{return '<div><small>'+esc(x[0])+'</small><b>'+esc(x[1])+'</b></div>'}).join('')+'</div>'}
export function renderBg(){let bg=BACKGROUNDS[B.bg],h='<h2 class="ttl">'+(R14()?"Choose a Background":"Choose Origin: Background")+'</h2>';
 if(un("bg"))return h+'<select class="dd" data-b="bg"><option value="" selected>- Choose a Background -</option>'+Object.keys(BACKGROUNDS).filter((n) =>{return !R14()||BACKGROUNDS[n].leg}).map((n) =>{return '<option>'+n+'</option>'}).join("")+'</select>';
 h+='<select class="dd" data-b="bg">'+Object.keys(BACKGROUNDS).filter((n) =>{return !R14()||BACKGROUNDS[n].leg}).map((n) =>{return '<option'+(n===B.bg?" selected":"")+'>'+n+'</option>'}).join("")+'</select>';
 h+=bStrip([["Skills",bg.sk.concat(bg.skPick?[(bg.skPick.n>1?bg.skPick.n+" of your choice":"1 of your choice")]:[]).join(", ")||"None"],["Tool",bg.tool],].concat(R14()?[]:[["Feat",bgFeatN(bg)],["Ability scores",bg.ab.map((k) =>{return ABN[k]}).join(", ")]]));
 let F=FEATS[bgFeatN(bg)],CB=choices(),bfc=null,fsb=CB.filter((c) =>{return c.fk==="Origin feat ("+B.bg+")"}),bt=CB.filter((c) =>{return c.key==="bgTool"})[0];const bsk=CB.filter((c) =>{return c.key==="bgsk"})[0];bfc=CB.filter((c) =>{return c.key==="bgfeatc"})[0];
 if(bsk)h+=card("bgsk","Skill Proficiency",metaOf(bsk.n,0)||bsk.n+" Choice"+(bsk.n>1?"s":""),'<p class="fd bhint">Choose '+bsk.n+' skill'+(bsk.n>1?"s":"")+'. A skill you already have from another source is not available.</p>'+choiceBody(bsk),{todo:!isDone(bsk)});/* v70 */
 if(bt)h+=card("bgtool","Tool Proficiency",metaOf(bt.n,0)||"1 Choice",'<p class="fd bhint">Choose one kind of '+esc(TOOL_ONE[bt.cats[0]])+'. Each kind needs its own proficiency.</p>'+choiceBody(bt),{todo:!isDone(bt)});/* v32 RL49 */ if(!R14())h+=card("bgfeat",bgFeatN(bg),"Granted Feat",(bfc?'<p class="fd bhint">This background lets you choose its feat.</p>'+choiceBody(bfc):"")+'<p class="fd">'+rtp(F?(F.full||F.d):"")+'</p>'+fsb.map((x) =>{return (fsb.length>1?'<h4>'+esc(x.title)+'</h4>':"")+choiceBody(x)}).join(""),{todo:fsb.some((x) =>{return !isDone(x)})});
 const doneAb=R14()||B.bgMode==="111"||(B.bg2&&B.bg1);
 let ab='<p class="fd">Increase '+bg.ab.join(", ")+'. Pick +2 to one and +1 to another, or +1 to all three. No score can go above 20.</p><div class="radios h"><button type="button" class="rad'+(B.bgMode==="21"?" on":"")+'" data-bgmode="21"><b>+2 / +1</b></button><button type="button" class="rad'+(B.bgMode==="111"?" on":"")+'" data-bgmode="111"><b>+1 / +1 / +1</b></button></div>';
 if(B.bgMode==="111")ab+='<div class="picked"><p>Applied automatically: '+bg.ab.map((k) =>{return '<b>'+ABN[k]+' +1</b>'}).join(', ')+'. No choice needed, because this background always uses these three scores.</p></div>';
 if(B.bgMode==="21")ab+='<div class="two"><label>+2 to<select class="dd" data-b="bg2"><option value="">- Choose -</option>'+bg.ab.map((k) =>{return '<option value="'+k+'"'+(B.bg2===k?" selected":"")+'>'+ABN[k]+'</option>'}).join("")+'</select></label><label>+1 to<select class="dd" data-b="bg1"><option value="">- Choose -</option>'+bg.ab.filter((k) =>{return k!==B.bg2}).map((k) =>{return '<option value="'+k+'"'+(B.bg1===k?" selected":"")+'>'+ABN[k]+'</option>'}).join("")+'</select></label></div>';
 if(!R14())h+=card("bgab","Ability Scores",B.bgMode==="111"?"3 Choices":"2 Choices",ab,{todo:!doneAb});
 (bg.bf||[]).forEach((f,i) =>{h+=card("bgf"+i,f[0],"Feature",'<p class="fd">'+esc(f[1])+'</p>')}); if(bg.leg&&!R14())h+='<p class="fd bhint">This is a 2014 background. It has no ability increase of its own, so the three scores above follow its skills.'+(bg.featOpts&&!bg.featOpts.length?"":"")+'</p>';
 h+=card("bgeq","Equipment","Starting gear",(R14()?'<p class="fd">'+esc(bg.eq)+'.</p>':'<p class="fd"><b>Option A:</b> '+esc(bg.eq)+'.<br><b>Option B:</b> 50 GP.</p>')+'<p class="fd bhint">Choose on the Equipment step.</p>');
 return h}

/* ---------- step: species ---------- */
export function renderSpecies(){let h="";
 if(pickSp||un("species")){h+='<h2 class="ttl">Choose a '+(R14()?"Race":"Species")+'</h2>'+(R14()?__R.sp14List():Object.keys(SPECIES)).concat(["Custom"]).map((n) =>{const s=SPECIES[n];return '<button type="button" class="pickrow" data-setsp="'+n+'"><b>'+(n==="Custom"?"Custom (homebrew)":(R14()?n.replace(/ \(2014\)$/,""):n))+'</b><span>'+(s?s.traits.map((t) =>{return t[0]}).join(", "):"Your setting's species")+'</span></button>'}).join("");return h}
 if(B.species==="Custom"){h+='<div class="sphead"><div><h2>Custom species</h2></div><button type="button" class="link" data-chgsp="1">Change Species</button></div>';
  h+='<div class="two"><label>Name<input class="btx" data-b="cSpecies.name" value="'+esc(B.cSpecies.name)+'"></label><label>Size<select class="dd" data-b="cSpecies.size"><option'+(B.cSpecies.size==="Medium"?" selected":"")+'>Medium</option><option'+(B.cSpecies.size==="Small"?" selected":"")+'>Small</option></select></label><label>Speed (ft)<input class="btx" type="number" data-b="cSpecies.speed" value="'+B.cSpecies.speed+'"></label><label>Darkvision (ft)<input class="btx" type="number" data-b="cSpecies.dark" value="'+B.cSpecies.dark+'"></label></div>';const lc0=choices().filter((c) =>{return c.key==="lang"})[0];if(lc0)h+=card("lang","Languages",R14()?((lc0.n||2)+" Choices"):"2 Choices \u2022 Origin",choiceBody(lc0),{todo:!isDone(lc0)});return h}/* v99 */
 const s=SPECIES[B.species],cs=choices();
 const dn=R14()?B.species.replace(/ \(2014\)$/,""):B.species;h+='<div class="sphead"><div><h2>'+dn+'</h2><p><b>'+dn+' Traits</b><br>'+s.traits.map((t) =>{return t[0]}).join(", ")+'</p></div><button type="button" class="link" data-chgsp="1">Change Species</button></div>';
 h+=bStrip([["Size",/or/.test(s.size)?(B.size||"Medium"):s.size],["Speed",s.speed+" ft"],["Darkvision",s.dark?s.dark+" ft":"None"],["Languages",R14()?((s.lgf&&s.lgf.length?s.lgf:["Common"]).join(", ")+(s.lgn?" + "+s.lgn+" of your choice":"")):"Common + 2"]]);
 const szNote='<p class="fd bhint">Both take up a 5-ft square. '+(R14()?'Small creatures have Disadvantage on attack rolls with Heavy weapons.':'Heavy weapons need Strength 13 (melee) or Dexterity 13 (ranged).')+'</p>';
 if(/or/.test(s.size))h+=card("size","Size",(B.size||"Medium")+" \u2022 "+htText(B.species,B.size||"Medium"),'<div class="radios h">'+["Medium","Small"].map((z) =>{return '<button type="button" class="rad'+((B.size||"Medium")===z?" on":"")+'" data-size="'+z+'"><b>'+z+'</b><span>'+htText(B.species,z)+'</span></button>'}).join("")+'</div>'+szNote);
 else h+=card("size","Size",s.size+" \u2022 "+htText(B.species,s.size),'<p class="fd">'+s.size+', '+htText(B.species,s.size)+'.</p>'+szNote); h+=card("speed","Speed","",'<p class="fd">'+s.speed+' feet.'+(s.dark?' Darkvision '+s.dark+' feet.':'')+'</p>');
 if(R14()){const rac=cs.filter((c) =>{return /^rasi/.test(c.key)}),ra0=rac[0],fx0=Object.keys(s.asi||{}).map((k) =>{return ABN[k]+" +"+s.asi[k]}).join(", ");const rb0=s.asiFlex?"Choose a pattern":(ra0?"Choose "+ra0.n:(fx0?"Fixed":"None"));let rbody=(fx0?'<p class="fd">'+esc(fx0)+".</p>":"");if(s.asiPick&&!s.asiFlex)rbody+='<p class="fd bhint">Choose '+s.asiPick.n+" different scores to raise by "+(s.asiPick.v||1)+".</p>";rac.forEach((c) =>{rbody+='<p class="fd bhint">'+esc(c.title)+"</p>"+choiceBody(c)});h+=card("rasi","Ability Score Increase",rb0,rbody,{todo:rac.some((c) =>{return !isDone(c)})})}/* v82 v83 */
 const lin=cs.filter((c) =>{return c.key==="lin"})[0],sab=cs.filter((c) =>{return c.key==="spab"})[0];/* RL35 2b */
 const hcn=cs.filter((c) =>{return c.key==="hecan"})[0];/* v32 RL49 no. 43 */
 if(lin)h+=card("lin",s.lin.label,sab?"2 Choices":"1 Choice",choiceBody(lin)+linNote(s)+(hcn?'<h4>Lineage cantrip</h4><p class="fd">'+esc(hcn.def[0])+' unless you pick another Wizard cantrip. You can swap it after a Long Rest.</p>'+choiceBody(hcn):"")+(sab?'<h4>Spellcasting ability</h4><p class="fd bhint">The spells from your '+esc(s.lin.label)+' use this ability.</p>'+choiceBody(sab):""),{todo:!isDone(lin)||(sab&&!isDone(sab))});
 const so=cs.filter((c) =>{return c.key==="spopt"})[0];if(so){const sub=["spfeat","spsk2","spcan","spwep"].map((k) =>{const x=cs.filter((c) =>{return c.key===k})[0];if(!x)return "";let ex="";if(k==="spfeat")ex=cs.filter((c) =>{return c.fk==="Origin feat ("+B.species+", Versatile)"}).map(choiceBody).join("");/* v32 RL49 */return '<h4>'+esc(x.title)+'</h4>'+choiceBody(x)+ex}).join("");
  const todo=!isDone(so)||["spfeat","spsk2","spcan","spwep"].some((k) =>{const x=cs.filter((c) =>{return c.key===k})[0];return x&&!isDone(x)});h+=card("spopt",s.opts.label,s.opts.n+" Choices",'<p class="fd">'+esc((s.traits.filter((t) =>{return t[0]===s.opts.label})[0]||["",""])[1])+'</p>'+choiceBody(so)+sub,{todo:todo})}
 s.traits.forEach((t) =>{let x=null;if(t[0]==="Skillful"||t[0]==="Keen Senses"||(s.skillPick&&t[0]===s.skillPick.label))x=cs.filter((c) =>{return c.key==="spsk"})[0];if(s.toolPick&&t[0]===s.toolPick.label)x=cs.filter((c) =>{return c.key==="sptool"})[0];if(s.wpPick&&t[0]===s.wpPick.label)x=cs.filter((c) =>{return c.key==="spwp"})[0];if(s.fx&&s.fx.cantripTrait===t[0])x=cs.filter((c) =>{return c.key==="spcan"})[0];/* v74 */if(t[0]==="Versatile"&&!s.opts)x=cs.filter((c) =>{return c.key==="spfeat"})[0];if(!s.lin&&s.spAbTrait&&t[0]===s.spAbTrait)x=cs.filter((c) =>{return c.key==="spab"})[0];/* v38 p15 */
  const vfs=x&&x.key==="spfeat"?cs.filter((c) =>{return c.fk==="Origin feat ("+B.species+", Versatile)"}):[],extra=vfs.map(choiceBody).join("");/* v32 RL49 */
  if(s.lin&&t[0]===s.lin.label)return;if(s.opts&&t[0]===s.opts.label)return;
  h+=card("t"+t[0],t[0],x?"1 Choice":"",'<p class="fd">'+rt(t[1])+'</p>'+(x?choiceBody(x)+extra:""),{todo:x&&(!isDone(x)||vfs.some((y) =>{return !isDone(y)}))})});
 const lc=cs.filter((c) =>{return c.key==="lang"})[0];if(lc)h+=card("lang","Languages",R14()?((lc.n?lc.n:2)+" Choices"):"2 Choices \u2022 Origin",choiceBody(lc),{todo:!isDone(lc)});/* v99: a 2014 race with fixed languages has no language pick */
 return h}

/* ---------- step: abilities ---------- */
export function renderAbil(){let a=abil(),h='<h2 class="ttl">Ability Scores</h2>';
 h+='<select class="dd" data-method="1">'+(un("abil")?'<option value="" selected>- Choose a Generation Method -</option>':'')+[["manual","Manual/Rolled"],["array","Standard Array"],["point","Point Buy"]].map((m) =>{return '<option value="'+m[0]+'"'+(B.method===m[0]&&!un("abil")?" selected":"")+'>'+m[1]+'</option>'}).join("")+'</select>';
 if(un("abil"))return h+'<p class="fd bhint">Choose how to set your ability scores.</p>';
 if(B.method==="point"){const used=ABK.reduce((t,k) =>{return t+(PBC[B.base[k]]!=null?PBC[B.base[k]]:0)},0);h+='<p class="pts'+(27-used===0?" done":27-used<0?" over":"")+'"><b>'+(27-used)+'</b> / 27 points left</p>'}
 h+='<div class="abgrid">'+ABK.map((k) =>{let ctl;
  if(B.method==="array"){const taken=ABK.filter((j) =>{return j!==k&&B.arr&&B.arr[j]}).map((j) =>{return +B.arr[j]});ctl='<select class="dd" data-arr="'+k+'"><option value="">--</option>'+ARR.filter((v,i) =>{const cnt=taken.filter((t) =>{return t===v}).length;return cnt===0}).concat([]).map((v) =>{return '<option'+(B.arr&&+B.arr[k]===v?" selected":"")+'>'+v+'</option>'}).join("")+'</select>'}
  else if(B.method==="point")ctl='<div class="pb"><button type="button" data-pb="'+k+'" data-d="-1">\u2212</button><output>'+B.base[k]+'</output><button type="button" data-pb="'+k+'" data-d="1">+</button></div>';
  else ctl='<input class="btx c" type="number" min="3" max="20" data-b="base.'+k+'" value="'+B.base[k]+'">';
  /* T11 G6 B2: the total sits in a hexagon with its modifier, the control below */
  return '<div class="abx"><b>'+ABN[k].toUpperCase()+'</b><div class="abhex" aria-hidden="true"><strong>'+a.sc[k]+'</strong><small>'+sg(mod(a.sc[k]))+'</small></div>'+ctl+'<span class="vh">Total '+a.sc[k]+', modifier '+sg(mod(a.sc[k]))+'</span></div>'}).join("")+'</div>';
 h+='<h2 class="ttl sm">Score Calculations</h2>';
 h+=ABK.map((k) =>{const s=a.sc[k],bon=a.src[k].reduce((t,b) =>{return t+b.v},0);
  return '<table class="calc"><thead><tr><th colspan="2">'+ABN[k].toUpperCase()+'</th></tr></thead><tbody><tr class="hl"><td>Total Score</td><td>'+s+'</td></tr><tr class="hl"><td>Modifier</td><td>'+sg(mod(s))+'</td></tr><tr><td>Base Score</td><td>'+B.base[k]+'</td></tr><tr><td>Bonus'+a.src[k].map((b) =>{return '<small>'+esc(b.s)+'</small>'}).join("")+'</td><td>'+sg(bon)+a.src[k].map((b) =>{return '<small>('+sg(b.v)+')</small>'}).join("")+'</td></tr></tbody></table>'}).join("");
 return h}


export function __set_showTpl(v){ return showTpl=v; }
export function __set_packTxt(v){ return packTxt=v; }
export function __set_lgOpen(v){ return lgOpen=v; }
