import {lateGet,pk} from "./01b-logic-late-ports.js";
import {MAGIC_SUM} from "./02-data-magic-item-summaries.js";
import {DMAP,dmapAlias} from "./03-logic-magic-item-effects.js";
import {B} from "./04-logic-storage.js";
import {SP14} from "./07-data-2014-spells.js";
import {genv} from "./00-env.js";
/*SP14FN*/
/* v92: the 2014 version of every spell the app has (rows, full text, damage and area numbers, book page) laid over the base rows. SP14 holds the data. 2024-only spells leave the list. sp14Set(false) puts everything back */
let SP14S=null;
function sp14Cmp(a,b){return a[1]-b[1]||(a[0]<b[0]?-1:a[0]>b[0]?1:0)}
/* sp14Set steps (SOLID s16): put the 2024 spells back, lay the 2014 rows over them (one row n at a time) */function sp14Undo(){SP14S.rows.forEach((o) =>{for(let i=0;i<12;i++)o.x[i]=o.o[i]});
  Object.keys(SP14S.full).forEach((n) =>{if(SP14S.full[n]===undefined)delete SPELL_FULL[n];else SPELL_FULL[n]=SP14S.full[n]});
  Object.keys(SP14S.fx).forEach((n) =>{if(SP14S.fx[n]===undefined)delete SPELL_FX[n];else SPELL_FX[n]=SP14S.fx[n]});
  if(typeof BOOKPG!=="undefined"&&BOOKPG.phb&&BOOKPG.phb.spell)Object.keys(SP14S.pg).forEach((n) =>{if(SP14S.pg[n]===undefined)delete BOOKPG.phb.spell[n];else BOOKPG.phb.spell[n]=SP14S.pg[n]});
  SP14S.hid.forEach((x) =>{if(SPELLS.indexOf(x)<0){SPELLS.push(x);lateGet("SMAP")[x[0]]=x}});SP14S=null;SPELLS.sort(sp14Cmp)}function sp14Ov(n,S,tce,keepL,hasPg){const x=lateGet("SMAP")[n];if(!x)return;const r=SP14.ov[n];S.rows.push({x:x,o:x.slice(0,12)});
  for(let i=1;i<12;i++)x[i]=r[i];
  const cl=r[3].slice();(SP14.cx[n]||[]).forEach((q) =>{if(tce&&B.src&&B.src[q[1]]&&cl.indexOf(q[0])<0)cl.push(q[0])});cl.sort();(S.rows[S.rows.length-1].o[3]||[]).forEach((l) =>{if(keepL(l)&&cl.indexOf(l)<0)cl.push(l)});x[3]=cl;
  S.full[n]=SPELL_FULL[n];SPELL_FULL[n]=SP14.full[n];
  S.fx[n]=SPELL_FX[n];const f=SP14.fx[n];if(f&&Object.keys(f).length)SPELL_FX[n]=f;else delete SPELL_FX[n];
  if(hasPg){S.pg[n]=BOOKPG.phb.spell[n];if(SP14.pg[n])BOOKPG.phb.spell[n]=SP14.pg[n];else delete BOOKPG.phb.spell[n]}}function sp14Do(tce){const S={rows:[],full:{},fx:{},pg:{},hid:[]},keepL=function(l){return /^(Mark of |Aberrant Dragonmark)/.test(l)};SP14S=S;
 const hasPg=typeof BOOKPG!=="undefined"&&BOOKPG.phb&&BOOKPG.phb.spell;
 Object.keys(SP14.ov).forEach((n) =>{sp14Ov(n,S,tce,keepL,hasPg)});
 SP14.hide.forEach((n) =>{const x=lateGet("SMAP")[n],i=x?SPELLS.indexOf(x):-1;if(i>=0){SPELLS.splice(i,1);delete lateGet("SMAP")[n];S.hid.push(x)}});
 SPELLS.sort(sp14Cmp)}export function sp14Set(on,tce){if(typeof SP14==="undefined"||typeof lateGet("SMAP")==="undefined")return;
 if(SP14S)sp14Undo();
 if(!on)return;sp14Do(tce)}
