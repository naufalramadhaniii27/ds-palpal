/* v33 p02: header and footer icons (one line style, like the sheet) */
(function(){var pre=function(id,k,end){var e=typeof id==="string"?document.querySelector(id):id;if(!e||e.querySelector("svg"))return;e.insertAdjacentHTML(end?"beforeend":"afterbegin",bI(k))};
 pre("#bld .brand b","ui-build");pre("#bld .lvhead","ui-levelup");pre("#b-close","ui-close");pre("#prev","ui-chev-l");var nx=document.getElementById("next"),ns=nx&&nx.querySelector("svg");if(ns)ns.remove();pre("#next","ui-chev-r",true)})();
/* v33 p02: every builder button carries an icon. Chips and radios show their state, buttons their action. Runs after each render */
var BTXT=[[/^(Add|Add Item|Add Source|Create)$/,"ui-plus"],[/^Quick Build$/,"ui-build"],[/^(Wield|Wear|Use|Attune|Equip)$/,"ui-box"],[/^(Wielding|Wearing|In Use|Attuned|Unequip)$/,"item-equipped"],[/^Unpack$/,"ui-bag"],
 [/^(Prepare|Learn)$/,"ui-plus"],[/^Chosen$/,"ui-check"],[/^(Unprepare|Unlearn)$/,"ui-minus"],[/^Remove/,"ui-trash"],[/^Clear All$/,"ui-trash"],[/^Read: /,"ui-book"],[/pack template$/,"ui-file"],[/^Change /,"ui-pen"],[/^Edit$/,"ui-pen"],[/^Cancel$/,"ui-close"],
 [/^Skip /,"ui-close"],[/^Start a new character$/,"home-create"],[/^Restore backup/,"home-restore"],[/^Level Up to /,"ui-levelup"],[/^Load from sheet/i,"home-import"],[/^Export/i,"home-export"]];
var BINV={ARMOR:"item-armor",POTION:"item-potion",RING:"item-ring",ROD:"item-rod",SCROLL:"item-scroll",STAFF:"item-staff",WAND:"item-wand",WEAPON:"item-weapon",WONDROUS:"item-wondrous",GEAR:"item-gear"};
function bTxt(b){var t=(b.textContent||"").replace(/\s+/g," ").trim();for(var i=0;i<BTXT.length;i++)if(BTXT[i][0].test(t))return BTXT[i][1];return ""}
function bDeco(root){var ICO=window.__ICO;if(!root||!ICO)return;var q=function(s){return Array.prototype.slice.call(root.querySelectorAll(s))},put=function(e,k,end){if(!k||e.querySelector("svg"))return;e.insertAdjacentHTML(end?"beforeend":"afterbegin",bI(k))};
 q(".chip").forEach(function(b){if(b.querySelector("svg"))return;var on=b.classList.contains("on");if(b.classList.contains("clash")&&b.firstChild&&b.firstChild.nodeType===3)b.firstChild.nodeValue=b.firstChild.nodeValue.replace(/^\u26a0\s*/,"");put(b,on?"ui-check":b.classList.contains("clash")?"toast-warn":b.classList.contains("have")?"ui-check":"ui-plus")});
 q(".rad").forEach(function(b){put(b,b.classList.contains("on")?"ui-radio-on":"fr-round")});
 q(".eqo .bcb").forEach(function(s){if(!s.querySelector("svg"))s.innerHTML=bI(s.parentNode.classList.contains("on")?"item-equipped":"ui-box")});
 q("[data-invt]").forEach(function(b){put(b,BINV[b.getAttribute("data-invt")])});
 q("[data-invr],[data-custr]").forEach(function(b){put(b,"item-wondrous")});q("[data-avar]").forEach(function(b){put(b,b.getAttribute("data-k")==="0"?"ui-minus":"ui-star")});
 q("[data-setcls]").forEach(function(b){var k=window.__icoCls?window.__icoCls(b.getAttribute("data-setcls")):"";put(b,ICO[k]?k:"src-class")});
 q("[data-setsp]").forEach(function(b){var k="sp-"+String(b.getAttribute("data-setsp")).toLowerCase().replace(/ \(.*\)$/,"");put(b,ICO[k]?k:"sp-custom")});
 q(".bxbtn").forEach(function(b){if(b.querySelector("svg"))return;b.textContent="";put(b,b.hasAttribute("data-mcdel")?"ui-trash":"ui-pen")});
 q(".rmv").forEach(function(b){if(b.querySelector("svg"))return;if(b.firstChild&&b.firstChild.nodeType===3)b.firstChild.nodeValue=b.firstChild.nodeValue.replace(/^\u2715\s*/,"");put(b,"ui-trash")});
 q("p.bhint,.bwarn,.caution").forEach(function(p){if(p.querySelector(":scope > svg"))return;var w=p.classList.contains("caution")||p.getAttribute("data-hi")==="toast-warn";if(p.firstChild&&p.firstChild.nodeType===3)p.firstChild.nodeValue=p.firstChild.nodeValue.replace(/^\u26a0\s*/,"");var sp=document.createElement("span");while(p.firstChild)sp.appendChild(p.firstChild);p.appendChild(sp);p.classList.add("bhint");if(w)p.classList.add("warn");p.insertAdjacentHTML("afterbegin",bI(w?"toast-warn":"ui-info"))});
 q(".lvup").forEach(function(b){if(b.querySelector("svg"))return;var t=b.firstChild;if(t&&t.nodeType===3){var sp=document.createElement("span");b.insertBefore(sp,t);sp.appendChild(t);sp.insertAdjacentHTML("afterbegin",bI("ui-levelup"))}});
 q("button").forEach(function(b){if(b.querySelector("svg")||b.closest(".noico"))return;put(b,bTxt(b)||(window.__icoText?window.__icoText(b):""))})}
