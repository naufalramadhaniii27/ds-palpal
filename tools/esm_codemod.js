#!/usr/bin/env node
/* One-time codemod: turns the files of one concatenated closure block into ES modules, keeping the old evaluation order.
   node tools/esm_codemod.js <manifest block index> [--write]
   A file only imports names of EARLIER files (forward edges), so the import graph has no cycle and the files run in manifest order,
   exactly as when they were joined. A name used by an EARLIER file (back edge: used when called, never while loading) goes through a
   small registry object (__R, builder/00-reg.js): the owner file defines a getter and setter on it, the user file reads __R.name.
   - forward use of a name: owner gets `export`, user gets `import {..}`
   - forward assignment from another file: owner exports `__set_N`, the assignment becomes a setter call (imported bindings are read-only)
   - back use: identifier becomes __R.name (assignments work through the setter)
   - load-time check: while a file loads it may call functions and read variables, none of them may belong to a LATER file
   Without --write it only reports. First and last files of the block must be the wrapper files (open and close of the closure). */
const espree=require('./build/node_modules/espree'), es=require('./build/node_modules/eslint-scope');
const fs=require('fs'), path=require('path');
const SRC=path.join(__dirname,'..','src'); const man=JSON.parse(fs.readFileSync(path.join(SRC,'manifest.json'),'utf8')).entries;
const bi=+process.argv[2], WRITE=process.argv.includes('--write'); const e=man[bi];
const files=e.files.filter(f=>f.endsWith('.js')&&!/wrap\.js$/.test(f));
const idx=f=>files.indexOf(f);
const PRE='(function(){'; let text=PRE, spans=[];
files.forEach(f=>{const t=fs.readFileSync(path.join(SRC,f),'utf8'); spans.push({f,a:text.length,b:text.length+t.length,t}); text+=t+'\n';});
text+='})();';
const fileOf=p=>{for(const s of spans) if(p>=s.a&&p<=s.b) return s; return null;};
const ast=espree.parse(text,{ecmaVersion:2022,sourceType:'script',range:true});
(function par(n,p){ if(!n||typeof n!=='object')return; if(typeof n.type==='string')n.parent=p; for(const k in n){ if(k==='parent'||k==='loc'||k==='range')continue; const v=n[k]; if(Array.isArray(v))v.forEach(c=>par(c,n)); else if(v&&typeof v.type==='string')par(v,n);} })(ast,null);
const sm=es.analyze(ast,{ecmaVersion:2022,sourceType:'script'}); const g=sm.globalScope.childScopes[0];
const edits={}, exportsOf={}, importsOf={}, backOf={}, usesReg={};
files.forEach(f=>{edits[f]=[]; exportsOf[f]=new Set(); importsOf[f]={}; backOf[f]=new Set(); usesReg[f]=false;});
const setters={}, problems=[];
const addImp=(f,from,name)=>{ (importsOf[f][from]=importsOf[f][from]||new Set()).add(name); };
g.variables.forEach(v=>{
  if(!v.defs.length) return; const df=fileOf(v.defs[0].name.range[0]).f;
  v.references.forEach(r=>{
    const s=fileOf(r.identifier.range[0]); if(!s||s.f===df) return; const id=r.identifier, p=id.parent, L=s.a;
    if(idx(df)<idx(s.f)){ // forward: import (and a setter for assignments)
      exportsOf[df].add(v.name); addImp(s.f,df,v.name);
      if(r.isWrite()){
        if(p.type==='AssignmentExpression'&&p.left===id){
          setters[v.name]=df; addImp(s.f,df,'__set_'+v.name);
          const rhs=text.slice(p.right.range[0],p.right.range[1]);
          const rep=p.operator==='='?'__set_'+v.name+'('+rhs+')':'__set_'+v.name+'('+v.name+' '+p.operator.slice(0,-1)+' ('+rhs+'))';
          edits[s.f].push({a:p.range[0]-L,b:p.range[1]-L,ins:rep});
        } else if(p.type==='UpdateExpression'&&p.argument===id){
          setters[v.name]=df; addImp(s.f,df,'__set_'+v.name);
          const op=p.operator==='++'?'+':'-';
          const rep=p.prefix?'__set_'+v.name+'('+v.name+op+'1)':'(__set_'+v.name+'('+v.name+op+'1),'+v.name+(op==='+'?'-':'+')+'1)';
          edits[s.f].push({a:p.range[0]-L,b:p.range[1]-L,ins:rep});
        } else problems.push('unsupported write to '+v.name+' in '+s.f+' ('+p.type+')');
      }
    } else { // back: through the registry
      backOf[df].add(v.name); usesReg[s.f]=true;
      if(p.type==='Property'&&p.shorthand&&p.value===id) { if(r.isWrite()) problems.push('shorthand write '+v.name); edits[s.f].push({a:p.range[0]-L,b:p.range[1]-L,ins:v.name+':__R.'+v.name}); }
      else edits[s.f].push({a:id.range[0]-L,b:id.range[1]-L,ins:'__R.'+v.name});
    }
  });
});
// `export` keyword at declarations of forward-used names
g.variables.forEach(v=>{
  if(!v.defs.length) return; const d=v.defs[0], s=fileOf(d.name.range[0]);
  if(!exportsOf[s.f].has(v.name)) return;
  let n=d.node; if(d.type==='Variable') n=d.parent;
  while(n&&n.parent&&n.parent.type!=='BlockStatement'&&n.parent.type!=='Program') n=n.parent;
  if(!n||n.parent.type!=='BlockStatement'||n.parent.parent.type!=='FunctionExpression'||n.parent.parent.parent.type!=='CallExpression'){ problems.push('declaration of '+v.name+' is not at the top of the closure'); return; }
  if(!edits[s.f].some(x=>x.a===n.range[0]-s.a&&x.ins==='export ')) edits[s.f].push({a:n.range[0]-s.a,b:n.range[0]-s.a,ins:'export '});
});
// `this` in a function reached through the registry would change (it becomes __R)
const thisFns=new Set(); g.variables.forEach(v=>{ if(v.defs[0]&&v.defs[0].type==='FunctionName'){ let hit=false; (function w(n){ if(!n||typeof n!=='object'||hit)return; if(n.type==='ThisExpression')hit=true; if(n!==v.defs[0].node&&/^Function/.test(n.type))return; for(const k in n){ if(k==='parent'||k==='loc'||k==='range')continue; const c=n[k]; if(Array.isArray(c))c.forEach(w); else if(c&&typeof c.type==='string')w(c);} })(v.defs[0].node.body); if(hit) thisFns.add(v.name);} });
files.forEach(f=>backOf[f].forEach(n=>{ if(thisFns.has(n)) problems.push('registry function uses this: '+n); }));
// ---- load-time check: while file T loads (top level + functions it calls, transitively) it may use no name of a later file ----
const fnOwner=sc=>{ let cur=sc.variableScope, owner=null;
  while(cur&&cur!==g){ const b=cur.block; const iife=b.parent&&b.parent.type==='CallExpression'&&b.parent.callee===b&&(b.type==='FunctionExpression'||b.type==='ArrowFunctionExpression'); if(!iife) owner=cur; cur=cur.upper&&cur.upper.variableScope; }
  if(!owner) return 'TOP'; const b=owner.block;
  if(b.type==='FunctionDeclaration'&&b.id) return b.id.name;
  if(b.parent&&b.parent.type==='VariableDeclarator'&&b.parent.id.type==='Identifier') return b.parent.id.name;
  return 'NONE'; };
