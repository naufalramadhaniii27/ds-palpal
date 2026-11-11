import assert from 'node:assert/strict';
import {criticalDice,dieReplaceProblems,riderProblems,selfDamageProblems} from '../src/data/lib/attack-target.js';
import {attackDamagePackets} from '../src/app/lib/damage-packets.js';
for(const x of ['1d1','0d6','1d0','4d6+1','-1d6',{},null])assert.equal(criticalDice(x),null);
assert.equal(criticalDice(' 4D6 '),'4d6');assert.deepEqual(dieReplaceProblems({d:'3d4',critD:'3d6'}),[]);assert(dieReplaceProblems({d:'3d4+1',critD:'3d6'}).length);
assert.deepEqual(riderProblems({d:'4d4',critD:'4d6',roll:true,t:'Necrotic'}),[]);for(const x of [{d:'4d4',critD:'4d6',t:'Necrotic'},{d:'4d4+1',critD:'4d6',roll:true,t:'Necrotic'},{d:'4d4',critD:'4d6+1',roll:true,t:'Necrotic'}])assert(riderProblems(x).length);
const self={when:'Scourge of Shadow',normal:'2d4',critical:'2d6',type:'Necrotic',bypassDefenses:true};assert.deepEqual(selfDamageProblems(self),[]);for(const patch of [{normal:'0d4'},{critical:'2d6+1'},{type:'anything'},{bypassDefenses:false},{extra:1},{when:[]}])assert(selfDamageProblems({...self,...patch}).length);
const a={n:'Scourge',die:'3d4',critDie:'3d6',type:'Slashing',xdice:[{d:'4d4',critD:'4d6',roll:true,t:'Necrotic'}]},p=attackDamagePackets(a,'3d4+3');assert.equal(p[0].critExpr,'3d6+3');assert.equal(p[1].critExpr,'4d6');assert.equal(p[0].expr,'3d4+3');assert.equal(p[1].expr,'4d4');assert.equal(attackDamagePackets({...a,xdice:[]},'3d4-2')[0].critExpr,'3d6-2');assert.deepEqual(attackDamagePackets({...a,xdice:[]},'7'),[]);
assert.equal(attackDamagePackets({...a,xdice:[{d:'1d8',t:'Slashing',roll:true}]},'3d4+3')[0].critExpr,'3d6+3+1d8');
assert.deepEqual(attackDamagePackets({n:'Sword',type:'Slashing',xdice:[{d:'1d6',t:'Fire',roll:true}]},'1d8+3'),[{expr:'1d8+3',type:'Slashing',sources:['Sword']},{expr:'1d6',type:'Fire',sources:['Extra damage']}]);
console.log('Critical dice and self-damage schema, grouping, flat preservation and normal packet compatibility PASS');

const sameType=attackDamagePackets({...a,type:"Necrotic"},"3d4+3");assert.equal(sameType.length,1);assert.equal(sameType[0].expr,"3d4+3+4d4");assert.equal(sameType[0].critExpr,"3d6+3+4d6");
console.log("Same-type critical base and rider preserve one typed packet PASS");
