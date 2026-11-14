/* A local qualified source composes with native skill flags; it never sets global Advantage. */
const qualifiedFail=reason=>({ok:false,reason}),qualifiedJSON=JSON.stringify;
export function qualifiedSkillMode(flags,sourceAdvantage,sourceLabel){
 if(!Array.isArray(flags)||typeof sourceAdvantage!=='boolean'||typeof sourceLabel!=='string'||!sourceLabel||flags.some(flag=>!flag||!['ADV','DIS','FAIL'].includes(flag.t)||typeof flag.s!=='string'))return qualifiedFail('native-skill-flags-unavailable');
 const adv=flags.filter(flag=>flag.t==='ADV').map(flag=>flag.s),dis=flags.filter(flag=>flag.t==='DIS').map(flag=>flag.s),fail=flags.filter(flag=>flag.t==='FAIL').map(flag=>flag.s);if(sourceAdvantage)adv.push(sourceLabel);
 return fail.length?{ok:false,reason:'automatic-failure',fail}:{ok:true,adv,dis,mode:adv.length&&!dis.length?'adv':dis.length&&!adv.length?'dis':''};
}
export function createQualifiedSkillRollRuntime(host){
 const sessions=new WeakMap(),epochs=new WeakMap();
 function epoch(state){if(!epochs.has(state))epochs.set(state,{});return epochs.get(state)}
 function identity(actor){return qualifiedJSON([actor.C.name,actor.C.cid,actor.C.id])}
 function ready(actor){return !!(actor&&actor.readOnly===false&&actor.C&&actor.S)}
 function capture(root,readOptions){const actor=host.actor();if(!ready(actor)||!host.rootActive(root)||typeof readOptions!=='function')return null;const id=identity(actor),context=host.context();if(!host.sourceReady())return null;const current=host.actor();if(!ready(current)||current.C!==actor.C||current.S!==actor.S||identity(current)!==id||host.context()!==context)return null;const token={};sessions.set(token,{actor,root,id,context,epoch:epoch(actor.S),readOptions,rolling:false,cancelled:false});return token}
 function current(token){const view=sessions.get(token),actor=host.actor();return view&&!view.cancelled&&ready(actor)&&actor.C===view.actor.C&&actor.S===view.actor.S&&identity(actor)===view.id&&epoch(actor.S)===view.epoch&&host.rootActive(view.root)&&host.context()===view.context&&host.sourceReady()?view:null}
 function inspect(token,options){const view=current(token);if(!view)return qualifiedFail('stale-qualified-check');let declared;try{declared=view.readOptions()}catch(error){return qualifiedFail('actual-check-context-required')}if(qualifiedJSON(declared)!==qualifiedJSON(options))return qualifiedFail('changed-check-context');const check=host.inspect(options);return !current(token)?qualifiedFail('stale-qualified-check'):check}
 function rollCurrent(roll){if(roll.completed||roll.cancelled)return false;const view=current(roll.token);if(!view){roll.cancelled=true;roll.view.rolling=false;return false}const check=inspect(roll.token,roll.options);if(!check?.ok||qualifiedJSON(check)!==roll.signature){roll.cancelled=true;view.rolling=false;return false}return true}
 function reply(roll,result){if(!rollCurrent(roll))return;roll.completed=true;roll.view.rolling=false;if(typeof roll.onResult==='function')roll.onResult({ok:true,result,check:roll.check,character:roll.view.actor.C,state:roll.view.actor.S})}
 function request(input){
  const view=current(input?.session);if(!view)return qualifiedFail('stale-qualified-check');if(view.rolling)return qualifiedFail('roll-pending');let options;try{options=structuredClone(input.options)}catch(error){return qualifiedFail('actual-check-context-required')}
  const check=inspect(input.session,options);if(!check?.ok)return check||qualifiedFail('check-unavailable');if(!Number.isFinite(check.total)||!['','adv','dis'].includes(check.mode)||typeof check.label!=='string')return qualifiedFail('native-skill-bonus-unavailable');const dice=host.dice();if(!dice||typeof dice.roll!=='function'||dice.commitHook!==1)return qualifiedFail('dice-transaction-unavailable');
  let spec;try{spec=typeof host.spec==='function'?host.spec(check):{bon:check.total}}catch(error){return qualifiedFail('native-roll-spec-unavailable')}if(!spec||spec.bon!==check.total)return qualifiedFail('native-roll-spec-unavailable');const roll={token:input.session,view,options,check,signature:qualifiedJSON(check),onResult:input.onResult,cancelled:false,completed:false};view.rolling=true;try{dice.roll(spec,check.mode,check.label,result=>reply(roll,result),()=>rollCurrent(roll))}catch(error){view.rolling=false;return qualifiedFail('dice-failed')}return {ok:true,pending:!roll.completed,check};
 }
 function invalidate(state){if(state&&typeof state==='object')epochs.set(state,{})}
 function cancel(token){const view=sessions.get(token);if(view){view.cancelled=true;view.rolling=false}}
 return {capture,current:token=>!!current(token),inspect,request,invalidate,cancel};
}
