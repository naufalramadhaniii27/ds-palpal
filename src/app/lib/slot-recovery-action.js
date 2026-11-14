/* An item recovery activation is an action, not a spellcasting permission. */
export function slotRecoveryCanAct(state){return !!state&&!['Incapacitated','Stunned','Paralyzed','Petrified','Unconscious'].some(name=>state.cond&&state.cond[name])}
export function slotRecoveryActionAllowed(state,profile,declarations){
 if(!state||!profile||!declarations||declarations.actionTaken!==profile.activation)return {ok:false,reason:'actual-native-action-required'};
 if(!slotRecoveryCanAct(state))return {ok:false,reason:'action-condition'};
 const field=profile.presence==='on-person'?'onPerson':profile.presence;
 if(declarations[field]!==true)return {ok:false,reason:'native-presence-required'};
 return {ok:true};
}
