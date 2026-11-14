import {registerSheetGroup} from './12a-logic-sheet-registry.js';
registerSheetGroup({id:'retained-necronomicon-reading',group:'necronomicon-reading',phase:'post',order:85,reads:['q.necronomiconReading'],writes:['C.necronomiconReading'],run:function(ctx){const state=ctx.q.necronomiconReading();if(state!==undefined)ctx.C.necronomiconReading=state;return ctx.patch()}});
