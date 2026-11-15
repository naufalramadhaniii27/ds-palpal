/* Seal the single paired-artifact Initiative flag after native inventory. */
import {registerSheetGroup} from './12a-logic-sheet-registry.js';
import {vecnaGraftsSheetProjection,vecnaGraftsProjectionMirror,vecnaGraftsOwnFuture,vecnaGraftSourcesOwnFuture} from './10w-logic-vecna-grafts.js';
registerSheetGroup({id:'vecna-graft-sources',group:'vecna-grafts',phase:'post',order:130,reads:['i.ATT','C.inv','C.itemAdv'],writes:['C.itemAdv','C.vecnaGrafts','C.vecnaGraftSources'],run:function(ctx){const out=vecnaGraftsSheetProjection(ctx.C,ctx.i.ATT),state=vecnaGraftsProjectionMirror();ctx.C.itemAdv=out.flags;if(state!==undefined||vecnaGraftsOwnFuture())ctx.C.vecnaGrafts=state;if(out.capability!==undefined||vecnaGraftSourcesOwnFuture())ctx.C.vecnaGraftSources=out.capability;return ctx.patch();}});
