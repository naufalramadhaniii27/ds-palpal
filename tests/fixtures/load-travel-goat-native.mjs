/* Actual source provider for isolated native historical-comparison fixtures. */
import{loadTceSpellBonusNative}from'./load-tce-spell-bonus-native.mjs';
import fs from'node:fs';import vm from'node:vm';import*as model from'../../src/data/lib/travel-goat.js';import*as source from'../../src/data/lib/travel-goat-source.js';import*as profile from'../../src/data/lib/travel-goat-profile.js';
const text=fs.readFileSync(new URL('../../src/builder/10r-logic-travel-goat.js',import.meta.url),'utf8'),names=[...text.matchAll(/export function (\w+)/g)].map(m=>m[1]),code=text.replace(/^import [^\n]*\n/gm,'').replace(/export /g,'');
export function loadTravelGoatNative(context){loadTceSpellBonusNative(context);Object.assign(context,model,source,profile);context.lateGet??=key=>context[key];context.fxo??=()=>context.FXO||{};context.gx??=()=>context.GX||{item:{}};vm.runInContext('(function(){'+code+';Object.assign(globalThis,{'+names.join(',')+'})})()',context);}
