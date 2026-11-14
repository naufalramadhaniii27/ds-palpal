/* Actual source adapter dependencies; unavailable casting queries stay unavailable. */
import fs from 'node:fs';import vm from 'node:vm';
import *as model from '../../src/data/lib/rod-absorption.js';
import *as source from '../../src/data/lib/rod-absorption-source.js';
const text=fs.readFileSync(new URL('../../src/builder/10q-logic-rod-absorption.js',import.meta.url),'utf8'),names=[...text.matchAll(/export function (\w+)/g)].map(m=>m[1]),code=text.replace(/^import [^\n]*\n/gm,'').replace(/export /g,'');
export function loadRodAbsorptionNative(context){Object.assign(context,model,source);context.QRY=context.QRY||{};vm.runInContext('(function(){'+code+';Object.assign(globalThis,{'+names.join(',')+'})})()',context);}
