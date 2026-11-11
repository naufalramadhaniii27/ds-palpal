// Owned HP-restoration outcomes. These operations never apply HP to an external target.
import {evaluateSupremeHealing,maximumHealingExpression} from '../../data/lib/cleric-maths.js';
import {supremeHealingDescriptorProblems,divineSparkDescriptorProblems,divineSparkDice,divineSparkResourceMatches} from '../../data/lib/cleric-capabilities.js';
const object=value=>!!value&&typeof value==='object'&&!Array.isArray(value);
const own=(value,key)=>Object.prototype.hasOwnProperty.call(value,key);
const exact=(value,keys)=>object(value)&&Reflect.ownKeys(value).length===keys.length&&keys.every(key=>own(value,key));
const failure=reason=>({ok:false,reason});
const epochs=new WeakMap();
function epoch(state){if(!epochs.has(state))epochs.set(state,{});return epochs.get(state)}
export function invalidateSupremeHealingState(state){if(object(state))epochs.set(state,{})}
function encoded(value){try{return JSON.stringify(value)}catch(error){return null}}
function sourceCurrent(character,source){const edition=character&&character.rs===undefined?'2024':character&&character.rs;return ['2014','2024'].includes(edition)&&character&&source&&source.edition===edition&&Number.isSafeInteger(character.level)&&character.level>=source.level&&(source.pre!==''||character.cls==='Cleric')}
export function supremeHealingRuleForCharacter(character){const descriptor=character&&character.supremeHealing;return !supremeHealingDescriptorProblems(descriptor).length&&sourceCurrent(character,descriptor.source)?descriptor.rule:null}
function cannotAct(state){return !object(state)||own(state,'cond')&&!object(state.cond)||['Incapacitated','Paralyzed','Petrified','Stunned','Unconscious'].some(key=>state.cond&&state.cond[key])}
export function divineSparkHealingPacket(character,state,scores){
 const descriptor=character&&character.divineSpark;if(divineSparkDescriptorProblems(descriptor).length||!sourceCurrent(character,descriptor.source)||!divineSparkResourceMatches(descriptor,character.res))return failure('spark-source-unavailable');
 if(cannotAct(state))return failure('cannot-take-action');const score=scores&&scores.WIS;if(!Number.isFinite(score))return failure('wisdom-unavailable');const mod=Math.floor((score-10)/2),dice=divineSparkDice(descriptor.source.level);if(!dice)return failure('spark-source-unavailable');
 const used=own(state,'used')?state.used:{};if(!object(used))return failure('unsupported-resource');const n=own(used,descriptor.resource.key)?used[descriptor.resource.key]:0;if(!Number.isSafeInteger(n)||n<0)return failure('unsupported-resource');
 const expression=dice+(mod?mod>0?'+'+mod:String(mod):'');return {ok:true,packet:{v:1,sourceKind:'channel-divinity',owner:'actor',effect:'restore-hp',expression},resourceKey:descriptor.resource.key,max:descriptor.resource.max,used:n,signature:encoded({descriptor,score,resource:character.res.filter(row=>row.k===descriptor.resource.key),conditions:state.cond}),source:descriptor.source};
}
export function createSupremeHealingRuntime(options){
 const {getActor,getRule,getSpellPacket,getDivineSparkPacket,rootActive,getDice,beforeCommit,save}=options||{};
 if([getActor,getRule,getSpellPacket,getDivineSparkPacket,rootActive,getDice,beforeCommit,save].some(fn=>typeof fn!=='function'))throw new TypeError('Healing runtime requires live callbacks');
 const contexts=new WeakMap();
 function actor(){try{const owner=getActor();return owner&&object(owner.C)&&object(owner.S)&&owner.readOnly!==true?owner:null}catch(error){return null}}
 function rootValid(root){try{return rootActive(root)===true}catch(error){return false}}
 function ruleFor(owner){try{return getRule(owner)||null}catch(error){return null}}
 function packetFor(owner,kind,index,level){if(kind==='declared')return {ok:true,packet:{v:1,sourceKind:'spell',owner:'actor',effect:'restore-hp',expression:'0'},signature:'declared-healing'};try{const value=kind==='spell'?getSpellPacket(owner,index,level):getDivineSparkPacket(owner);return value&&value.ok===true&&object(value.packet)&&typeof value.signature==='string'?value:null}catch(error){return null}}
 function ownerCurrent(view){const owner=actor();return owner&&owner.C===view.C&&owner.S===view.S&&owner.C.name===view.name&&owner.C.cid===view.cid&&owner.C.id===view.id&&rootValid(view.root)?owner:null}
 function stamp(owner){return encoded({supreme:owner.C.supremeHealing,spark:owner.C.divineSpark,abilities:owner.C.abilities,level:owner.C.level,rs:owner.C.rs,cls:owner.C.cls,cust:owner.S.cust,conditions:owner.S.cond,turn:owner.S.sit&&owner.S.sit.turn})}
 function capture(kind,index,level,root){const owner=actor();if(!owner||!rootValid(root))return null;const packet=packetFor(owner,kind,index,level),rule=ruleFor(owner),spell=kind==='spell'&&(owner.C.spells||[])[index];if(!packet||kind!=='spark'&&!rule||kind==='spell'&&!spell)return null;const signature=stamp(owner),ruleStamp=encoded(rule);if(signature===null||ruleStamp===null)return null;const token={};contexts.set(token,{kind,index,level,root,C:owner.C,S:owner.S,name:owner.C.name,cid:owner.C.cid,id:owner.C.id,spell,epoch:epoch(owner.S),turn:owner.S.sit&&owner.S.sit.turn,signature,ruleStamp,packetStamp:encoded(packet),pending:false,completed:false,cancelled:false});return token}
 function captureSpell(index,level,root){return Number.isInteger(index)&&Number.isInteger(level)?capture('spell',index,level,root):null}
 function captureDivineSpark(root){return capture('spark',null,null,root)}
 function captureDeclaredHealing(root){return capture('declared',null,null,root)}
 function current(token){const view=token&&contexts.get(token);if(!view||view.completed||view.cancelled)return null;const owner=ownerCurrent(view);if(!owner||epoch(owner.S)!==view.epoch||(owner.S.sit&&owner.S.sit.turn)!==view.turn||stamp(owner)!==view.signature||view.kind==='spell'&&(owner.C.spells||[])[view.index]!==view.spell)return null;const rule=ruleFor(owner),packet=packetFor(owner,view.kind,view.index,view.level);return packet&&encoded(rule)===view.ruleStamp&&encoded(packet)===view.packetStamp?{view,owner,rule,packet}:null}
 function declaredHealing(value,facts){
  const fields=['sourceKind','expression','ownedSource','actualSourceUsed','healingResolved','targetCreature'];
  if(!object(facts)||Reflect.ownKeys(facts).some(key=>typeof key!=='string'||![...fields,'minimum'].includes(key))||fields.some(key=>!own(facts,key))||!['spell','channel-divinity'].includes(facts.sourceKind)||typeof facts.expression!=='string'||['ownedSource','actualSourceUsed','healingResolved','targetCreature'].some(key=>typeof facts[key]!=='boolean')||own(facts,'minimum')&&(!Number.isSafeInteger(facts.minimum)||facts.minimum<0))return failure('invalid-healing-context');
  if(!facts.ownedSource||!facts.actualSourceUsed||!facts.healingResolved)return failure('actual-source-healing-required');if(value.rule.creatureOnly&&!facts.targetCreature)return failure('creature-required');
  const packet={v:1,sourceKind:facts.sourceKind,owner:'actor',effect:'restore-hp',expression:facts.expression};if(own(facts,'minimum'))packet.minimum=facts.minimum;const maximum=evaluateSupremeHealing(value.rule,packet,{targetCreature:facts.targetCreature});if(!maximum.ok)return maximum;if(!maximum.applies)return failure('maximized-healing-unavailable');
  return {ok:true,expression:maximum.expression,maximum:true,amount:maximum.amount,normalExpression:maximum.normalExpression,limit:maximum.amount,sourceKind:facts.sourceKind,resourceKey:null};
 }
 function prepare(value,facts){
  if(value.view.kind==='declared')return declaredHealing(value,facts);
  const spell=value.view.kind==='spell',fields=spell?['spellWasCast','targetCreature','healingResolved']:['magicActionComplete','holySymbol','targetCreature','anotherCreature','targetVisible','distanceFeet'];
  if(!exact(facts,fields)||fields.filter(key=>key!=='distanceFeet').some(key=>typeof facts[key]!=='boolean'))return failure('invalid-healing-context');
  if(spell&&(!facts.spellWasCast||!facts.healingResolved))return failure('actual-spell-healing-required');if(!spell){if(!facts.magicActionComplete||!facts.holySymbol)return failure('spark-declarations-required');if(!facts.anotherCreature)return failure('another-creature-required');if(!facts.targetVisible)return failure('visible-target-required');if(!Number.isFinite(facts.distanceFeet)||facts.distanceFeet<0||facts.distanceFeet>30)return failure('target-range-required')}
  if((!spell||value.rule&&value.rule.creatureOnly)&&!facts.targetCreature)return failure('creature-required');
  const maximum=value.rule?evaluateSupremeHealing(value.rule,value.packet.packet,{targetCreature:facts.targetCreature}):{ok:true,applies:false,expression:value.packet.packet.expression};if(!maximum.ok)return maximum;if(spell&&!maximum.applies)return failure('maximized-healing-unavailable');
  if(!spell&&(!Number.isSafeInteger(value.packet.max)||!Number.isSafeInteger(value.packet.used)||value.packet.used>=value.packet.max))return failure('channel-divinity-unavailable');
  const expression=maximum.applies?maximum.expression:value.packet.packet.expression,limit=maximumHealingExpression(expression);if(!limit.ok)return limit;
  return {ok:true,expression,maximum:maximum.applies,amount:maximum.applies?maximum.amount:null,normalExpression:value.packet.packet.expression,limit:Math.max(0,limit.total),sourceKind:spell?'spell':'channel-divinity',resourceKey:spell?null:value.packet.resourceKey};
 }
 function inspect(token,facts){const value=current(token);return value?prepare(value,facts):failure('stale-healing-source')}
 function notify(roll,response){if(roll.replied)return;roll.replied=true;if(ownerCurrent(roll.view)&&typeof roll.onResult==='function')roll.onResult({...response,character:roll.view.C,state:roll.view.S,owner:roll.view.name})}
 function refuse(roll,reason){roll.cancelled=true;roll.view.pending=false;notify(roll,failure(reason));return false}
 function check(roll){if(roll.cancelled||roll.committed)return false;const value=current(roll.token),preview=value&&prepare(value,roll.facts);return value&&preview.ok?true:refuse(roll,preview&&preview.reason||'stale-healing-source')}
 function commit(roll,result){if(!object(result)||!Number.isFinite(result.v)||result.v<0||result.v>roll.preview.limit||roll.preview.maximum&&result.v!==roll.preview.amount)return refuse(roll,'invalid-healing-result');if(!check(roll))return false;let value=current(roll.token);
  try{const accepted=beforeCommit(value.owner,value.view.kind==='spark'?'Use Divine Spark healing':'Record maximized healing',{changesActor:value.view.kind==='spark'});if(accepted===false||accepted&&typeof accepted.then==='function')return refuse(roll,'commit-failed')}catch(error){return refuse(roll,'commit-failed')}
  if(!check(roll))return false;value=current(roll.token);if(value.view.kind==='spark')value.owner.S.used={...(value.owner.S.used||{}),[value.packet.resourceKey]:value.packet.used+1};
  roll.committed=true;roll.view.completed=true;roll.view.pending=false;roll.certificate={ok:true,committed:true,result,profile:roll.preview};try{save(value.owner)}catch(error){roll.certificate.warning='save-failed'}return true;
 }
 function request(token,facts,onResult){const value=current(token);if(!value)return failure('stale-healing-source');if(value.view.pending)return failure('roll-pending');const preview=prepare(value,facts);if(!preview.ok)return preview;let dice;try{dice=getDice()}catch(error){}if(!dice||typeof dice.roll!=='function'||dice.commitHook!==1)return failure('dice-transaction-unavailable');const serialized=encoded(facts);if(serialized===null)return failure('invalid-healing-context');const roll={token,view:value.view,facts:JSON.parse(serialized),preview,onResult,cancelled:false,committed:false,replied:false};value.view.pending=true;
  try{const returned=dice.roll({dmg:preview.expression,dtype:'Healing'},'',value.view.kind==='spark'?'Divine Spark: healing':value.view.kind==='spell'?value.view.spell.n+': maximized healing':'Supreme Healing: actual '+preview.sourceKind+' outcome',result=>{if(roll.committed&&!roll.cancelled)notify(roll,{...roll.certificate,result})},()=>check(roll),result=>commit(roll,result));if(returned&&typeof returned.then==='function'&&!roll.committed){refuse(roll,'dice-transaction-unavailable');return failure('dice-transaction-unavailable')}}catch(error){if(!roll.committed){refuse(roll,'dice-failed');return failure('dice-failed')}}
  return roll.cancelled?failure('stale-healing-source'):{ok:true,pending:value.view.pending,committed:roll.committed};
 }
 function cancel(token){const view=token&&contexts.get(token);if(!view)return false;view.cancelled=true;view.pending=false;contexts.delete(token);return true}
 return {captureSpell,captureDivineSpark,captureDeclaredHealing,inspect,request,cancel};
}
