import {registerSheetGroup} from './12a-logic-sheet-registry.js';
registerSheetGroup({id:'retained-bag-tricks',group:'bag-tricks',phase:'post',order:87,reads:['q.bagTricks'],writes:['C.bagTricks'],run:function(ctx){const state=ctx.q.bagTricks();if(state!==undefined)ctx.C.bagTricks=state;return ctx.patch()}});
