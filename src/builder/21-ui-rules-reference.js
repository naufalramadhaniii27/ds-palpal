import {ABK,esc,toast} from "./01-logic-core-helpers.js";
import {DMAP,NEWB,un} from "./03-logic-magic-item-effects.js";
import {B,__set_B,save} from "./04-logic-storage.js";
import {R14} from "./05-logic-choice-model-ruleset.js";
import {fs14List} from "./08-logic-2014-rules.js";
import {allFeats,choices} from "./09-logic-feats-and-choices.js";
import {bookNeed,bookOwn,isDone,wizLv} from "./10-logic-v17-additions.js";
import {clsLv} from "./11-logic-derivation.js";
import {ACM,toSheet} from "./12-logic-export-to-sheet.js";
import {applyPacks,autoSpells,miFeats} from "./13-logic-sources-and-packs.js";
import {baseOf,dbCat,dbItems,dbQ,packOut,qOf,rebuildKit} from "./14-logic-multiclass-hp-shop.js";
import {__set_pickCls,__set_pickSp,__set_step,ask,card,pickCls,pickSp,profSkills,step} from "./17-ui-step-builder.js";
import {SMAP,issueText,plural,ruleIssues,spInfo} from "./18-ui-spells.js";
import {__R} from "./00-reg.js";
Object.defineProperty(__R,"acModeCard",{get:function(){return acModeCard;},set:function(v){acModeCard=v;},configurable:true});
Object.defineProperty(__R,"bCt",{get:function(){return bCt;},set:function(v){bCt=v;},configurable:true});
Object.defineProperty(__R,"bInN",{get:function(){return bInN;},set:function(v){bInN=v;},configurable:true});
Object.defineProperty(__R,"bInvOrder",{get:function(){return bInvOrder;},set:function(v){bInvOrder=v;},configurable:true});
Object.defineProperty(__R,"binIn",{get:function(){return binIn;},set:function(v){binIn=v;},configurable:true});
Object.defineProperty(__R,"hbForm",{get:function(){return hbForm;},set:function(v){hbForm=v;},configurable:true});
Object.defineProperty(__R,"qbCard",{get:function(){return qbCard;},set:function(v){qbCard=v;},configurable:true});
Object.defineProperty(__R,"sp14List",{get:function(){return sp14List;},set:function(v){sp14List=v;},configurable:true});
/* ---------- rules ---------- */
export function renderRules(){const cats=["Classes","Subclasses","Species","Backgrounds","Feats","Weapons","Armor","Options"],it=dbItems();
 return '<h2 class="ttl">Rules Database</h2><input class="btx" id="dbq" type="search" placeholder="Search name or rule text" value="'+esc(dbQ)+'"><div class="chips cats">'+cats.map((c) =>{return '<button type="button" class="chip'+(c===dbCat&&!dbQ?" on":"")+'" data-cat="'+c+'">'+c+'</button>'}).join("")+'</div><p class="pick">'+it.length+' entries'+(dbQ?' across all categories':'')+'</p>'+
  it.map((i,n) =>{return card("db"+i.t+n,i.t,i.m,(i.d?'<p class="fd">'+esc(i.d)+'</p>':'')+(i.x.length?i.x.map((x) =>{return '<p class="fd">'+esc(x)+'</p>'}).join(""):''))}).join("")}

/* v26 RU38 no. 8: make your own species, feat, or magic item in the builder (Sources step). They go into the source "My Homebrew" (B.packs, id my-homebrew),
   which this build turns on. The pack format is the one Add Homebrew Source reads, so a made entry also works in a pasted pack.
   Homebrew of the other characters on this device can be added to this character (copied, not linked). */
