import assert from 'node:assert/strict';import {createInstrumentCaster} from './fixtures/instrument-cast-native.mjs';
let checks=0;const ok=value=>{assert.ok(value);checks++},eq=(a,b)=>{assert.deepEqual(structuredClone(a),structuredClone(b));checks++};
for(const profileId of ['current-canaith','legacy-canaith']){
 const f=createInstrumentCaster({profileId});f.ready();f.c.S.used.s1=2;f.c.S.used.pact=1;const before=structuredClone(f.c.S.used),u=f.engine.undos;f.log.length=0;const reply=f.cast();ok(reply.ok);ok(f.c.acceptInstrumentSpellsCommit(reply,f.root));eq(f.engine.undos,u+1);eq(f.log.filter(x=>x==='source-save').length,1);eq(f.log.filter(x=>x==='ordinary-save').length,0);eq(f.c.S.conc,{n:'Fly',l:3});eq(f.c.S.used.s1,2);eq(f.c.S.used.pact,1);eq(reply.spell.cmp,'None (item)');eq(reply.stats.ability,'CHA');ok(f.c.instrumentSpellResult(reply,f.root));const n=f.engine.undos;ok(!f.cast().ok);eq(f.engine.undos,n);const other=f.cast('invisibility','INT');ok(other.ok);eq(f.c.S.conc.n,'Invisibility');for(const key of Object.keys(before))if(! /-(fly|invisibility)$/.test(key))eq(f.c.S.used[key],before[key]);
}
for(const profileId of ['legacy-anstruth','current-ollamh']){
 const f=createInstrumentCaster({profileId});f.ready();const reply=f.cast('control-weather','INT');ok(reply.ok);eq(reply.spell.castLevel,8);eq(reply.spell.instrumentSpellSource,profileId.startsWith('legacy')?'phb2014':'phb2024');eq(reply.spell.ct,profileId.startsWith('legacy')?'Action':'10 minutes');eq(f.c.S.conc,{n:'Control Weather',l:8});
}
{
 const f=createInstrumentCaster({profileId:'current-fochlucan',mutate:c=>{c.B.base.INT=16}});f.ready();const row=f.engine.C.spells.find(x=>x.instrumentSpell?.grantId==='shillelagh'),index=f.engine.C.spells.indexOf(row),u=f.engine.undos,old=structuredClone(f.c.S.used);eq(row.l,0);eq(f.c.spCastOpts(row),[]);f.c.quickCast(index);eq(f.engine.undos,u);eq(f.c.castDo(index,'',0),false);eq(f.c.S.used,old);const reply=f.cast('shillelagh','INT');ok(reply.ok);eq(reply.stats.ability,'INT');eq(reply.stats.modifier,3);eq(reply.spell.ct,'Bonus Action');ok(!f.cast('shillelagh','INT').ok);
}
{
 const f=createInstrumentCaster({profileId:'current-doss'});f.ready();const reply=f.cast('protection-from-energy','CHA');ok(reply.ok);eq(reply.spell.restriction,{damageType:'Fire'});eq(f.engine.C.instrumentSpells.events.at(-1).cast.restriction,{damageType:'Fire'});
}
for(const mutation of [f=>{f.engine.C.inv[0].eq=false},f=>{f.engine.c.S.used['i-instrument-1-fly']=1},f=>{f.engine.setC({...f.engine.C})}]){
 const f=createInstrumentCaster();f.ready();f.c.raging=true;const replies=[],u=f.engine.undos;ok(f.cast('fly','CHA',{onCommitted:r=>replies.push(r)}).pending);eq(f.engine.undos,u);mutation(f);f.prompts[0]();eq(f.engine.undos,u);eq(replies.length,1);eq(replies[0].ok,false);
}
{
 const f=createInstrumentCaster({spells:['Fly','Charm Person']});f.ready();const index=f.engine.C.spells.findIndex(row=>row.n==='Fly'&&!row.itc),before=structuredClone(f.c.S.used);ok(index>=0);f.c.castDo(index,'s3',3);eq(f.c.S.used.s3,1);eq(f.c.S.conc.n,'Fly');for(const key of Object.keys(before))if(key.startsWith('i-instrument-'))eq(f.c.S.used[key],before[key]);
}
console.log(checks+' actual instrument native casting checks PASS');
