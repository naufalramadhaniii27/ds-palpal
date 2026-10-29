/* ---------- shell ---------- */
function stepIss(s){try{return ruleIssues().some(function(x){return x.step===s})}catch(e){return false}}
/* v33 p02: [done, total] for a step. Same rules as stepTodo: the class, background and species themselves, the background ability increase, ability scores, both starting equipment choices, and every choice that belongs to the step */
function stepProg(s,cs){var d=0,n=0,add=function(ok){n++;if(ok)d++},inStep=function(st){(cs||choices()).forEach(function(c){if(choiceStep(c)===st)add(isDone(c))})};
 if(s==="class"){add(!un("cls"));if(!un("cls"))inStep("class")}
 else if(s==="bg"){add(!un("bg"));if(!un("bg")){add(R14()||B.bgMode==="111"||!!(B.bg2&&B.bg1));inStep("bg")}}
 else if(s==="species"){add(!un("species"));if(!un("species"))inStep("species")}
 else if(s==="abil")add(!un("abil"));
 else if(s==="equip"){add(!un("eqC"));add(!un("eqB"))}
 return n?[d,n]:null}
function stepTodo(s){if(s==="abil")return un("abil");if(s==="equip")return un("eqC")||un("eqB");if(un({class:"cls",bg:"bg",species:"species"}[s]))return true;var cs=choices();
 /* v32 RL49: every open choice marks the step that holds it (Skilled at an ASI level marks Class) */
 if(s==="class")return cs.some(function(c){return !isDone(c)&&choiceStep(c)==="class"});
 if(s==="bg")return !(R14()||B.bgMode==="111"||(B.bg2&&B.bg1))||cs.some(function(c){return choiceStep(c)==="bg"&&!isDone(c)});
 if(s==="species")return cs.some(function(c){return choiceStep(c)==="species"&&!isDone(c)});
 return false}
function render(){try{window.__bldArt&&window.__bldArt(step,B)}catch(e){}try{var hb=document.querySelector("#bld .brand>span");if(hb)hb.textContent=R14()?"PHB 2014":"PHB 2024"}catch(e){}
 $("#nmIn").value!==B.name&&document.activeElement!==$("#nmIn")&&($("#nmIn").value=B.name);
 /* T10: which campaign the character belongs to. Optional. A non-empty value goes to the sheet on Apply */
 if(!$("#cpIn")){if(!B.camp&&window.__sheetCamp){var sc0=window.__sheetCamp();if(sc0){B.camp=sc0;save()}}var nr=$("#nameRow");if(nr){var cr=document.createElement("div");cr.className="bnm";cr.id="campRow";cr.innerHTML='<label for="cpIn">Campaign</label><input class="btx" id="cpIn" autocomplete="off" placeholder="Optional, for example Lost Mine">';nr.parentNode.insertBefore(cr,nr.nextSibling)}}
 if($("#cpIn")&&$("#cpIn").value!==(B.camp||"")&&document.activeElement!==$("#cpIn"))$("#cpIn").value=B.camp||"";
 var csP=null;try{csP=choices()}catch(e){}
 $("#steps").innerHTML=STEPS.map(function(s){var pr=null;try{pr=stepProg(s[0],csP)}catch(e){}return '<button type="button" class="st'+(s[0]===step?" on":"")+'" data-step="'+s[0]+'" data-ico="1"'+(s[0]===step?' aria-current="step"':'')+'>'+bI(STEP_ICO[s[0]])+'<span class="stl">'+s[1]+'</span>'+(pr?'<span class="sprog'+(pr[0]===pr[1]?" ok":"")+'" aria-hidden="true">'+(pr[0]===pr[1]?bI("ui-check"):"")+pr[0]+'/'+pr[1]+'</span><span class="vh">, '+pr[0]+' of '+pr[1]+' done</span>':'')+(stepIss(s[0])?'<i class="r" aria-hidden="true"></i><span class="vh"> (has problems)</span>':stepTodo(s[0])?'<i aria-hidden="true"></i><span class="vh"> (choices left)</span>':'')+'</button>'}).join("");var nI=ruleIssues().length,ab=$("#b-toSheet");if(ab){ab.innerHTML=bI("ui-check")+'<span>Apply<span class="bt2"> to Sheet</span></span>'+(nI?'<span class="abad" title="'+esc("Rule checks and missing spells: "+issueText(ruleIssues())+". Other open choices are listed in What\'s Next.")+'">'+nI+'</span>':'');ab.setAttribute("aria-label","Apply to Sheet"+(nI?". "+nI+" thing"+(nI===1?"":"s")+" to check first":""))}
 var on=$("#steps .on");if(on)on.scrollIntoView({block:"nearest",inline:"center"});
 var f={home:renderHome,class:renderClass,bg:renderBg,species:renderSpecies,abil:renderAbil,equip:renderEquip,next:renderNext,rules:renderRules}[step];
 $("#body").innerHTML=f();try{bDeco($("#body"))}catch(e){}
 var i=STEPS.map(function(s){return s[0]}).indexOf(step);$("#prev").disabled=i===0;$("#next").disabled=i===STEPS.length-1;
 $("#nameRow").hidden=step==="rules"}
