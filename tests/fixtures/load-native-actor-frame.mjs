/* Actual native actor frame and cached/live math review dependencies. */
import fs from'node:fs';import vm from'node:vm';
import{ iounCharacterMathStatus as cachedCharacterMathStatus }from'../../src/data/lib/ioun-orbit-source.js';
import{canonical}from'../../src/data/lib/vecna-graft-profiles.js';
export function loadNativeActorFrame(context){if(!vm.isContext(context))vm.createContext(context);Object.assign(context,{cachedCharacterMathStatus,canonical});const source=fs.readFileSync(new URL('../../src/app/lib/native-actor-frame.js',import.meta.url),'utf8'),names=[...source.matchAll(/export function (\w+)/g)].map(m=>m[1]),plain=source.replace(/^import [^\n]*\n/gm,'').replace(/^export /gm,'');vm.runInContext('(function(){'+plain+';Object.assign(globalThis,{'+names.join(',')+'})})()',context);context.iounCharacterMathStatus=context.nativeCharacterMathStatus;return context;}
