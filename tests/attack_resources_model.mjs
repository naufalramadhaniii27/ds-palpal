import assert from 'node:assert/strict';
import {spendDiceProblems,scaledResourceDice} from '../src/data/lib/attack-resources.js';
const striking={when:'Staff of Striking',d:'1d6',type:'Force',maxCost:3,perCost:true,resource:{kind:'charges'}};
assert.deepEqual(spendDiceProblems(striking),[]);
for(let cost=1;cost<=3;cost++){assert.equal(scaledResourceDice(striking,cost),`${cost}d6`);assert.equal(scaledResourceDice(striking,cost,true),`${cost*2}d6`);}
const lightning={n:'Lightning',when:['Staff of Thunder and Lightning'],d:'2d6',type:'Lightning',maxCost:1,resource:{kind:'use',name:'Lightning (Staff of Thunder and Lightning)'}};
assert.deepEqual(spendDiceProblems(lightning),[]);assert.equal(scaledResourceDice(lightning,1),'2d6');assert.equal(scaledResourceDice(lightning,1,true),'4d6');
assert.equal(scaledResourceDice({...striking,perCost:false},3),'1d6');
for(const cost of [0,-1,4,1.5,'1',NaN,Infinity,null])assert.equal(scaledResourceDice(striking,cost),null);
for(const critical of [0,1,'crit',null])assert.equal(scaledResourceDice(striking,1,critical),null);
for(const patch of [{d:'1d6+1'},{d:'0d6'},{d:'1d1'},{type:'force'},{type:'all'},{maxCost:0},{maxCost:1.5},{maxCost:Number.MAX_SAFE_INTEGER+1},{perCost:1},{when:[]},{when:['']},{when:null},{n:''},{extra:1},{resource:null},{resource:[]},{resource:{kind:'charges',name:'another pool'}},{resource:{kind:'use'}},{resource:{kind:'use',name:'x',extra:true}},{resource:{kind:'spell'}}]){assert(spendDiceProblems({...striking,...patch}).length,JSON.stringify(patch));assert.equal(scaledResourceDice({...striking,...patch},1),null);}
for(const value of [null,undefined,[],1,'entry'])assert(spendDiceProblems(value).length);
const huge={...striking,d:'9007199254740991d6'};assert.equal(scaledResourceDice(huge,1),'9007199254740991d6');assert.equal(scaledResourceDice(huge,2),null);assert.equal(scaledResourceDice(huge,1,true),null);
assert.equal(scaledResourceDice({...striking,d:' 2D8 '},2),'4d8');
assert.deepEqual(striking,{when:'Staff of Striking',d:'1d6',type:'Force',maxCost:3,perCost:true,resource:{kind:'charges'}});
console.log('Resource damage schema, charge scaling, critical doubling, independent daily use, invalid costs and overflow PASS');