export var HB_ID="my-homebrew",HBF={t:"species"},HBE="";
function hbMine(){return (B.packs||[]).filter((p) =>{return p.id===HB_ID})[0]||null}
function hbHas(p,t,n){return !!p&&(t==="species"?!!(p.species||{})[n]:t==="feat"?!!(p.feats||{})[n]:(p.items||[]).some((x) =>{return x[0]===n}))}
function hbList(p){if(!p)return [];const o=[];Object.keys(p.species||{}).forEach((k) =>{o.push(["species",k])});Object.keys(p.feats||{}).forEach((k) =>{o.push(["feat",k])});(p.items||[]).forEach((x) =>{o.push(["item",x[0]])});return o}
function hbCount(p){const a=Object.keys(p.species||{}).length,b=Object.keys(p.feats||{}).length,c=(p.items||[]).length,o=[];if(a)o.push(plural(a,"species").replace(/speciess$/,"species"));if(b)o.push(plural(b,"feat"));if(c)o.push(plural(c,"magic item"));return o.join(", ")||"empty"}
function hbIn(id,lab,v,ph,type){return '<label class="hbf"><span>'+lab+'</span><input class="btx" id="'+id+'" type="'+(type||"text")+'" value="'+esc(v==null?"":v)+'"'+(ph?' placeholder="'+esc(ph)+'"':'')+'></label>'}
function hbSel(id,lab,v,opts){return '<label class="hbf"><span>'+lab+'</span><select class="dd" id="'+id+'">'+opts.map((o) =>{const val=Array.isArray(o)?o[0]:o,tx=Array.isArray(o)?o[1]:o;return '<option value="'+esc(val)+'"'+(String(v)===String(val)?" selected":"")+'>'+esc(tx)+'</option>'}).join("")+'</select></label>'}
function hbTa(id,lab,v,ph){return '<label class="hbf"><span>'+lab+'</span><textarea class="btx" id="'+id+'" rows="4"'+(ph?' placeholder="'+esc(ph)+'"':'')+'>'+esc(v||"")+'</textarea></label>'}
const HB_FX=[["ac","Armor Class"],["save","Saving throws"],["atk","Weapon attack rolls"],["dmg","Weapon damage"],["spellAtk","Spell attack"],["spellDc","Spell save DC"]];
function hbForm(){let f=HBF,h='<div class="hbmk"><div class="radios h">'+[["species","Species"],["feat","Feat"],["item","Magic Item"]].map((t) =>{return '<button type="button" class="rad'+(f.t===t[0]?" on":"")+'" data-hbt="'+t[0]+'"'+(HBE?' disabled':'')+'><b>'+t[1]+'</b></button>'}).join("")+'</div>';
 h+=hbIn("hb-n","Name",f.n,f.t==="species"?"For example: Tidekin":f.t==="feat"?"For example: Lantern Bearer":"For example: Gloves of the Tide");
 if(f.t==="species")h+=hbSel("hb-size","Size",f.size||"Medium",["Small","Medium"])+hbIn("hb-speed","Speed (feet)",f.speed||30,"","number")+hbSel("hb-dark","Darkvision",f.dark||0,[[0,"None"],[60,"60 feet"],[120,"120 feet"]])+hbTa("hb-traits","Traits, one per line as Name: what it does",f.traits,"Water Breathing: You can breathe air and water.");
 if(f.t==="feat")h+=hbSel("hb-cat","Category",f.cat||"G",[["O","Origin"],["G","General"],["F","Fighting Style"],["E","Epic Boon"]])+hbIn("hb-pre","Prerequisite (optional)",f.pre,"For example: Level 4+, Wis 13+")+'<div class="hbf"><span>Ability Score Increase: the player raises one of these by 1 (optional)</span><div class="hbab">'+ABK.map((k) =>{return '<label><input type="checkbox" data-hbab="'+k+'"'+((f.asi||[]).indexOf(k)>=0?" checked":"")+'> '+k+'</label>'}).join("")+'</div></div><label class="hbf hbck"><input type="checkbox" id="hb-rep"'+(f.rep?" checked":"")+'> Repeatable: can be taken more than once</label>'+hbTa("hb-d","What it does",f.d,"");
 if(f.t==="item")h+=hbSel("hb-type","Type",f.type||"Wondrous Item",["Wondrous Item","Ring","Rod","Staff","Wand","Potion","Scroll","Weapon","Armor"])+hbSel("hb-rar","Rarity",f.rar||"Uncommon",["Common","Uncommon","Rare","Very Rare","Legendary","Artifact"])+'<label class="hbf hbck"><input type="checkbox" id="hb-att"'+(f.att?" checked":"")+'> Requires attunement</label>'+hbTa("hb-d","What it does",f.d,"")+
  '<div class="hbf"><span>Bonus while worn or wielded (optional, counted on the sheet)</span><div class="hbnum">'+HB_FX.map((x) =>{const v=(f.fx||{})[x[0]]||0;return '<label><span>'+x[1]+'</span><select class="dd sm" data-hbfx="'+x[0]+'">'+[0,1,2,3].map((k) =>{return '<option value="'+k+'"'+(v===k?" selected":"")+'>'+(k?"+"+k:"None")+'</option>'}).join("")+'</select></label>'}).join("")+'</div></div>';
 h+='<div class="eqact"><button type="button" class="bdg add" data-hbsave="1">'+(HBE?"Save Changes":"Create")+'</button>'+(HBE?'<button type="button" class="link" data-hbcancel="1">Cancel</button>':'')+'</div></div>';
 const L=hbList(hbMine());if(L.length)h+='<p class="flab">Made by you ('+L.length+')</p><div class="hblist">'+L.map((e) =>{const k=esc(e[0]+"|"+e[1]);return '<div class="hbrow"><span><b>'+esc(e[1])+'</b><small>'+({species:"Species",feat:"Feat",item:"Magic Item"})[e[0]]+'</small></span><button type="button" class="link" data-hbedit="'+k+'">Edit</button><button type="button" class="rmv" data-hbdel="'+k+'">✕ Remove</button></div>'}).join("")+'</div>';
 const O=hbOthers();if(O.length)h+='<p class="flab">Homebrew of your other characters</p><div class="hblist">'+O.map((o) =>{return '<div class="hbrow"><span><b>'+esc(o.p.name)+'</b><small>'+esc(o.who)+': '+esc(hbCount(o.p))+'</small></span><button type="button" class="bdg add" data-hbcopy="'+esc(o.cid+"|"+o.p.id)+'">Add to this character</button></div>'}).join("")+'</div>';
 return h}
