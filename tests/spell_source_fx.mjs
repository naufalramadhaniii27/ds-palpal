import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
const file=fs.readFileSync(new URL('../src/fx/16-z-pack-dice-sound-hover.js',import.meta.url),'utf8');const pack=fs.readFileSync(new URL('../src/fx/18-m-pack-rolls-concentration.js',import.meta.url),'utf8');const continuation=fs.readFileSync(new URL('../src/fx/16b-z-pack-dice-sound-hover-2.js',import.meta.url),'utf8');
let count=0;const eq=(a,b)=>{assert.deepEqual(a,b);count++};
const c={FXS16A:{decorateAttack:(el,spec)=>spec},FXS18A:{},FXENV:{},console,Date,isFinite,parseInt,d:()=>10,esc:String,st:()=>({C:{name:'Actor'}}),navigator:{}};const listeners=[];c.addEventListener=(name,callback)=>listeners.push(callback);vm.createContext(c);
function assignment(name,source=file){const start=source.indexOf('  '+name+'=');assert.ok(start>=0,'actual '+name);const end=source.indexOf('\n})();',start);assert.ok(end>start);vm.runInContext(source.slice(start,end),c)}
assignment('FXS16A.defenderSpec',continuation);assignment('FXS16A.iounCheckSpec',continuation);assignment('FXS16A.sourceSpec',continuation);assignment('FXS16A.rollSpec');assignment('FXS18A.kindOf',pack);
let valid=true,seen=[];c.FXENV.__spellSourceGuard=(key,bonus)=>{seen.push({key,bonus});return ()=>valid};
for(const key of ['spatk-source-Artificer','spatk-source-%40mi%3Ami1','spatk-source-%40species']){const spec=c.FXS16A.rollSpec(key,null,'+7');eq(spec.bon,7);eq(typeof spec.sourceGuard,'function');eq(spec.sourceGuard(),true);eq(c.FXS18A.kindOf(key),'atk')}
for(const key of ['spatk','spatk-INT','spatk-CHA']){const spec=c.FXS16A.rollSpec(key,null,'+6');eq(spec.bon,6);eq(spec.sourceGuard,undefined);eq(c.FXS18A.kindOf(key),'atk')}
eq(seen.length,3);eq(seen[1].bonus,7);
assignment('FXS16A.barAllowed',continuation);assignment('FXS16A.rollDice');assignment('FXS16A.rollAllowed');
const begin=file.indexOf('  FXS16A.doRoll=function'),end=file.indexOf('  (FXENV.__miRoll=',begin);vm.runInContext(file.slice(begin,end),c);
assignment('FXS16A.rollGo');let logged=0,finished=0;c.FXS16A.calm=()=>false;c.FXS16A.finish=(spec,mode,label,values)=>{finished++;return {l:label,v:values[0]+spec.bon,d:'d20',k:'roll'}};c.FXS16A.after=()=>logged++;
function bar(guard){const result={innerHTML:'',animate(){}};return {isConnected:true,closest:()=>({classList:{contains:()=>true}}),__spec:{bon:7,...(guard?{sourceGuard:guard}:{})},__lab:'Artificer',querySelector:()=>result,result}}
function click(w){const button={closest:()=>w,getAttribute:()=>''};return {target:{closest:()=>button},preventDefault(){},stopPropagation(){}}}
for(const guard of [()=>false,()=>{throw Error('stale')}]){const w=bar(guard);eq(c.FXS16A.barAllowed(w),false);const old=logged;c.FXS16A.rollGo(click(w));eq(logged,old);eq(w.result.__r,undefined)}
{const w=bar(()=>true);c.FXS16A.rollGo(click(w));eq(w.result.__r.v,17);eq(w.__busy,0)}
{const w=bar();c.FXS16A.rollGo(click(w));eq(w.result.__r.v,17)}
// Actual async engine must discard a source invalidated before 3D settles, before history/callback.
{let release;c.FXENV.__dice3d={roll:()=>new Promise(resolve=>release=resolve)};valid=true;const w=bar(()=>valid),old=logged;c.FXS16A.rollGo(click(w));valid=false;release([10]);await Promise.resolve();eq(logged,old);eq(w.result.__r,undefined);delete c.FXENV.__dice3d}
// Execute the actual hand-entered roll event listener, including its ownership check.
assignment('FXS16A.handResult',continuation);
const manual=file.indexOf('  addEventListener("click",(e) =>{ const b=e.target.closest&&e.target.closest("[data-mrself],[data-mrok]")');assert.ok(manual>=0);const manualEnd=file.indexOf('\n})();',manual);vm.runInContext(file.slice(manual,manualEnd),c);const handler=listeners.at(-1);
for(const allowed of [false,true]){const w=bar(()=>allowed),input={value:'10'},result=w.result;result.querySelector=()=>input;const button={closest:()=>w,hasAttribute:()=>false},event={target:{closest:()=>button},preventDefault(){},stopPropagation(){}};const before=logged;handler(event);eq(logged-before,allowed?1:0);eq(!!result.__r,allowed)}
// Unknown/unavailable source factories must fail closed; legacy bars retain their old behavior.
for(const factory of [undefined,()=>null,()=>{throw Error('factory')}]){c.FXENV.__spellSourceGuard=factory;const spec=c.FXS16A.rollSpec('spatk-source-Artificer',null,'+7');eq(spec.sourceGuard(),false)}
for(const mutate of [w=>w.isConnected=false,w=>w.closest=()=>null,w=>w.closest=()=>({classList:{contains:()=>false}}),w=>w.closest=()=>{throw Error('root')}]){const w=bar(()=>true);mutate(w);const old=logged;c.FXS16A.rollGo(click(w));eq(logged,old);eq(w.result.__r,undefined);eq(w.__busy,0)}
// A connected DOM node under a closed sheet cannot open manual entry or record a hand roll.
for(const enter of [false,true]){const w=bar(()=>true);w.closest=()=>({classList:{contains:()=>false}});const button={closest:()=>w,hasAttribute:()=>enter};handler({target:{closest:()=>button},preventDefault(){},stopPropagation(){}});eq(w.result.innerHTML,'');eq(w.result.__r,undefined)}
// Closure while 3D resolves or rejects must not append history or invoke bar callback.
for(const reject of [false,true]){let resolve,fail;c.FXENV.__dice3d={roll:()=>new Promise((yes,no)=>{resolve=yes;fail=no})};const w=bar(()=>true),old=logged;c.FXS16A.rollGo(click(w));w.closest=()=>({classList:{contains:()=>false}});reject?fail(Error('3D')):resolve([10]);await Promise.resolve();eq(logged,old);eq(w.result.__r,undefined);eq(w.__busy,0);delete c.FXENV.__dice3d}
// Manual path revalidates immediately before logging, even after result finalization.
{const w=bar(()=>true),input={value:'10'};w.result.querySelector=()=>input;const original=c.FXS16A.finish;c.FXS16A.finish=(...args)=>{w.isConnected=false;return original(...args)};const old=logged;handler({target:{closest:()=>({closest:()=>w,hasAttribute:()=>false})},preventDefault(){},stopPropagation(){}});eq(logged,old);eq(w.result.__r,undefined);c.FXS16A.finish=original}
// Temporary attack hit and damage bars share the native pre-history guard.
for(const key of ['ah-0','ad-0']){
 c.FXENV.__temporaryAttackGuard=()=>undefined;let spec=c.FXS16A.rollSpec(key,null,key.startsWith('ah')?'+7':'1d6');eq(spec.sourceGuard,undefined);
 c.FXENV.__temporaryAttackGuard=()=>false;spec=c.FXS16A.rollSpec(key,null,key.startsWith('ah')?'+7':'1d6');eq(spec.sourceGuard(),false);
 c.FXENV.__temporaryAttackGuard=()=>()=>valid;valid=true;spec=c.FXS16A.rollSpec(key,null,key.startsWith('ah')?'+7':'1d6');eq(spec.sourceGuard(),true);valid=false;eq(spec.sourceGuard(),false);
 c.FXENV.__temporaryAttackGuard=()=>{throw Error('unavailable')};spec=c.FXS16A.rollSpec(key,null,key.startsWith('ah')?'+7':'1d6');eq(spec.sourceGuard(),false);
}
delete c.FXENV.__temporaryAttackGuard;
console.log(count+' actual source-specific FX checks PASS');
