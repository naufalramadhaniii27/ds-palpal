/* Old state migration and target boundary checks, independent of browser state. */
import assert from 'node:assert/strict';
import {normalizeTarget,targetMatches,targetProblems,riderProblems} from '../src/data/lib/attack-target.js';
import {attackDamagePackets} from '../src/app/lib/damage-packets.js';
assert.deepEqual(normalizeTarget(null),{type:'',alignment:'',hp:null,maxHp:null,tags:[]});
assert.equal(normalizeTarget({future:7}).future,7);
for(const p of [{types:null},{alignment:''},{creature:false},{missingHp:false},{types:['Creature']}])assert(targetProblems(p).length);
assert(!targetMatches({missingHp:true},{}));
assert(!targetMatches({types:['Undead']},{type:'Object'}));
assert(targetMatches({bloodied:true},{hp:0,maxHp:1}));
assert(!targetMatches({bloodied:true},{hp:1,maxHp:1}));
assert(!targetMatches({creature:true},{alignment:'Good'}));
assert(targetMatches({creature:true},{type:'Creature'}));
assert.deepEqual(attackDamagePackets({n:'Sword',type:'Slashing',xdice:[{d:'2d10',t:'Slashing',roll:true},{d:'1d6',t:'Fire',roll:true}]},'1d8-2').map(p=>p.expr),['1d8-2+2d10','1d6']);
assert.deepEqual(attackDamagePackets({n:'Sword',type:'Slashing',xdice:[{d:'2d10',t:'Slashing against an Undead'}]},'1d8'),[]);
assert.deepEqual(riderProblems({d:'3d6',typeFrom:'weapon',roll:true}),[]);
for(const rider of [{d:'3d6',typeFrom:'other',roll:true},{d:'3d6',typeFrom:'weapon',t:'Fire',roll:true},{d:'3d6',t:'Fire',roll:'yes'}])assert(riderProblems(rider).length);
for(const type of ['Slashing','Radiant','Psychic']){
 const groups=attackDamagePackets({n:'Blade',type,xdice:[{d:'3d6',typeFrom:'weapon',roll:true}]},'1d8+3');
 assert.equal(groups.length,1);assert.equal(groups[0].type,type);assert.equal(groups[0].expr,'1d8+3+3d6');
}
assert.deepEqual(attackDamagePackets({n:'Blade',type:'unknown',xdice:[{d:'3d6',typeFrom:'weapon',roll:true}]},'1d8'),[]);
console.log('Pure target and typed packet assertions PASS');