/* M18: attuned items in the build (equipped items that need attunement) */
function attN(){return (B.inv||[]).filter(function(y){return y.eq&&DMAP[y.n]&&DMAP[y.n][3]}).length}
window.__bldToggleEq=function(name,occ){ensureInv();var i=invFind(name,occ);if(i<0)return;var it=B.inv[i];if(!it.eq&&DMAP[it.n]&&DMAP[it.n][3]&&attN()>=attMax())return;it.eq=!it.eq;if(it.eq&&ARMOR[baseOf(it.n).b])B.inv.forEach(function(y,k){if(k!==i&&ARMOR[baseOf(y.n).b])y.eq=false});save();if(window.__sheetSoft)window.__sheetSoft(toSheet())};
window.__bldSetQty=function(name,q,occ){ensureInv();var i=invFind(name,occ);if(i<0)return;B.inv[i].q=Math.max(0,Math.floor(+q)||0);save();if(window.__sheetSoft)window.__sheetSoft(toSheet())};
window.__bldRemove=function(name,occ){ensureInv();var i=invFind(name,occ);if(i<0)return;ctFree(B.inv[i]);B.inv.splice(i,1);save();if(window.__sheetSoft)window.__sheetSoft(toSheet())};
/* v32 RU134: open a pack of the build into its container and items. soft: rebuild the sheet from the build. false: not this character, not a pack, or Qty 0 */
window.__bldUnpack=function(name,owner,occ,soft){ensureInv();if(!own(owner))return false;var i=invFind(name,occ);if(i<0||!unpackAt(i))return false;save();if(soft&&window.__sheetSoft)window.__sheetSoft(toSheet());if(!document.getElementById("bld").hidden)render();return true};
window.__itemMeta=function(n){var c=[n],pm=/\(([^)]+)\)/.exec(n);if(pm)c.push(pm[1]);for(var k=0;k<c.length;k++){var b=baseOf(c[k]).b;if(WEAPONS[b]||ARMOR[b]||b==="Shield"||DMAP[c[k]]||itemCost(b)!=null){var html="";window.__inTS=1;try{html=itemDetail(c[k],{n:c[k]})}catch(e){}window.__inTS=0;return {type:itemType(c[k]),cost:itemCost(b),w:itemW(c[k]),equippable:equippable(c[k])||!!(DMAP[c[k]]&&DMAP[c[k]][1]!=="Potion"),html:html,cost:PRICE[c[k]]!=null?PRICE[c[k]]:itemCost(b),/* v20 M1 */att:!!(DMAP[c[k]]&&DMAP[c[k]][3])}}}return null};
/* N2: keep the saved build in step with a hand-filled sheet of the same character, without replacing the sheet (no __sheetSoft).
   ch: {eq:true|false} | {q:n} | {del:1}. Item by name, then by alias ("Celurit (Sickle)"). Other owner or unknown item: nothing, false */
