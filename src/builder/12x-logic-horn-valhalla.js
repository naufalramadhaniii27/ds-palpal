import {registerSheetGroup} from './12a-logic-sheet-registry.js';
registerSheetGroup({id:'retained-horn-valhalla',group:'horn-valhalla',phase:'post',order:88,reads:['q.hornValhalla'],writes:['C.hornValhalla'],run:function(ctx){const state=ctx.q.hornValhalla();if(state!==undefined)ctx.C.hornValhalla=state;return ctx.patch()}});
