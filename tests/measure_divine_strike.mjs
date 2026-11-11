import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync,spawnSync} from 'node:child_process';
const root=new URL('../',import.meta.url),source=execFileSync('python',['-c',"import importlib.util;s=importlib.util.spec_from_file_location('measure','tests/zero_miss_measure.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);print(m.JS_LIB)"],{cwd:root,encoding:'utf8'});
let C;const window={__bldFuzz:o=>({b:{...o,ch:{}}}),__bldSheetFor:()=>C};const context=vm.createContext({window,structuredClone,Set,Reflect,Number,Object,Array,JSON});vm.runInContext('('+source+')()',context);window.__zm.base('fixture',{});
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++},ok=x=>{assert.ok(x);count++};
function descriptor(level=14){return {rule:{v:1,key:'divine-strike',source:'Life Domain (2014)',feature:'Divine Strike',turn:'any',dice:level>=14?'2d8':'1d8',creatureOnly:true,types:['Radiant']},source:{kind:'sub',owner:'Life Domain (2014)',classKey:'Cleric',level,pre:'',edition:'2014'}}}
function rows(){return JSON.parse(JSON.stringify(window.__zm.run([{key:'fixture',lv:C.level}])[0]))}
function setup(level=14){C={cls:'Cleric',level,rs:'2014',attacks:[],spells:[],divineStrike:descriptor(level)}}
setup();const canonical=rows().filter(r=>r[0]==='strike');eq(canonical.length,1);eq(canonical[0][2],'Divine Strike | Life Domain (2014)');ok(!canonical[0][3].includes('14'));C.level=15;C.divineStrike=descriptor(15);eq(rows().filter(r=>r[0]==='strike'),canonical);
setup(13);const before=rows().filter(r=>r[0]==='strike');setup(14);ok(JSON.stringify(rows().filter(r=>r[0]==='strike'))!==JSON.stringify(before));
for(const change of [d=>{d.rule.v=2},d=>{d.source.owner='Unrelated'},d=>{d.rule.types=['Fire']},d=>{d.source.level=21},d=>{d.source.extra=true},d=>{d.rule.dice='9d8'}]){setup();change(C.divineStrike);eq(rows().filter(r=>r[0]==='strike').length,0)}
setup();C.rs='2024';eq(rows().filter(r=>r[0]==='strike').length,0);setup();C.level=13;eq(rows().filter(r=>r[0]==='strike').length,0);
function advisory(level,dice='1d8',type='Radiant'){const label='Divine Strike (Life Domain (2014) '+level+')';return {n:'Longsword',die:'1d8',dieSrc:'Longsword',note:'Extra damage: +'+dice+' '+type+' ('+label+').',xdice:[{d:dice,t:type,s:label}]}}
setup(17);delete C.divineStrike;C.attacks=[advisory(17)];const a=rows().find(r=>r[0]==='att');C.level=16;C.attacks=[advisory(16)];const z=rows().find(r=>r[0]==='att');ok(a[3]!==z[3]);eq(a[4],z[4]);
C.attacks=[advisory(16,'2d8')];ok(rows().find(r=>r[0]==='att')[4]!==z[4]);C.attacks=[advisory(16,'1d8','Fire')];ok(rows().find(r=>r[0]==='att')[4]!==z[4]);
setup();C.rs='2024';C.divineStrike={rule:{v:1,key:'divine-strike',source:'Cleric',feature:'Blessed Strikes',turn:'own',dice:'2d8',creatureOnly:true,types:['Necrotic','Radiant']},source:{kind:'cls',owner:'Cleric',classKey:'Cleric',level:14,pre:'',edition:'2024'}};ok(rows().find(r=>r[0]==='strike')[2].includes('Improved Blessed Strikes'));
for(const edition of [null,'','2025',1]){C.rs=edition;eq(rows().filter(r=>r[0]==='strike').length,0)}delete C.rs;eq(rows().filter(r=>r[0]==='strike').length,1);
const eligibility=JSON.parse(execFileSync('python',['-c',"import importlib.util,json;s=importlib.util.spec_from_file_location('m','tests/zero_miss_measure.py');m=importlib.util.module_from_spec(s);s.loader.exec_module(m);print(json.dumps([m.delta_eligible(('c','','',{'DICE'},k),'DICE') for k in ['strike|Blessed','att|Longsword']]))"],{cwd:root,encoding:'utf8'}));eq(eligibility,[false,true]);
const baseline=fs.readFileSync(new URL('zero_miss_baseline.json',import.meta.url));for(const flags of [[],['--force']]){const result=spawnSync('python',['tests/zero_miss_measure.py','--reference','missing-reference.json','--update-baseline',...flags],{cwd:root,encoding:'utf8'});ok(result.status!==0);ok((result.stdout+result.stderr).includes('--reference cannot be combined'));eq(fs.readFileSync(new URL('zero_miss_baseline.json',import.meta.url)),baseline)}
console.log(count+' strict Divine Strike measurement provenance checks PASS');
