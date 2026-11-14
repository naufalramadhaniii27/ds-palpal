import {registerSheetGroup} from './12a-logic-sheet-registry.js';
registerSheetGroup({id:'retained-bird-token',group:'bird-token',phase:'post',order:100,reads:['q.birdToken'],writes:['C.birdToken'],run:function(ctx){const state=ctx.q.birdToken();if(state!==undefined)ctx.C.birdToken=state;return ctx.patch()}});
