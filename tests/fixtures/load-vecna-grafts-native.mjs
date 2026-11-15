/* The actual native paired-source adapter; never substitutes attachment or source permission. */
import fs from 'node:fs';
import vm from 'node:vm';
import * as profiles from '../../src/data/lib/vecna-graft-profiles.js';
import * as model from '../../src/data/lib/vecna-grafts.js';
import * as source from '../../src/data/lib/vecna-graft-source.js';
const seen=new WeakSet();
export function loadVecnaGraftsNative(context){
 if(seen.has(context))return;
 Object.assign(context,profiles,model,source);
 context.lateGet??=key=>context[key];context.fxo??=()=>context.FXO||{};context.gx??=()=>context.GX||{item:{}};
 const text=fs.readFileSync(new URL('../../src/builder/10w-logic-vecna-grafts.js',import.meta.url),'utf8'),names=[...text.matchAll(/export function (\w+)/g)].map(match=>match[1]);
 const code=text.replace(/^import [^\n]*\n/gm,'').replace(/^export \{[^\n]*\};?\n?/gm,'').replace(/export /g,'');
 vm.runInContext('(function(){'+code+';Object.assign(globalThis,{'+names.join(',')+'})})()',context);
 seen.add(context);
}
