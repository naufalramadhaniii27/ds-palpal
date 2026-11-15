/* Seal after native inventory and all other item flags. */
import {registerSheetGroup} from './12a-logic-sheet-registry.js';
import {perceptionItemsProjection,perceptionItemsOwnFuture} from './10u-logic-perception-items.js';
registerSheetGroup({id:'perception-item-sources',group:'perception-items',phase:'post',order:126,reads:['i.ATT','i.AFX','C.inv','C.itemAdv'],writes:['C.itemAdv','C.perceptionItemSources'],run:function(ctx){const result=perceptionItemsProjection(ctx.C,ctx.i.ATT,ctx.i.AFX);ctx.C.itemAdv=result.flags;if(result.capability!==undefined||perceptionItemsOwnFuture())ctx.C.perceptionItemSources=result.capability;return ctx.patch();}});