window.__bldSync=function(name,owner,ch){ensureInv();if(!ch||!own(owner))return false;var i=invFind(name,ch.occ);if(i<0)return false;var it=B.inv[i];if(ch.del){ctFree(it);B.inv.splice(i,1)}else if(ch.q!=null)it.q=Math.max(0,Math.floor(+ch.q)||0);else if(ch.in!==undefined){if(ch.in)it.in=ch.in;else delete it.in}/* RU35 no. 8 */else if(ch.eq!=null){it.eq=!!ch.eq;if(it.eq&&ARMOR[baseOf(it.n).b])B.inv.forEach(function(y,k){if(k!==i&&ARMOR[baseOf(y.n).b])y.eq=false})}else return false;save();return true};
/* N1: what a builder-made sheet P has that toSheet() would not produce now: named attacks and resources the builder does not make (Logic manualLost),
   then other sections whose values differ (Edit changes, or builder changes not applied yet). [] if P matches, or P is another character */
var DIFFL={name:"Name",species:"Species",size:"Size",cls:"Class",clsLabel:"Class",sub:"Subclass",bg:"Background",level:"Level",hitDie:"Hit Points",hpPerLevel:"Hit Points",hpBonus:"Hit Points",office:"Campaign",cardNo:"Record number",rolledNote:"Roll record",abilities:"Ability scores",saves:"Saving throws",skills:"Skills",initBonus:"Initiative",ac:"Armor Class",speed:"Speed",speedSrc:"Speed",darkvision:"Darkvision",darkSrc:"Darkvision",senses:"Senses",profs:"Proficiencies",attacks:"Attacks",inv:"Inventory",gp:"Gold",equipNote:"Equipment note",res:"Limited Use",actions:"Actions",features:"Features",defenses:"Defenses",spellcasting:"Spells",spells:"Spells",lang:"Languages",grappler:"Grappler",dcAb:"Grapple DC",dcSrc:"Grapple DC"};
window.__bldDiff=function(P){if(!P||!own(P.name))return [];var N=toSheet(),lost=manualLost(P,N),out=[],oth=[],j=function(x){return JSON.stringify(x===undefined?null:x)},jf=function(x){return j((x||[]).filter(function(g){return !/^Species/.test(g.g)}))};/* V14-8 */if(lost.attacks.length)out.push("Attacks: "+lost.attacks.join(", "));if(lost.res.length)out.push("Limited Use: "+lost.res.join(", "));Object.keys(P).concat(Object.keys(N)).forEach(function(k){if(k==="v"||k==="_app"||k==="bv")return;/* v27 RU28: C.bv is the builder version */if((+P._app||0)>(window.__appVer||0)&&!(k in N))return;/* v18 RL47: fields of a newer version stay on Apply */var l=DIFFL[k]||k;if(oth.indexOf(l)>=0)return;if((k==="attacks"&&lost.attacks.length)||(k==="res"&&lost.res.length))return;if(k==="features"?jf(P[k])!==jf(N[k]):j(P[k])!==j(N[k]))oth.push(l)});if(oth.length)out.push("Other changes: "+oth.join(", "));return out};
/* v18 RU74: the build was saved in another tab: load it here */
window.__bldReload=function(){B=loadB();applyPacks();if(!document.getElementById("bld").hidden)render()};
/* v25 RU38 no. 3: Manage Spells on the sheet. The caster parts of the build that belongs to the open character (null: no such build) */
function bldMine(){var st=window.__sheetState&&window.__sheetState();return !!(st&&st.C&&savedRaw()!=null&&own(st.C.name))}
window.__bldSpInfo=function(){if(!bldMine())return null;var CP=casterParts();if(!CP.length)return null;var SLs=spLists();
 return {parts:CP.map(function(p){var K=spInfoPart(p)||{ct:0,pr:0,max:0,lists:[p.list]},o={cls:p.cls,ct:K.ct,pr:K.pr,kn:K.kn||0,max:K.max,lists:K.lists,taken:(SLs[p.cls]||[]).slice()};if(p.cls==="Wizard"){o.book=bookOf();o.bookO=bookOwn().length;o.bookN=bookNeed()}return o}),/* v32: Wizard spellbook */auto:autoSpells().map(function(a){return a.n})}};
