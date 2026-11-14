import {registerSheetGroup} from './12a-logic-sheet-registry.js';
registerSheetGroup({id:'retained-magic-ropes',group:'magic-ropes',phase:'post',order:100,reads:['q.magicRopes'],writes:['C.magicRopes'],run:function(ctx){const state=ctx.q.magicRopes();if(state!==undefined)ctx.C.magicRopes=state;return ctx.patch()}});