/* user packs (not built in) of the other characters in My Characters that have something this build does not */
function hbOthers(){let out=[],r=null;try{r=JSON.parse(__store.getItem("cs-roster-v1")||"null")}catch(e){r=null}if(!r||!r.chars)return out;const me=__R.sid();
 Object.keys(r.chars).forEach((id) =>{if(id===me||id===r.active)return;let b=null;try{b=JSON.parse(r.chars[id].B||"null")}catch(e){b=null}if(!b||!Array.isArray(b.packs))return;
  b.packs.forEach((p) =>{if(!p||!p.id||HB_BUILTIN[p.id])return;const mine=(B.packs||[]).filter((q) =>{return q.id===p.id})[0];if(hbList(p).some((e) =>{return !hbHas(mine,e[0],e[1])}))out.push({cid:id,who:r.chars[id].name||"Character",p:p})})});return out}
export function hbRead(){const g=function(id){const e=document.getElementById(id);return e?String(e.value||"").trim():""},f={t:HBF.t,n:g("hb-n").slice(0,60)};
 if(f.t==="species"){f.size=g("hb-size")||"Medium";f.speed=Math.max(0,Math.min(120,Math.round(+g("hb-speed")||30)));f.dark=+g("hb-dark")||0;f.traits=g("hb-traits")}
 if(f.t==="feat"){f.cat=g("hb-cat")||"G";f.pre=g("hb-pre");f.asi=[].slice.call(document.querySelectorAll("#bld [data-hbab]:checked")).map((x) =>{return x.getAttribute("data-hbab")});f.rep=!!(document.getElementById("hb-rep")||{}).checked;f.d=g("hb-d")}
 if(f.t==="item"){f.type=g("hb-type")||"Wondrous Item";f.rar=g("hb-rar")||"Uncommon";f.att=!!(document.getElementById("hb-att")||{}).checked;f.d=g("hb-d");f.fx={};[].slice.call(document.querySelectorAll("#bld [data-hbfx]")).forEach((s) =>{const v=+s.value;if(v)f.fx[s.getAttribute("data-hbfx")]=v})}
 return f}
function hbRemove(p,t,n){if(!p)return;if(t==="species")delete (p.species||{})[n];if(t==="feat")delete (p.feats||{})[n];if(t==="item")p.items=(p.items||[]).filter((x) =>{return x[0]!==n})}
export function hbSave(){let f=hbRead(),p=hbMine();HBF=f;
 if(!f.n){toast("Give it a name first.");__R.render();return}
 const taken=f.t==="species"?SPECIES[f.n]:f.t==="feat"?FEATS[f.n]:DMAP[f.n];if(taken&&f.n!==HBE&&!hbHas(p,f.t,f.n)){toast("That name is already used. Pick another name.");__R.render();return}
 if(f.t!=="species"&&!f.d){toast("Write what it does.");__R.render();return}
 if(!p){p={id:HB_ID,name:"My Homebrew",desc:"Species, feats, and magic items you made"};B.packs=(B.packs||[]).concat([p])}
 if(HBE&&HBE!==f.n){hbRemove(p,f.t,HBE);if(f.t==="species"&&B.species===HBE)B.species=f.n}
 if(f.t==="species"){p.species=p.species||{};p.species[f.n]={size:f.size,speed:f.speed,dark:f.dark,traits:String(f.traits||"").split(/\n+/).map((l) =>{const m=/^\s*([^:]{1,60}):\s*(.+)$/.exec(l);return m?[m[1].trim(),m[2].trim()]:l.trim()?["Trait",l.trim()]:null}).filter(Boolean)}}
 if(f.t==="feat"){p.feats=p.feats||{};const o={cat:f.cat,d:f.d};if(f.pre)o.pre=f.pre;if(f.asi.length)o.asi=f.asi;if(f.rep)o.rep=1;p.feats[f.n]=o}
 if(f.t==="item"){p.items=(p.items||[]).filter((x) =>{return x[0]!==f.n});const x=[f.n,f.type,f.rar,f.att?1:0,f.d||""];if(Object.keys(f.fx).length)x.push({fx:f.fx});p.items.push(x)}
 B.src=B.src||{core:true,dmg:true};B.src[HB_ID]=true;const was=HBE;HBE="";HBF={t:f.t};applyPacks();__R.commit();toast((was?"Saved ":"Created ")+f.n+". It is in My Homebrew"+(f.t==="species"?", in the Species step.":f.t==="feat"?", in the feat lists.":", in Equipment, Magic Items."))}
