import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const file=new URL('../src/app/26-ui-customize.js',import.meta.url),read=s=>s.replace(/^import .*$/gm,'').replace(/export (function|var|const) /g,'$1 ');
const current=fs.readFileSync(file,'utf8'),prior=current.replace('|ab-(?:STR|DEX|CON|INT|WIS|CHA)','');
let fields=[],saves=0,renders=0,undos=0;
function context(){const ctx={C:{attacks:[{n:'Longsword'}],spells:[{n:'Shield'}],inv:[{n:'Rope',key:'Rope'}],skills:[{n:'Athletics'}]},S:{},B:{'ab-STR':{t:'Strength score'},ac:{t:'Armor Class'}},navStack:[],bindLive(){},invKey:it=>it.key||it.n,esc:String,part:(l,v,note)=>({l,v,note}),sg:String,lateGet:()=>({}),$$:()=>fields,undoMark(){undos++},save(){saves++},renderAll(){renders++},toastU(){},closeSheet(){}};vm.createContext(ctx);return ctx}
const ctx=context(),base=context();vm.runInContext(read(current),ctx);vm.runInContext(read(prior),base);let checks=0;
const eq=(a,b)=>{assert.deepEqual(a,b);checks++},plain=x=>JSON.parse(JSON.stringify(x));
for(const ab of ['STR','DEX','CON','INT','WIS','CHA']){
 eq(plain(ctx.cuOf('bd','ab-'+ab)),{k:'n:ab-'+ab,n:ab==='STR'?'Strength score':'ab-'+ab,kind:'n'});
 eq(base.cuOf('bd','ab-'+ab),null);
 const decorated=ctx.cuDecor('bd:ab-'+ab,{t:ab,h:'<p>Real ability breakdown</p>'});assert.match(decorated.h,new RegExp('data-cust="n:ab-'+ab+'"'));checks++;
 const form=ctx.cuHTML('n:ab-'+ab,ab);assert.match(form,/data-cuf="o" type="number"/);assert.match(form,/data-cuf="b" type="number"/);checks+=2;
}
for(const key of ['ab-XYZ','ab-str','ab-Strength','ab-STR-extra','ab-','ab-CHA ', 'age','height','weight'])eq(ctx.cuOf('bd',key),null);
for(const [type,key] of [['bd','ac'],['bd','init'],['bd','speed'],['bd','save-STR'],['bd','save-XYZ'],['bd','pas-per'],['bd','pas-ins'],['bd','pas-inv'],['bd','sk-0'],['bd','ah-0'],['bd','ad-0'],['w','0'],['ah','0'],['ad','0'],['sp','0'],['it','0'],['w','9'],['unknown','0']])eq(plain(ctx.cuOf(type,key)),plain(base.cuOf(type,key)));
// The new entry point uses the existing numeric save/override format and feedback.
fields=[['o','17'],['b','5'],['note','Native Customize workflow']].map(([key,value])=>({getAttribute:()=>key,value,type:key==='note'?'textarea':'number'}));
ctx.cuSave('n:ab-STR',false);eq(plain(ctx.S.cust),{'n:ab-STR':{o:17,b:5,note:'Native Customize workflow'}});eq(ctx.cuApply('ab-STR',[],16),17);eq([saves,renders,undos],[1,1,1]);
ctx.cuSave('n:ab-STR',true);eq(ctx.S.cust,undefined);eq([saves,renders,undos],[2,2,2]);
console.log(checks+' real ability Customize controls / exact keys / existing routes / save-reset checks passed');