/* on: the spell is chosen for that class. soft: rebuild the sheet from the build (only when the sheet matches the build) */
window.__bldSpSet=function(n,cls,on,soft){if(!bldMine())return false;var L=spLists();if(((L[cls]||[]).indexOf(n)>=0)!==!!on)spToggle(n,cls);save();if(soft&&window.__sheetSoft)window.__sheetSoft(toSheet());if(!document.getElementById("bld").hidden)render();return true};
/* v25 RU38 no. 6: Hit Points fixed (average) or rolled, from Settings. m null: read */
window.__bldRs=function(){return R14()};window.__bldSpCnt=function(){return casterParts().map(function(q){var K=spInfoPart(q);return K&&{cls:q.cls,ct:K.ct,pr:K.pr,kn:K.kn,max:K.max}}).filter(Boolean)};window.__bldSpMsgs=function(){return spellCounts().map(function(m){return m.m})};/* v92: test hooks */window.__rl14=function(){return RL14};window.__bldSpTest=function(n,o){snap();var s=JSON.parse(BASE.sp);if(o)s[n]=o;else delete s[n];BASE.sp=JSON.stringify(s);applyPacks()};/* v82 test hook */window.__bldMine=bldMine;/* v27 RU28 */
/* v32 RL49: every choice of the build with its state. Spell picks of the Spells tab come from spellCounts (key "spell:...") */
function choiceList(){var cs=choices().map(function(c){return {key:c.key,t:c.t,n:c.n||1,title:c.title,src:c.src,feature:c.feature||"",lvl:c.lvl,mc:c.mc,fk:c.fk||"",cats:c.cats||null,from:c.from&&c.from.length?(typeof c.from[0]==="string"?c.from:c.from.map(function(x){return x[0]})):null,list:c.list&&typeof c.list!=="string"?c.list.map(function(x){return Array.isArray(x)?x[0]:x}):c.list?(OPTS[c.list]||[]).map(function(x){return x[0]}):null,done:isDone(c),step:choiceStep(c)}});
 spellCounts().forEach(function(x){if(x.open)cs.push({key:"spell:"+(x.key||x.m),t:"spell",n:x.n||1,title:x.m,feature:x.f||"",done:false,step:"class"})});
 casterParts().forEach(function(p){if(p.xl&&p.xl.length)cs.push({key:"lists:"+p.cls,t:"lists",n:p.xl.length,list:p.xl,title:p.cls+" extra spell lists",feature:"Magical Secrets",done:true,step:"class"})});/* tests only: Magical Secrets */
 return cs}
function withB(b,fn){var keep=B;if(!b)return fn();try{var x=JSON.parse(JSON.stringify(b));for(var k in BLANK)if(x[k]==null)x[k]=clone(BLANK)[k];B=cleanCh(x);applyPacks();return fn()}finally{B=keep;applyPacks()}}
window.__bldChoiceList=function(b){return withB(b,choiceList)};
/* v32 RL49 no. 10d, tests only: show build b in the open builder without saving it (null: back to the saved build), and go to a step */
var TKEEP=null;window.__bldTestSet=function(b){if(b){if(!TKEEP)TKEEP=B;var x=JSON.parse(JSON.stringify(b));for(var k in BLANK)if(x[k]==null)x[k]=clone(BLANK)[k];B=cleanCh(x)}else if(TKEEP){B=TKEEP;TKEEP=null}applyPacks();openCards={};render()};
window.__bldTestB=function(){return JSON.parse(JSON.stringify(B))};window.__bldTestItems=function(){return {dmgi:DMGI.map(function(x){return x[0]}),gear:GEAR.map(function(x){return x[0]}),weapons:Object.keys(WEAPONS),armor:Object.keys(ARMOR),price:typeof PRICE!=="undefined"?Object.keys(PRICE):[],spells:SPELLS.map(function(x){return x[0]})}};/* v100: test hook for the audits *//* v95: test hook */window.__bldTestGo=function(s){step=s;pickCls=false;pickSp=false;clsTab="feat";render()};
/* v32 RU137: open choices of the build that belongs to the open character, same number as "Still to choose" in What's Next. 0 = none or no build */
function openCount(){if(unList())return [["cls"],["species"],["bg"]].filter(function(x){return un(x[0])}).length;
 return choices().filter(function(x){return !isDone(x)}).length+ruleIssues().filter(function(x){return x.open}).length}
