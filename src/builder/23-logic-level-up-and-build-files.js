import {bindLive,choiceList,lateGet,withB,__set_step,ask,issueText,ruleIssues,spInfoPart,qbBook,qbFill,qbMI,qbSpells,copyOf,own,render,sid,stamp,stepBack} from "./01b-logic-late-ports.js";import {genv} from "./00-env.js";
import {ABK,ABN,clone,toast} from "./01-logic-core-helpers.js";
import {BLANK,DMAP,cleanCh,un} from "./03-logic-magic-item-effects.js";
import {B,__set_B,save,saveBak,savedRaw} from "./04-logic-storage.js";
import {CL} from "./05-logic-choice-model-ruleset.js";
import {featViol,toolAll} from "./09-logic-feats-and-choices.js";
import {bookNeed,bookOwn} from "./10-logic-v17-additions.js";
import {fxtSet,casterParts,clsLv,manualLost,spLists,spToggle} from "./11-logic-derivation.js";
import {toSheet} from "./12-logic-export-to-sheet.js";
import {BASE,allPacks,applyPacks,autoSpells,snap} from "./13-logic-sources-and-packs.js";
import {MCL,TL,baseOf,itemCost} from "./14-logic-multiclass-hp-shop.js";
import {fromSheet} from "./15-logic-import-from-sheet.js";





