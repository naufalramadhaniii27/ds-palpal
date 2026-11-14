import {registerSheetGroup} from './12a-logic-sheet-registry.js';
import {defineLocals} from './12b-logic-sheet-schema.js';
import {arcaneGrimoireResourceBinding,arcaneGrimoireRecoveryProjection,arcaneGrimoireRecoveryOwnFuture} from './10t-logic-arcane-grimoire-recovery.js';
defineLocals({arcaneGrimoirePool:'object'});
registerSheetGroup({id:'arcane-grimoire-resource-binding',group:'arcane-grimoire',phase:'resources',order:79,reads:['i.B','i.parts','C.res','q.slugK'],writes:['l.arcaneGrimoirePool'],run:function(ctx){const binding=arcaneGrimoireResourceBinding(ctx);if(binding)ctx.l.arcaneGrimoirePool=binding;return ctx.patch();}});
registerSheetGroup({id:'arcane-grimoire-recovery-source',group:'arcane-grimoire',phase:'post',order:124,reads:['i.ATT','C.inv','C.res','l.arcaneGrimoirePool'],writes:['C.arcaneGrimoireRecovery'],run:function(ctx){const cap=arcaneGrimoireRecoveryProjection(ctx.C,ctx.i.ATT,ctx.l.arcaneGrimoirePool);if(cap!==undefined||arcaneGrimoireRecoveryOwnFuture())ctx.C.arcaneGrimoireRecovery=cap;return ctx.patch();}});