var OCC={k:null,v:0};
window.__bldOpenCount=function(b){try{if(b)return withB(b,openCount);if(!bldMine())return 0;var k=JSON.stringify(B);if(OCC.k!==k)OCC={k:k,v:openCount()};return OCC.v}catch(e){return 0}};
window.__bldHpMode=function(m,soft){if(!bldMine())return null;if(m==null)return B.hpMode==="roll"?"roll":"avg";B.hpMode=m==="roll"?"roll":"avg";save();if(soft&&window.__sheetSoft)window.__sheetSoft(toSheet());return B.hpMode};
window.__bldHas=function(name,owner){ensureInv();return own(owner)&&B.inv.some(function(x){return x.n===name})};
/* RL40: the sheet name was edited (Edit form). The saved build of the same character takes the new name */
window.__bldRename=function(from,to){if(!to||B.name===to||!own(from)||savedRaw()==null)return false;B.name=to;save();return true};
window.__bldEquip=function(){window.__bldOpen();go("equip")};
/* v23 RU38 no. 4: Manage Proficiencies and Manage Feats open the builder at a step */
window.__bldGo=function(s){window.__bldOpen();if(document.querySelector("#bld > .exp:not(#exp)"))return;if(STEPS.some(function(x){return x[0]===s}))go(s)};
/* RU29: armor or Shield equipped or unequipped on a hand-filled sheet (items without key). st = sheet state before the change.
   Saved build of the same character: it takes the change (as __bldSync). No saved build yet: a copy imported from the sheet is used, not saved.
   Returns {b0,b1,off}: AC, Speed, Stealth of the build before and after, and other armor taken off. null: not armor, not in the build, or another character */
window.__bldArmor=function(st,name,eq){var bn=baseOf(name).b;if(!st||!st.C||!(ARMOR[bn]||bn==="Shield"||itemFx(name)))return null;/* M18: magic items with numbers too */var raw=savedRaw(),keep=null,out=null;
 if(raw==null){keep=B;fromSheet(st)}else if(!own(st.C.name))return null;
 try{ensureInv();var i=B.inv.findIndex(function(x){return x.n===name});if(i<0)i=B.inv.findIndex(function(x){return x.alias===name});
  /* RU31: armor typed into the Edit form after the build was saved: it joins the build too (as N2), so a later Apply keeps it */
  if(i<0&&!keep){B.inv.push({n:name,q:1,eq:false});i=B.inv.length-1}/* V14-1: full name, so "Shield, +1" keeps its +1 */
  if(i>=0){var pick=function(){var c=toSheet(),s=(c.skills||[]).filter(function(k){return k.n==="Stealth"})[0];return {ac:c.ac,speed:c.speed,speedSrc:c.speedSrc,stealth:s&&s.dis||"",sb:c.saveBonus||[],ab:c.abilities}};
   var b0=pick(),it=B.inv[i],off=[];it.eq=!!eq;if(it.eq&&ARMOR[baseOf(it.n).b])B.inv.forEach(function(y,k){if(k!==i&&ARMOR[baseOf(y.n).b]&&y.eq){y.eq=false;off.push(y.n);if(y.alias)off.push(y.alias)}});
   out={b0:b0,b1:pick(),off:off}}
 }finally{if(keep){B=keep;applyPacks()}else if(out)save()}
 return out};
if(window.__sheetRerender)setTimeout(window.__sheetRerender,0);
if(window.__publicFresh&&!localStorage.getItem("cs-new")){window.__publicFresh=0;B=NEWB();stamp();save();applyPacks();if(window.__sheetApply)window.__sheetApply(blankC(),false)}/* v24 p08 */
if(localStorage.getItem("cs-new")){localStorage.removeItem("cs-new");B=NEWB();stamp();save();applyPacks();if(window.__sheetApply)window.__sheetApply(blankC());setTimeout(function(){window.__bldOpen();go("home")},50)}
applyPacks();render();
})();

