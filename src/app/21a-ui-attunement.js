import {C,S,saveC} from "./04-logic-storage.js";
import {attOn,attActive,attCount,attMaxC,bldGuard,esc,invAt,num,toast,viaBld} from "./05-logic-helpers.js";
import {closeSheet,occOf,renderAll,undoMark} from "./00a-reg-late-ports.js";
import {env} from "./00-env.js";
import {attunementMessage} from "./lib/attunement-message.js";
export function attunementControl(it,index){if(!it.att)return "";const on=attOn(it),reason=it.attuneReason;
 const help=on&&!attActive(it)?attunementMessage({reason:reason,limit:attMaxC()}):on?"Remains attuned when not in use.":"Using an item does not attune you to it.";
 return '<div class="mwsw"><div class="mwsw-t"><b>Attunement</b><small>'+esc(help)+'</small></div><button type="button" role="switch" class="fxsw press'+(on?' on':'')+'" aria-checked="'+on+'" aria-label="Attunement: '+esc(it.n)+'" data-iatts="'+esc(it.key||it.n)+'" data-iix="'+index+'"'+(!on&&num(it.q,1)<=0?' disabled':'')+'><i></i></button></div>'}
document.addEventListener("click",async(e)=>{const button=e.target.closest&&e.target.closest("[data-iatts]");if(!button||button.closest("#bld"))return;e.preventDefault();e.stopPropagation();
 const state=S,name=button.getAttribute("data-iatts"),index=button.getAttribute("data-iix");if(!env.__bldSetAttuned&&env.__bldNeed)await env.__bldNeed();if(S!==state)return;
 const it=invAt(name,index);if(!it)return;const on=!attOn(it);
 if(viaBld(name)){bldGuard(()=>{if(S!==state)return;undoMark(on?"Attune "+it.n:"End attunement: "+it.n);const result=env.__bldSetAttuned(name,C.name,on,occOf(it));if(!result||!result.ok){toast(attunementMessage(result));return}closeSheet()});return}
 if(on&&attCount()>=attMaxC()){toast(attunementMessage({reason:"limit",limit:attMaxC()}));return}
 undoMark("Change attunement");it.attuned=on;delete it.attunedActive;delete it.attuneReason;saveC();renderAll();closeSheet();toast("Attunement recorded. Apply from Build to recalculate magical effects.");
},true);
