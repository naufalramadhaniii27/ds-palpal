/* Opaque prepared actual-slot costs. The physical service owns Undo and installation. */
const storedPaymentFail=reason=>({ok:false,reason});
export function createStoredSpellPayment(ports){
 const tokens=new WeakMap();
 const signature=actor=>JSON.stringify({identity:[actor.C.name,actor.C.cid,actor.C.id],context:ports.context(actor),used:actor.S.used});
 function prepare(actor,request){const source=ports.source(actor,request);if(!source||!source.ok)return source||storedPaymentFail('actual-casting-source-required');if(!source.actualSlotPaid||!Number.isSafeInteger(source.slotLevel)||source.slotLevel<1)return storedPaymentFail('actual-slot-proof-required');const token={};tokens.set(token,{actor,request:structuredClone(request),source,signature:signature(actor)});return {ok:true,payment:token}}
 function current(token,bound){const proof=tokens.get(token),actor=bound||ports.actor();if(!proof||!actor||actor.C!==proof.actor.C||actor.S!==proof.actor.S||signature(actor)!==proof.signature)return false;const fresh=ports.source(actor,proof.request);return !!fresh&&fresh.ok&&JSON.stringify(fresh)===JSON.stringify(proof.source)}
 function plan(token,bound){const proof=tokens.get(token);if(!proof||!current(token,bound))return storedPaymentFail('stale-native-payment');return ports.plan({...bound,request:proof.request,source:proof.source})}
 return {prepare,current,plan};
}
