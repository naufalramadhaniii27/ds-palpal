/* v22 RU52: Level Up from the sheet. Opens the build of this character and raises the main class one level. New choices show the usual marks */
/* v22 P1: names and numbers of a build file. err stops the import, warn is shown before it */
window.__bldCheck=function(b){var err=[],warn=[],keep=B,lv=+b.level;
 if(!b.cls||!CLASSES[b.cls])err.push("unknown class \""+(b.cls||"")+"\"");
 if(!(lv>=1&&lv<=20&&Math.floor(lv)===lv))err.push("level must be a whole number from 1 to 20");
 var tl=(lv||0)+(Array.isArray(b.mc)?b.mc.reduce(function(t,m){return t+(+m.lv||0)},0):0);if(tl>20)err.push("total level "+tl+" is more than 20");
 if(err.length)return {err:err,warn:warn};
 try{B=JSON.parse(JSON.stringify(BLANK));B.src=b.src||{core:true,dmg:true};applyPacks();
  if(b.species&&!SPECIES[b.species]&&b.species!=="Custom")warn.push("species \""+b.species+"\"");
  var bg=BACKGROUNDS[b.bg];if(b.bg&&!bg)warn.push("background \""+b.bg+"\"");
  if(bg&&b.bgMode!=="111")["bg2","bg1"].forEach(function(k){if(b[k]&&bg.ab.indexOf(b[k])<0)warn.push(b.bg+" cannot raise "+b[k])});
  var C0=CLASSES[b.cls];if(b.sub&&b.sub!=="__custom"&&!(C0.subs||{})[b.sub])warn.push("subclass \""+b.sub+"\" for "+b.cls);
  (Array.isArray(b.mc)?b.mc:[]).forEach(function(m){if(!CLASSES[m.cls])warn.push("multiclass \""+m.cls+"\"");else if(m.sub&&!(CLASSES[m.cls].subs||{})[m.sub])warn.push("subclass \""+m.sub+"\" for "+m.cls)});
  ABK.forEach(function(k){var v=(b.base||{})[k];if(v==null)return;v=+v;if(!(v>=3&&v<=20&&Math.floor(v)===v))warn.push(k+" score "+(b.base||{})[k])});
  var sp=[].concat(b.sp||[]);Object.keys(b.spm||{}).forEach(function(k){sp=sp.concat(b.spm[k]||[])});var bs=sp.filter(function(n){return !SMAP[n]});if(bs.length)warn.push("spells "+bs.join(", "));
  var bi=(Array.isArray(b.inv)?b.inv:[]).map(function(x){return x&&x.n}).filter(function(n){if(!n)return false;var bo=baseOf(n).b;return !(WEAPONS[bo]||ARMOR[bo]||bo==="Shield"||DMAP[n]||itemCost(bo)!=null||/^Spell Scroll \(/.test(n)||(typeof POTIONS!=="undefined"&&POTIONS.some(function(p){return p[0]===n})))});if(bi.length)warn.push("items "+bi.join(", "));
  var bf=[];Object.keys(b.ch||{}).forEach(function(k){var v=b.ch[k];if(v&&typeof v==="object"&&!Array.isArray(v)&&v.feat&&!FEATS[v.feat])bf.push(v.feat)});if(bf.length)warn.push("feats "+bf.join(", "));
 }finally{B=keep;applyPacks()}
 return {err:err,warn:warn}};
/* v22 RU80b: a build file written by hand or in a chat is tidied before it opens. Names are matched to the app lists
   (case, spaces, punctuation, a typo of one or two letters, a short form like "Berserker"), numbers written as text become numbers,
   scores stay 3 to 20, the background bonus goes only to the background's abilities (PHB 2024), and a homebrew source turns on
   when a name comes from it. What changes is listed in "notes" so the player sees it before the build opens. err stops the import */
window.__bldNorm=function(b0){var keep=B,err=[],notes=[],b;
 function nk(s){return String(s==null?"":s).toLowerCase().replace(/[‘’`]/g,"'").replace(/[^a-z0-9+]/g,"")}
 function lev(a,c,mx){if(Math.abs(a.length-c.length)>mx)return mx+1;var d=[],i,j;for(i=0;i<=a.length;i++){d[i]=[i]}for(j=0;j<=c.length;j++)d[0][j]=j;
  for(i=1;i<=a.length;i++)for(j=1;j<=c.length;j++){d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===c[j-1]?0:1));if(i>1&&j>1&&a[i-1]===c[j-2]&&a[i-2]===c[j-1])d[i][j]=Math.min(d[i][j],d[i-2][j-2]+1)}return d[a.length][c.length]}
 /* the name in the list for v: {v, near} or null. part: a short or long form that fits one name only */
 function pick(v,list,part,wide){if(v==null||v==="")return null;v=String(v).trim().replace(/\s+/g," ");if(list.indexOf(v)>=0)return {v:v};var k=nk(v);if(!k)return null;
  var m=list.filter(function(x){return nk(x)===k});if(m.length===1)return {v:m[0]};
  if(part&&k.length>=4){m=list.filter(function(x){var y=nk(x);return y.length>k.length?y.indexOf(k)>=0:wide&&k.indexOf(y)>=0&&y.length>=4});if(m.length===1)return {v:m[0],near:1}}
  if(k.length>=6){var mx=1,best=mx+1,bm=[];list.forEach(function(x){var e=lev(k,nk(x),mx);if(e<best){best=e;bm=[x]}else if(e===best)bm.push(x)});if(best<=mx&&bm.length===1)return {v:bm[0],near:1}}
  return null}
 function q(s){return "\""+s+"\""}
 function said(v,r){if(r&&r.near)notes.push(q(v)+" is read as "+q(r.v))}
 function abl(v){if(v==null||v==="")return "";var k=nk(v).slice(0,3).toUpperCase();return ABK.indexOf(k)>=0?k:null}
 function num(v){if(typeof v==="number")return v;var m=/^\s*(-?\d+(?:\.\d+)?)/.exec(String(v==null?"":v));return m?+m[1]:NaN}
 function arr(v){return v==null||v===""?[]:Array.isArray(v)?v:[v]}
 try{
 b=JSON.parse(JSON.stringify(b0||{}));delete b.kind;delete b.app;delete b.format;
 /* other field names a chat may use */
 [["class","cls"],["subclass","sub"],["background","bg"],["race","species"],["spells","sp"],["abilities","base"],["scores","base"],["items","inv"],["inventory","inv"],["equipment","inv"],["multiclass","mc"]].forEach(function(p){if(b[p[1]]==null&&b[p[0]]!=null){b[p[1]]=b[p[0]];delete b[p[0]]}});
 var byName=b.choices&&typeof b.choices==="object"&&!Array.isArray(b.choices)?b.choices:null;delete b.choices;/* v34 p07 */
 b.ch=b.ch&&typeof b.ch==="object"&&!Array.isArray(b.ch)?b.ch:{};
 var lin=b.lin!=null?b.lin:b.lineage;delete b.lin;delete b.lineage;if(lin&&!b.ch.lin)b.ch.lin=lin;
 /* homebrew packs this build needs */
 var src0=b.src&&typeof b.src==="object"?b.src:{core:true,dmg:true};b.src=src0;
 function on(src){B=JSON.parse(JSON.stringify(BLANK));B.src=src;B.packs=Array.isArray(b.packs)?b.packs:[];applyPacks()}
 function names(){var o={sp:Object.keys(SPECIES),bg:Object.keys(BACKGROUNDS),ft:Object.keys(FEATS),subs:{}};Object.keys(CLASSES).forEach(function(c){o.subs[c]=Object.keys(CLASSES[c].subs||{})});return o}
 on(src0);var N0=names(),ids=[];
 var cl=pick(b.cls,Object.keys(CLASSES));if(!cl){err.push(b.cls?"the class "+q(b.cls)+" is not a 2024 class":"it has no class");return {err:err,notes:notes,b:b}}said(b.cls,cl);b.cls=cl.v;
 function need(v,list,part,wide){return v&&!pick(v,list,part,wide)}
 var want=[];if(need(b.species,N0.sp))want.push(["sp",b.species]);if(need(b.bg,N0.bg,1,1))want.push(["bg",b.bg]);if(need(b.sub,N0.subs[b.cls]||[],1))want.push(["sub",b.sub]);
 if(want.length)allPacks().forEach(function(p){if(src0[p.id])return;var s=Object.assign({},src0);s[p.id]=true;on(s);var N=names(),hit=want.filter(function(w){return w[0]==="sp"?pick(w[1],N.sp):w[0]==="bg"?pick(w[1],N.bg,1,1):pick(w[1],N.subs[b.cls]||[],1)});
  if(hit.length){src0[p.id]=true;notes.push("The "+p.name+" source is turned on for "+hit.map(function(w){return q(w[1])}).join(", "));want=want.filter(function(w){return hit.indexOf(w)<0})}});
 on(src0);var L=names();
 /* level and multiclass */
 var lv=b.level==null||b.level===""?1:num(b.level);if(b.level==null||b.level==="")notes.push("Level is missing, so it is 1");
 if(!(lv>=1&&lv<=20&&Math.floor(lv)===lv)){err.push("level must be a whole number from 1 to 20");return {err:err,notes:notes,b:b}}b.level=lv;
 b.mc=arr(b.mc).filter(function(m){if(!m||typeof m!=="object")return false;var r=pick(m.cls||m.class,Object.keys(CLASSES));if(!r){notes.push("Multiclass "+q(m.cls||m.class||"")+" is removed. It is not a 2024 class");return false}
  said(m.cls||m.class,r);m.cls=r.v;delete m["class"];var l=m.lv==null?num(m.level):num(m.lv);delete m.level;if(!(l>=1&&Math.floor(l)===l)){notes.push("Multiclass "+m.cls+" has no level, so it is 1");l=1}m.lv=l;
  if(m.sub){var s=pick(m.sub,L.subs[m.cls]||[],1);if(s){said(m.sub,s);m.sub=s.v}else{notes.push("Subclass "+q(m.sub)+" is not a "+m.cls+" subclass, so it is left for you to choose");m.sub=""}}return true});
 var tl=b.level+b.mc.reduce(function(t,m){return t+m.lv},0);if(tl>20){err.push("total level "+tl+" is more than 20");return {err:err,notes:notes,b:b}}
 /* species, lineage, background, subclass */
 b.unset=b.unset&&typeof b.unset==="object"?b.unset:{};
 if(b.species){var sr=pick(b.species,L.sp);
  if(!sr&&b.species!=="Custom"){/* "Wood Elf", "Tiefling (Infernal)", "Red Dragonborn": species plus lineage */var t0=String(b.species);L.sp.forEach(function(s){if(sr)return;var o=(SPECIES[s].lin||{}).opts;if(!o)return;
    if(nk(t0).indexOf(nk(s))<0&&nk(t0)!=="drow")return;var rest=nk(t0).replace(nk(s),"");var lo=o.filter(function(x){var y=nk(x);return rest.length>=3&&y.indexOf(rest)===0});if(lo.length===1&&(nk(t0).indexOf(nk(s))>=0||lo.length===1)){sr={v:s,near:1};b.ch.lin=lo[0]}});
   if(sr)notes.push(q(t0)+" is read as "+sr.v+", "+String(b.ch.lin).replace(/ \(.*$/,""))}
  else said(b.species,sr);
  if(sr)b.species=sr.v;else if(b.species!=="Custom"){notes.push("Species "+q(b.species)+" is not in the app, so it is left for you to choose");delete b.species;b.unset.species=1}}
 if(b.species&&SPECIES[b.species]&&b.ch.lin){var lo2=(SPECIES[b.species].lin||{}).opts||[],k2=nk(b.ch.lin),lr=lo2.filter(function(x){return x===b.ch.lin})[0]||lo2.filter(function(x){return nk(x).indexOf(k2)===0||nk(x.replace(/ \(.*$/,""))===k2})[0];
  if(lr)b.ch.lin=lr;else{notes.push(q(b.ch.lin)+" is not a "+b.species+" option, so it is left for you to choose");delete b.ch.lin}}
 if(b.bg){var br=pick(b.bg,L.bg,1,1);if(br){said(b.bg,br);b.bg=br.v}else{notes.push("Background "+q(b.bg)+" is not in the app, so it is left for you to choose");delete b.bg;b.unset.bg=1}}
 if(b.sub){var ur=pick(b.sub,L.subs[b.cls]||[],1);if(ur){said(b.sub,ur);b.sub=ur.v}else{notes.push("Subclass "+q(b.sub)+" is not a "+b.cls+" subclass, so it is left for you to choose");b.sub=""}}
 /* ability scores */
 var bs=b.base&&typeof b.base==="object"?b.base:null,nb={};
 if(bs){Object.keys(bs).forEach(function(k){var a=abl(k);if(a)nb[a]=bs[k]});ABK.forEach(function(a){var v=nb[a];if(v==null||v===""||isNaN(num(v))){notes.push(ABN[a]+" score is missing, so it is 10");nb[a]=10;return}
  v=Math.round(num(v));if(v>20){notes.push(ABN[a]+" "+nb[a]+" becomes 20, the highest score");v=20}else if(v<3){notes.push(ABN[a]+" "+nb[a]+" becomes 3, the lowest score");v=3}nb[a]=v});b.base=nb;if(!b.method)b.method="manual"}
 /* background bonus: only the background's three abilities */
 var bm=String(b.bgMode==null?"21":b.bgMode).replace(/[^0-9]/g,"");b.bgMode=(bm==="111"||b.rs==="2014")?"111":"21";
 var bgo=b.bg&&BACKGROUNDS[b.bg];
 if(b.bgMode==="21"){var a2=abl(b.bg2),a1=abl(b.bg1);b.bg2=a2||"";b.bg1=a1||"";
  if(bgo){var ab=bgo.ab,sc=b.base||BLANK.base,best=function(no){return ab.filter(function(x){return x!==no}).sort(function(x,y){return (sc[y]||0)-(sc[x]||0)})[0]};
   if(b.bg2&&ab.indexOf(b.bg2)<0){var n2=best(b.bg1&&ab.indexOf(b.bg1)>=0?b.bg1:"");notes.push(b.bg+" cannot raise "+b.bg2+", so the +2 goes to "+n2);b.bg2=n2}
   if(b.bg1&&(ab.indexOf(b.bg1)<0||b.bg1===b.bg2)){var n1=best(b.bg2);notes.push(b.bg1===b.bg2?"The +1 cannot go to "+b.bg1+" again, so it goes to "+n1:b.bg+" cannot raise "+b.bg1+", so the +1 goes to "+n1);b.bg1=n1}}}
 /* spells */
 var SN=Object.keys(SMAP),gone=[];
 function spl(list){var out=[];arr(list).forEach(function(n){var r=pick(n,SN);if(!r){if(n)gone.push(n);return}said(n,r);if(out.indexOf(r.v)<0)out.push(r.v)});return out}
 b.sp=spl(b.sp);if(b.spm&&typeof b.spm==="object"){var sm={};Object.keys(b.spm).forEach(function(c){var r=pick(c,Object.keys(CLASSES));if(r)sm[r.v]=spl(b.spm[c])});b.spm=sm}
 if(b.pk&&typeof b.pk==="object")Object.keys(b.pk).forEach(function(k){var p=b.pk[k];if(!p||typeof p!=="object")return;if(p.c)p.c=spl(p.c);if(p.s)p.s=spl(p.s);if(p.ab!=null){var a=abl(p.ab);if(a)p.ab=a;else delete p.ab}});
 if(gone.length)notes.push("Not in the 2024 spell list, so removed: "+gone.join(", "));
 /* choices: skills, languages, Weapon Mastery, feats */
 var FT=L.ft;
 /* v34 p07: choices by feature name ({"Eldritch Invocations":[...],"Fighting Style":"Defense"}). Raw builder keys still work */
 if(byName){var left=Object.keys(byName).filter(function(k){return byName[k]!=null&&byName[k]!==""}),CHN=[];
  var cands=function(c){if(c.t==="feat"||c.t==="fs"||c.t==="ofeat")return FT;if(c.t==="tool")return c.cats?[].concat.apply([],c.cats.map(function(k){return TOOLS[k]||[]})):toolAll();if(c.t==="sub")return L.subs[b.cls]||[];
   if(c.t==="lang")return c.from||LANGS.map(function(x){return x[0]});if(c.t==="skills"||c.t==="exp")return c.from||Object.keys(SKILLS);if(c.t==="wm")return c.from||wmKeys();return c.list||c.from||null};
  var one=function(c){return /^(feat|fs|ofeat|opt|sub|mcsub|lin)$/.test(c.t)};
  var put=function(c,vals,name){var cl=cands(c),out=[],bad=[];vals.forEach(function(v){if(v&&typeof v==="object"){out.push(v);return}var r=cl?pick(v,cl,1):{v:String(v)};if(r){said(v,r);if(out.indexOf(r.v)<0)out.push(r.v)}else bad.push(v)});
   if(bad.length)notes.push(name+": "+bad.map(q).join(", ")+" "+(bad.length>1?"are":"is")+" not an option there, so it is left for you to choose");if(!out.length)return;
   if(c.t==="sub"){if(!b.sub)b.sub=out[0];return}if(c.t==="mcsub"){var mcx=(b.mc||[])[c.mc];if(mcx&&!mcx.sub)mcx.sub=out[0];return}
   if(c.t==="feat"){var o=out[0];ch0[c.key]=typeof o==="object"?o:{feat:o};return}if(one(c)){ch0[c.key]=typeof out[0]==="object"?out[0].feat:out[0];return}ch0[c.key]=out.slice(0,c.n)};
  var ch0=b.ch;
  /* Magic Initiate spells ("Magic Initiate (Wizard)": {"cantrips":[..],"spell":"..","ability":"INT"}) go to the spell feat picks (pk mi0, mi1) */
  left=left.filter(function(name){var v=byName[name];if(!/^magic initiate/i.test(String(name).trim())||!v||typeof v!=="object"||Array.isArray(v))return true;b.pk=b.pk&&typeof b.pk==="object"?b.pk:{};var i=0;while(b.pk["mi"+i])i++;
   var ab=v.ab||v.ability;b.pk["mi"+i]={c:arr(v.c||v.cantrips||[]),s:arr(v.s||v.spells||v.spell||[]),ab:ab?(abl(ab)||ab):undefined};if(!b.pk["mi"+i].ab)delete b.pk["mi"+i].ab;return false});
  for(var pass=0;pass<3&&left.length;pass++){var CLx=[];try{CLx=withB(b,choiceList)||[]}catch(er){CLx=[]}var KS=CLx.map(function(c){return c.key});
   left=left.filter(function(name){var val=byName[name];if(KS.indexOf(name)>=0){ch0[name]=val;return false}
    var nn=nk(name),lab=function(c){var t=c.title||"",f=c.feature||"",i=t.indexOf(": ");return [t,f,t.split(":")[0],i>0&&f?f+": "+t.slice(i+2):"",i>0?t.slice(i+2):""].filter(Boolean)};
    var E=CLx.filter(function(c){return c.t!=="spell"&&lab(c).some(function(x){return nk(x)===nn})});
    if(!E.length&&nn.length>=6)E=CLx.filter(function(c){return c.t!=="spell"&&lab(c).some(function(x){return lev(nk(x),nn,2)<=2})});
    if(!E.length)return true;
    E.sort(function(a,c){return (a.lvl||0)-(c.lvl||0)});var got=E.map(function(){return []}),rest=[];
    /* each value goes to the first entry (lowest level) that has room and offers it, so level 5 picks land at level 5 */
    arr(val).forEach(function(v){var placed=E.some(function(c,i){if(got[i].length>=(one(c)?1:c.n))return false;if(v&&typeof v==="object"){if(/^(feat|fs|ofeat)$/.test(c.t)){got[i].push(v);return true}return false}var cl=cands(c);if(cl&&!pick(v,cl,1))return false;got[i].push(v);return true});if(!placed)rest.push(v)});
    E.forEach(function(c,i){put(c,got[i],name)});
    if(rest.length)notes.push(name+": more picks than this build has, so left out: "+rest.map(function(v){return typeof v==="object"?JSON.stringify(v):q(v)}).join(", "));
    return false})}
  left.forEach(function(name){if(/^[a-z][A-Za-z0-9:_-]*$/.test(name)){ch0[name]=byName[name];return}notes.push(q(name)+" is not a choice for this build, so it is left out")})}
 var ch=b.ch;
 function lst(key,list,what){if(ch[key]==null)return;var bad=[],out=[];arr(ch[key]).forEach(function(n){var r=pick(n,list);if(r){said(n,r);if(out.indexOf(r.v)<0)out.push(r.v)}else bad.push(n)});ch[key]=out;if(bad.length)notes.push(what+" not in the app, so removed: "+bad.join(", "))}
 lst("clsk",Object.keys(SKILLS),"Skills");lst("lang",LANGS.map(function(x){return x[0]}),"Languages");lst("wm",wmKeys(),"Weapon Mastery weapons");
 Object.keys(ch).forEach(function(k){var v=ch[k];
  if(/^(m\d+:)?(feat\d+|fs\d+)$|^spfeat$/.test(k)){var o=v&&typeof v==="object"&&!Array.isArray(v)?v:null,f=o?o.feat:v;if(f==null||f==="")return;var r=pick(f,FT);
   if(!r&&/^magic initiate$/i.test(String(f).trim())&&o&&o.list){r=pick("Magic Initiate ("+o.list+")",FT)}
   if(!r){notes.push("Feat "+q(f)+" is not in the app, so it is left for you to choose");delete ch[k];return}said(f,r);if(o){o.feat=r.v;["a1","a2","a"].forEach(function(x){if(o[x]!=null){var a=abl(o[x]);if(a)o[x]=a;else delete o[x]}})}else ch[k]=r.v}});
 /* items: names from the app lists, "+1 Longsword", "Plate" for "Plate Armor"; an unknown item stays as plain gear */
 var IN=[].concat(Object.keys(WEAPONS),Object.keys(ARMOR),["Shield"],Object.keys(DMAP),GEAR.map(function(x){return x[0]}),Object.keys(PRICE),POTIONS.map(function(x){return x[0]})).filter(function(x,i,a){return a.indexOf(x)===i}),plain=[];
 function item(n){var s=String(n).trim().replace(/\s+/g," ");if(IN.indexOf(s)>=0)return {v:s};var m=/^Spell Scroll \((.+)\)$/i.exec(s);if(m){var r=pick(m[1],SN);return r?{v:"Spell Scroll ("+r.v+")",near:r.near}:null}
  m=/^\+(\d)\s+(.+)$/.exec(s)||/^(.+?),?\s*\+(\d)$/.exec(s);if(m){var pl=/^\+/.test(s)?m[1]:m[2],bn=item(/^\+/.test(s)?m[2]:m[1]);if(bn){var c=bn.v+", +"+pl;if(DMAP[c]||WEAPONS[bn.v]||ARMOR[bn.v]||bn.v==="Shield")return {v:c,near:bn.near}}}
  var p=/^Potion of (Greater|Superior|Supreme) Healing$/i.exec(s);if(p)return {v:"Potion of Healing ("+p[1].charAt(0).toUpperCase()+p[1].slice(1).toLowerCase()+")"};if(/^(rope|rope, (hempen|silk)( \(50 feet\))?|(hempen|silk) rope)$/i.test(s)&&IN.indexOf("Rope")>=0)return {v:"Rope",near:s.toLowerCase()!=="rope"?1:0};
  var r2=pick(s,IN);if(r2)return r2;var ak=nk(s+" Armor");r2=Object.keys(ARMOR).filter(function(x){return nk(x)===ak})[0];if(r2)return {v:r2,near:1};
  var pre=GEAR.map(function(x){return x[0]}).filter(function(x){return /\)$/.test(x)&&nk(x).indexOf(nk(s))===0});/* bundles such as "Arrows (20)" */return pre.length===1&&nk(s).length>=5?{v:pre[0],near:1}:null}
 if(b.inv!=null){var arm=0;b.inv=arr(b.inv).map(function(x){if(typeof x==="string")x={n:x};if(!x||typeof x!=="object")return null;var n=x.n!=null?x.n:x.name;if(n==null||n==="")return null;
  var o={n:String(n).trim()},qv=x.q!=null?x.q:x.qty!=null?x.qty:x.quantity!=null?x.quantity:x.count;qv=num(qv);o.q=qv>=1?Math.floor(qv):1;o.eq=!!(x.eq!=null?x.eq:x.equipped);
  Object.keys(x).forEach(function(k){if(["n","name","q","qty","quantity","count","eq","equipped"].indexOf(k)<0)o[k]=x[k]});
  var eq0=x.eq!=null||x.equipped!=null,r=item(o.n);if(r){var bu=/\((\d+)\)$/.exec(r.v);if(bu&&!/\(\d+\)$/.test(o.n)&&o.q>=+bu[1]&&o.q%+bu[1]===0)o.q=o.q/+bu[1];said(o.n,r);o.n=r.v}else plain.push(o.n);
  if(!eq0){var bo=baseOf(o.n).b;/* not said: weapons, the first armor, and a Shield are worn */if(WEAPONS[bo]||bo==="Shield")o.eq=true;else if(ARMOR[bo]&&!arm){o.eq=true;arm=1}}else if(o.eq&&ARMOR[baseOf(o.n).b])arm=1;return o}).filter(Boolean);
  if(plain.length)notes.push("Not in the app item lists, so kept as plain gear with no weight or cost: "+plain.join(", "));
  if(b.eqC==null)b.eqC="none";if(b.eqB==null)b.eqB="none"}
 if(!Object.keys(b.unset).length)delete b.unset;
 }finally{B=keep;applyPacks()}
 return {err:err,notes:notes,b:b}};
/* v22 RU80: the sheet a build gives, without touching the build being edited */
window.__bldAuto=function(nb){var keep=B,out=null;try{var b=JSON.parse(JSON.stringify(nb));for(var k in BLANK)if(b[k]==null)b[k]=clone(BLANK)[k];B=cleanCh(b);applyPacks();qbFill();if(MCL().length){if(!(nb.sp&&nb.sp.length))B.sp=[]}else qbSpells();qbSpMC();qbMI();qbBook();qbFill();qbSpMC();out=JSON.parse(JSON.stringify(B))}finally{B=keep;applyPacks()}return out};
window.__bldFeatViol=function(b){return withB(b,featViol)};
function qbSpMC(){var cp=casterParts();if(!cp.length)return;var auto=autoSpells().map(function(a){return a.n}),DMG=["Eldritch Blast","Fire Bolt","Sacred Flame","Vicious Mockery","Produce Flame","Starry Wisp","Toll the Dead","Mind Sliver"];
 var all=function(){var s=[],o=spLists();for(var k in o)s=s.concat(o[k]);return s};
 cp.slice().sort(function(a,b){var ka=spInfoPart(a),kb=spInfoPart(b),n=function(K){return K?SPELLS.filter(function(x){return K.lists.some(function(l){return x[3].indexOf(l)>=0})&&x[1]<=K.max}).length:0};return n(ka)-n(kb)}).forEach(function(P){var K=spInfoPart(P);if(!K)return;/* the class with the shortest list picks first, so a shared spell does not leave it short */var L=SPELLS.filter(function(x){return K.lists.some(function(l){return x[3].indexOf(l)>=0})&&x[1]<=K.max});
  L.sort(function(a,b){return ((DMG.indexOf(b[0])>=0)-(DMG.indexOf(a[0])>=0))||(b[1]-a[1])});
  [0,1].forEach(function(kind){L.forEach(function(x){var t=(spLists()[P.cls]||[]).map(function(n){return SMAP[n]}).filter(Boolean),nc=t.filter(function(y){return !y[1]}).length,np=t.filter(function(y){return y[1]}).length;
   if((kind===0&&!x[1]&&nc<K.ct)||(kind===1&&x[1]&&np<K.pr)){if(all().indexOf(x[0])<0&&auto.indexOf(x[0])<0)spToggle(x[0],P.cls)}})})});
 var wl=clsLv("Warlock");B.pk=B.pk||{};[[11,6],[13,7],[15,8],[17,9]].forEach(function(r){if(wl>=r[0]&&!B.pk["ma"+r[1]]){var s=SPELLS.filter(function(x){return x[1]===r[1]&&x[3].indexOf("Warlock")>=0})[0];if(s)B.pk["ma"+r[1]]=s[0]}});
 var need=bookNeed(),wz=cp.filter(function(p){return p.cls==="Wizard"})[0];if(need&&wz){var mx=(spInfoPart(wz)||{max:1}).max,bk=B.pk.book=B.pk.book||[];SPELLS.filter(function(x){return x[1]>=1&&x[1]<=mx&&x[3].indexOf("Wizard")>=0}).map(function(x,i,A){return [x,A.slice(0,i).filter(function(y){return y[1]===x[1]}).length]}).sort(function(a,b){return a[1]-b[1]||b[0][1]-a[0][1]}).map(function(p){return p[0]}).forEach(function(x){if(bookOwn().length<need&&bookOwn().indexOf(x[0])<0)bk.push(x[0])})}}/* v35 p05 */
window.__bldSheetFor=function(nb){var keep=B,out=null;try{var b=JSON.parse(JSON.stringify(nb));for(var k in BLANK)if(b[k]==null)b[k]=clone(BLANK)[k];B=cleanCh(b);applyPacks();out=toSheet()}finally{B=keep;applyPacks()}return out};
/* v74 test hook: reads a sheet back without saving. Returns the species, lineage and sources the builder would hold */
window.__bldRound=function(C){var keep=B,out=null;try{fromSheet({C:C});out={species:B.species,lin:B.ch.lin||"",ch:clone(B.ch),sub:B.sub,src:clone(B.src),sp:(B.sp||[]).slice(),spm:clone(B.spm||{}),spells:(toSheet().spells||[]).map(function(x){return x.n+"|"+x.use+"|"+x.src})}}finally{B=keep;applyPacks()}return out};
window.__bldLevelUp=function(){var st0=window.__sheetState&&window.__sheetState();if(st0&&st0.C&&!st0.C.cls){toast("Build this character first.");if(window.__bldOpen)window.__bldOpen();return}/* v22 i3 */window.__bldOpen();if(document.querySelector("#bld > .exp:not(#exp)")){toast("Answer the question first, then raise the level in the Class step.");return}
 if(!B.cls){toast("Choose a class first.");return}/* v22 i3 */
 var st=window.__sheetState&&window.__sheetState(),sl=st&&st.C?(+st.C.level||1):0;if(sl&&TL()>sl){step="class";render();toast("This build is already at level "+TL()+" and not applied yet. Finish it, then Apply.");return}/* v22 M4 */
 if(TL()>=20){toast("Level 20 is the highest level.");return}B.level=Math.min(20,(+B.level||1)+1);save();step="class";applyPacks();render();
 toast("Level "+TL()+": "+B.cls+" "+B.level+". New choices are marked. To level another class instead, change it in the Class step. Apply when you are done.")};
window.__bldOpen=function(){if(window.__bldBusyOff)window.__bldBusyOff();document.getElementById("bld").hidden=false;document.body.style.overflow="hidden";var st=window.__sheetState&&window.__sheetState();
 var load=function(more){var miss=fromSheet(st);stamp();save();step="class";toast("Loaded "+B.name+" from the sheet"+(miss.length?". Check: "+miss.join(", "):"")+(more||""));applyPacks();render()};
 if(st&&st.C){var raw=savedRaw();
  /* no saved build yet (old manual sheet): nothing to lose, import as before */
  if(raw==null){if(B.name!==st.C.name||TL()!==(+st.C.level||1)){load();return}}
  /* RL40: the saved build is another character's (Start new before v13, older data). The Build button always opens this character:
     load it from the sheet. The other build stays as the backup (Restore backup build on the last step) */
  else if(!own(st.C.name)&&!copyOf(st.C.name)){var other=B.name;saveBak(raw);load(". "+other+" is kept as the backup build");return}
  else{if(copyOf(st.C.name))B.name=st.C.name;
   /* same character. Build level higher: a level-up not applied yet, open it. Sheet level higher (C2/L3): show the build, ask, back it up before loading from the sheet */
   if(TL()<(+st.C.level||1)){var ml=MCL().length?": "+[B.cls+" "+B.level].concat(MCL().map(function(m){return m.cls+" "+m.lv})).join(" / "):"";
    applyPacks();render();
    ask("The sheet ("+(st.C.name||"Character")+", level "+(+st.C.level||1)+") does not match your saved build ("+B.name+", level "+TL()+ml+"). Load the build from the sheet? This replaces the saved choices, spells, and multiclass. A backup copy stays on this device. Cancel keeps the saved build.","Load from sheet",function(){saveBak(raw);load()});return}
   if(B.cid!==sid()||copyOf(st.C.name)){stamp();save()}}}
 applyPacks();render()};
function closeBld(){document.getElementById("bld").hidden=true;document.body.style.overflow="";if(window.__bldDot)window.__bldDot()}/* v32 RU137 */
/* RU30: what a new character still has to choose before Apply: "class, species, and background" */
function unList(){var m=[["cls","class"],["species","species"],["bg","background"]].filter(function(x){return un(x[0])}).map(function(x){return x[1]});return m.length>1?m.slice(0,-1).join(", ")+(m.length>2?",":"")+" and "+m[m.length-1]:m.join("")}
/* RU30: sheet of a new character before its first Apply: name and level only, nothing from the unchosen defaults */
function blankC(){var C=toSheet();["species","cls","sub","bg","size","clsLabel","speedSrc","darkSrc","equipNote","rolledNote"].forEach(function(k){C[k]=""});C.clsLabel="No class yet";
 C.hitDie=0;C.hpPerLevel=[];C.hpBonus=[];C.initBonus=[];C.pasBon=[];C.saves={};C.skills=(C.skills||[]).map(function(s){return {n:s.n,ab:s.ab}});C.lang=[];
 C.ac={base:10,baseSrc:"Unarmored",dex:"full",bonus:[]};C.speed=30;C.darkvision=0;C.profs={armor:"",weapons:"",tools:""};C.profSrc={armor:[],weapons:[],tools:[]};C.acts=[];
 C.attacks=[];C.inv=[];C.gp=0;C.res=[];C.actions=[];C.features=[];C.defenses=[];C.spells=[];delete C.spellcasting;delete C.dcAb;delete C.dcSrc;return C}
function toSheetApply(review){var miss=unList();if(miss){toast("Choose your "+miss+" first");return}var C=toSheet(),cur=window.__sheetName?window.__sheetName():"",RI=ruleIssues(),imsg=RI.length?" Not finished yet: "+issueText(RI)+". You can Apply now and finish later.":"";
 var go=function(){if(window.__sheetApply)window.__sheetApply(C,RI.length?"Sheet updated. Still to check in the builder: "+issueText(RI.slice(0,3))+(RI.length>3?" and "+(RI.length-3)+" more":"")+".":"");if(B.coins&&window.__coinsPending){var pc=B.coins;delete B.coins;save();window.__coinsPending(pc)}closeBld()};
 if(review===true&&RI.length){ask("Apply this build to the sheet?"+imsg,"Apply",function(){toSheetApply(false)});return}
 /* M3 / RU4: manual sheet entries that Apply drops (Logic manualLost). Cancel keeps the sheet. Nothing is carried over */
 var st=window.__sheetState?window.__sheetState():null,lost=manualLost(st&&st.C,C),lt=[];
 if(lost.attacks.length)lt.push("Attacks: "+lost.attacks.join(", "));if(lost.res.length)lt.push("Limited Use: "+lost.res.join(", "));
 var lmsg=lt.length?" The sheet also has entries the builder does not produce. Apply removes them: "+lt.join(". ")+". They are not carried over.":"";
 if(cur&&cur!==C.name)ask("Replace the current sheet ("+cur+") with "+C.name+"? Notes stay, but HP, used resources, and the build are replaced."+lmsg+imsg,"Replace sheet",go);
 else if(lt.length)ask("Apply removes sheet entries the builder does not produce: "+lt.join(". ")+". They are not carried over. Cancel keeps the sheet as it is."+imsg,"Apply",go);
 else go()}
document.getElementById("b-toSheet").addEventListener("click",function(){toSheetApply(false)});
document.getElementById("b-close").addEventListener("click",closeBld);
