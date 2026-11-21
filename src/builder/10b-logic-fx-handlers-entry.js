import {registerFxHandler,chPick,ABFULL} from "./10a-logic-fx-registry.js";
/* Entry handlers (registry "entry", contract in 10a). ctx = {src:{kind,owner,lv,pre,okey,alias,ocls,bk}, ch:(the pick map, read only), fxT:(toggle state map)}.
   gate and prepare handlers get the raw source entry e, post handlers get the built entry o. One handler per field group. */
/* l: the entry counts from this level (class level for cls and sub entries, character level for the rest) */
registerFxHandler("entry",{id:"gate-level",group:"gate",phase:"gate",fields:["l"],uses:["src"],run:function(e,ctx){return e.l&&ctx.src.lv<e.l?{skip:true}:null}});
registerFxHandler("entry",{id:"gate-level-max",group:"gate",phase:"gate",fields:["lMax"],uses:["src"],run:function(e,ctx){return e.lMax&&ctx.src.lv>e.lMax?{skip:true}:null}});
/* ed:"2024": the entry is for a 2024 build only (a feature the 2014 class table does not have, or reads differently). A 2014 build drops it, toggle row included (zero miss 3) */
registerFxHandler("entry",{id:"gate-edition",group:"gate",phase:"gate",fields:["ed"],uses:["rs"],run:function(e,ctx){return (e.ed==="2024"&&ctx.rs==="2014")||(e.ed==="2014"&&ctx.rs!=="2014")?{skip:true}:null}});
/* forCls [class]: the entry counts only under these owner classes (ctx.src.ocls). For a subclass name two books share under different classes (Reanimator: tvss Necromancer, rhw Artificer) */
registerFxHandler("entry",{id:"gate-class",group:"gate",phase:"gate",fields:["forCls"],uses:["src"],run:function(e,ctx){return e.forCls&&e.forCls.indexOf(ctx.src.ocls)<0?{skip:true}:null}});
/* fromBk [book id]: the entry counts only when its item or feat record came from one of these books (ctx.src.bk, the WXI key or the feat hb mapped to the id). For a name two books share (Star Metal Ring: tghg, tgh14p) */
registerFxHandler("entry",{id:"gate-book",group:"gate",phase:"gate",fields:["fromBk"],uses:["src"],run:function(e,ctx){return e.fromBk&&e.fromBk.indexOf(ctx.src.bk)<0?{skip:true}:null}});
/* when {key,val,any}: only while the pick named in key holds val */
registerFxHandler("entry",{id:"gate-when",group:"gate",phase:"gate",fields:["when"],uses:["ch", "src"],run:function(e,ctx){if(!e.when)return null;const s=ctx.src,ok=function(w){const v=chPick(ctx.ch,w.key,s.pre,s.kind,s.okey,w.any),a=Array.isArray(v)?v:(v?[v]:[]);return a.indexOf(w.val)>=0&&(!w.and||ok(w.and))};return ok(e.when)?null:{skip:true}}});/* when.and: a second pick that must also hold (Fiend Stage 4 Abyssal Resistance) */
/* spCls "@asi" / "@abpick": the source names the ability, the entry gets the "@sub:AB" form (src.alias is {"@asi":"@sub:CHA",...}) */
registerFxHandler("entry",{id:"spcls-alias",group:"spellcasting",phase:"prepare",fields:["spCls"],uses:["src"],run:function(e,ctx){const al=ctx.src.alias;return e.spCls&&al&&Object.prototype.hasOwnProperty.call(al,e.spCls)?{set:{spCls:al[e.spCls]}}:null}});
/* abPick {k,from:[ab],up,max,set}: gets its own pick (one ability from the list) unless the entry already has a pick with that k */
registerFxHandler("entry",{id:"abpick-pick",group:"abilityScores",phase:"prepare",fields:["abPick","pick"],uses:[],run:function(e,ctx){const ap=e.abPick;if(!(ap&&ap.from&&!(e.pick||[]).some((q) =>{return q.k===ap.k})))return null;
 return {set:{pick:(e.pick||[]).concat([{k:ap.k,t:"multi",n:ap.n||1,title:ap.title||"Ability score",list:ap.from.map((k) =>{return [ABFULL[k]||k,""]})}])}}}});
/* toggle {id,label,default}: the effect counts only while the state is on. Off: only the keys in TGKEEP stay (so picks and the toggle list still work) */
export const TGKEEP=["n","l","lMax","when","pick","pickLv","toggle","abPick","kind","owner","lv","pre","okey","idx","lbl","ocls"];
registerFxHandler("entry",{id:"toggle",group:"toggle",phase:"post",fields:["toggle"],uses:["fxT"],eKeys:["*"],run:function(o,ctx){if(!o.toggle)return null;const st=ctx.fxT[o.toggle.id],on=st==null?!!o.toggle.default:!!st;
 if(on)return {replace:Object.assign({},o,{tgOn:on})};const k={off:1,tgOn:false};TGKEEP.forEach((f) =>{if(o[f]!==undefined)k[f]=o[f]});return {replace:k}}});
