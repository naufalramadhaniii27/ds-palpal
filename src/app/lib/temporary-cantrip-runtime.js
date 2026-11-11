// Actor-owned temporary-cantrip transactions; source eligibility is supplied by live integration.
import {createTemporaryCantripState,temporaryCantripStateProblems,activateTemporaryCantrip,advanceTemporaryCantripTime} from '../../data/lib/temporary-cantrip.js';
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const itemNames=['+1 All-Purpose Tool','+2 All-Purpose Tool','+3 All-Purpose Tool'];
const text=value=>typeof value==='string'&&value.length>0&&value.trim()===value;
const failure=reason=>({ok:false,reason});
function encoded(value){try{return JSON.stringify(value)}catch(error){return null}}
function stateOf(S){const state=own(S,'temporaryCantrips')?S.temporaryCantrips:createTemporaryCantripState();return temporaryCantripStateProblems(state).length?null:state}
function counter(S,key){if(!own(S,'used')||S.used==null)return 0;if(!object(S.used))return null;const n=own(S.used,key)?S.used[key]:0;return Number.isSafeInteger(n)&&n>=0?n:null}
function validSource(source){return object(source)&&source.eligible===true&&text(source.sourceId)&&itemNames.includes(source.item)&&text(source.chargeKey)&&source.max===1&&text(source.signature)}
function sourceStamp(source){return encoded({sourceId:source.sourceId,item:source.item,chargeKey:source.chargeKey,max:source.max,signature:source.signature})}
export function createTemporaryCantripRuntime(options){
 const {getActor,sourceInfo,spellInfo,beforeCommit,save,refresh,rootActive}=options||{};
 if([getActor,sourceInfo,spellInfo,beforeCommit,save,refresh,rootActive].some(fn=>typeof fn!=='function'))throw new TypeError('Temporary cantrip runtime requires live callbacks');
 const contexts=new WeakMap();
 function actor(){try{const value=getActor();return value&&object(value.C)&&object(value.S)?value:null}catch(error){return null}}
 function rootValid(root){try{return rootActive(root)===true}catch(error){return false}}
 function capture(root,kind){const current=actor();if(!current||!rootValid(root))return null;const state=stateOf(current.S),stamp=state&&encoded(state);if(!stamp)return null;const token={};contexts.set(token,{kind,root,C:current.C,S:current.S,name:current.C.name,cid:current.C.cid,id:current.C.id,stamp});return token}
 function current(token){const view=token&&contexts.get(token),now=actor();if(!view||!now||now.C!==view.C||now.S!==view.S||now.C.name!==view.name||now.C.cid!==view.cid||now.C.id!==view.id||!rootValid(view.root))return null;const state=stateOf(now.S);return state&&encoded(state)===view.stamp?{view,actor:now,state}:null}
 function getSource(selection,owner){try{return sourceInfo(selection,owner)}catch(error){return null}}
 function getSpell(spell,owner){try{return spellInfo(spell,owner)}catch(error){return null}}
 function spellValid(info,name){return object(info)&&info.spell===name&&info.cantripOnClassList===true&&typeof info.definitelyKnown==='boolean'}
 function sourceCurrent(value){const source=getSource(value.view.selection,value.actor);return validSource(source)&&sourceStamp(source)===value.view.sourceStamp?source:null}
 function activationCurrent(token){const value=current(token);if(!value||value.view.kind!=='activation')return null;const source=sourceCurrent(value),spell=getSpell(value.view.spell,value.actor);if(!source||!spellValid(spell,value.view.spell)||encoded(spell)!==value.view.spellStamp)return null;return {...value,source,spell}}
 function captureActivation(selection,spell,root){if(!text(spell))return null;const token=capture(root,'activation');if(!token)return null;const value=current(token),selectionStamp=encoded(selection);if(!value||!selectionStamp)return null;const chosen=JSON.parse(selectionStamp),source=getSource(chosen,value.actor),info=getSpell(spell,value.actor);if(!validSource(source)||!spellValid(info,spell))return null;Object.assign(value.view,{selection:chosen,spell,sourceStamp:sourceStamp(source),spellStamp:encoded(info)});return token}
 function stillOwned(value){const now=actor(),view=value.view;return !!(now&&now.C===view.C&&now.S===view.S&&now.C.name===view.name&&now.C.cid===view.cid&&now.C.id===view.id&&rootValid(view.root))}
 function commit(token,read,apply){let value=read(token);if(!value)return failure('stale-context');try{const allowed=beforeCommit(value.actor);if(allowed===false||allowed&&typeof allowed.then==='function')return failure('commit-failed')}catch(error){return failure('commit-failed')}value=read(token);if(!value)return failure('stale-context');apply(value);contexts.delete(token);let reason='';try{save(value.actor)}catch(error){reason='save-failed'}if(stillOwned(value)){try{refresh(value.actor)}catch(error){reason=reason||'refresh-failed'}}else reason=reason||'actor-changed';return reason?{ok:true,committed:true,warning:reason}:{ok:true,committed:true}}
 function activate(token,declarations){let value=activationCurrent(token);if(!value)return failure('stale-context');const available=counter(value.actor.S,value.source.chargeKey);if(available===null)return failure('unsupported-counter');const context={sourceEligible:true,chargeAvailable:available<1,actionComplete:declarations&&declarations.actionComplete,focusOnTool:declarations&&declarations.focusOnTool,cantripOnClassList:true,definitelyKnown:value.spell.definitelyKnown,notAlreadyKnown:declarations&&declarations.notAlreadyKnown};const result=activateTemporaryCantrip(value.state,{sourceId:value.source.sourceId,item:value.source.item,spell:value.view.spell},context);if(!result.ok)return result;const key=value.source.chargeKey;
  const read=next=>{const fresh=activationCurrent(next);return fresh&&counter(fresh.actor.S,key)===available?fresh:null};
  const done=commit(token,read,fresh=>Object.assign(fresh.actor.S,{used:{...(fresh.actor.S.used||{}),[key]:available+result.chargeSpend},temporaryCantrips:result.state}));return done.ok?{...done,grant:result.grant,chargeKey:key}:done}
 function captureClock(root){return capture(root,'clock')}
 function clockCurrent(token){const value=current(token);return value&&value.view.kind==='clock'?value:null}
 function advance(token,seconds){const value=clockCurrent(token);if(!value)return failure('stale-context');if(!Number.isSafeInteger(seconds)||seconds<=0)return failure('invalid-elapsed-time');const result=advanceTemporaryCantripTime(value.state,seconds);if(!result.ok)return result;return commit(token,clockCurrent,fresh=>{fresh.actor.S.temporaryCantrips=result.state})}
 function dawnSources(value){const result=getSource({kind:'dawn'},value.actor);if(!result||result.eligible!==true||!Array.isArray(result.sources))return null;const sources=result.sources;if(!sources.length||sources.some(source=>!validSource(source)))return null;const keys=new Set(),ids=new Set();for(const source of sources){if(keys.has(source.chargeKey)||ids.has(source.sourceId)||counter(value.actor.S,source.chargeKey)===null)return null;keys.add(source.chargeKey);ids.add(source.sourceId)}return sources}
 function dawn(token,declaration){const value=clockCurrent(token);if(!value)return failure('stale-context');if(!declaration||declaration.declared!==true)return failure('dawn-declaration-required');const sources=dawnSources(value);if(!sources)return failure('source-unavailable');const stamp=encoded(sources.map(sourceStamp)),usedStamp=encoded(value.actor.S.used);
  const read=next=>{const fresh=clockCurrent(next),rows=fresh&&dawnSources(fresh);return fresh&&rows&&encoded(rows.map(sourceStamp))===stamp&&encoded(fresh.actor.S.used)===usedStamp?{...fresh,sources:rows}:null};
  return commit(token,read,fresh=>{const used={...(fresh.actor.S.used||{})};fresh.sources.forEach(source=>{if(own(used,source.chargeKey))used[source.chargeKey]=0});fresh.actor.S.used=used})}
 function inspect(token){const value=current(token);if(!value)return failure('stale-context');return {ok:true,kind:value.view.kind,elapsedSeconds:value.state.elapsedSeconds}}
 return {captureActivation,activate,captureClock,advance,dawn,inspect};
}
