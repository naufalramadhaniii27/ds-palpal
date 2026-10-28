// Unit test of the Access JWT check in functions/api/[[path]].js:  node tests/api_jwt.mjs
import { readFileSync, writeFileSync, mkdtempSync } from "fs"; import { join, dirname } from "path"; import { tmpdir } from "os"; import { fileURLToPath } from "url";
const src = join(dirname(fileURLToPath(import.meta.url)), "..", "functions", "api", "[[path]].js"), tmp = join(mkdtempSync(join(tmpdir(), "jwt-")), "api.mjs"); writeFileSync(tmp, readFileSync(src));
const { onRequest } = await import(tmp);
const team="team1", aud="AUD123";
const kp = await crypto.subtle.generateKey({name:"RSASSA-PKCS1-v1_5",modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"},true,["sign","verify"]);
const jwk = await crypto.subtle.exportKey("jwk",kp.publicKey); jwk.kid="k1";
globalThis.fetch = async (u)=>{ if(String(u).includes("/cdn-cgi/access/certs")) return new Response(JSON.stringify({keys:[jwk]})); throw new Error("net "+u); };
const b64u = s => Buffer.from(s).toString("base64url");
async function tok(claims, kid="k1", key=kp.privateKey){ const h=b64u(JSON.stringify({alg:"RS256",kid})), p=b64u(JSON.stringify(claims));
  const sig=await crypto.subtle.sign("RSASSA-PKCS1-v1_5",key,new TextEncoder().encode(h+"."+p)); return h+"."+p+"."+Buffer.from(sig).toString("base64url"); }
// fake D1 that answers enough for /api/me
const DB={ prepare(sql){ const st={ bind(){return st}, async first(){ if(/FROM users/.test(sql)) return {id:"u1",name:"x"}; if(/FROM state/.test(sql)) return {v:new Date().toISOString().slice(0,10)}; if(/COUNT/.test(sql)) return {n:0,bytes:0}; return null; }, async run(){return {meta:{changes:1}}}, async all(){return {results:[]}} }; return st; }, async batch(){ return []; } };
const env={DB,ACCESS_TEAM:team,ACCESS_AUD:aud};
const now=Math.floor(Date.now()/1000), good={aud:[aud],email:"P@x.com",iss:"https://"+team+".cloudflareaccess.com",exp:now+600};
async function call(t){ const h=t?{"cf-access-jwt-assertion":t}:{}; const r=await onRequest({request:new Request("https://h/api/me",{headers:h}),env}); return r.status; }
const other = await crypto.subtle.generateKey({name:"RSASSA-PKCS1-v1_5",modulusLength:2048,publicExponent:new Uint8Array([1,0,1]),hash:"SHA-256"},true,["sign","verify"]);
const cases=[["valid",await tok(good),200],["no token",null,401],["wrong aud",await tok({...good,aud:["x"]}),401],["expired",await tok({...good,exp:now-5}),401],
 ["wrong iss",await tok({...good,iss:"https://evil.cloudflareaccess.com"}),401],["wrong key",await tok(good,"k1",other.privateKey),401],["unknown kid",await tok(good,"k9"),401],
 ["service token",await tok({aud:[aud],common_name:"x.access",iss:good.iss,exp:now+600}),403],["tampered",(await tok(good)).replace(/\.([^.]+)\./,(m,p)=>"."+b64u(JSON.stringify({...good,email:"evil@x.com"}))+"."),401]];
let bad=0; for(const [n,t,want] of cases){ const got=await call(t); console.log((got===want?"ok   ":"FAIL ")+n+" "+got); if(got!==want) bad++; }
// health needs no login
const h=await onRequest({request:new Request("https://h/api/health"),env}); console.log((h.status===200?"ok   ":"FAIL ")+"health "+h.status);
process.exit(bad?1:0);
