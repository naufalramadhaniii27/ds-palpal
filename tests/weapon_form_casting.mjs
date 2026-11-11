import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {weaponFormMetadata,weaponFormUsable} from '../src/data/lib/weapon-form.js';
const source=fs.readFileSync(new URL('../src/app/32b-logic-play-concentration-casting.js',import.meta.url),'utf8').replace(/^import .*$/gm,'').replace(/export (function|var|const) /g,'$1 ');
let marks=0,saves=0;
const ctx={C:{name:'Hero',rs:'2024',inventoryFormV:1,spellcasting:{}},S:{used:{}},D:{res:[]},env:{},weaponFormMetadata,weaponFormUsable,
 bindLive(){},document:{addEventListener(){}},attActive:it=>it.attuned===true,eqOn:it=>it.eq===true,num:(v,d)=>Number.isFinite(+v)&&v!=null?+v:d,
 occOf:it=>it.occ||0,used:(k,max)=>Math.min(max,ctx.S.used[k]||0),modeOn:()=>false,undoMark(){marks++},save(){saves++},
 lateGet:()=>({}),syncLU(){},renderSpells(){},renderConds(){},refreshEntry(){},toastU(){},toast(){},cmbCast(){},cmbRe(){}};
vm.createContext(ctx);vm.runInContext(source,ctx);
for(const [item,spell] of [['Dawnbringer','Lesser Restoration'],['Duskcrusher','Sunbeam']]){
 const x={n:spell,l:2,itc:{it:item,c:1,lv:2}};
 const it={n:item,key:item,eq:true,q:1,attuned:true,form:{v:1,active:true,radius:15},chargeKey:'item-pool',occ:2};
 ctx.C.inv=[it];ctx.C.spells=[x];ctx.D.res=[{item:true,f:item,k:'item-pool',max:1,invIndex:0}];ctx.S.used={};delete ctx.env.__bldFormInfo;
 assert.equal(ctx.spCastOpts(x).length,1);
 it.form.active=false;assert.equal(ctx.spCastOpts(x).length,0);const before=marks;ctx.castDo(0,'item-pool',2);assert.equal(marks,before);assert.equal(ctx.S.used['item-pool'],undefined);
 it.form.active=true;
 for(const [field,value] of [['eq',false],['attuned',false],['q',0]]){const prev=it[field];it[field]=value;assert.equal(ctx.spCastOpts(x).length,0);ctx.castDo(0,'item-pool',2);assert.equal(marks,before);it[field]=prev;}
 ctx.C.inventoryFormV=99;assert.equal(ctx.spCastOpts(x).length,0);ctx.C.inventoryFormV=1;
 ctx.env.__bldFormInfo=(name,owner,occ)=>{assert.equal(name,item);assert.equal(owner,'Hero');assert.equal(occ,2);return {formUsable:false}};
 assert.equal(ctx.spCastOpts(x).length,0);ctx.castDo(0,'item-pool',2);assert.equal(marks,before);
 delete it.key;ctx.env.__bldFormInfo=()=>{throw new Error('manual sheet must not consult unrelated same-owner builder')};assert.equal(ctx.spCastOpts(x).length,1);it.key=item;
 ctx.env.__bldFormInfo=()=>({formUsable:true});assert.equal(ctx.spCastOpts(x).length,1);
 ctx.castDo(0,'rit',2);assert.equal(marks,before);ctx.castDo(0,'item-pool|2',2);assert.equal(marks,before);
 ctx.castDo(0,'item-pool',2);assert.equal(marks,before+1);assert.equal(ctx.S.used['item-pool'],1);
 it.form.active=false;ctx.spCastOpts(x);assert.equal(ctx.S.used['item-pool'],1);assert.equal(ctx.C.spells.length,1);
}
for(const [item,spell] of [['Dawnbringer','Lesser Restoration'],['Duskcrusher','Sunbeam']]){
 const x={n:spell,l:2,itc:{it:item,c:1,lv:2}};
 const copies=[0,1].map(i=>({n:item,key:item,eq:true,q:1,attuned:true,form:{v:1,active:i===1,radius:15},chargeKey:'copy-'+i,occ:i}));
 ctx.C.inv=copies;ctx.C.spells=[x];ctx.D.res=copies.map((it,i)=>({item:true,f:item,k:it.chargeKey,max:1,invIndex:i}));ctx.S.used={};
 ctx.env.__bldFormInfo=(name,owner,occ)=>({formUsable:copies[occ].form.active});
 assert.equal(ctx.spCastOpts(x).length,1);assert.equal(ctx.spCastOpts(x)[0].k,'copy-1');
 let before=marks;ctx.castDo(0,'copy-0',2);assert.equal(marks,before);ctx.castDo(0,'copy-1',2);assert.equal(ctx.S.used['copy-1'],1);assert.equal(ctx.S.used['copy-0'],undefined);
 copies[0].form.active=true;ctx.S.used={'copy-0':1};assert.equal(ctx.spCastOpts(x).length,2);assert.equal(ctx.spCastOpts(x).find(q=>q.k==='copy-0').left,0);assert.equal(ctx.spCastOpts(x).find(q=>q.k==='copy-1').left,1);
 before=marks;ctx.castDo(0,'copy-0',2);assert.equal(marks,before);copies[1].form.active=false;ctx.castDo(0,'copy-1',2);assert.equal(marks,before);assert.equal(ctx.S.used['copy-1'],undefined);
 copies[0].form.active=false;copies[1].form.active=true;ctx.S.used={};ctx.spCastOpts(x);copies[0].form.active=true;copies[1].form.active=false;
 before=marks;ctx.castDo(0,'copy-1',2);assert.equal(marks,before);ctx.castDo(0,'copy-0',2);assert.equal(ctx.S.used['copy-0'],1);assert.equal(ctx.S.used['copy-1'],undefined);
}
const ordinaryItem={n:'Light',l:1,itc:{it:'Other Wand',c:1,lv:1}};ctx.D.res=[0,1].map(i=>({item:true,f:'Other Wand',k:'wand-'+i,max:1}));assert.equal(ctx.spCastOpts(ordinaryItem).length,1);assert.equal(ctx.spCastOpts(ordinaryItem)[0].k,'wand-0');
const ordinary={n:'Lesser Restoration',l:2};ctx.C.spells=[ordinary];ctx.D.res=[{k:'s2',max:1}];ctx.S.used={};assert.equal(ctx.spCastOpts(ordinary).length,1);ctx.castDo(0,'s2',2);assert.equal(ctx.S.used.s2,1);
assert.ok(saves>0);console.log('weapon form casting: options, stale commits, eligibility, backend identity and counters passed');
