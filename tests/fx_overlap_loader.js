/* Loads the fx data files (argv[2] = JSON list of paths, manifest order) into one vm context and reports, per kind and name,
   which file added or changed it. Used by tests/fx_overlap.py. No browser needed. */
const vm=require('vm'),fs=require('fs');
const files=JSON.parse(process.argv[2]);
const ctx={console:{log(){},warn(){},error(){}}};ctx.window=ctx;ctx.self=ctx;vm.createContext(ctx);
const out={errors:{},owners:{},detail:{},loc:{}};
/* source lines: remember where each pushed entry object and each FXO key was created (outermost stack frame inside the fx file) */
const LOC=new WeakMap(),FXL={};let curFile='';
function where(){const st=(new Error().stack||'').split('\n');const F=[];for(const l of st){const m=l.match(/(\/[^\s():]*fx-[^\/:]*\.js):(\d+):\d+/);if(m)F.push([m[1],+m[2]])}
 if(!F.length)return null;let o=F[F.length-1];if(F.length>1){const t=(SRCL[o[0]]||[])[o[1]-1]||'';if(/^\s*\}\)/.test(t))o=F[F.length-2]}return o[1]}
const SRCL={};
vm.runInContext('(function(rec){var op=Array.prototype.push;Array.prototype.push=function(){for(var i=0;i<arguments.length;i++){var a=arguments[i];if(a&&typeof a==="object"&&!Array.isArray(a))rec(a)}return op.apply(this,arguments)}})',ctx)(function(a){if(!LOC.has(a))LOC.set(a,where())});
ctx.FXO=new Proxy({},{set(t,k,v){FXL[k]=where();t[k]=v;return true}});
function snap(){const s={};const G=ctx.GX||{};
 for(const k of Object.keys(G)){const o=G[k];s['GX.'+k]={};if(o&&typeof o==='object')for(const n of Object.keys(o))s['GX.'+k][n]=JSON.stringify(o[n])}
 s['FXO']={};const F=ctx.FXO||{};for(const n of Object.keys(F))s['FXO'][n]=JSON.stringify(F[n]);
 return s}
let prev=snap();
for(const f of files){
 SRCL[f]=fs.readFileSync(f,'utf8').split('\n');
 const base=f.split('/').pop();
 try{vm.runInContext(fs.readFileSync(f,'utf8'),ctx,{filename:f})}catch(e){out.errors[base]=String(e).slice(0,200)}
 const cur=snap();
 for(const kind of Object.keys(cur)){
  const pk=prev[kind]||{};
  for(const n of Object.keys(cur[kind])){
   const was=pk[n],now=cur[kind][n];
   if(was===now)continue;
   const key=kind+'|'+n;
   let added;
   if(kind==='FXO')added=[JSON.parse(now)];
   else{const a=was==null?[]:JSON.parse(was),b=JSON.parse(now);added=b.length>a.length?b.slice(a.length):b}
   {let lines=[];if(kind==='FXO')lines=[FXL[n]];else{const parts=kind.split('.');const arr=ctx.GX[parts[1]][n];const from=arr.length-added.length;for(let i=from;i<arr.length;i++)lines.push(LOC.get(arr[i])||null)}
    (out.loc[key]=out.loc[key]||{})[base]=lines}
   (out.owners[key]=out.owners[key]||[]);
   if(out.owners[key].indexOf(base)<0)out.owners[key].push(base);
   (out.detail[key]=out.detail[key]||{})[base]=added;
  }
 }
 prev=cur;
}
console.log(JSON.stringify(out));
