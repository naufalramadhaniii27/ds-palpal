import assert from 'node:assert/strict';import {spellChannel as channel,spellChannelsDiffer as differ,selectSpellSource as select} from '../src/data/lib/spell-source.js';
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++};
const scores={INT:16,CHA:18,WIS:12};const wizard=channel({k:'Wizard',n:'Wizard',ab:'INT'},scores,3),artificer=channel({k:'Artificer',n:'Artificer',ab:'INT'},scores,3,{atk:1,dc:1});const main={...wizard,by:[wizard,artificer]};
eq(wizard.atk,6);eq(artificer.atk,7);eq(artificer.dc,15);eq(differ(main.by),true);
for(const [key,atk,dc] of [['Wizard',6,14],['Artificer',7,15]]){const selected=select(main,{sourceKey:key,ab:'INT',src:'Misleading display name'});eq(selected.atk,atk);eq(selected.dc,dc);eq(selected.k,key)}
eq(select(main,{ab:'INT'}).k,'Wizard');eq(select(main,{sourceKey:'missing',ab:'INT'}),{});
const warlock=channel({k:'Warlock',n:'Warlock',ab:'CHA'},scores,3,{atk:2,dc:0}),sorcerer=channel({k:'Sorcerer',n:'Sorcerer',ab:'CHA'},scores,3);eq(differ([warlock,sorcerer]),true);eq(select({...warlock,by:[warlock,sorcerer]},{sourceKey:'Sorcerer',ab:'CHA'}).atk,7);
for(const k of ['@species','@mi:mi1','@sub:source','']){const row=channel({k,n:'Feature',ab:'WIS'},scores,3);eq(select({...wizard,by:[wizard,row]},{sourceKey:k}).k,k)}
eq(differ([wizard,{...wizard,k:'Other',n:'Other'}]),false);eq(differ([wizard,{...wizard,ab:'WIS'}]),true);eq(differ([]),false);eq(differ([wizard]),false);
const fixed=select(main,{sourceKey:'Artificer',itc:{dc:17,atk:9}});eq(fixed.dc,17);eq(fixed.atk,9);eq(select(main,{sourceKey:'Artificer',itc:{dc:17}}).atk,6);
const overridden=select(main,{sourceKey:'Artificer',itc:{dc:17,atk:9}},{dc:19,atk:11});eq(overridden.dc,19);eq(overridden.atk,11);
for(const value of [0,'0',-1,'12'])eq(select(main,{sourceKey:'Artificer'},{atk:value}).atk,+value);
for(const value of ['',null,undefined,NaN,Infinity,'bad'])eq(select(main,{sourceKey:'Artificer'},{atk:value}).atk,7);
const before=JSON.stringify({main,scores});const selected=select(main,{sourceKey:'Artificer'});selected.atk=999;eq(main.by[1].atk,7);eq(JSON.stringify({main,scores}),before);
for(const bad of [null,{},[],{k:'Wizard',n:'Wizard',ab:'bad'}])eq(channel(bad,scores,3),null);
eq(channel({k:'Wizard',n:'Wizard',ab:'INT'},{INT:NaN},3),null);eq(channel({k:'Wizard',n:'Wizard',ab:'INT'},scores,3,{atk:'1'}),null);
const boosted={...artificer,by:[artificer,wizard]};
for(const sourceKey of ['missing',null,{},[],42,undefined]){const result=select(boosted,{sourceKey,ab:'INT',src:'Artificer'});eq(result.atk,undefined);eq(result.dc,undefined)}
eq(select(boosted,{sourceKey:'missing',itc:{dc:17}}).dc,17);
eq(select(boosted,{sourceKey:'missing'},{atk:11,dc:19}).atk,11);
eq(select(boosted,{sourceKey:'missing'},{atk:11,dc:19}).dc,19);
eq(select(boosted,{ab:'INT'}).atk,7);
eq(select(artificer,{sourceKey:'missing',ab:'INT'}),{});
eq(select(artificer,{ab:'INT'}).atk,7);
console.log(count+' spell source model checks PASS');
