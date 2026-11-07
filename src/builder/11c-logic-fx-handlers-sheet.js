import {registerFxHandler} from "./10a-logic-fx-registry.js";
/* Sheet handlers (registry "sheet", contract in 10a), the groups moved out of toSheet() in SOLID stage 1.
   ctx = {ok:function(e) (the armor and shield condition of the entry, "cond"), val:function(value,e) (engine value rule),
          spd:number (Speed so far), dark:{vision,src} (Darkvision so far, vision may be undefined)}. toSheet() applies the patches. */
/* speed [[class level, feet]], speedAdd (value rule), speedSet (Speed is at least this) */
registerFxHandler("sheet",{id:"speed-add",group:"speed",phase:"speed",fields:["cond","speed","speedAdd","speedSet","lv","lbl"],uses:["ok", "spd", "val"],eKeys:["min"],run:function(e,ctx){if(!ctx.ok(e))return null;let v=0,spd=ctx.spd,src="";
 (e.speed||[]).forEach((r) =>{if(e.lv>=r[0])v=r[1]});if(e.speedAdd!=null)v+=ctx.val(e.speedAdd,e);
 if(v){spd+=v;src+=", "+(v>0?"+":"")+v+" "+e.lbl}
 if(e.speedSet&&spd<e.speedSet){spd=e.speedSet;src+=", set to "+e.speedSet+" "+e.lbl}
 return src?{spd:spd,srcAdd:src}:null}});
/* fx batch H: speedMul = Speed multiplied (Nosferatu: doubled). After the additions and the armor cut */
registerFxHandler("sheet",{id:"speed-mul",group:"speed",phase:"speed-mul",fields:["cond","speedMul","lbl"],uses:["ok", "spd"],run:function(e,ctx){if(!e.speedMul||!ctx.ok(e)||!ctx.spd)return null;return {spd:Math.floor(ctx.spd*e.speedMul),srcAdd:", ×"+e.speedMul+" "+e.lbl}}});
/* darkAdd: more feet on top. darkTo: raised to that range. darkNone N: only when you have none yet. darkHave {add:N} or {to:N}: when you already have it (the check uses the value before this entry) */
registerFxHandler("sheet",{id:"darkvision",group:"senses",phase:"darkvision",fields:["darkAdd","darkTo","darkNone","darkHave","lbl"],uses:["dark"],run:function(e,ctx){
 if(!(e.darkAdd||e.darkTo||e.darkNone||e.darkHave))return null;
 let vis=ctx.dark.vision,src=ctx.dark.src,touched=false;const had=vis||0;
 if(e.darkAdd){vis=(vis||0)+e.darkAdd;src=(src?src+", +"+e.darkAdd+" ":"")+e.lbl;touched=true}
 if(e.darkTo&&(vis||0)<e.darkTo){vis=e.darkTo;src=e.lbl;touched=true}
 if(e.darkNone&&!had){vis=e.darkNone;src=e.lbl;touched=true}
 if(e.darkHave&&had){if(e.darkHave.add){vis=had+e.darkHave.add;src=(src?src+", +"+e.darkHave.add+" ":"")+e.lbl;touched=true}else if(e.darkHave.to&&had<e.darkHave.to){vis=e.darkHave.to;src=e.lbl;touched=true}}
 return touched?{dark:{vision:vis,src:src}}:null}});
/* init: number or ability key (value rule). The bonus joins the initiative list */
registerFxHandler("sheet",{id:"init-bonus",group:"initiative",phase:"init",fields:["init","cond","lbl"],uses:["ok", "val"],eKeys:["min"],run:function(e,ctx){if(e.init==null||(e.cond&&!ctx.ok(e)))return null;const iv=ctx.val(e.init,e);return iv?{initBonus:[{s:e.lbl,v:iv}]}:null}});
