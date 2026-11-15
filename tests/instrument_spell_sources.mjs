import assert from 'node:assert/strict';
import {instrumentProfiles,instrumentGenericRow,INSTRUMENT_GENERIC_FINGERPRINT} from '../src/data/lib/instrument-spell-profiles.js';
import {instrumentSpellSource,instrumentSpellBlueprint,instrumentSpellDefinition,instrumentSpellsMarker,instrumentSpellsRawState,instrumentSpellNeedsController} from '../src/data/lib/instrument-spells-source.js';
import {instrumentModel,createInstrumentSpells} from '../src/data/lib/instrument-spells.js';
let count=0;const check=(a,b)=>{assert.deepEqual(a,b);count++;},profiles=instrumentProfiles(),model=instrumentModel(profiles);
check(instrumentSpellsMarker({}),{present:false,ok:true,id:null});
for(const value of [undefined,null,{v:99,id:'isp-1'},{v:1,id:'isp-01'},{v:1,id:'isp-9007199254740992'}])check(instrumentSpellsMarker({instrumentSpells:value}).ok,false);
check(instrumentSpellsRawState({},model),{present:false,ok:true,state:null});check(instrumentSpellsRawState({instrumentSpells:createInstrumentSpells()},model).ok,true);check(instrumentSpellsRawState({instrumentSpells:undefined},model).ok,false);
let reads=0;const hidden={};Object.defineProperty(hidden,'instrumentSpells',{get(){reads++;return createInstrumentSpells()},enumerable:true});check(instrumentSpellsRawState(hidden,model).ok,false);check(instrumentSpellsMarker(hidden).ok,false);check(reads,0);
for(const p of profiles){
 const row={n:p.item,key:p.item,q:1,eq:true};const frame={profileId:p.id,row,attunement:{requires:true,attuned:true},originalCatalogRows:[p.row],legacyCatalogRows:[p.row],resolvedRow:p.row,customItems:[]};
 check(instrumentSpellSource(frame).ok,true);check(instrumentSpellSource({...frame,attunement:{requires:true,attuned:false}}).ok,false);check(instrumentSpellSource({...frame,row:{...row,q:2}}).ok,false);check(instrumentSpellSource({...frame,row:{...row,q:'1oops'}}).ok,false);check(instrumentSpellSource({...frame,row:{...row,eq:false}}).ok,false);check(instrumentSpellSource({...frame,resolvedRow:[]}).ok,false);check(instrumentSpellSource({...frame,originalCatalogRows:[],legacyCatalogRows:[]}).ok,false);check(instrumentSpellSource({...frame,fxOverrides:{[p.item]:{}}}).ok,false);check(instrumentSpellSource({...frame,gxItems:{[p.item]:{}}}).ok,false);
 const marked={...row,instrumentSpells:{v:1,id:'isp-1'}};check(instrumentSpellSource({...frame,row:marked,inventory:[marked],index:0}).physicalId,'isp-1');check(instrumentSpellSource({...frame,row:marked,inventory:[marked,{...marked}],index:0}).ok,false);
 check(instrumentSpellNeedsController({}, {n:'Fly',itc:{it:p.item}}),true);check(instrumentSpellNeedsController({}, {n:'Fly',src:p.item}),true);check(instrumentSpellNeedsController({}, {n:'Fly',src:'Bard'}),false);
 if(p.genericOriginAllowed){const generic={...row,n:instrumentGenericRow()[0],key:instrumentGenericRow()[0]};const g={...frame,row:generic,originalCatalogRows:[p.row,instrumentGenericRow()],resolvedRow:instrumentGenericRow(),parentFingerprint:INSTRUMENT_GENERIC_FINGERPRINT};check(instrumentSpellSource(g).ok,true);check(instrumentSpellSource({...g,parentFingerprint:null}).ok,false);}
 for(const grant of p.grants){const b=instrumentSpellBlueprint(p.id,grant.id),defined=instrumentSpellDefinition(p.id,grant.id,[b.definition]);check(defined.ok,true);check(defined.castLevel,grant.castLevel);check(defined.restriction,grant.restriction);check(defined.castingTime,grant.castingTimeOverride||b.definition.ct);check(instrumentSpellDefinition(p.id,grant.id,[]).ok,false);}
}
check(instrumentSpellNeedsController({}, {n:'Fly',instrumentSpells:undefined}),true);
console.log(`${count} original instrument source/printed spell/marker checks PASS`);