function go(s){var o=STEPS.map(function(x){return x[0]}),d=o.indexOf(s)-o.indexOf(step);step=s;pickCls=false;pickSp=false;render();window.scrollTo(0,0);/* v55: slide in from the side you move toward */try{var bd=$("#body");if(bd&&d&&bd.animate&&!(window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches))bd.animate([{opacity:0,transform:"translateX("+(d>0?28:-28)+"px)"},{opacity:1,transform:"none"}],{duration:window.__miT?__miT(300):260,easing:window.__miSpring||"cubic-bezier(.2,.8,.2,1)"})}catch(e){}}
function setB(path,val){var ks=path.split("."),o=B;while(ks.length>1)o=o[ks.shift()];o[ks[0]]=val}
function commit(){save();render()}
document.addEventListener("click",function(e){if(!e.target.closest("#bld"))return;var sm=e.target.closest("summary[data-lgsum]");if(sm){lgOpen=!sm.parentNode.open;return}/* v96 v98: remember the fold across redraws; the browser still toggles it */var t=e.target.closest("button");if(!t)return;var d=t.dataset;
 if(d.srcall){srcAll(d.srcall);applyPacks();commit();toast(d.srcall==="none"?"Optional books are off":"Books turned on");return}/* v98 */
 if(d.lnk){var pp=d.lnk.split("|");showRef(pp[0],pp.slice(1).join("|"));return}
 if(d.step){go(d.step);return}
 if(d.acm!=null){if(d.acm)B.acMode=d.acm;else delete B.acMode;commit();return}/* v27 i2 */
 if(d.qb){qbCls=(document.getElementById("qbCls")||{}).value||"";qbSp=(document.getElementById("qbSp")||{}).value||(R14()?"Human (2014)":"Human");if(!qbCls){toast("Choose a class first.");return}quickBuild(qbCls,qbSp);return}/* v27 RU65 */
 if(d.hbt){HBF={t:d.hbt};render();return}if(d.hbsave){hbSave();return}if(d.hbcancel){HBE="";HBF={t:HBF.t};render();return}/* v26 RU38 no. 8 */
 if(d.hbedit){var he=d.hbedit.split("|");hbEdit(he[0],he.slice(1).join("|"));return}if(d.hbdel){var hd2=d.hbdel.split("|");hbDel(hd2[0],hd2.slice(1).join("|"));return}if(d.hbcopy){var hc=d.hbcopy.split("|");hbCopy(hc[0],hc.slice(1).join("|"));return}
 if(d.pk){var kk=d.pk.split(":"),o2=B.pk[kk[0]]=B.pk[kk[0]]||{c:[],s:[]},ar=o2[kk[1]],ix2=ar.indexOf(d.v);if(ix2>=0)ar.splice(ix2,1);else{if(ar.length>=(kk[1]==="c"?2:1)){toast("Limit reached. Remove one first.");return}ar.push(d.v)}commit();return}
 if(d.mcdel!=null){var mi=+d.mcdel;ask("Remove this class?","Remove",function(){B.mc.splice(mi,1);Object.keys(B.ch).forEach(function(k){if(/^m\d+:/.test(k))delete B.ch[k]});commit()});return}
 if(d.roll){B.hpr=B.hpr||{};B.hpr[d.roll]=1+Math.floor(Math.random()*(+d.hd));commit();return}
 if(d.packdel){var pid=d.packdel;ask("Remove this homebrew source?","Remove",function(){B.packs=(B.packs||[]).filter(function(p){return p.id!==pid});delete B.src[pid];applyPacks();commit()});return}
 if(d.packadd){var pk;try{pk=JSON.parse(packTxt)}catch(er){toast("That text isn't valid JSON");return}if(!pk||!pk.id||!pk.name){toast("A pack needs an id and a name");return}if(HB_BUILTIN[pk.id]){toast("That id is already used");return}B.packs=(B.packs||[]).filter(function(p){return p.id!==pk.id}).concat([pk]);B.src[pk.id]=true;packTxt="";applyPacks();commit();toast("Added "+pk.name);return}
 if(d.tpl){showTpl=!showTpl;render();return}
 if(d.tog2){openCards[d.tog2]=openCards[d.tog2]===false?true:false;render();return}
 if(d.skip){B.eqC="none";B.eqB="none";unDone("eqC");unDone("eqB");rebuildKit();commit();return}
 if(d.clearinv){ask("Clear your starting equipment choices and remove every item from your inventory?","Clear All",function(){B.inv=[];B.eqC="none";B.eqB="none";B.gpOverride=null;commit();toast("Inventory cleared")});return}
 if(d.ieq!=null){var it=B.inv[+d.ieq];if(!it.eq&&DMAP[it.n]&&DMAP[it.n][3]&&attN()>=attMax()){toast("You can attune to at most "+attMax()+" magic items. Unattune one first.");return}it.eq=!it.eq;if(it.eq&&ARMOR[it.n])B.inv.forEach(function(y,k){if(k!==+d.ieq&&ARMOR[y.n])y.eq=false});commit();return}
 if(d.iq!=null){var iq=B.inv[+d.iq];iq.q=Math.max(0,qOf(iq)+(+d.d));commit();return}
 if(d.irm!=null){var rmx=B.inv[+d.irm],rmn=rmx&&bCt(rmx.n)?bInN(rmx):0;ctFree(rmx);B.inv.splice(+d.irm,1);commit();if(rmn)toast("Removed "+rmx.n+". Its "+rmn+" item"+(rmn>1?"s are":" is")+" now outside any container.");return}
 if(d.iunpack!=null){var upx=B.inv[+d.iunpack],upn=upx&&upx.n;if(!upx)return;if(qOf(upx)<1){toast("Qty is 0, so there is nothing to unpack.");return}var upc=unpackAt(+d.iunpack);commit();toast(upc?"Unpacked "+upn+" into a "+PACKS[upx.alias&&PACKS[upx.alias]?upx.alias:upn][0]+" with its items.":"Nothing to unpack.");return}/* v32 RU134 */
 if(d.aq){addQty[d.aq]=Math.max(1,(addQty[d.aq]||1)+(+d.d));render();return}
 if(d.ibuy){var bq=Math.max(1,+d.qty||1),bp=itemCost(d.ibuy);if(bp==null||!(bp>0)){toast("This item has no listed price. Use Add.");return}
  var mc2=false;try{mc2=bldMine()}catch(er){}var live2=!!(mc2&&window.__coinsGet),wal=live2?window.__coinsGet():bCoins(gpNow()),pr=window.__coinPay?window.__coinPay(wal,Math.round(bp*100*bq)):null;
  if(!pr){toast("Not enough coin. It costs "+(window.__priceTxt?window.__priceTxt(bp*bq):bp*bq+" gp")+(window.__coinCp?" and you have "+(Math.round(window.__coinCp(wal))/100)+" gp in all.":"."));return}
  if(live2&&window.__coinsPut)window.__coinsPut(pr.c,"Buy "+d.ibuy);else B.coins=pr.c;
  var pu=window.__coinList?window.__coinList(pr.use):"",ch=window.__coinList?window.__coinList(pr.chg):"";bMsg="Bought "+(bq>1?bq+" \u00d7 ":"")+d.ibuy+" for "+(window.__priceTxt?window.__priceTxt(bp*bq):bp*bq+" gp")+(pu?". Paid "+pu:"")+(ch?", change back: "+ch:"")+".";d.iadd=d.ibuy}
 if(d.iadd&&PACKS[d.iadd]){ensureInv();var pq=+d.qty||1,PK=PACKS[d.iadd];for(var pk3=0;pk3<pq;pk3++)packOut(d.iadd,B.inv).forEach(function(y){B.inv.push(y)});addQty[d.iadd]=1;commit();toast(bMsg||"Added "+(pq>1?pq+" \u00d7 ":"")+d.iadd+": a "+PK[0]+" with "+PK[1].length+" kinds of items inside");bMsg="";return}/* v32 RU134 */
 if(d.iadd){ensureInv();var ex=B.inv.filter(function(y){return y.n===d.iadd&&!y.kit})[0],qq=+d.qty||1;if(ex&&!equippable(d.iadd))ex.q+=qq;else{var eq=equippable(d.iadd);if(ARMOR[d.iadd]&&B.inv.some(function(y){return ARMOR[y.n]&&y.eq}))eq=false;var lib=(B.custLib||[]).filter(function(c){return c.n===d.iadd})[0];B.inv.push(lib?{n:d.iadd,q:qq,eq:false,rar:lib.rar,desc:lib.desc,type:lib.type}:{n:d.iadd,q:qq,eq:DMAP[d.iadd]?false:eq})}addQty[d.iadd]=1;commit();toast(bMsg||"Added "+(qq>1?qq+" \u00d7 ":"")+d.iadd);bMsg="";return}
 if(d.avar){addVar[d.avar]=+d.k;render();return}
 if(d.custr){cust.r=d.custr;render();return}
 if(d.custadd){var cn=(cust.n||'').trim();if(!cn){toast("Type an item name first");return}ensureInv();var ci={n:cn,q:1,eq:false,rar:cust.r==='Common'?'':cust.r,desc:cust.d,type:cust.t};B.inv.push(ci);B.custLib=(B.custLib||[]).filter(function(c){return c.n!==cn}).concat([{n:cn,rar:ci.rar,desc:ci.desc,type:ci.type}]);cust={n:'',r:'Uncommon',d:'',t:'Wondrous Item'};commit();toast('Added '+cn);return}
 if(d.invr){invR=invR===d.invr?"":d.invr;render();return}
 if(d.invt){invT=invT===d.invt?"":d.invt;render();return}
 if(d.ctab){clsTab=d.ctab;render();return}if(d.lore){showLore(d.lore);return}
 if(d.splv!=null){spLv=String(spLv)===d.splv?"all":d.splv;render();return}
 if(d.spcls){spCls=d.spcls;render();return}
 if(d.sp&&d.full==="b"){toast("Your spellbook is full ("+bookNeed()+" spells). Remove a spell from it first.");return}
 if(d.sp&&!d.full){var wsx=SMAP[d.sp],wcl=d.spc||(casterParts()[0]||{}).cls;if(wsx&&wsx[1]&&wcl==="Wizard"&&(spLists().Wizard||[]).indexOf(d.sp)<0&&bookOf().indexOf(d.sp)<0){B.pk=B.pk||{};(B.pk.book=B.pk.book||[]).push(d.sp)}}/* v32: preparing adds to the spellbook */
 if(d.sp&&d.full){toast(d.full==="c"?"All cantrips are chosen. Unlearn one first.":"All prepared spells are chosen. Unprepare one first.");return}/* v32 p90 */
 if(d.sp){spToggle(d.sp,d.spc||"");commit();return}/* M9 */
 if(d.tog){openCards[d.tog]=!openCards[d.tog];var acc=t.closest(".acc");if(!acc){render();return}acc.classList.toggle("open");acc.querySelector(".acc-b").hidden=!openCards[d.tog];return}
 if(d.book){var bn2=d.book;if(d.bsav){toast(bn2+" comes from your Savant feature. Change it in Class Features.");return}if(d.bprep){toast(bn2+" is prepared, so it stays in your spellbook. Unprepare it first.");return}
  B.pk=B.pk||{};var bb=B.pk.book=B.pk.book||[],bi=bb.indexOf(bn2);if(bi>=0)bb.splice(bi,1);else{if(bookOwn().length>=bookNeed()){toast("Your spellbook is full ("+bookNeed()+" spells). Remove one first.");return}bb.push(bn2)}if(!bb.length)delete B.pk.book;commit();return}/* v32 RL49 no. 34 */
 if(d.ck){var v=B.ch[d.ck]||[],x=d.v,j=v.indexOf(x);if(j<0&&d.clash&&!d.ok){var bt=t;ask("Caution: "+x+" already comes from "+d.clash+". Proficiency doesn't stack, so this pick gives no extra benefit. Pick it anyway?","Pick anyway",function(){bt.dataset.ok="1";bt.click()});return}if(j>=0)v.splice(j,1);else{if(v.length>=+d.n){toast("Limit "+d.n+". Remove one first.");return}v.push(x)}B.ch[d.ck]=v;commit();return}
 if(d.ch1){B.ch[d.ch1]=d.v;commit();return}
 if(d.setcls){if(d.setcls!==B.cls){B.cls=d.setcls;B.sub="";B.ch={};B.eqC="A";B.eqG=[];B.eqP={};B.sp=[]}unDone("cls");pickCls=false;commit();return}
 if(d.chgcls){pickCls=true;render();return}
 if(d.setsp){unDone("species");B.species=d.setsp;delete B.ch.lin;delete B.ch.spsk;delete B.ch.sptool;delete B.ch.spfeat;B.size="";pickSp=false;commit();return}
 if(d.chgsp){pickSp=true;render();return}
 if(d.lvup){if(un("cls")){toast("Choose a class first");return}if(TL()>=20){toast("Character level is already 20");return}B.level=B.level+1;var nw=choices().filter(function(c){return c.lvl===B.level&&!isDone(c)});commit();toast("Level "+B.level+(nw.length?". "+nw.length+" new choice"+(nw.length>1?"s":""):""));return}
 if(d.rs){var nr=d.rs==="2014"?"2014":"2024";if((R14()?"2014":"2024")===nr)return;var sw=function(){rsStash(nr==="2014"?"2024":"2014");if(nr==="2014"){B.rs="2014";B.src=B.src||{};B.src.phb14=true}else delete B.rs;rsLoad(nr);applyPacks();commit()};/* v83 v95 */if(un("cls")&&un("species")&&un("bg"))sw();else ask("Switch this character to the "+nr+" rules? Your "+(nr==="2014"?"species":"race")+", background, subclass, class picks, spells, and kit choices are set aside. Switch back and they return.","Switch",sw);return}/* v82 */
  if(d.bgmode){B.bgMode=d.bgmode;commit();return}
 if(d.size){B.size=d.size;commit();return}
 if(d.pb){var k=d.pb,nv=B.base[k]+(+d.d);if(nv<8||nv>15)return;var used=ABK.reduce(function(t,j){return t+(PBC[j===k?nv:B.base[j]]||0)},0);if(used>27){toast("Not enough points");return}B.base[k]=nv;commit();return} if(d.eqg!=null){B.eqG=B.eqG||[];B.eqG[+d.eqg]=d.v;B.eqP={};ensureInv();rebuildKit(1);B.gpOverride=null;commit();return}/* v93 */
 if(d.eq){B[d.eq]=d.v;unDone(d.eq);ensureInv();rebuildKit(1);B.gpOverride=null;commit();return}
 if(d.wep){var n=d.wep,i=B.weps.indexOf(n);if(i>=0)B.weps.splice(i,1);else B.weps.push(n);commit();return}
 if(d.cat){dbCat=d.cat;dbQ="";render();return}
 if(t.id==="prev"||t.id==="next"){var ix=STEPS.map(function(s){return s[0]}).indexOf(step)+(t.id==="next"?1:-1);if(STEPS[ix])go(STEPS[ix][0]);return}
 if(t.id==="expBtn2"){toSheetApply(true);return}
 if(t.id==="expCopy"){var ta=$("#expTxt");ta.select();var ok=false;try{ok=document.execCommand("copy")}catch(er){}if(navigator.clipboard)navigator.clipboard.writeText(ta.value).then(function(){toast("Copied")},function(){toast(ok?"Copied":"Select the text and copy it")});else toast(ok?"Copied":"Select the text and copy it");return}
 if(t.id==="expClose"){$("#exp").hidden=true;return}
 if(t.id==="newBtn2"){/* RL40: a new character in My Characters. The open character keeps its build */if(window.__sheetNew){ask("Start a new character? "+B.name+" stays in My Characters.","Start new",function(){window.__sheetNew()});return}ask("Start a new character? This clears the current build.","Start new",function(){B=NEWB();save();go("class")});return}
 if(t.id==="bakBtn"){restoreBak();return}});
