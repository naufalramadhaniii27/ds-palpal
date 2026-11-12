/* Prepared native spell costs; the physical service owns the single Undo/install boundary. */
const gemPaymentFailure=reason=>({ok:false,reason});
const gemPaymentJSON=value=>JSON.stringify(value);
export function createGemNativePayment(ports){
 const prepared=new WeakMap();
 function snapshot(actor,row){return gemPaymentJSON({identity:[actor.C.name,actor.C.cid,actor.C.id],row,resources:ports.resources(actor),used:actor.S.used,context:ports.context(actor)})}
 function prepare(actor,request,material){const row=ports.sourceRow(actor,request);if(!row||!ports.sourceAvailable(actor,row,request))return gemPaymentFailure('actual-casting-source-required');const options=ports.options(actor,row),choice=options.find(option=>option.key===request.paymentKey&&option.level===request.castLevel);if(!choice||!choice.available)return gemPaymentFailure('native-payment-unavailable');const components=ports.components(actor,row,request.declarations,material);if(!components||!components.ok)return components||gemPaymentFailure('native-components-unavailable');const token={};prepared.set(token,{actor,row,request:structuredClone(request),choice:structuredClone(choice),components,signature:snapshot(actor,row)});return {ok:true,payment:token}}
 function current(token,bound){const proof=prepared.get(token),actor=bound||ports.actor();return !!(proof&&actor&&actor.C===proof.actor.C&&actor.S===proof.actor.S&&ports.sourceRow(actor,proof.request)===proof.row&&snapshot(actor,proof.row)===proof.signature&&ports.componentsCurrent(proof.components,actor))}
 function plan(token,bound,material){const proof=prepared.get(token);if(!proof||!current(token,bound))return gemPaymentFailure('stale-native-payment');return ports.plan({...bound,request:proof.request,row:proof.row,choice:proof.choice,components:proof.components,material})}
 return {prepare,current,canCast:current,plan,describe(token){const proof=prepared.get(token);return proof?{spell:proof.row.n,level:proof.request.castLevel,components:structuredClone(proof.components)}:null}};
}
