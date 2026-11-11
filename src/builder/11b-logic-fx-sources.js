import {B} from "./04-logic-storage.js";
import {activeFx,bgX,un} from "./03-logic-magic-item-effects.js";
import {allFeats} from "./09-logic-feats-and-choices.js";
import {clsParts} from "./11-logic-derivation.js";
import {registerFxSource} from "./10a-logic-fx-registry.js";
/* Effect sources (SOLID stage 1). One source per place that holds effect entries. collect(ctx) returns descriptors
   {list, kind, owner, lv, pre, lblOf, okey, ocls, alias} (see 10a). ctx = {TL: character level, G: the GX registry, noItem}.
   A new source is one registerFxSource() call here, the gfx() loop is not touched. Run order = order of the calls below (class and subclass, species, background, feats, items). */
/* CLASSES[cls].fx and GX.cls[cls] at the class level; GX.sub[sub] at the same level. A multiclass part gets the key prefix "m<i>:" */
registerFxSource({id:"class",items:false,collect:function(ctx){const out=[],G=ctx.G;let mi=0;clsParts().forEach((q) =>{const pre=q.mc?"m"+(mi++)+":":"",c=CLASSES[q.cls];
 out.push({list:((c&&c.fx)||[]).concat((G.cls&&G.cls[q.cls])||[]),kind:"cls",owner:q.cls,lv:q.lv,pre:pre,lblOf:(n) =>{return n+" ("+q.cls+" "+q.lv+")"},okey:undefined,ocls:q.cls});
 if(q.sub)out.push({list:((G.sub&&G.sub[q.sub])||[]),kind:"sub",owner:q.sub,lv:q.lv,pre:pre,lblOf:(n) =>{return n+" ("+q.sub+" "+q.lv+")"},okey:undefined,ocls:q.cls})});return out}});
registerFxSource({id:"species",items:false,collect:function(ctx){const sp=un("species")?null:SPECIES[B.species];if(!sp)return [];
 return [{list:(sp.gx||[]).concat((ctx.G.species&&ctx.G.species[B.species])||[]),kind:"species",owner:B.species,lv:ctx.TL,pre:"",lblOf:(n) =>{return n+" ("+B.species+")"}}]}});
registerFxSource({id:"background",items:false,collect:function(ctx){const bg=bgX();if(!bg)return [];
 return [{list:(bg.gx||[]).concat((ctx.G.bg&&ctx.G.bg[B.bg])||[]),kind:"bg",owner:B.bg,lv:ctx.TL,pre:"",lblOf:(n) =>{return n+" ("+B.bg+" background)"}}]}});
/* spCls "@asi": the ability the feat raised. "@abpick": the ability picked with pick k "ab" */
registerFxSource({id:"feats",items:false,collect:function(ctx){const G=ctx.G,out=[];allFeats().forEach((f) =>{const F=FEATS[f.n],fok=f.key||f.s,fab=(f.asi&&f.asi.a1)||"CHA",fpa=(B.ch["gx-ab-feat-"+fok]||[])[0]||"INT";
 out.push({list:((F&&F.gx)||[]).concat((G.feat&&G.feat[f.n])||[]),kind:"feat",owner:f.n,lv:ctx.TL,pre:"",lblOf:(n) =>{return n+" ("+f.n+" feat)"},okey:f.key||f.s,alias:{"@asi":"@sub:"+fab,"@abpick":"@sub:"+fpa}})});return out}});
/* equipped (and attuned when needed) magic items: row gx and GX.item[name] */
registerFxSource({id:"items",items:true,collect:function(ctx){const G=ctx.G;return activeFx().map((q) =>{
 return {list:(q.gx||[]).concat((G.item&&(G.item[q.n]||G.item[q.mi]))||[]).filter((e) =>!e.consume&&!e.retain),kind:"item",owner:q.n,lv:ctx.TL,pre:"",lblOf:(n) =>{return (n===q.n?n:n+" ("+q.n+")")+" (magic item"+(q.att?", attuned":"")+")"},alias:{"@abpick":"@sub:"+((B.ch["gx-ab-item-"+q.n]||[])[0]||"INT")}}})}});

/* Consumable effects have a lifetime independent of their inventory row. Available
   while stock remains, active until explicitly ended. S.fxT remains a boolean map.
   Multiple bottles never multiply an effect. Expiry is tracked by the player. */
registerFxSource({id:"consumables",items:true,collect:function(ctx){const out=[];
 Object.keys(ctx.G.item||{}).forEach((n) =>{const list=ctx.G.item[n].filter((e) =>e.consume&&e.toggle&&((ctx.fxT||{})[e.toggle.id]===true||(B.inv||[]).some((it) =>it.n===n&&+it.q>0)));
  if(list.length)out.push({list:list,kind:"item",owner:n,lv:ctx.TL,pre:"",lblOf:(name) =>name+" (consumed item)"})});return out}});

/* Learned upgrades remain after their training item leaves inventory. The
   existing boolean state records the player's decision that training occurred. */
registerFxSource({id:"retained-item-grants",items:true,collect:function(ctx){const out=[];
 Object.keys(ctx.G.item||{}).forEach((n) =>{const list=ctx.G.item[n].filter((e) =>e.retain&&e.toggle&&((ctx.fxT||{})[e.toggle.id]===true||(B.inv||[]).some((it) =>it.n===n&&+it.q>0)));
  if(list.length)out.push({list:list,kind:"item",owner:n,lv:ctx.TL,pre:"",lblOf:(name) =>name+" (learned upgrade)"})});return out}});
