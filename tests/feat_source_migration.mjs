import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
let checks=0;const eq=(a,b)=>{assert.deepEqual(a,b);checks++},read=name=>fs.readFileSync(new URL('../'+name,import.meta.url),'utf8');
const source=read('src/builder/03-logic-magic-item-effects.js'),start=source.indexOf('const VALDA_FEAT_SOURCES='),end=source.indexOf('/* Records a completed attunement',start),ctx={Object,Array,migrateInventory:value=>value};assert(start>=0&&end>start);vm.createContext(ctx);vm.runInContext(source.slice(start,end).replace(/export /g,''),ctx);
const plain=value=>JSON.parse(JSON.stringify(value)),profiles=[['Gambler','tdcg','feat-source-gambler'],['Aberrant Spawn','tsdm','feat-source-aberrant-spawn'],['Proto-Man','tsdm','feat-source-proto-man']];
for(const [name,book,memo] of profiles){
 const make=(rs='2014',src={tvss14:true})=>({rs,src,ch:{feat4:{feat:name,a1:'CON',future:{keep:1}},[memo+'-unrelated']:'untouched'},inv:[{n:'Rope',q:2}]});
 const fresh=make(),old=structuredClone(fresh);ctx.migrateFeatSources(fresh);eq(fresh.ch.feat4.feat,name+' (Valda 2014)');eq(fresh.ch.feat4.future,old.ch.feat4.future);eq(Object.keys(fresh.ch),Object.keys(old.ch));eq(fresh.src,old.src);eq(fresh.inv,old.inv);const after=JSON.stringify(fresh);ctx.migrateFeatSources(fresh);eq(JSON.stringify(fresh),after);
 for(const rs of ['2024',undefined,'future']){const b=make(rs,{tvss14:true,[book]:true});if(rs===undefined)delete b.rs;const before=JSON.stringify(b);ctx.migrateFeatSources(b);eq(JSON.stringify(b),before);eq(ctx.featSourceReview(b,name),null)}
 const both=make('2014',{tvss14:true,[book]:true}),before=JSON.stringify(both);ctx.migrateFeatSources(both);eq(JSON.stringify(both),before);eq(ctx.featSourceReview(both,name).alias,name+' (Valda 2014)');ctx.rememberFeatSource(both,name);eq(both.ch[memo],book);eq(ctx.featSourceReview(both,name),null);ctx.migrateFeatSources(both);eq(both.ch.feat4.feat,name);eq(both.src.tvss14,true);
 both.ch[memo]='tvss14';ctx.migrateFeatSources(both);eq(both.ch.feat4.feat,name+' (Valda 2014)');eq(both.src[book],true);eq(both.src.tvss14,true);
 for(const value of [null,false,{},'future','']){const b=make();b.ch[memo]=value;const before=JSON.stringify(b);ctx.migrateFeatSources(b);eq(JSON.stringify(b),before);eq(ctx.featSourceReview(b,name).alias,name+' (Valda 2014)')}
 const absent=make('2014',{}),absentBefore=JSON.stringify(absent);ctx.migrateFeatSources(absent);eq(JSON.stringify(absent),absentBefore);eq(ctx.featSourceReview(absent,name),null);
}
for(const name of ['constructor','toString','__proto__','Future unknown feat']){const b={rs:'2014',src:{tvss14:true},ch:{feat4:{feat:name,future:99}}},before=JSON.stringify(b);ctx.migrateFeatSources(b);ctx.rememberFeatSource(b,name);eq(JSON.stringify(b),before);eq(ctx.featSourceReview(b,name),null)}
const generated=read('src/data/tp16-tvss14.js'),extract=name=>{const match=generated.match(new RegExp('var '+name+'=(.*);'));assert(match);return JSON.parse(match[1])},feats=extract('FT'),uses=extract('FTLU');
for(const [name] of profiles){eq(Object.hasOwn(feats,name),false);eq(feats[name+' (Valda 2014)'].hb,'VSS14')}
eq(uses.filter(row=>row.n==='Primal Recovery').map(row=>row.owner),['Proto-Man (Valda 2014)']);
console.log(checks+' exact feat-source migration/provenance/opaque-state assertions PASS');