const fileOfName={}; g.variables.forEach(v=>{ if(v.defs.length) fileOfName[v.name]=fileOf(v.defs[0].name.range[0]).f; });
const bodyRefs={}, bodyCalls={}, topRefs={}, topCalls={}; files.forEach(f=>{topRefs[f]=new Set(); topCalls[f]=new Set();});
g.variables.forEach(v=>{ if(!v.defs.length) return; v.references.forEach(r=>{ const s=fileOf(r.identifier.range[0]); if(!s) return; const o=fnOwner(r.from); if(o==='NONE') return;
  const q=r.identifier.parent, isCall=q&&(q.type==='CallExpression'||q.type==='NewExpression')&&q.callee===r.identifier;
  if(o==='TOP'){ topRefs[s.f].add(v.name); if(isCall) topCalls[s.f].add(v.name); } else { (bodyRefs[o]=bodyRefs[o]||new Set()).add(v.name); if(isCall) (bodyCalls[o]=bodyCalls[o]||new Set()).add(v.name); } }); });
let loadBad=0;
files.forEach(T=>{ const seen=new Set(), vars=new Set(topRefs[T]); const stack=[...topCalls[T]];
  while(stack.length){ const f=stack.pop(); if(seen.has(f)) continue; seen.add(f); (bodyRefs[f]||[]).forEach(n=>vars.add(n)); (bodyCalls[f]||[]).forEach(c=>stack.push(c)); }
  vars.forEach(n=>{ const Y=fileOfName[n]; if(Y&&idx(Y)>idx(T)){ loadBad++; problems.push('while loading '+T+' a name of a later file is used: '+n+' ('+Y+')'); } }); });
console.log('files',files.length,'forward exports',files.map(f=>exportsOf[f].size).reduce((a,b)=>a+b),'setters',Object.keys(setters).length,
  'registry names',files.map(f=>backOf[f].size).reduce((a,b)=>a+b),'problems',problems.length);
problems.forEach(p=>console.log(' !',p));
if(!WRITE||problems.length) process.exit(problems.length?1:0);
const base=f=>'./'+path.basename(f); const dir=path.dirname(files[0]);
fs.writeFileSync(path.join(SRC,dir,'00-reg.js'),'/* Registry for names that an earlier file calls in a later file (only at run time, never while loading). The owner file defines each name here. */\nexport var __R={};\n');
files.forEach(f=>{
  const s=spans.find(x=>x.f===f); let t=s.t;
  edits[f].sort((x,y)=>y.a-x.a).forEach(ed=>{ t=t.slice(0,ed.a)+ed.ins+t.slice(ed.b); });
  const st=Object.keys(setters).filter(n=>setters[n]===f).map(n=>'export function __set_'+n+'(v){ return '+n+'=v; }').join('\n');
  const reg=[...backOf[f]].sort().map(n=>'Object.defineProperty(__R,"'+n+'",{get:function(){return '+n+';},set:function(v){'+n+'=v;},configurable:true});').join('\n');
  const imps=Object.keys(importsOf[f]).sort((a,b)=>idx(a)-idx(b)).map(from=>'import {'+[...importsOf[f][from]].sort().join(',')+'} from "'+base(from)+'";');
  if(usesReg[f]||backOf[f].size) imps.push('import {__R} from "./00-reg.js";');
  fs.writeFileSync(path.join(SRC,f),(imps.length?imps.join('\n')+'\n':'')+(reg?reg+'\n':'')+t+(st?'\n'+st+'\n':''));
});
const entry=path.join(dir,'main.js');
fs.writeFileSync(path.join(SRC,entry),'/* Entry of the module block: every file in the order it used to be joined. */\n'+files.map(f=>'import "'+base(f)+'";').join('\n')+'\n');
console.log('wrote',files.length,'files, 00-reg.js and',entry);
