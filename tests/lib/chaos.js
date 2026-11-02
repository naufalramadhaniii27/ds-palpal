/* N40: failure injector for storage tests. Added with page.add_init_script after a line  window.__CHAOS={seed:N,...};
   Nothing fails until window.__chaosOn is set to 1, so the page can start clean. Every choice comes from mulberry32(seed), the same generator as the Training Ground engine.
   Failures: IndexedDB put throws QuotaExceededError, the transaction is aborted after a put, localStorage.setItem throws QuotaExceededError, fetch rejects or answers after 5 s. */
(function(){
  var C=window.__CHAOS||{seed:1}, a=C.seed>>>0;
  function rnd(){ a=(a+0x6D2B79F5)|0; var t=Math.imul(a^(a>>>15),1|a); t=(t+Math.imul(t^(t>>>7),61|t))^t; return((t^(t>>>14))>>>0)/4294967296; }
  var P={put:C.put!=null?C.put:0.25, abort:C.abort!=null?C.abort:0.15, ls:C.ls!=null?C.ls:0.25, fetchFail:C.fetchFail!=null?C.fetchFail:0.3, fetchSlow:C.fetchSlow!=null?C.fetchSlow:0.2};
  var log=window.__chaosLog=[];
  function on(){ return !!window.__chaosOn; }
  var qe=function(){ return new DOMException("chaos quota","QuotaExceededError"); };
  var put=IDBObjectStore.prototype.put;
  IDBObjectStore.prototype.put=function(v,k){ if(on()){ var r=rnd(); if(r<P.put){ log.push("put-throw"); throw qe(); } if(r<P.put+P.abort){ log.push("tx-abort"); var tx=this.transaction, res=put.apply(this,arguments); try{ setTimeout(function(){ try{ tx.abort(); }catch(e){} },0); }catch(e){} return res; } } return put.apply(this,arguments); };
  var ls=Storage.prototype.setItem;
  Storage.prototype.setItem=function(k,v){ if(on()&&this===window.localStorage&&rnd()<P.ls){ log.push("ls-throw:"+k); throw qe(); } return ls.apply(this,arguments); };
  var f=window.fetch;
  if(f) window.fetch=function(){ if(on()){ var r=rnd(); if(r<P.fetchFail){ log.push("fetch-fail"); return Promise.reject(new TypeError("chaos network")); } if(r<P.fetchFail+P.fetchSlow){ log.push("fetch-slow"); var args=arguments, self=this; return new Promise(function(res){ setTimeout(function(){ res(f.apply(self,args)); },5000); }); } } return f.apply(this,arguments); };
  window.__chaosRnd=rnd;
})();
