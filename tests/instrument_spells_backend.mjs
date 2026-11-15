import assert from 'node:assert/strict';import{createInstrumentSpellsEngine}from'./fixtures/instrument-spells-native.mjs';
let checks=0;const ok=value=>{assert.ok(value);checks++},eq=(a,b)=>{assert.deepEqual(structuredClone(a),structuredClone(b));checks++};
const admitFacts={actualPhysicalIdentityVerified:true,actualSpecificOriginalProfileVerified:true},reviewFacts={actualPhysicalIdentityVerified:true,actualEverySpellHistoryVerified:true,actualLastDawnVerified:true},castFacts={actualPlayingCompleted:true,actualPrintedCastingTimeCompleted:true};
function ready(options={}){const f=createInstrumentSpellsEngine(options),profile=options.profileId||'current-canaith';ok(f.command('admit',{index:0,profile,facts:admitFacts}).ok);const p=f.C.instrumentSpells.physical[0];ok(f.command('review',{physicalId:p.id,initialUsed:p.spells.map(g=>({grantId:g.grantId,used:0})),lastDawn:{occurrenceId:'start',ordinal:0},facts:reviewFacts}).ok);return f}
function prepare(f,grantId='fly',ability='CHA'){return f.castPrepare({physicalId:'isp-1',grantId,ability,facts:castFacts})}
for(const profileId of ['current-canaith','legacy-canaith']){
 const f=ready({profileId}),before=structuredClone(f.c.S.used),cast=prepare(f);ok(cast.ok);ok(f.castCurrent(cast.payment));eq(cast.stats.dc,16);eq(cast.stats.atk,8);eq(cast.spell.castLevel,3);eq(cast.spell.ct,'Action');const result=f.castCommit(cast.payment,(spell,stats)=>{f.c.S.conc={n:spell.n,l:spell.castLevel};return {ok:true,message:'native cast'}});ok(result.ok);ok(f.accept(result.receipt).ok);eq(f.c.S.conc,{n:'Fly',l:3});const p=f.C.instrumentSpells.physical[0],fly=p.spells.find(g=>g.grantId==='fly');eq(f.c.S.used[fly.budgetKey],1);ok(!prepare(f).ok);eq(f.info().physical[0].spells.find(g=>g.grantId==='invisibility').remaining,1);eq(f.info().physical[0].abilities,['CHA','INT']);for(const key of Object.keys(before))if(key!==fly.budgetKey)eq(f.c.S.used[key],before[key]);
}
for(const mutate of [f=>{f.c.C.notes='Changed actor'},f=>{f.c.S.used.s1=1},f=>{f.c.B.inv[0].eq=false},f=>{f.c.DMAP[f.c.B.inv[0].n][4]+=' Changed'}]){
 const f=ready(),cast=prepare(f),n=f.undos;ok(cast.ok);mutate(f);ok(!f.castCurrent(cast.payment));ok(!f.castCommit(cast.payment,()=>({ok:true})).ok);eq(f.undos,n);
}
for(const outcome of [false,undefined,{},Promise.resolve({ok:true})]){
 const f=ready(),cast=prepare(f),before=structuredClone(f.c.S);ok(cast.ok);const result=f.castCommit(cast.payment,()=>{f.c.S.conc={n:'Fly',l:3};return outcome});ok(!result.ok);eq(f.c.S,before);
}
for(const failure of ['false','throw','promise']){
 const f=ready(),cast=prepare(f),before=structuredClone(f.c.S);f.setSave(()=>{if(failure==='throw')throw Error('Save failed');return failure==='promise'?Promise.resolve(true):false});const result=f.castCommit(cast.payment,()=>{f.c.S.conc={n:'Fly',l:3};return {ok:true}});ok(!result.ok);eq(f.c.S,before);
}
{
 const f=ready(),cast=prepare(f);f.setSave(()=>{f.c.C.notes='Changed in Save';return true});const result=f.castCommit(cast.payment,spell=>{f.c.S.conc={n:spell.n,l:spell.castLevel};return {ok:true}});ok(!result.ok&&result.committed);eq(f.c.C.notes,'Changed in Save');ok(!f.accept(result.receipt).ok);
}
{
 const f=createInstrumentSpellsEngine();ok(f.command('admit',{index:0,profile:'current-canaith',facts:admitFacts}).ok);ok(f.info().physical[0].reviewRequired);const dawn={occurrenceId:'actual-dawn-1',ordinal:1},facts={actualDawnOccurred:true,actualCampaignDawnVerified:true,actualDawnOccurredAfterAdmissions:true};ok(f.command('dawn',{dawn,facts}).ok);ok(!f.info().physical[0].reviewRequired);ok(!f.command('dawn',{dawn,facts}).ok);eq(f.info().physical[0].spells[0].remaining,1);
}
console.log(checks+' actual instrument backend checks PASS');
