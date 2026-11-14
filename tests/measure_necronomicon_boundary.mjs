import assert from 'node:assert/strict';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
const root=new URL('../',import.meta.url),source=execFileSync('python',['-c',"import importlib.util;s=importlib.util.spec_from_file_location('measure','tests/zero_miss_measure.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);print(m.JS_LIB)"],{cwd:root,encoding:'utf8'});
let C;const window={__bldFuzz:o=>({b:{...o,ch:{}}}),__bldSheetFor:()=>C},context=vm.createContext({window,structuredClone,Set,Reflect,Number,Object,Array,JSON});vm.runInContext('('+source+')()',context);window.__zm.base('fixture',{});
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++},extract=()=>JSON.parse(JSON.stringify(window.__zm.run([{key:'fixture',lv:C.level}])[0]));
const reading={v:1,reading:{source:'Necronomicon',hoursVerified:19,INT:{mode:'fixed-delta',before:18,delta:2,baseAnchor:null},WIS:{mode:'fixed-delta',before:12,delta:-2,baseAnchor:null},warp:{result:null,cured:false},madness:{result:null,cured:false}}};
for(const rs of ['2014','2024']){
 const reset=()=>{C={cls:'Wizard',rs,level:17,attacks:[],spells:[],res:[],inv:[]}};reset();const original=extract();
 for(const state of [reading,{v:1,reading:null},{v:99,reading:{opaque:'preserve',INT:99,WIS:99,damage:'99d20',attack:99,dc:99}},null]){reset();C.necronomiconReading=structuredClone(state);eq(extract(),original)}
 for(const item of ['Necronomicon','Necronomicon Ex Corvis']){reset();C.inv=[{n:item,q:1,attunedActive:true,necronomiconReading:structuredClone(reading)}];eq(extract(),original)}
 reset();C.necronomiconSocialSource={v:1,source:'Necronomicon',ability:'CHA',skill:'Persuasion',targetType:'aberration',advantage:true,modifier:99};eq(extract(),original);
 reset();C.necronomiconReadingSources={v:1,source:'Necronomicon',INT:2,WIS:-2,advOn:['Charisma checks'],sourceAvailable:true};eq(extract(),original);
}
console.log(checks+' Necronomicon reading/future/social metadata cannot supply actor measurement evidence checks PASS');