export function hbEdit(t,n){const p=hbMine();if(!hbHas(p,t,n))return;const f={t:t,n:n};
 if(t==="species"){const s=p.species[n];f.size=s.size;f.speed=s.speed;f.dark=s.dark;f.traits=(s.traits||[]).map((x) =>{return Array.isArray(x)?x[0]+": "+x[1]:String(x)}).join("\n")}
 if(t==="feat"){const o=p.feats[n];f.cat=o.cat;f.pre=o.pre||"";f.asi=o.asi||[];f.rep=!!o.rep;f.d=o.d||""}
 if(t==="item"){const x=p.items.filter((y) =>{return y[0]===n})[0];f.type=x[1];f.rar=x[2];f.att=!!x[3];f.d=x[4]||"";f.fx=(x[5]&&x[5].fx)||{}}
 HBF=f;HBE=n;__R.render();const e=document.getElementById("hb-n");if(e)e.scrollIntoView({block:"center"})}
export function hbDel(t,n){ask("Remove "+n+" from My Homebrew? A character that uses it falls back to a core choice the next time the builder opens.","Remove",() =>{const p=hbMine();hbRemove(p,t,n);if(p&&!hbList(p).length){B.packs=(B.packs||[]).filter((q) =>{return q.id!==HB_ID});delete (B.src||{})[HB_ID]}if(HBE===n){HBE="";HBF={t:t}}applyPacks();__R.commit();toast("Removed "+n+".")})}
export function hbCopy(cid,pid){const o=hbOthers().filter((x) =>{return x.cid===cid&&x.p.id===pid})[0];if(!o)return;let src=JSON.parse(JSON.stringify(o.p)),mine=(B.packs||[]).filter((q) =>{return q.id===pid})[0],n=0;
 if(!mine){B.packs=(B.packs||[]).concat([src]);n=hbList(src).length}
 else hbList(src).forEach((e) =>{if(hbHas(mine,e[0],e[1]))return;n++;if(e[0]==="species"){mine.species=mine.species||{};mine.species[e[1]]=src.species[e[1]]}if(e[0]==="feat"){mine.feats=mine.feats||{};mine.feats[e[1]]=src.feats[e[1]]}if(e[0]==="item"){mine.items=(mine.items||[]).concat(src.items.filter((x) =>{return x[0]===e[1]}))}});
 B.src=B.src||{core:true,dmg:true};B.src[pid]=true;applyPacks();__R.commit();toast("Added "+plural(n,"entry").replace("entrys","entries")+" from "+o.who+".")}

/* v27 RU65: Quick Build for new players. Pick a class and a species; the builder fills a level 1 character: Standard Array by class (PHB 2024 table),
   a background whose abilities fit the class (+2 and +1), class and background equipment (option A), skills, languages, Weapon Mastery, class options,
   and starting spells (QUICK in db4.js). Every pick can be changed afterwards in the steps */
