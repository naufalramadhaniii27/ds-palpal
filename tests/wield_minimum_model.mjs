import assert from 'node:assert/strict';
import {wieldMinimumProblems as problems,nativeWieldMinimum as native,evaluateWieldMinimum as evaluate,explainWieldMinimum as explain,weaponRowAllowed as allowed,applyWieldScoreCustomization as customize} from '../src/data/lib/wield-minimum.js';
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++};
const rule=native("Forgemaster's Might");
for(let str=1;str<=30;str++)eq(allowed("Forgemaster's Might",{STR:str}),str>=17);
for(const bad of [undefined,null,{},[],{STR:'17'},{STR:NaN},{STR:Infinity},{CHA:20}])eq(evaluate(rule,bad).allowed,false);
for(const bad of [undefined,{},[],{abilityMin:{}},{abilityMin:{str:17}},{abilityMin:{STR:0}},{abilityMin:{STR:17.1}},{abilityMin:{STR:17},extra:true}])eq(problems(bad).length>0,true);
eq(evaluate({abilityMin:{STR:17,DEX:13}},{STR:18,DEX:12}).allowed,false);
eq(evaluate({abilityMin:{STR:17,DEX:13}},{STR:18,DEX:13}).allowed,true);
eq(allowed('Warhammer',{STR:1}),true);eq(native('Cratering Quarterstaff'),null);eq(native('Oversized Longbow'),null);
const actor={scores:{STR:16},inv:[{n:"Forgemaster's Might",eq:true,attuned:true,q:1}],spells:['Mending'],used:{Creation:1}};
const before=JSON.stringify(actor);eq(allowed(actor.inv[0].n,actor.scores),false);eq(JSON.stringify(actor),before);
// Existing cached row must be reevaluated after actor change; high CHA/Pact never waives STR.
const row={n:"Forgemaster's Might"};eq(allowed(row.n,{STR:17,CHA:8}),true);eq(allowed(row.n,{STR:16,CHA:20}),false);
for(const derived of [17,19,21])eq(allowed(row.n,{STR:derived}),true);
eq(explain(evaluate(rule,{STR:16})),'Strength 17 required to wield (current 16).');
eq(explain(evaluate(rule,{})),'Strength 17 required to wield (current unknown).');
for(const suffix of ['', ' (Maul)',' (Warhammer)'])eq(allowed("Forgemaster's Might"+suffix,{STR:16}),false);
for(const name of ["Forgemaster's Might (Longsword)","Forgemaster's Might extra",'Maul'])eq(native(name),null);
eq(evaluate(rule,{STR:17}).checks,[{ability:'STR',minimum:17,actual:17}]);
eq(explain(evaluate(rule,{STR:17})),'Strength 17 required to wield (current 17).');
for(const [cust,value] of [[{b:2},18],[{b:2,o:19},19],[{b:'2',o:''},18],[{b:'bad',o:null},16],[{o:0},0],[{b:0,o:'17'},17]]){
 const scores={STR:16,DEX:10};const before=JSON.stringify(scores);eq(customize(scores,{'n:ab-STR':cust}).STR,value);eq(JSON.stringify(scores),before);
}
eq(customize({}, {'n:ab-STR':{o:17}}),{});
eq(customize({STR:Infinity},{'n:ab-STR':{o:17}}).STR,17);
eq(customize({STR:NaN},{'n:ab-STR':{o:17}}).STR,17);
console.log(count+' wield minimum checks PASS');