document.addEventListener("change",function(e){if(!e.target.closest("#bld"))return;var t=e.target,d=t.dataset;
 if(d.iin!=null){var it2=B.inv[+d.iin],XD=/^(Bag of Holding|Heward's Handy Haversack|Portable Hole)\b/;if(!it2)return;if(t.value&&XD.test(it2.n)&&XD.test(t.value)){toast("Putting "+it2.n+" inside "+t.value+" tears both apart and opens a rift to the Astral Plane. Not moved.");render();return}if(t.value)it2.in=t.value;else delete it2.in;commit();return}/* v27 RU46 */
 if(d.ibase!=null){var bi=B.inv[+d.ibase],bd=bi&&DMAP[bi.n];if(bd&&bd[5]&&bd[5].base){bi.n=t.value===bd[5].base[0]?bd[0]:bd[0]+" ("+t.value+")";delete bi.alias;commit()}return}/* V16-1 */ if(d.eqp){B.eqP=B.eqP||{};B.eqP[d.eqp]=t.value;ensureInv();rebuildKit(1);B.gpOverride=null;commit();return}/* v93 */
 if(d.b){var v=t.type==="checkbox"?t.checked:t.type==="number"?+t.value:t.value;if(d.b==="bg"&&!v){render();return}setB(d.b,v);if(d.b==="bg"){B.bg2="";B.bg1="";delete B.ch.bgfeatc;unDone("bg")}commit();return}
 if(d.ch){B.ch[d.ch]=t.value;commit();return}
 if(d.addcls){if(t.value){B.mc=B.mc||[];B.mc.push({cls:t.value,lv:1,sub:""})}commit();return}
 if(d.mclv!=null){B.mc[+d.mclv].lv=+t.value;commit();return}
 if(d.mcsub!=null){B.mc[+d.mcsub].sub=t.value;commit();return}
 if(d.hpr){B.hpr=B.hpr||{};var hv=parseInt(t.value);if(hv>0)B.hpr[d.hpr]=hv;else delete B.hpr[d.hpr];commit();return}if(d.srcck){B.src=B.src||{core:true,dmg:true};if(d.srcck==='dmg')B.src.dmg=t.checked;else B.src[d.srcck]=t.checked;applyPacks();commit();return}
 if(d.coin){var co={};document.querySelectorAll("#bld [data-coin]").forEach(function(x){var v=Math.floor(+x.value||0);co[x.dataset.coin]=v>0?v:0});var mc=false;try{mc=bldMine()}catch(er){}
  if(mc&&window.__coinsPut){window.__coinsPut(co,"Coins in the builder");render();return}B.coins=co;commit();return}/* v34 p06 */
 if(d.gp){B.gpOverride=t.value;commit();return}
 if(d.invp){invP=t.checked;render();return}
 if(t.id==="custt"){cust.t=t.value;return}
 if(d.pksel){B.pk=B.pk||{};B.pk[d.pksel]=t.value;commit();return}
 if(d.miab){B.pk=B.pk||{};var o3=B.pk[d.miab]=B.pk[d.miab]||{c:[],s:[]};o3.ab=t.value;commit();return}
 if(d.subsel){B.sub=t.value;Object.keys(B.ch).forEach(function(k){if(/maneuver$|^p7fs$/.test(k))delete B.ch[k]});commit();return}
 if(d.lvsel){B.level=+t.value;commit();return}
 if(d.method){if(!t.value){render();return}var was=un("abil");unDone("abil");B.method=t.value;if(was&&B.method==="point")ABK.forEach(function(k){B.base[k]=8});if(B.method==="point")ABK.forEach(function(k){B.base[k]=Math.max(8,Math.min(15,B.base[k]))});if(B.method==="array")B.arr={};commit();return}
 if(d.arr){B.arr=B.arr||{};B.arr[d.arr]=t.value;B.base[d.arr]=+t.value||8;commit();return}
 if(d.fk){var o=B.ch[d.fk]||{};o[d.fp]=t.value;if(d.fp==="feat"){delete o.a1;delete o.a2;delete o.dt}B.ch[d.fk]=o;commit()}});
document.addEventListener("input",function(e){if(e.target.closest&&e.target.closest("#bld .hbmk"))HBF=Object.assign(hbRead(),{});});/* v26: keep what is typed in Create Homebrew */
document.addEventListener("change",function(e){if(e.target.closest&&e.target.closest("#bld .hbmk"))HBF=hbRead();});
document.addEventListener("input",function(e){if(!e.target.closest("#bld"))return;var t=e.target;
 if(t.id==="nmIn"){B.name=t.value||"New Hero";save();return}
 if(t.id==="cpIn"){B.camp=t.value;save();return}
 if(t.id==="packtxt"){packTxt=t.value;return}
 if(t.id==="custn"){cust.n=t.value;return}
 if(t.id==="custd"){cust.d=t.value;return}
 if(t.id==="invq"){invQ=t.value;var ip=t.selectionStart;render();var q3=$("#invq");q3.focus();q3.setSelectionRange(ip,ip);return}
 if(t.id==="spq"){spQ=t.value;var sp2=t.selectionStart;render();var q2=$("#spq");q2.focus();q2.setSelectionRange(sp2,sp2);return}
 if(t.id==="dbq"){dbQ=t.value;var p=t.selectionStart;render();var q=$("#dbq");q.focus();q.setSelectionRange(p,p);return}
 if(t.dataset.b==="cSub"||t.dataset.b==="cSpecies.name"){setB(t.dataset.b,t.value);save()}});
/* RL40: the builder belongs to the character open on the sheet. B.cid = that character's id in My Characters (sheet.js __sheetId).
   own(name): the saved build is this character's. With cid: same id. Without cid (builds saved before v13): same name, as before.
   copyOf(name): a build copied with its sheet before v13 ("Name (copy)"). stamp(): write the id into B (caller saves) */
function sid(){try{return window.__sheetId?window.__sheetId()||"":""}catch(e){return ""}}
function own(nm){var id=sid();return B.cid&&id?B.cid===id:B.name===nm}
function copyOf(nm){var n=B.name||"";return !B.cid&&!!nm&&nm.indexOf(n)===0&&/^( \(copy\))+$/.test(nm.slice(n.length))}
function stamp(){var id=sid();if(id)B.cid=id}

/* T4: Ctrl+K or Cmd+K inside the builder opens a small jump list: steps, Prev, Next, Close. Apply is left out on purpose */
(function(){ var pal=null, back=null;
  function items(){ var l=[]; STEPS.forEach(function(s){ l.push({t:"Go to "+s[1],k:s[1]+" step go",f:function(){ var b=document.querySelector('#steps [data-step="'+s[0]+'"]'); if(b) b.click(); }}); });
    l.push({t:"Previous step",k:"prev back",f:function(){ var b=document.getElementById("prev"); if(b&&!b.disabled) b.click(); }});
    l.push({t:"Next step",k:"next forward",f:function(){ var b=document.getElementById("next"); if(b&&!b.disabled) b.click(); }});
    l.push({t:"Close builder",k:"close exit leave",f:function(){ var b=document.getElementById("b-close"); if(b) b.click(); }}); return l; }
  function close(){ if(!pal) return; pal.remove(); pal=null; try{ if(back&&back.focus) back.focus(); }catch(er){} back=null; }
  function draw(q){ var l=items().filter(function(i){ return !q||(i.t+" "+i.k).toLowerCase().indexOf(q.toLowerCase())>=0; }), box=pal.querySelector(".bpal-l");
    box.innerHTML=l.map(function(i,n){ return '<button type="button" class="bpal-i" data-bpi="'+n+'">'+esc(i.t)+'</button>'; }).join("")||'<p class="bpal-e">No match.</p>'; pal._l=l; }
  function open(){ if(pal) return; back=document.activeElement; pal=document.createElement("div"); pal.className="bpal"; pal.setAttribute("role","dialog"); pal.setAttribute("aria-modal","true"); pal.setAttribute("aria-label","Builder jump list");
    pal.innerHTML='<div class="bpal-b"><input class="bpal-q" type="text" autocomplete="off" placeholder="Jump to a step" aria-label="Jump to a step"><div class="bpal-l"></div></div>';
    document.getElementById("bld").appendChild(pal); draw(""); var q=pal.querySelector(".bpal-q"); q.focus();
    q.addEventListener("input",function(){ draw(q.value); });
    pal.addEventListener("click",function(e){ if(e.target===pal){ close(); return; } var b=e.target.closest(".bpal-i"); if(!b) return; var it=pal._l[+b.getAttribute("data-bpi")]; close(); if(it) it.f(); });
    pal.addEventListener("keydown",function(e){ var bs=[].slice.call(pal.querySelectorAll(".bpal-i")), i=bs.indexOf(document.activeElement);
      if(e.key==="Escape"){ e.preventDefault(); e.stopPropagation(); close(); }
      else if(e.key==="ArrowDown"){ e.preventDefault(); (bs[i+1]||bs[0]||q).focus(); }
      else if(e.key==="ArrowUp"){ e.preventDefault(); (i<=0?q:bs[i-1]).focus(); }
      else if(e.key==="Enter"&&document.activeElement===q){ e.preventDefault(); var it=pal._l&&pal._l[0]; close(); if(it) it.f(); }
      else if(e.key==="Tab"){ var all=[q].concat(bs); var j=all.indexOf(document.activeElement); e.preventDefault(); all[(j+(e.shiftKey?-1:1)+all.length)%all.length].focus(); } }); }
  document.addEventListener("keydown",function(e){ if(!(e.ctrlKey||e.metaKey)||e.altKey||e.shiftKey||String(e.key).toLowerCase()!=="k") return; var bl=document.getElementById("bld"); if(!bl||bl.hidden||document.querySelector(".ask")) return; e.preventDefault(); if(pal){ pal.querySelector(".bpal-q").focus(); return; } open(); },true);
})();