export var qbCls="",qbSp="";
/* v99: races a 2014 build can use (the ones that carry ability score increases) */
function sp14List(){return Object.keys(SPECIES).filter((n) =>{const s=SPECIES[n];return s&&(s.asi||s.asiPick||s.asiFlex)})}
const QB_BG14={Barbarian:"Outlander (2014)",Bard:"Entertainer (2014)",Cleric:"Acolyte (2014)",Druid:"Hermit (2014)",Fighter:"Soldier (2014)",Monk:"Hermit (2014)",Paladin:"Noble (2014)",Ranger:"Outlander (2014)",Rogue:"Criminal (2014)",Sorcerer:"Sage (2014)",Warlock:"Charlatan (2014)",Wizard:"Sage (2014)",Artificer:"Guild Artisan (2014)"};
function qbCard(){const cl=Object.keys(CLASSES),sp=R14()?sp14List().sort():Object.keys(SPECIES).sort(),dsp=R14()?"Human (2014)":"Human";if(!SPECIES[qbSp])qbSp="";
 return '<div class="qb"><h2 class="ttl">Quick Build</h2><p class="fd bhint">Pick a class and a species. You get a level 1 character with every choice made, and you can change any of it.</p>'+
  '<div class="two"><label>Class<select class="dd" id="qbCls"><option value="">- Choose a class -</option>'+cl.map((c) =>{return '<option'+(qbCls===c?" selected":"")+'>'+esc(c)+'</option>'}).join("")+'</select></label>'+
  '<label>Species<select class="dd" id="qbSp">'+sp.map((s) =>{return '<option value="'+esc(s)+'"'+((qbSp||dsp)===s?" selected":"")+'>'+esc(R14()?s.replace(/ \(2014\)$/,""):s)+'</option>'}).join("")+'</select></label></div>'+
  '<div class="eqact"><button type="button" class="bdg add" data-qb="1">Quick Build</button></div></div>'}
function qbNames(L){return (L||[]).map((o) =>{return Array.isArray(o)?o[0]:(o&&typeof o==="object"?(o.n||o.name):o)}).filter(Boolean)}
function qbPick(c){const Q=QUICK[B.cls]||{},have=profSkills();
 const fill=function(pref,list,n,skip){const out=[];pref.concat(list).forEach((x) =>{if(out.length<n&&list.indexOf(x)>=0&&out.indexOf(x)<0&&(!skip||skip.indexOf(x)<0))out.push(x)});list.forEach((x) =>{if(out.length<n&&out.indexOf(x)<0)out.push(x)});return out};
 if(c.t==="skills"){const from=Array.isArray(c.from)?c.from:ALLSK;return fill(Q.sk||[],from,c.n,have)}
 if(c.t==="exp"){const ef=c.from||have;return fill(Q.exp||[],ef,c.n)}
 if(c.t==="lang"){let used=[];choices().forEach((o) =>{if(o.t==="lang"&&o.key!==c.key&&Array.isArray(B.ch[o.key]))used=used.concat(B.ch[o.key])});return fill(["Elvish","Dwarvish","Halfling","Giant","Gnomish","Draconic","Orc","Goblin"],qbNames(c.from),c.n,used.concat(["Common"]))}
 if(c.t==="wm"){const kitW=(B.inv||[]).map((x) =>{return baseOf(x.n).b}).filter((n) =>{return WEAPONS[n]&&!WEAPONS[n].xw&&!WEAPONS[n].nm}),okW=wmKeys().filter((n) =>{return B.cls!=="Barbarian"||WEAPONS[n].k==="M"});return fill((Q.wm||[]).concat(kitW),okW,c.n)}
 if(c.t==="multi"&&c.opt)return null;/* v32: optional choices stay empty */
 if(c.t==="multi"){const L=qbNames(c.list);return fill(/invocation$/.test(c.key)?(Q.inv||[]):[],L,c.n)}
 if(c.t==="opt"){const O=qbNames(OPTS[c.list]);return Q.opt&&O.indexOf(Q.opt[c.list])>=0?Q.opt[c.list]:(c.key==="spab"?({INT:"Intelligence",WIS:"Wisdom",CHA:"Charisma"}[CLASSES[B.cls].cast]||O[0]):O[0])||""}
 if(c.t==="tool"){let tl=[],had=[];(c.cats||[]).forEach((k) =>{tl=tl.concat(TOOLS[k]||[])});choices().forEach((o) =>{if(o.t==="tool"&&o.key!==c.key&&Array.isArray(B.ch[o.key]))had=had.concat(B.ch[o.key])});return fill([],tl,c.n,had)}/* v32 p22 */
 if(c.t==="fs"){var tk=[];choices().forEach((o) =>{if(o.t==="fs"&&o.key!==c.key&&B.ch[o.key])tk.push(B.ch[o.key])});const fl=R14()?fs14List(c.cls||B.cls):Object.keys(FEATS).filter((n) =>{return FEATS[n].cat==="F"});return [Q.fs,"Defense","Dueling","Great Weapon Fighting","Archery","Protection","Two-Weapon Fighting"].concat(fl).filter((n) =>{return n&&fl.indexOf(n)>=0&&tk.indexOf(n)<0})[0]||""}/* T11 N6: a second Fighting Style choice (Champion 7) no longer repeats the first */
 if(c.t==="lin")return ((SPECIES[B.species]||{}).lin||{opts:[]}).opts[0]||"";
 if(c.t==="ofeat"){var tk=allFeats().map((f) =>{return f.n});return ["Tough","Alert","Lucky","Healer","Musician"].filter((n) =>{return FEATS[n]&&tk.indexOf(n)<0})[0]||""}
 return null}
