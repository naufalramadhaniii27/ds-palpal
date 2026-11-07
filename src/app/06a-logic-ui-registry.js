/* UI registries (SOLID stage 3, O and L). One small registry per extension point of the sheet UI. Adding a detail card type, a command word,
   a long-press menu source or a sheet entry type is ONE `X.add(key, entry)` call in the file that owns it. The dispatchers
   (renderDetail, palWords, ctxSpec, entryContent) only look entries up: they never name a kind, so they are not edited.

   CONTRACTS (tests/solid_ui_contract.py checks every registered entry against these, on a loaded sheet):
   DETAIL  key = the type before ":" in a data-info spec ("sp", "it", "g" ...).
           entry { render(key) -> {t:string, h:string}   the card title and body for the part after ":"
                   self?(key) -> string                   the entry's own name, so a name in its own card is not linked to itself }
           render never returns undefined and never throws for a key that does not exist (it answers {t, h:"Not found"-like}).
   ENTRY   key = en.type of a sheet navigation entry ("bd", "cond", "combat" ...). Types that are not registered are info cards (DETAIL).
           entry { content(en) -> {t:string, h:string, m:string}   m is the sheet mode }
   PALWORD key = id of a provider of command words for the Search sheet.
           entry { words() -> [ {k:[string], f() -> {i:string, t:string, s?:string, run?:function, fill?:string}} ]
           a command has run (runs on Enter) or fill (the text put in the box, e.g. "dmg " waits for a number) }
           k lists the words that match, f builds the command row when it matched. Registration order is the match order.
   CTXSRC  key = id of a long-press menu source.
           entry { sel:string, build(el) -> {t:string, L:[[label, icon, fn|null, danger?]], el:Element} | null }
           The first source whose selector matches the pressed target wins, even when build answers null.
   No entry reads window.*: shared page state comes from env (00-env.js). */
import {env} from "./00-env.js";
export function makeRegistry(name, req){
  const map=new Map();
  function check(key, e){
    if(typeof key!=="string"||!key) throw new Error("ui-registry "+name+": key must be a non-empty string");
    if(!e||typeof e!=="object") throw new Error("ui-registry "+name+"/"+key+": entry must be an object");
    Object.keys(req).forEach((f) =>{
      const want=req[f], v=e[f], opt=want.slice(-1)==="?", t=opt?want.slice(0,-1):want;
      if(v===undefined&&opt) return;
      if(t==="function"?typeof v!=="function":t==="array"?!Array.isArray(v):typeof v!==t) throw new Error("ui-registry "+name+"/"+key+": field "+f+" must be a "+t);
    });
  }
  return {
    name:name, req:req,
    add(key, e){ check(key, e); if(map.has(key)) throw new Error("ui-registry "+name+": "+key+" is already registered"); map.set(key, e); return e; },
    get(key){ return map.get(key); },
    keys(){ return Array.from(map.keys()); },
    list(){ return Array.from(map.values()); }
  };
}
export const DETAIL=makeRegistry("detail", {render:"function", self:"function?"});
export const ENTRY=makeRegistry("entry", {content:"function"});
export const PALWORD=makeRegistry("palword", {words:"function"});
export const CTXSRC=makeRegistry("ctxsrc", {sel:"string", build:"function"});
env.__uiReg={detail:DETAIL, entry:ENTRY, palword:PALWORD, ctxsrc:CTXSRC};/* read by tests/solid_ui_contract.py */
