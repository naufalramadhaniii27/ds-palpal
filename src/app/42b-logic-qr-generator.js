/* QR code generator (split from 42, SOLID stage 12) */
import {esc} from "./05-logic-helpers.js";
/* QR generator: byte mode, error correction L or M, versions 1 to 40 (ISO/IEC 18004 tables) */
export var QRG=(function(){
  const {ECW, NB, FB, rawMods, dataCw, cap, bytesOf, rsDiv, rsRem}=logicPwaQrIconsWalletAnonStep1();
  const {make}=logicPwaQrIconsWalletAnonStep2(bytesOf, cap, dataCw, NB, ECW, rawMods, rsDiv, rsRem, FB);
  const {svg}=logicPwaQrIconsWalletAnonStep3();
  return {make:make, svg:svg, cap:cap};
})();
function logicPwaQrIconsWalletAnonStep1(){
  const ECW={L:[-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],
           M:[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28]};
  const NB={L:[-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],
          M:[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49]};
  const FB={L:1,M:0};
  function rawMods(v){ let r=(16*v+128)*v+64; if(v>=2){ const n=Math.floor(v/7)+2; r-=(25*n-10)*n-55; if(v>=7) r-=36; } return r; }
  function dataCw(v,e){ return Math.floor(rawMods(v)/8)-ECW[e][v]*NB[e][v]; }
  function cap(v,e){ return Math.floor((dataCw(v,e)*8-4-(v<10?8:16))/8); }
  function mul(x,y){ let z=0; for(let i=7;i>=0;i--){ z=((z<<1)^((z>>>7)*0x11D))&255; z^=((y>>>i)&1)*x; } return z; }
  function rsDiv(n){ let r=[],i,j,root=1; for(i=0;i<n-1;i++) r.push(0); r.push(1); for(i=0;i<n;i++){ for(j=0;j<n;j++){ r[j]=mul(r[j],root); if(j+1<n) r[j]^=r[j+1]; } root=mul(root,2); } return r; }
  function rsRem(d,div){ const r=div.map(() =>{ return 0; }); d.forEach((b) =>{ const f=b^r.shift(); r.push(0); for(let i=0;i<div.length;i++) r[i]^=mul(div[i],f); }); return r; }
  function bytesOf(s){ if(typeof TextEncoder!=="undefined") return Array.prototype.slice.call(new TextEncoder().encode(s)); return unescape(encodeURIComponent(s)).split("").map((c) =>{ return c.charCodeAt(0); }); }
  return /** @type {any} */ ({ECW, NB, FB, rawMods, dataCw, cap, bytesOf, rsDiv, rsRem});
}
function logicPwaQrIconsWalletAnonStep2(bytesOf, cap, dataCw, NB, ECW, rawMods, rsDiv, rsRem, FB){
  function make(text,e,maxV){ e=e||"M"; maxV=maxV||40; let by=bytesOf(text), v=1; while(v<=maxV&&by.length>cap(v,e)) v++; if(v>maxV) return null;
    const _makeStep1=makeStep1(by, v);
    const {bb, put}=_makeStep1;
    let {i, j}=_makeStep1;
    const capB=dataCw(v,e)*8; put(0,Math.min(4,capB-bb.length)); put(0,(8-bb.length%8)%8); for(let pad=0xEC; bb.length<capB; pad^=0xEC^0x11) put(pad,8);
    const data=[]; for(i=0;i<bb.length;i+=8){ let x=0; for(j=0;j<8;j++) x=(x<<1)|bb[i+j]; data.push(x); }
    let nb=NB[e][v], el=ECW[e][v], raw=Math.floor(rawMods(v)/8), nShort=nb-raw%nb, sLen=Math.floor(raw/nb), div=rsDiv(el), blocks=[], k=0;
    ({i, k}=makeStep2(i, nb, data, k, sLen, el, nShort, rsRem, div, blocks));
    const _makeStep3=makeStep3(i, blocks, j, nb, sLen, el, nShort);
    const {cw}=_makeStep3;
    i=_makeStep3.i;
    j=_makeStep3.j;
    const _makeStep4=makeStep4(v, i, j);
    const {size, M, F, set}=_makeStep4;
    i=_makeStep4.i;
    j=_makeStep4.j;
    let {al}=makeStep5(size, v, set);
    ({i, j}=makeStep6(i, al, j, set));
    function fmt(m){ let d=FB[e]<<3|m, r=d, q; for(q=0;q<10;q++) r=(r<<1)^((r>>>9)*0x537); const b=(d<<10|r)^0x5412, g=function(t){ return ((b>>>t)&1)!==0; };
      for(q=0;q<=5;q++) set(8,q,g(q)); set(8,7,g(6)); set(8,8,g(7)); set(7,8,g(8)); for(q=9;q<15;q++) set(14-q,8,g(q));
      for(q=0;q<8;q++) set(size-1-q,8,g(q)); for(q=8;q<15;q++) set(8,size-15+q,g(q)); set(8,size-8,true); }
    fmt(0);
    const _makeStep7=makeStep7(v, i, size, set);
    let {bi}=_makeStep7;
    i=_makeStep7.i;
 const _makeStep8=makeStep8(size, j, F, bi, cw, M);
 const {flip}=_makeStep8;
 j=_makeStep8.j;
 bi=_makeStep8.bi;
    const _makeStep9=makeStep9(size, M);
    const {pen}=_makeStep9;
    let {best, bp}=_makeStep9; for(let m=0;m<8;m++){ flip(m); fmt(m); const pp=pen(); if(pp<bp){ bp=pp; best=m; } flip(m); } flip(best); fmt(best);
    return {size:size, v:v, mask:best, m:M}; }
  return /** @type {any} */ ({make});
}
function logicPwaQrIconsWalletAnonStep3(){
  function svg(q,label){ let n=q.size+8, d=""; for(let y=0;y<q.size;y++){ let x=0; while(x<q.size){ if(!q.m[y][x]){ x++; continue; } const s=x; while(x<q.size&&q.m[y][x]) x++; d+="M"+(s+4)+" "+(y+4)+"h"+(x-s)+"v1h-"+(x-s)+"z"; } }
    return '<svg class="qr-svg" viewBox="0 0 '+n+' '+n+'" shape-rendering="crispEdges" role="img" aria-label="'+esc(label||"QR code")+'"><rect width="'+n+'" height="'+n+'" fill="#fff"/><path d="'+d+'" fill="#000"/></svg>'; }
  return /** @type {any} */ ({svg});
}
function makeStep1(by, v){
    let bb=[], i, j; function put(val,len){ for(let q=len-1;q>=0;q--) bb.push((val>>>q)&1); }
    put(4,4); put(by.length,v<10?8:16); by.forEach((b) =>{ put(b,8); });
  return /** @type {any} */ ({bb, put, i, j});
}
function makeStep2(i, nb, data, k, sLen, el, nShort, rsRem, div, blocks){
    for(i=0;i<nb;i++){ const dat=data.slice(k,k+sLen-el+(i<nShort?0:1)); k+=dat.length; const ecc=rsRem(dat,div); if(i<nShort) dat.push(0); blocks.push(dat.concat(ecc)); }
  return /** @type {any} */ ({i, k});
}
function makeStep3(i, blocks, j, nb, sLen, el, nShort){
    const cw=[]; for(i=0;i<blocks[0].length;i++) for(j=0;j<nb;j++) if(i!==sLen-el||j>=nShort) cw.push(blocks[j][i]);
  return /** @type {any} */ ({cw, i, j});
}
function makeStep4(v, i, j){
    const size=v*4+17, M=[], F=[]; for(i=0;i<size;i++){ const a1=[],a2=[]; for(j=0;j<size;j++){ a1.push(false); a2.push(false); } M.push(a1); F.push(a2); }
    function set(x,y,d){ M[y][x]=d; F[y][x]=true; }
    for(i=0;i<size;i++){ set(6,i,i%2===0); set(i,6,i%2===0); }
  return /** @type {any} */ ({size, M, F, set, i, j});
}
function makeStep5(size, v, set){
    function finder(cx,cy){ for(let dy=-4;dy<=4;dy++) for(let dx=-4;dx<=4;dx++){ const d=Math.max(Math.abs(dx),Math.abs(dy)), x=cx+dx, y=cy+dy; if(x>=0&&x<size&&y>=0&&y<size) set(x,y,d!==2&&d!==4); } }
    finder(3,3); finder(size-4,3); finder(3,size-4);
    let al=[]; if(v>1){ const na=Math.floor(v/7)+2, st=v===32?26:Math.ceil((v*4+4)/(na*2-2))*2; al=[6]; for(let p=size-7; al.length<na; p-=st) al.splice(1,0,p); }
  return /** @type {any} */ ({al});
}
function makeStep6(i, al, j, set){
    for(i=0;i<al.length;i++) for(j=0;j<al.length;j++){ if((i===0&&j===0)||(i===0&&j===al.length-1)||(i===al.length-1&&j===0)) continue; for(let ay=-2;ay<=2;ay++) for(let ax=-2;ax<=2;ax++) set(al[i]+ax,al[j]+ay,Math.max(Math.abs(ax),Math.abs(ay))!==1); }
  return /** @type {any} */ ({i, j});
}
function makeStep7(v, i, size, set){
    if(v>=7){ let r2=v; for(i=0;i<12;i++) r2=(r2<<1)^((r2>>>11)*0x1F25); const vb=v<<12|r2; for(i=0;i<18;i++){ const bit=((vb>>>i)&1)!==0, va=size-11+i%3, vc=Math.floor(i/3); set(va,vc,bit); set(vc,va,bit); } }
    let bi=0;
  return /** @type {any} */ ({bi, i});
}
function makeStep8(size, j, F, bi, cw, M){
for(let right=size-1; right>=1; right-=2){ if(right===6) right=5; for(let vert=0; vert<size; vert++) for(j=0;j<2;j++){ const x2=right-j, up=((right+1)&2)===0, y2=up?size-1-vert:vert; if(!F[y2][x2]&&bi<cw.length*8){ M[y2][x2]=((cw[bi>>>3]>>>(7-(bi&7)))&1)!==0; bi++; } } }
    function mk(m,x,y){ switch(m){ case 0: return (x+y)%2===0; case 1: return y%2===0; case 2: return x%3===0; case 3: return (x+y)%3===0; case 4: return (Math.floor(x/3)+Math.floor(y/2))%2===0; case 5: return x*y%2+x*y%3===0; case 6: return (x*y%2+x*y%3)%2===0; default: return ((x+y)%2+x*y%3)%2===0; } }
    function flip(m){ for(let y=0;y<size;y++) for(let x=0;x<size;x++) if(!F[y][x]&&mk(m,x,y)) M[y][x]=!M[y][x]; }
  return /** @type {any} */ ({flip, j, bi});
}
function makeStep9(size, M){
    function lineP(g){ let s=0, run=1, prev=g(0), str="0000", q; for(q=0;q<size;q++){ const c=g(q); str+=c?"1":"0"; if(q>0){ if(c===prev) run++; else { if(run>=5) s+=run-2; run=1; prev=c; } } } if(run>=5) s+=run-2; str+="0000";
      for(let at=str.indexOf("1011101"); at>=0; at=str.indexOf("1011101",at+1)){ if(str.substr(at-4,4)==="0000"||str.substr(at+7,4)==="0000") s+=40; } return s; }
    function pen(){ let s=0, x, y, dark=0; for(y=0;y<size;y++) s+=lineP((q) =>{ return M[y][q]; }); for(x=0;x<size;x++) s+=lineP((q) =>{ return M[q][x]; });
      for(y=0;y<size-1;y++) for(x=0;x<size-1;x++){ const c=M[y][x]; if(c===M[y][x+1]&&c===M[y+1][x]&&c===M[y+1][x+1]) s+=3; }
      for(y=0;y<size;y++) for(x=0;x<size;x++) if(M[y][x]) dark++; s+=10*Math.floor(Math.abs(dark*100/(size*size)-50)/5); return s; }
    let best=0, bp=1e9;
  return /** @type {any} */ ({best, bp, pen});
}