export function qbFill(){for(let pass=0;pass<80;pass++){var any=false;choices().some((c) =>{if(isDone(c))return false;const v=qbPick(c);if(v==null||v===""||(Array.isArray(v)&&!v.length))return false;B.ch[c.key]=v;any=true;return true});if(!any)break}}/* v35 p19: the list is read again after each pick, so a later level does not repeat an earlier pick */
export function qbSpells(){const I=spInfo();if(!I)return;const Q=QUICK[B.cls]||{},L=SPELLS.filter((x) =>{return I.lists.some((l) =>{return x[3].indexOf(l)>=0})&&x[1]<=I.max});B.sp=[];
 const nc=function(){return B.sp.filter((n) =>{return SMAP[n]&&!SMAP[n][1]}).length},np=function(){return B.sp.filter((n) =>{return SMAP[n]&&SMAP[n][1]}).length},auto=autoSpells().map((a) =>{return a.n});
 (Q.ct||[]).concat(L.filter((x) =>{return !x[1]}).map((x) =>{return x[0]})).forEach((n) =>{const x=SMAP[n];if(x&&!x[1]&&nc()<I.ct&&B.sp.indexOf(n)<0&&auto.indexOf(n)<0&&L.indexOf(x)>=0)B.sp.push(n)});
 (Q.sp||[]).concat(L.filter((x) =>{return x[1]===1}).map((x) =>{return x[0]})).forEach((n) =>{const x=SMAP[n];if(x&&x[1]&&np()<I.pr&&B.sp.indexOf(n)<0&&auto.indexOf(n)<0&&L.indexOf(x)>=0)B.sp.push(n)});
 /* T11 N6: when the level 1 spells run out (or the list is short), the rest come from higher levels in turn, so no prepared spell stays empty */
 const byL={};L.forEach((x) =>{if(x[1])(byL[x[1]]=byL[x[1]]||[]).push(x[0])});for(let g=0;g<400&&np()<I.pr;g++){let put=false;for(let lv=I.max;lv>=1&&np()<I.pr;lv--){const q=byL[lv]||[];while(q.length){const n=q.shift();if(B.sp.indexOf(n)<0&&auto.indexOf(n)<0){B.sp.push(n);put=true;break}}}if(!put)break}
 qbArc()}
/* T11 N6: Mystic Arcanum picks (Warlock 11, 13, 15, 17): the first Warlock spell of that level not already known */
function qbArc(){const wl=clsLv("Warlock");if(!wl)return;B.pk=B.pk||{};const mine=(B.sp||[]).concat(autoSpells().map((a) =>{return a.n}));[[11,6],[13,7],[15,8],[17,9]].forEach((r) =>{const k="ma"+r[1];if(wl<r[0]||B.pk[k])return;const x=SPELLS.filter((x) =>{return x[1]===r[1]&&x[3].indexOf("Warlock")>=0&&mine.indexOf(x[0])<0})[0];if(x)B.pk[k]=x[0]})}
/* Magic Initiate from the background (Acolyte, Guide, Sage): two cantrips and one level 1 spell of that list, not already chosen */
const QB_MI={Wizard:{c:["Prestidigitation","Minor Illusion","Ray of Frost","Light"],s:["Find Familiar","Sleep","Feather Fall"]},Cleric:{c:["Spare the Dying","Light","Resistance","Guidance"],s:["Shield of Faith","Sanctuary","Command"]},Druid:{c:["Druidcraft","Shillelagh","Guidance","Produce Flame"],s:["Goodberry","Speak with Animals","Healing Word"]}};
export function qbMI(){B.pk=B.pk||{};miFeats().forEach((m) =>{const v=B.pk[m.key];if(v&&v.c&&v.c.length>=2&&v.s&&v.s.length>=1)return;const L=SPELLS.filter((x) =>{return x[3].indexOf(m.cls)>=0&&x[1]<=1}),mine=(B.sp||[]).concat(autoSpells().map((a) =>{return a.n})),P=QB_MI[m.cls]||{c:[],s:[]};
 const pick=function(pref,lv,n){const out=[];pref.concat(L.filter((x) =>{return x[1]===lv}).map((x) =>{return x[0]})).forEach((nm) =>{const x=SMAP[nm];if(out.length<n&&x&&x[1]===lv&&x[3].indexOf(m.cls)>=0&&mine.indexOf(nm)<0&&out.indexOf(nm)<0)out.push(nm)});return out};
 let cast=CLASSES[B.cls].cast,cs=pick(P.c,0,2),ss=pick(P.s,1,1);
 /* T11 N6: a Cleric or Druid of high level can already know every level 1 spell of the list. Then Magic Initiate takes one of them again */
 if(!ss.length)ss=L.filter((x) =>{return x[1]===1}).map((x) =>{return x[0]}).slice(0,1);if(cs.length<2)L.filter((x) =>{return !x[1]&&cs.indexOf(x[0])<0}).forEach((x) =>{if(cs.length<2)cs.push(x[0])});
 B.pk[m.key]={c:cs,s:ss,ab:["INT","WIS","CHA"].indexOf(cast)>=0?cast:"WIS"}})}