bindLive("toSheetApply",{get:function(){return toSheetApply;}});
bindLive("unList",{get:function(){return unList;}});
/* v22 RU52: Level Up from the sheet. Opens the build of this character and raises the main class one level. New choices show the usual marks */
/* v22 P1: names and numbers of a build file. err stops the import, warn is shown before it */
genv.__bldCheck=function(b){const err=[],warn=[],keep=B,lv=+b.level;
 if(!b.cls||!CLASSES[b.cls])err.push("unknown class \""+(b.cls||"")+"\"");
 if(!(lv>=1&&lv<=20&&Math.floor(lv)===lv))err.push("level must be a whole number from 1 to 20");
 const tl=(lv||0)+(Array.isArray(b.mc)?b.mc.reduce((t,m) =>{return t+(+m.lv||0)},0):0);if(tl>20)err.push("total level "+tl+" is more than 20");
 if(err.length)return {err:err,warn:warn};
 try{__set_B(structuredClone(BLANK));B.src=b.src||{core:true,dmg:true};applyPacks();
  if(b.species&&!SPECIES[b.species]&&b.species!=="Custom")warn.push("species \""+b.species+"\"");
  const bg=BACKGROUNDS[b.bg];if(b.bg&&!bg)warn.push("background \""+b.bg+"\"");
  if(bg&&b.bgMode!=="111")["bg2","bg1"].forEach((k) =>{if(b[k]&&bg.ab.indexOf(b[k])<0)warn.push(b.bg+" cannot raise "+b[k])});
  const C0=CLASSES[b.cls];if(b.sub&&b.sub!=="__custom"&&!(C0.subs||{})[b.sub])warn.push("subclass \""+b.sub+"\" for "+b.cls);
  (Array.isArray(b.mc)?b.mc:[]).forEach((m) =>{if(!CLASSES[m.cls])warn.push("multiclass \""+m.cls+"\"");else if(m.sub&&!(CLASSES[m.cls].subs||{})[m.sub])warn.push("subclass \""+m.sub+"\" for "+m.cls)});
  ABK.forEach((k) =>{let v=(b.base||{})[k];if(v==null)return;v=+v;if(!(v>=3&&v<=20&&Math.floor(v)===v))warn.push(k+" score "+(b.base||{})[k])});
  let sp=[].concat(b.sp||[]);Object.keys(b.spm||{}).forEach((k) =>{sp=sp.concat(b.spm[k]||[])});const bs=sp.filter((n) =>{return !lateGet("SMAP")[n]});if(bs.length)warn.push("spells "+bs.join(", "));
  const bi=(Array.isArray(b.inv)?b.inv:[]).map((x) =>{return x&&x.n}).filter((n) =>{if(!n)return false;const bo=baseOf(n).b;return !(WEAPONS[bo]||ARMOR[bo]||bo==="Shield"||DMAP[n]||itemCost(bo)!=null||/^Spell Scroll \(/.test(n)||(typeof POTIONS!=="undefined"&&POTIONS.some((p) =>{return p[0]===n})))});if(bi.length)warn.push("items "+bi.join(", "));
  const bf=[];Object.keys(b.ch||{}).forEach((k) =>{const v=b.ch[k];if(v&&typeof v==="object"&&!Array.isArray(v)&&v.feat&&!FEATS[v.feat])bf.push(v.feat)});if(bf.length)warn.push("feats "+bf.join(", "));
 }finally{__set_B(keep);applyPacks()}
 return {err:err,warn:warn}};
/* v22 RU80b: a build file written by hand or in a chat is tidied before it opens. Names are matched to the app lists
   (case, spaces, punctuation, a typo of one or two letters, a short form like "Berserker"), numbers written as text become numbers,
   scores stay 3 to 20, the background bonus goes only to the background's abilities (PHB 2024), and a homebrew source turns on
   when a name comes from it. What changes is listed in "notes" so the player sees it before the build opens. err stops the import */
 function bnNk(s){return String(s==null?"":s).toLowerCase().replace(/[‘’`]/g,"'").replace(/[^a-z0-9+]/g,"")}
 function bnLev(a,c,mx){if(Math.abs(a.length-c.length)>mx)return mx+1;let d=[],i,j;for(i=0;i<=a.length;i++){d[i]=[i]}for(j=0;j<=c.length;j++)d[0][j]=j;
  for(i=1;i<=a.length;i++)for(j=1;j<=c.length;j++){d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===c[j-1]?0:1));if(i>1&&j>1&&a[i-1]===c[j-2]&&a[i-2]===c[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1)}return d[a.length][c.length]}
 /* the name in the list for v: {v, near} or null. part: a short or long form that fits one name only */
 function bnPick(v,list,part,wide){if(v==null||v==="")return null;v=String(v).trim().replace(/\s+/g," ");if(list.indexOf(v)>=0)return {v:v};const k=bnNk(v);if(!k)return null;
  let m=list.filter((x) =>{return bnNk(x)===k});if(m.length===1)return {v:m[0]};
  if(part&&k.length>=4){m=list.filter((x) =>{const y=bnNk(x);return y.length>k.length?y.indexOf(k)>=0:wide&&k.indexOf(y)>=0&&y.length>=4});if(m.length===1)return {v:m[0],near:1}}
  if(k.length>=6){let mx=1,best=mx+1,bm=[];list.forEach((x) =>{const e=bnLev(k,bnNk(x),mx);if(e<best){best=e;bm=[x]}else if(e===best)bm.push(x)});if(best<=mx&&bm.length===1)return {v:bm[0],near:1}}
  return null}
 function bnQ(s){return "\""+s+"\""}
 function bnAbl(v){if(v==null||v==="")return "";const k=bnNk(v).slice(0,3).toUpperCase();return ABK.indexOf(k)>=0?k:null}
 function bnNum(v){if(typeof v==="number")return v;const m=/^\s*(-?\d+(?:\.\d+)?)/.exec(String(v==null?"":v));return m?+m[1]:NaN}
 function bnArr(v){return v==null||v===""?[]:Array.isArray(v)?v:[v]}
function saidIn(notes){return function(v,r){if(r&&r.near)notes.push(bnQ(v)+" is read as "+bnQ(r.v))}}
function normScores(b,notes){
 const bs=b.base&&typeof b.base==="object"?b.base:null,nb={};
 if(bs){Object.keys(bs).forEach((k) =>{const a=bnAbl(k);if(a)nb[a]=bs[k]});ABK.forEach((a) =>{let v=nb[a];if(v==null||v===""||isNaN(bnNum(v))){notes.push(ABN[a]+" score is missing, so it is 10");nb[a]=10;return}
  v=Math.round(bnNum(v));if(v>20){notes.push(ABN[a]+" "+nb[a]+" becomes 20, the highest score");v=20}else if(v<3){notes.push(ABN[a]+" "+nb[a]+" becomes 3, the lowest score");v=3}nb[a]=v});b.base=nb;if(!b.method)b.method="manual"}}
function normBgBonus(b,notes){
 const bm=String(b.bgMode==null?"21":b.bgMode).replace(/[^0-9]/g,"");b.bgMode=(bm==="111"||b.rs==="2014")?"111":"21";
 const bgo=b.bg&&BACKGROUNDS[b.bg];
 if(b.bgMode==="21"){const a2=bnAbl(b.bg2),a1=bnAbl(b.bg1);b.bg2=a2||"";b.bg1=a1||"";
  if(bgo){const ab=bgo.ab,sc=b.base||BLANK.base,best=function(no){return ab.filter((x) =>{return x!==no}).sort((x,y) =>{return (sc[y]||0)-(sc[x]||0)})[0]};
   if(b.bg2&&ab.indexOf(b.bg2)<0){const n2=best(b.bg1&&ab.indexOf(b.bg1)>=0?b.bg1:"");notes.push(b.bg+" cannot raise "+b.bg2+", so the +2 goes to "+n2);b.bg2=n2}
   if(b.bg1&&(ab.indexOf(b.bg1)<0||b.bg1===b.bg2)){const n1=best(b.bg2);notes.push(b.bg1===b.bg2?"The +1 cannot go to "+b.bg1+" again, so it goes to "+n1:b.bg+" cannot raise "+b.bg1+", so the +1 goes to "+n1);b.bg1=n1}}}}
function normSpells(b,notes,said){const SN=Object.keys(lateGet("SMAP")),gone=[];
 function spl(list){const out=[];bnArr(list).forEach((n) =>{const r=bnPick(n,SN);if(!r){if(n)gone.push(n);return}said(n,r);if(out.indexOf(r.v)<0)out.push(r.v)});return out}
 b.sp=spl(b.sp);if(b.spm&&typeof b.spm==="object"){const sm={};Object.keys(b.spm).forEach((c) =>{const r=bnPick(c,Object.keys(CLASSES));if(r)sm[r.v]=spl(b.spm[c])});b.spm=sm}
 if(b.pk&&typeof b.pk==="object")Object.keys(b.pk).forEach((k) =>{const p=b.pk[k];if(!p||typeof p!=="object")return;if(p.c)p.c=spl(p.c);if(p.s)p.s=spl(p.s);if(p.ab!=null){const a=bnAbl(p.ab);if(a)p.ab=a;else delete p.ab}});
 if(gone.length)notes.push("Not in the 2024 spell list, so removed: "+gone.join(", "));}
function normChoiceLists(b,notes,said,FT){const ch=b.ch;
 function lst(key,list,what){if(ch[key]==null)return;const bad=[],out=[];bnArr(ch[key]).forEach((n) =>{const r=bnPick(n,list);if(r){said(n,r);if(out.indexOf(r.v)<0)out.push(r.v)}else bad.push(n)});ch[key]=out;if(bad.length)notes.push(what+" not in the app, so removed: "+bad.join(", "))}
 lst("clsk",Object.keys(SKILLS),"Skills");lst("lang",LANGS.map((x) =>{return x[0]}),"Languages");lst("wm",wmKeys(),"Weapon Mastery weapons");
 Object.keys(ch).forEach((k) =>{const v=ch[k];
  if(/^(m\d+:)?(feat\d+|fs\d+)$|^spfeat$/.test(k)){const o=v&&typeof v==="object"&&!Array.isArray(v)?v:null,f=o?o.feat:v;if(f==null||f==="")return;let r=bnPick(f,FT);
   if(!r&&/^magic initiate$/i.test(String(f).trim())&&o&&o.list){r=bnPick("Magic Initiate ("+o.list+")",FT)}
   if(!r){notes.push("Feat "+bnQ(f)+" is not in the app, so it is left for you to choose");delete ch[k];return}said(f,r);if(o){o.feat=r.v;["a1","a2","a"].forEach((x) =>{if(o[x]!=null){const a=bnAbl(o[x]);if(a)o[x]=a;else delete o[x]}})}else ch[k]=r.v}});}
 function itemSpecial(s,IN){const p=/^Potion of (Greater|Superior|Supreme) Healing$/i.exec(s);if(p)return {v:"Potion of Healing ("+p[1].charAt(0).toUpperCase()+p[1].slice(1).toLowerCase()+")"};if(/^(rope|rope, (hempen|silk)( \(50 feet\))?|(hempen|silk) rope)$/i.test(s)&&IN.indexOf("Rope")>=0)return {v:"Rope",near:s.toLowerCase()!=="rope"?1:0};return null}
function itemName(n,IN,SN){const s=String(n).trim().replace(/\s+/g," ");if(IN.indexOf(s)>=0)return {v:s};let m=/^Spell Scroll \((.+)\)$/i.exec(s);if(m){const r=bnPick(m[1],SN);return r?{v:"Spell Scroll ("+r.v+")",near:r.near}:null}
  m=/^\+(\d)\s+(.+)$/.exec(s)||/^(.+?),?\s*\+(\d)$/.exec(s);if(m){const pl=/^\+/.test(s)?m[1]:m[2],bn=itemName(/^\+/.test(s)?m[2]:m[1],IN,SN);if(bn){const c=bn.v+", +"+pl;if(DMAP[c]||WEAPONS[bn.v]||ARMOR[bn.v]||bn.v==="Shield")return {v:c,near:bn.near}}}
  const sp=itemSpecial(s,IN);if(sp)return sp;
  let r2=bnPick(s,IN);if(r2)return r2;const ak=bnNk(s+" Armor");r2=Object.keys(ARMOR).filter((x) =>{return bnNk(x)===ak})[0];if(r2)return {v:r2,near:1};
  const pre=GEAR.map((x) =>{return x[0]}).filter((x) =>{return /\)$/.test(x)&&bnNk(x).indexOf(bnNk(s))===0});/* bundles such as "Arrows (20)" */return pre.length===1&&bnNk(s).length>=5?{v:pre[0],near:1}:null}
function normInvRow(x,IN,SN,said,plain){if(typeof x==="string")x={n:x};if(!x||typeof x!=="object")return null;const n=x.n!=null?x.n:x.name;if(n==null||n==="")return null;
  let o={n:String(n).trim()},qv=x.q!=null?x.q:x.qty!=null?x.qty:x.quantity!=null?x.quantity:x.count;qv=bnNum(qv);o.q=qv>=1?Math.floor(qv):1;o.eq=!!(x.eq!=null?x.eq:x.equipped);
  Object.keys(x).forEach((k) =>{if(["n","name","q","qty","quantity","count","eq","equipped"].indexOf(k)<0)o[k]=x[k]});
  const eq0=x.eq!=null||x.equipped!=null,r=itemName(o.n,IN,SN);if(r){const bu=/\((\d+)\)$/.exec(r.v);if(bu&&!/\(\d+\)$/.test(o.n)&&o.q>=+bu[1]&&o.q%+bu[1]===0)o.q=o.q/+bu[1];said(o.n,r);o.n=r.v}else plain.push(o.n);return {o:o,eq0:eq0}}
function normInvEquip(o,eq0,st){if(!eq0){const bo=baseOf(o.n).b;/* not said: weapons, the first armor, and a Shield are worn */if(WEAPONS[bo]||bo==="Shield")o.eq=true;else if(ARMOR[bo]&&!st.arm){o.eq=true;st.arm=1}}else if(o.eq&&ARMOR[baseOf(o.n).b])st.arm=1;}
function normItems(b,notes,said,SN){
 const IN=[].concat(Object.keys(WEAPONS),Object.keys(ARMOR),["Shield"],Object.keys(DMAP),GEAR.map((x) =>{return x[0]}),Object.keys(PRICE),POTIONS.map((x) =>{return x[0]})).filter((x,i,a) =>{return a.indexOf(x)===i});
 const plain=[];
 if(b.inv!=null){const st={arm:0};b.inv=bnArr(b.inv).map((x) =>{const row=normInvRow(x,IN,SN,said,plain);if(!row)return null;normInvEquip(row.o,row.eq0,st);return row.o}).filter(Boolean);
  if(plain.length)notes.push("Not in the app item lists, so kept as plain gear with no weight or cost: "+plain.join(", "));
  if(b.eqC==null)b.eqC="none";if(b.eqB==null)b.eqB="none"}}
/* v34 p07: choices by feature name ({"Eldritch Invocations":[...],"Fighting Style":"Defense"}). Raw builder keys still work. X = {b, notes, said, L, FT, ch0}: the build being read and its notes. One function per step: candidates, put, Magic Initiate, match, deal, pass */
function bnCands(X,c){const FT=X.FT,L=X.L,b=X.b;if(c.t==="feat"||c.t==="fs"||c.t==="ofeat")return FT;if(c.t==="tool")return c.cats?[].concat.apply([],c.cats.map((k) =>{return TOOLS[k]||[]})):toolAll();if(c.t==="sub")return L.subs[b.cls]||[];
 if(c.t==="lang")return c.from||LANGS.map((x) =>{return x[0]});if(c.t==="skills"||c.t==="exp")return c.from||Object.keys(SKILLS);if(c.t==="wm")return c.from||wmKeys();return c.list||c.from||null}
function bnOne(c){return /^(feat|fs|ofeat|opt|sub|mcsub|lin)$/.test(c.t)}
function bnStore(X,c,out){const b=X.b,ch0=X.ch0;
 if(c.t==="sub"){if(!b.sub)b.sub=out[0];return}if(c.t==="mcsub"){const mcx=(b.mc||[])[c.mc];if(mcx&&!mcx.sub)mcx.sub=out[0];return}
 if(c.t==="feat"){const o=out[0];ch0[c.key]=typeof o==="object"?o:{feat:o};return}if(bnOne(c)){ch0[c.key]=typeof out[0]==="object"?out[0].feat:out[0];return}ch0[c.key]=out.slice(0,c.n)}
function bnPut(X,c,vals,name){const cl=bnCands(X,c),out=[],bad=[],notes=X.notes;vals.forEach((v) =>{if(v&&typeof v==="object"){out.push(v);return}const r=cl?bnPick(v,cl,1):{v:String(v)};if(r){X.said(v,r);if(out.indexOf(r.v)<0)out.push(r.v)}else bad.push(v)});
 if(bad.length)notes.push(name+": "+bad.map(bnQ).join(", ")+" "+(bad.length>1?"are":"is")+" not an option there, so it is left for you to choose");if(!out.length)return;
 bnStore(X,c,out)}
/* Magic Initiate spells ("Magic Initiate (Wizard)": {"cantrips":[..],"spell":"..","ability":"INT"}) go to the spell feat picks (pk mi0, mi1) */
function bnMiPicks(b,left,byName){return left.filter((name) =>{const v=byName[name];if(!/^magic initiate/i.test(String(name).trim())||!v||typeof v!=="object"||Array.isArray(v))return true;b.pk=b.pk&&typeof b.pk==="object"?b.pk:{};let i=0;while(b.pk["mi"+i])i++;
  const ab=v.ab||v.ability;b.pk["mi"+i]={c:bnArr(v.c||v.cantrips||[]),s:bnArr(v.s||v.spells||v.spell||[]),ab:ab?(bnAbl(ab)||ab):undefined};if(!b.pk["mi"+i].ab)delete b.pk["mi"+i].ab;return false})}
function bnLabels(c){const t=c.title||"",f=c.feature||"",i=t.indexOf(": ");return [t,f,t.split(":")[0],i>0&&f?f+": "+t.slice(i+2):"",i>0?t.slice(i+2):""].filter(Boolean)}
function bnMatch(CLx,name){const nn=bnNk(name);let E=CLx.filter((c) =>{return c.t!=="spell"&&bnLabels(c).some((x) =>{return bnNk(x)===nn})});
 if(!E.length&&nn.length>=6)E=CLx.filter((c) =>{return c.t!=="spell"&&bnLabels(c).some((x) =>{return bnLev(bnNk(x),nn,2)<=2})});
 return E}
/* each value goes to the first entry (lowest level) that has room and offers it, so level 5 picks land at level 5 */
function bnDeal(X,E,val,name){E.sort((a,c) =>{return (a.lvl||0)-(c.lvl||0)});const got=E.map(() =>{return []}),rest=[];
 bnArr(val).forEach((v) =>{const placed=E.some((c,i) =>{if(got[i].length>=(bnOne(c)?1:c.n))return false;if(v&&typeof v==="object"){if(/^(feat|fs|ofeat)$/.test(c.t)){got[i].push(v);return true}return false}const cl=bnCands(X,c);if(cl&&!bnPick(v,cl,1))return false;got[i].push(v);return true});if(!placed)rest.push(v)});
 E.forEach((c,i) =>{bnPut(X,c,got[i],name)});
 if(rest.length)X.notes.push(name+": more picks than this build has, so left out: "+rest.map((v) =>{return typeof v==="object"?JSON.stringify(v):bnQ(v)}).join(", "))}
function bnPass(X,left,byName){let CLx=[];try{CLx=withB(X.b,choiceList)||[]}catch(er){CLx=[]}const KS=CLx.map((c) =>{return c.key});
 return left.filter((name) =>{const val=byName[name];if(KS.indexOf(name)>=0){X.ch0[name]=val;return false}
  const E=bnMatch(CLx,name);if(!E.length)return true;
  bnDeal(X,E,val,name);return false})}
function normByName(X,byName){let left=Object.keys(byName).filter((k) =>{return byName[k]!=null&&byName[k]!==""});
 left=bnMiPicks(X.b,left,byName);
 for(let pass=0;pass<3&&left.length;pass++)left=bnPass(X,left,byName);
 left.forEach((name) =>{if(/^[a-z][A-Za-z0-9:_-]*$/.test(name)){X.ch0[name]=byName[name];return}X.notes.push(bnQ(name)+" is not a choice for this build, so it is left out")})}
genv.__bldNorm=function(b0){let keep=B,err=[],notes=[],b;
 const said=saidIn(notes);
 try{
 b=structuredClone(b0||{});delete b.kind;delete b.app;delete b.format;
 /* other field names a chat may use */
 [["class","cls"],["subclass","sub"],["background","bg"],["race","species"],["spells","sp"],["abilities","base"],["scores","base"],["items","inv"],["inventory","inv"],["equipment","inv"],["multiclass","mc"]].forEach((p) =>{if(b[p[1]]==null&&b[p[0]]!=null){b[p[1]]=b[p[0]];delete b[p[0]]}});
 const byName=b.choices&&typeof b.choices==="object"&&!Array.isArray(b.choices)?b.choices:null;delete b.choices;/* v34 p07 */
 b.ch=b.ch&&typeof b.ch==="object"&&!Array.isArray(b.ch)?b.ch:{};
 const lin=b.lin!=null?b.lin:b.lineage;delete b.lin;delete b.lineage;if(lin&&!b.ch.lin)b.ch.lin=lin;
 /* homebrew packs this build needs */
 const src0=b.src&&typeof b.src==="object"?b.src:{core:true,dmg:true};b.src=src0;
 function on(src){__set_B(structuredClone(BLANK));B.src=src;B.packs=Array.isArray(b.packs)?b.packs:[];applyPacks()}
 function names(){const o={sp:Object.keys(SPECIES),bg:Object.keys(BACKGROUNDS),ft:Object.keys(FEATS),subs:{}};Object.keys(CLASSES).forEach((c) =>{o.subs[c]=Object.keys(CLASSES[c].subs||{})});return o}
 on(src0);const N0=names(),ids=[];
 const cl=bnPick(b.cls,Object.keys(CLASSES));if(!cl){err.push(b.cls?"the class "+bnQ(b.cls)+" is not a 2024 class":"it has no class");return {err:err,notes:notes,b:b}}said(b.cls,cl);b.cls=cl.v;
 function need(v,list,part,wide){return v&&!bnPick(v,list,part,wide)}
 let want=[];if(need(b.species,N0.sp))want.push(["sp",b.species]);if(need(b.bg,N0.bg,1,1))want.push(["bg",b.bg]);if(need(b.sub,N0.subs[b.cls]||[],1))want.push(["sub",b.sub]);
 if(want.length)allPacks().forEach((p) =>{if(src0[p.id])return;const s=Object.assign({},src0);s[p.id]=true;on(s);const N=names(),hit=want.filter((w) =>{return w[0]==="sp"?bnPick(w[1],N.sp):w[0]==="bg"?bnPick(w[1],N.bg,1,1):bnPick(w[1],N.subs[b.cls]||[],1)});
  if(hit.length){src0[p.id]=true;notes.push("The "+p.name+" source is turned on for "+hit.map((w) =>{return bnQ(w[1])}).join(", "));want=want.filter((w) =>{return hit.indexOf(w)<0})}});
 on(src0);const L=names();
 /* level and multiclass */
 const lv=b.level==null||b.level===""?1:bnNum(b.level);if(b.level==null||b.level==="")notes.push("Level is missing, so it is 1");
 if(!(lv>=1&&lv<=20&&Math.floor(lv)===lv)){err.push("level must be a whole number from 1 to 20");return {err:err,notes:notes,b:b}}b.level=lv;
 b.mc=bnArr(b.mc).filter((m) =>{if(!m||typeof m!=="object")return false;const r=bnPick(m.cls||m.class,Object.keys(CLASSES));if(!r){notes.push("Multiclass "+bnQ(m.cls||m.class||"")+" is removed. It is not a 2024 class");return false}
  said(m.cls||m.class,r);m.cls=r.v;delete m["class"];let l=m.lv==null?bnNum(m.level):bnNum(m.lv);delete m.level;if(!(l>=1&&Math.floor(l)===l)){notes.push("Multiclass "+m.cls+" has no level, so it is 1");l=1}m.lv=l;
  if(m.sub){const s=bnPick(m.sub,L.subs[m.cls]||[],1);if(s){said(m.sub,s);m.sub=s.v}else{notes.push("Subclass "+bnQ(m.sub)+" is not a "+m.cls+" subclass, so it is left for you to choose");m.sub=""}}return true});
 const tl=b.level+b.mc.reduce((t,m) =>{return t+m.lv},0);if(tl>20){err.push("total level "+tl+" is more than 20");return {err:err,notes:notes,b:b}}
 /* species, lineage, background, subclass */
 b.unset=b.unset&&typeof b.unset==="object"?b.unset:{};
 if(b.species){let sr=bnPick(b.species,L.sp);
  if(!sr&&b.species!=="Custom"){/* "Wood Elf", "Tiefling (Infernal)", "Red Dragonborn": species plus lineage */const t0=String(b.species);L.sp.forEach((s) =>{if(sr)return;const o=(SPECIES[s].lin||{}).opts;if(!o)return;
    if(bnNk(t0).indexOf(bnNk(s))<0&&bnNk(t0)!=="drow")return;const rest=bnNk(t0).replace(bnNk(s),"");const lo=o.filter((x) =>{const y=bnNk(x);return rest.length>=3&&y.indexOf(rest)===0});if(lo.length===1&&(bnNk(t0).indexOf(bnNk(s))>=0||lo.length===1)){sr={v:s,near:1};b.ch.lin=lo[0]}});
   if(sr)notes.push(bnQ(t0)+" is read as "+sr.v+", "+String(b.ch.lin).replace(/ \(.*$/,""))}
  else said(b.species,sr);
  if(sr)b.species=sr.v;else if(b.species!=="Custom"){notes.push("Species "+bnQ(b.species)+" is not in the app, so it is left for you to choose");delete b.species;b.unset.species=1}}
 if(b.species&&SPECIES[b.species]&&b.ch.lin){const lo2=(SPECIES[b.species].lin||{}).opts||[],k2=bnNk(b.ch.lin),lr=lo2.filter((x) =>{return x===b.ch.lin})[0]||lo2.filter((x) =>{return bnNk(x).indexOf(k2)===0||bnNk(x.replace(/ \(.*$/,""))===k2})[0];
  if(lr)b.ch.lin=lr;else{notes.push(bnQ(b.ch.lin)+" is not a "+b.species+" option, so it is left for you to choose");delete b.ch.lin}}
 if(b.bg){const br=bnPick(b.bg,L.bg,1,1);if(br){said(b.bg,br);b.bg=br.v}else{notes.push("Background "+bnQ(b.bg)+" is not in the app, so it is left for you to choose");delete b.bg;b.unset.bg=1}}
 if(b.sub){const ur=bnPick(b.sub,L.subs[b.cls]||[],1);if(ur){said(b.sub,ur);b.sub=ur.v}else{notes.push("Subclass "+bnQ(b.sub)+" is not a "+b.cls+" subclass, so it is left for you to choose");b.sub=""}}
 /* ability scores */
 normScores(b,notes);
 /* background bonus: only the background's three abilities */
 normBgBonus(b,notes);
 /* spells */
 normSpells(b,notes,said);
 /* choices: skills, languages, Weapon Mastery, feats */
 const FT=L.ft;
 /* v34 p07: choices by feature name ({"Eldritch Invocations":[...],"Fighting Style":"Defense"}). Raw builder keys still work */
 if(byName)normByName({b:b,notes:notes,said:said,L:L,FT:FT,ch0:b.ch},byName);
 const ch=b.ch;
 normChoiceLists(b,notes,said,FT);
 /* items: names from the app lists, "+1 Longsword", "Plate" for "Plate Armor"; an unknown item stays as plain gear */
 const SN=Object.keys(lateGet("SMAP"));normItems(b,notes,said,SN);
 if(!Object.keys(b.unset).length)delete b.unset;
 }finally{__set_B(keep);applyPacks()}
 return {err:err,notes:notes,b:b}};
/* v22 RU80: the sheet a build gives, without touching the build being edited */
genv.__bldAuto=function(nb){let keep=B,out=null;try{const b=structuredClone(nb);for(const k in BLANK)if(b[k]==null)b[k]=clone(BLANK)[k];__set_B(cleanCh(b));applyPacks();qbFill();if(MCL().length){if(!(nb.sp&&nb.sp.length))B.sp=[]}else qbSpells();qbSpMC();qbMI();qbBook();qbFill();qbSpMC();out=structuredClone(B)}finally{__set_B(keep);applyPacks()}return out};
genv.__bldFeatViol=function(b){return withB(b,featViol)};
function qbSpMC(){const cp=casterParts();if(!cp.length)return;const auto=autoSpells().map((a) =>{return a.n}),DMG=["Eldritch Blast","Fire Bolt","Sacred Flame","Vicious Mockery","Produce Flame","Starry Wisp","Toll the Dead","Mind Sliver"];
 const all=function(){let s=[],o=spLists();for(const k in o)s=s.concat(o[k]);return s};
 cp.slice().sort((a,b) =>{const ka=spInfoPart(a),kb=spInfoPart(b),n=function(K){return K?SPELLS.filter((x) =>{return K.lists.some((l) =>{return x[3].indexOf(l)>=0})&&x[1]<=K.max}).length:0};return n(ka)-n(kb)}).forEach((P) =>{const K=spInfoPart(P);if(!K)return;/* the class with the shortest list picks first, so a shared spell does not leave it short */const L=SPELLS.filter((x) =>{return K.lists.some((l) =>{return x[3].indexOf(l)>=0})&&x[1]<=K.max});
  L.sort((a,b) =>{return ((DMG.indexOf(b[0])>=0)-(DMG.indexOf(a[0])>=0))||(b[1]-a[1])});
  [0,1].forEach((kind) =>{L.forEach((x) =>{const t=(spLists()[P.cls]||[]).map((n) =>{return lateGet("SMAP")[n]}).filter(Boolean),nc=t.filter((y) =>{return !y[1]}).length,np=t.filter((y) =>{return y[1]}).length;
   if((kind===0&&!x[1]&&nc<K.ct)||(kind===1&&x[1]&&np<K.pr)){if(all().indexOf(x[0])<0&&auto.indexOf(x[0])<0)spToggle(x[0],P.cls)}})})});
 const wl=clsLv("Warlock");B.pk=B.pk||{};[[11,6],[13,7],[15,8],[17,9]].forEach((r) =>{if(wl>=r[0]&&!B.pk["ma"+r[1]]){const s=SPELLS.filter((x) =>{return x[1]===r[1]&&x[3].indexOf("Warlock")>=0})[0];if(s)B.pk["ma"+r[1]]=s[0]}});
 const need=bookNeed(),wz=cp.filter((p) =>{return p.cls==="Wizard"})[0];if(need&&wz){const mx=(spInfoPart(wz)||{max:1}).max,bk=B.pk.book=B.pk.book||[];SPELLS.filter((x) =>{return x[1]>=1&&x[1]<=mx&&x[3].indexOf("Wizard")>=0}).map((x,i,A) =>{return [x,A.slice(0,i).filter((y) =>{return y[1]===x[1]}).length]}).sort((a,b) =>{return a[1]-b[1]||b[0][1]-a[0][1]}).map((p) =>{return p[0]}).forEach((x) =>{if(bookOwn().length<need&&bookOwn().indexOf(x[0])<0)bk.push(x[0])})}}/* v35 p05 */
genv.__bldSheetFor=function(nb,fxT){let keep=B,out=null;try{fxtSet(fxT||null);const b=structuredClone(nb);for(const k in BLANK)if(b[k]==null)b[k]=clone(BLANK)[k];__set_B(cleanCh(b));applyPacks();out=toSheet()}finally{fxtSet(null);__set_B(keep);applyPacks()}return out};
/* T11 N29: many builds in a row (Find a build). The data tables (applyPacks) are set up again only when something they depend on changes:
   every builder field except the ones Find a build varies (species, background and its ability choice, scores), plus whether the species
   and background are core or come from a source (MoM, EFotA, a pack). Between two tries that differ only in core species, background or
   scores, the tables stay the same, so the second set-up is skipped, and the open character's tables are set up once per slice of work (pause) and at the end,
   not after every try. Same results as __bldSheetFor one by one (tests/rb_fast.py compares every try) */
genv.__bldSheetBatch=function(){let keep=B,last=null,srcAfter=null,bs=null,bb=null,done=false,VARY={species:1,bg:1,bgMode:1,bg1:1,bg2:1,base:1,arr:1,method:1,unset:1,name:1};
 function tag(t,base,n){return base[n]?(base[n].hb||"core"):"x:"+n+":"+(t[n]&&t[n].hb||"")}
 return {one:function(nb){if(done)return null;if(!bs){snap();bs=JSON.parse(BASE.sp);bb=JSON.parse(BASE.bg)}let out=null;try{const b=structuredClone(nb),z=clone(BLANK);for(const k in BLANK)if(b[k]==null)b[k]=z[k];__set_B(cleanCh(b));
   const o={};Object.keys(B).forEach((k) =>{if(!VARY[k])o[k]=B[k]});const key=JSON.stringify(o)+"|"+tag(SPECIES,bs,B.species)+"|"+tag(BACKGROUNDS,bb,B.bg);
   if(key!==last){applyPacks();last=key;srcAfter=JSON.stringify(B.src||{})}else{B.src=JSON.parse(srcAfter);if(!SPECIES[B.species]&&B.species!=="Custom")B.species="Human";if(!BACKGROUNDS[B.bg])B.bg="Soldier";if(B.sub&&B.sub!=="__custom"&&!CL().subs[B.sub])B.sub=""}
   out=toSheet()}catch(e){out=null;last=null}finally{__set_B(keep)}return out},
  /* between slices the open character's tables come back, so nothing else ever sees a try's tables. Skipped when they are the same */
  pause:function(){if(last===null)return;__set_B(keep);const o={};Object.keys(B).forEach((k) =>{if(!VARY[k])o[k]=B[k]});const key=JSON.stringify(o)+"|"+tag(SPECIES,bs,B.species)+"|"+tag(BACKGROUNDS,bb,B.bg);if(key!==last)applyPacks();last=null},
  end:function(){if(done)return;done=true;__set_B(keep);applyPacks()}}};
/* v74 test hook: reads a sheet back without saving. Returns the species, lineage and sources the builder would hold */
genv.__bldRound=function(C){let keep=B,out=null;try{fromSheet({C:C});out={species:B.species,lin:B.ch.lin||"",ch:clone(B.ch),sub:B.sub,src:clone(B.src),sp:(B.sp||[]).slice(),spm:clone(B.spm||{}),spells:(toSheet().spells||[]).map((x) =>{return x.n+"|"+x.use+"|"+x.src})}}finally{__set_B(keep);applyPacks()}return out};
genv.__bldLevelUp=function(){const st0=genv.__sheetState&&genv.__sheetState();if(st0&&st0.C&&!st0.C.cls){toast("Build this character first.");if(genv.__bldOpen)genv.__bldOpen();return}/* v22 i3 */genv.__bldOpen();if(document.querySelector("#bld > .exp:not(#exp)")){toast("Answer the question first, then raise the level in the Class step.");return}
 if(!B.cls){toast("Choose a class first.");return}/* v22 i3 */
 const st=genv.__sheetState&&genv.__sheetState(),sl=st&&st.C?(+st.C.level||1):0;if(sl&&TL()>sl){__set_step("class");render();toast("This build is already at level "+TL()+" and not applied yet. Finish it, then Apply.");return}/* v22 M4 */
 if(TL()>=20){toast("Level 20 is the highest level.");return}B.level=Math.min(20,(+B.level||1)+1);save();__set_step("class");applyPacks();render();
 toast("Level "+TL()+": "+B.cls+" "+B.level+". New choices are marked. To level another class instead, change it in the Class step. Apply when you are done.")};
genv.__bldOpen=function(){if(genv.__bldBusyOff)genv.__bldBusyOff();document.getElementById("bld").hidden=false;try{if(!B.camp&&genv.__sheetCamp){const sc1=genv.__sheetCamp();if(sc1){B.camp=sc1;save()}}const ci1=document.getElementById("cpIn");if(ci1)ci1.value=B.camp||""}catch(e){}/* T10: the campaign of the sheet */document.body.style.overflow="hidden";const st=genv.__sheetState&&genv.__sheetState();
 const load=function(more){const miss=fromSheet(st);stamp();save();__set_step("class");toast("Loaded "+B.name+" from the sheet"+(miss.length?". Check: "+miss.join(", "):"")+(more||""));applyPacks();render()};
 if(st&&st.C){const raw=savedRaw();
  /* no saved build yet (old manual sheet): nothing to lose, import as before */
  if(raw==null){if(B.name!==st.C.name||TL()!==(+st.C.level||1)){load();return}}
  /* RL40: the saved build is another character's (Start new before v13, older data). The Build button always opens this character:
     load it from the sheet. The other build stays as the backup (Restore backup build on the last step) */
  else if(!own(st.C.name)&&!copyOf(st.C.name)){const other=B.name;saveBak(raw);load(". "+other+" is kept as the backup build");return}
  else{if(copyOf(st.C.name))B.name=st.C.name;
   /* same character. Build level higher: a level-up not applied yet, open it. Sheet level higher (C2/L3): show the build, ask, back it up before loading from the sheet */
   if(TL()<(+st.C.level||1)){const ml=MCL().length?": "+[B.cls+" "+B.level].concat(MCL().map((m) =>{return m.cls+" "+m.lv})).join(" / "):"";
    applyPacks();render();
    ask("The sheet ("+(st.C.name||"Character")+", level "+(+st.C.level||1)+") does not match your saved build ("+B.name+", level "+TL()+ml+"). Load the build from the sheet? This replaces the saved choices, spells, and multiclass. A backup copy stays on this device. Cancel keeps the saved build.","Load from sheet",() =>{saveBak(raw);load()});return}
   if(B.cid!==sid()||copyOf(st.C.name)){stamp();save()}}}
 try{stepBack()}catch(e){}applyPacks();render()};
function closeBld(){document.getElementById("bld").hidden=true;document.body.style.overflow="";if(genv.__bldDot)genv.__bldDot()}/* v32 RU137 */
/* RU30: what a new character still has to choose before Apply: "class, species, and background" */
export function unList(){const m=[["cls","class"],["species","species"],["bg","background"]].filter((x) =>{return un(x[0])}).map((x) =>{return x[1]});return m.length>1?m.slice(0,-1).join(", ")+(m.length>2?",":"")+" and "+m[m.length-1]:m.join("")}
/* RU30: sheet of a new character before its first Apply: name and level only, nothing from the unchosen defaults */
export function blankC(){const C=toSheet();["species","cls","sub","bg","size","clsLabel","speedSrc","darkSrc","equipNote","rolledNote"].forEach((k) =>{C[k]=""});C.clsLabel="No class yet";
 C.hitDie=0;C.hpPerLevel=[];C.hpBonus=[];C.initBonus=[];C.pasBon=[];C.saves={};C.skills=(C.skills||[]).map((s) =>{return {n:s.n,ab:s.ab}});C.lang=[];
 C.ac={base:10,baseSrc:"Unarmored",dex:"full",bonus:[]};C.speed=30;C.darkvision=0;C.profs={armor:"",weapons:"",tools:""};C.profSrc={armor:[],weapons:[],tools:[]};C.acts=[];
 C.attacks=[];C.inv=[];C.gp=0;C.res=[];C.actions=[];C.features=[];C.defenses=[];C.spells=[];delete C.spellcasting;delete C.dcAb;delete C.dcSrc;return C}
function toSheetApply(review){const miss=unList();if(miss){toast("Choose your "+miss+" first");return}const C=toSheet(),cur=genv.__sheetName?genv.__sheetName():"",RI=ruleIssues(),imsg=RI.length?" Not finished yet: "+issueText(RI)+". You can Apply now and finish later.":"";
const go=function(){if(genv.__sheetApply)genv.__sheetApply(C,RI.length?"Sheet updated. Still to check in the builder: "+issueText(RI.slice(0,3))+(RI.length>3?" and "+(RI.length-3)+" more":"")+".":"");if(B.coins&&genv.__coinsPending){const pc=B.coins;delete B.coins;save();genv.__coinsPending(pc)}closeBld()};
 if(review===true&&RI.length){ask("Apply this build to the sheet?"+imsg,"Apply",() =>{toSheetApply(false)});return}
 /* M3 / RU4: manual sheet entries that Apply drops (Logic manualLost). Cancel keeps the sheet. Nothing is carried over */
 const st=genv.__sheetState?genv.__sheetState():null,lost=manualLost(st&&st.C,C),lt=[];
 if(lost.attacks.length)lt.push("Attacks: "+lost.attacks.join(", "));if(lost.res.length)lt.push("Limited Use: "+lost.res.join(", "));
 const lmsg=lt.length?" The sheet also has entries the builder does not produce. Apply removes them: "+lt.join(". ")+". They are not carried over.":"";
 if(cur&&cur!==C.name)ask("Replace the current sheet ("+cur+") with "+C.name+"? Notes stay, but HP, used resources, and the build are replaced."+lmsg+imsg,"Replace sheet",go);
 else if(lt.length)ask("Apply removes sheet entries the builder does not produce: "+lt.join(". ")+". They are not carried over. Cancel keeps the sheet as it is."+imsg,"Apply",go);
 else go()}
document.getElementById("b-toSheet").addEventListener("click",() =>{toSheetApply(false)});
document.getElementById("b-close").addEventListener("click",closeBld);