/* v93: 2014 equipment. eq14Set lays the 2014 weapons (no Weapon Mastery, Lance, Trident, Warhammer, War Pick, Net), equipment packs and armor words over the base tables. dm14Set swaps the 2024 Dungeon Master's Guide items for the 2014 ones (DM14.ov), and leaves out the 2024-only ones (DM14.hide) unless the character owns them. Both put everything back when off */
function eqGear(n){return GEAR.filter((g) =>{return g[0]===n})[0]||null}
export var EQ14S=null,EQ14SH=null,DM14ON=false,DM14S=null,DM14M=null;
/* eq14Set steps (SOLID s16): put the 2024 equipment back from the saved copy S, lay the 2014 equipment over it */function eq14Undo(S){Object.keys(S.w).forEach((k) =>{const o=WEAPONS[k];if(S.w[k]===null){delete WEAPONS[k];return}if(o){Object.keys(o).forEach((q) =>{delete o[q]});Object.assign(o,S.w[k])}});
  Object.keys(S.pr).forEach((k) =>{if(S.pr[k]===undefined)delete PRICE[k];else PRICE[k]=S.pr[k]});
  Object.keys(S.pk).forEach((k) =>{PACKS[k]=S.pk[k]});
  Object.keys(S.id).forEach((k) =>{if(S.id[k]===undefined)delete ITEMDESC[k];else ITEMDESC[k]=S.id[k]});
  Object.keys(S.gc).forEach((k) =>{const g=eqGear(k);if(g){g[1]=S.gc[k][0];g[2]=S.gc[k][1]}});
  S.ga.forEach((g) =>{const i=GEAR.indexOf(g);if(i>=0)GEAR.splice(i,1)});
  var GL=genv.__GLOSS||{};Object.keys(S.gl).forEach((k) =>{if(S.gl[k]===null)delete GL[k];else if(GL[k]){GL[k].d=S.gl[k];if(S.gs&&S.gs[k]!=null)GL[k].s=S.gs[k]}});
  ARMOR_GEN=S.ag;EQ14SH=null;EQ14S=null}function eq14Do(){const T={w:{},pr:{},pk:{},id:{},gc:{},ga:[],gl:{},gs:{},ag:ARMOR_GEN};EQ14S=T;
 const cp=function(o){return structuredClone(o)};
 Object.keys(WEAPONS).forEach((k) =>{const o=WEAPONS[k];if(o.m!==undefined||EQ14D.w[k]){T.w[k]=cp(o);delete o.m}});
 Object.keys(EQ14D.w).forEach((k) =>{const o=WEAPONS[k];if(o)Object.assign(o,EQ14D.w[k])});
 if(!WEAPONS.Net){T.w.Net=null;WEAPONS.Net=Object.assign({},EQ14D.net);T.pr.Net=PRICE.Net;PRICE.Net=EQ14D.pr.Net}
 Object.keys(EQ14D.packs).forEach((n) =>{const q=EQ14D.packs[n];T.pk[n]=PACKS[n];PACKS[n]=[q[0],q[1]];T.id[n]=ITEMDESC[n];
  ITEMDESC[n]="Comes as a "+q[0].toLowerCase()+" with: "+q[1].map((x) =>{return (x[1]>1?x[1]+" × ":"")+x[0]}).join(", ")+". Added to your inventory, it opens into the "+q[0].toLowerCase()+" and its items, each with its own quantity and weight.";
  const g=eqGear(n);if(g){T.gc[n]=[g[1],g[2]];g[1]=q[2];g[2]=q[3]}});
 EQ14D.gear.forEach((r) =>{if(!eqGear(r[0])){const g=r.slice();GEAR.push(g);T.ga.push(g)}});
 var GL=genv.__GLOSS||{};Object.keys(EQ14D.gloss).forEach((k) =>{if(GL[k]){T.gl[k]=GL[k].d;T.gs[k]=GL[k].s;GL[k].d=EQ14D.gloss[k];GL[k].s=String(GL[k].s||"").replace("PHB-2024","PHB-2014")}else if(GL.Heavy){T.gl[k]=null;GL[k]={c:"Weapon property",s:String(GL.Heavy.s||"").replace("PHB-2024","PHB-2014"),d:EQ14D.gloss[k]}}});
 ARMOR_GEN=EQ14D.armorGen;EQ14SH=EQ14D.shield}export function eq14Set(on,force){if(typeof EQ14D==="undefined"||typeof WEAPONS==="undefined"||typeof PACKS==="undefined"||typeof GEAR==="undefined")return;
 const S=EQ14S;if(S&&!force&&on)return;
 if(S)eq14Undo(S);
 if(!on)return;eq14Do()}
/* dm14Set steps (SOLID s16): put the 2024 magic items back, lay the 2014 items over them */function dm14Undo(){DMGI.length=0;DM14S.forEach((x) =>{DMGI.push(x)});Object.keys(DMAP).forEach((k) =>{delete DMAP[k]});DMGI.forEach((x) =>{DMAP[x[0]]=x});dmapAlias();
  if(DM14M&&typeof MAGIC_SUM!=="undefined")Object.keys(DM14M).forEach((k) =>{MAGIC_SUM[k]=DM14M[k]})}function dm14Do(){const own={};((typeof B!=="undefined"&&B&&B.inv)||[]).concat((typeof C!=="undefined"&&C&&C.inv)||[]).forEach((x) =>{if(x&&x.n)own[x.n]=1});
 DM14S=DMGI.slice();const out=[],seen={};
 DMGI.forEach((x) =>{const n=x[0];if(DM14.hide[n]&&!own[n])return;const o=DM14.ov[n];seen[n]=1;out.push(o||x)});
 Object.keys(DM14.ov).forEach((n) =>{if(!seen[n])out.push(DM14.ov[n])});
 DMGI.length=0;out.forEach((x) =>{DMGI.push(x)});Object.keys(DMAP).forEach((k) =>{delete DMAP[k]});DMGI.forEach((x) =>{DMAP[x[0]]=x});dmapAlias();
 if(typeof MAGIC_SUM!=="undefined"){DM14M={};Object.keys(DM14.ov).forEach((n) =>{if(MAGIC_SUM[n]!==undefined){DM14M[n]=MAGIC_SUM[n];delete MAGIC_SUM[n]}})}}export function dm14Set(on,force){if(typeof DM14==="undefined"||typeof DMGI==="undefined"||typeof DMAP==="undefined")return;
 if(!force&&on===DM14ON)return;
 if(DM14ON&&DM14S)dm14Undo();
 DM14ON=false;DM14S=null;DM14M=null;
 if(!on)return;dm14Do();
 DM14ON=true}
genv.__sp14Set=function(on){sp14Set(on,false);eq14Set(on);dm14Set(on);genv.__gl14&&genv.__gl14(on)};
export function __set_DM14ON(v){ return DM14ON=v; }
export function __set_DM14S(v){ return DM14S=v; }
export function __set_DM14M(v){ return DM14M=v; }