/* v32 p22: a Wizard spellbook filled with level 1 Wizard spells (the Magic Initiate picks first) */
export function qbBook(){const need=bookNeed();if(!need)return;B.pk=B.pk||{};const bk=B.pk.book=B.pk.book||[];(QB_MI.Wizard.s.concat(SPELLS.filter((x) =>{return x[1]===1&&x[3].indexOf("Wizard")>=0}).map((x) =>{return x[0]}))).forEach((n) =>{if(bookOwn().length<need&&bookOwn().indexOf(n)<0)bk.push(n)});
 /* T11 N6: higher Wizard levels need more spells than there are level 1 Wizard spells, so the rest come from the levels the Wizard can cast, highest first */
 const mx=Math.min(9,Math.ceil(wizLv()/2));for(var lv=mx;lv>=2&&bookOwn().length<need;lv--)SPELLS.filter((x) =>{return x[1]===lv&&x[3].indexOf("Wizard")>=0}).forEach((x) =>{if(bookOwn().length<need&&bookOwn().indexOf(x[0])<0)bk.push(x[0])});
 if(!bk.length)delete B.pk.book}
export function quickBuild(cls,sp){const Q=QUICK[cls];if(!Q){toast("Choose a class first.");return}
 const go=function(){const keep={name:B.name,cid:B.cid,src:B.src,packs:B.packs,rs:B.rs};__set_B(NEWB());if(keep.rs==="2014")B.rs="2014";if(keep.name&&keep.name!=="New Hero")B.name=keep.name;if(keep.cid)B.cid=keep.cid;if(keep.src)B.src=keep.src;if(keep.packs)B.packs=keep.packs;applyPacks();
  B.cls=cls;B.sub="";B.level=1;B.mc=[];applyPacks();/* v99: the class is set, so a class that comes from a source (Artificer) loads before the kit is read */B.species=SPECIES[sp]?sp:(R14()?"Human (2014)":"Human");B.method="array";B.arr={};ABK.forEach((k,i) =>{B.base[k]=Q.arr[i];B.arr[k]=String(Q.arr[i])});
  if(R14()){B.bg=BACKGROUNDS[QB_BG14[cls]]?QB_BG14[cls]:"Acolyte (2014)";B.bgMode="111";B.bg2="";B.bg1=""}else{B.bg=BACKGROUNDS[Q.bg]?Q.bg:B.bg;B.bgMode="21";B.bg2=Q.b2;B.bg1=Q.b1}/* v99: a 2014 Quick Build uses a 2014 background, no ability score picks from it */B.eqC="A";B.eqB="A";B.ch={};delete B.unset;rebuildKit(1);qbFill();qbSpells();qbMI();qbBook();save();go2()};
 var go2=function(){__set_step("next");__set_pickCls(false);__set_pickSp(false);__R.render();window.scrollTo(0,0);const RI=ruleIssues();toast("Quick Build ready: "+B.species.replace(/ \(2014\)$/,"")+" "+cls+" 1."+(RI.length?" Still to check: "+issueText(RI.slice(0,2))+".":" Check What's Next, then Apply."))};
 if(!un("cls")&&B.cls)ask("Replace this build with a Quick Build of a "+(SPECIES[sp]?sp.replace(/ \(2014\)$/,""):"Human")+" "+cls+"? The name stays. The choices, spells, and equipment of the build are replaced. Nothing changes on the sheet until you Apply.","Quick Build",go);else go()}

/* v27 i2: choose how AC is set when no armor is worn. Shown when two rules can set it, or when one was chosen before */
function acModeCard(){try{toSheet()}catch(e){}const real=(ACM||[]).filter((x) =>{return x.k!=="none"});if(real.length<2&&!B.acMode)return "";if(!ACM.length)return "";const cur=B.acMode||"",best=ACM.reduce((m,x) =>{return x.v>m.v?x:m},ACM[0]);
 return '<div class="acm"><h3 class="eqh">Armor Class without Armor</h3><p class="fd bhint">Several rules set your AC without armor. Pick one, or Automatic (main class first).</p><div class="radios">'+
  [["","Automatic: "+ACM[0].n+", AC "+ACM[0].v]].concat(ACM.map((x) =>{return [x.k,x.n+", AC "+x.v]})).map((o) =>{return '<button type="button" class="rad'+(cur===o[0]?" on":"")+'" data-acm="'+o[0]+'"><b>'+esc(o[1])+'</b>'+(o[0]&&o[0]===best.k&&best.v>ACM[0].v?'<span>Highest</span>':'')+'</button>'}).join("")+'</div><p class="fd bhint">A shield and magic items add to these. Worn armor replaces them.</p></div>'}
/* v32 RU134: item of B.inv by name and occurrence (occ 0 = first), then by alias. -1: none */
export function invFind(name,occ){let n=+occ||0,f=-1;for(let i=0;i<B.inv.length;i++)if(B.inv[i].n===name){if(f<0)f=i;if(n--===0)return i}if(f>=0)return f;return B.inv.findIndex((x) =>{return x.alias===name})}
/* a container leaves: its items move out (no other container has its name) */
export function ctFree(c){if(!c||!bCt(c.n)||B.inv.some((y) =>{return y!==c&&y.n===c.n}))return;B.inv.forEach((y) =>{if(y.in===c.n)delete y.in})}
/* a pack row opens into its container and items, in its place. Returns the number of new rows, 0 when it is not a pack or its Qty is 0 */
export function unpackAt(i){const x=B.inv[i],pn=x&&(PACKS[x.n]?x.n:x.alias&&PACKS[x.alias]?x.alias:"");if(!pn||qOf(x)<1)return 0;let out=[];for(let k=0;k<qOf(x);k++)out=out.concat(packOut(pn,B.inv.concat(out)));
 out.forEach((y) =>{if(x.kit)y.kit=1;if(x.src)y.src=x.src;if(!y.in&&x.in)y.in=x.in});B.inv.splice.apply(B.inv,[i,1].concat(out));return out.length}
/* Current Inventory order: an item inside a container comes right after it, one step in */
function bInvOrder(L){const out=[],seen={},top=function(y){return !y.in||!L.some((c) =>{return c!==y&&c.n===y.in&&bCt(c.n)})},
  kids=function(c,d){L.forEach((y,j) =>{if(!seen[j]&&y!==c&&y.in===c.n){seen[j]=1;out.push([y,j,d]);if(bCt(y.n)&&d<4)kids(y,d+1)}})};
 L.forEach((x,i) =>{if(seen[i]||!top(x))return;seen[i]=1;out.push([x,i,0]);if(bCt(x.n))kids(x,1)});L.forEach((x,i) =>{if(!seen[i]){seen[i]=1;out.push([x,i,0])}});return out}
export function bInN(c){return (B.inv||[]).filter((y) =>{return y!==c&&y.in===c.n}).length}
/* v27 RU46: put an item in a container here, as Move does on the sheet */
export function bCt(n){const b=String(n||"").replace(/ \(.*\)$/,"");return (typeof CONTAINERS!=="undefined"?CONTAINERS:[]).some((c) =>{return c[0]===n||c[0]===b})}
function binIn(x,i){const cs=(B.inv||[]).filter((y,k) =>{return k!==i&&bCt(y.n)&&y.in!==x.n});if(!cs.length&&!x.in)return "";return '<label class="binin">In <select class="dd sm" data-iin="'+i+'" aria-label="Container for '+esc(x.n)+'"><option value="">Not in a container</option>'+cs.map((y) =>{return '<option value="'+esc(y.n)+'"'+(x.in===y.n?" selected":"")+'>'+esc(y.n)+'</option>'}).join("")+'</select></label>'}

export function __set_HBF(v){ return HBF=v; }
export function __set_HBE(v){ return HBE=v; }
export function __set_qbCls(v){ return qbCls=v; }
export function __set_qbSp(v){ return qbSp=v; }
