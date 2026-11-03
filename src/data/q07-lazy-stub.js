/* Fase 2.2: QREFS.monster (4.7 MB of rows, part q7) loads on its first read. The first read runs q7, which adds the rows. Rows added before this point are kept.
   If the file has not arrived yet, the read gets what is here (nothing) and the loader calls __lazyOn.q7 when the file is in: the rows are added and the "qrefs" event tells the Library to rebuild its index. */
(function(){var R=window.QREFS=window.QREFS||{},pre=R.monster;
  if(!window.__lazyRun||!document.querySelector('script[data-lazy][data-defer="q7"]')){return;}
  function guard(){Object.defineProperty(R,"monster",{configurable:true,enumerable:true,
    get:function(){delete R.monster;if(pre)R.monster=pre;if(window.__lazyRun("q7")){if(!R.monster)R.monster=pre||[];return R.monster;}
      var cur=R.monster;delete R.monster;guard();return cur||[];},
    set:function(v){delete R.monster;R.monster=v;}});}
  guard();
  window.__lazyOn.q7=function(){void R.monster;try{document.dispatchEvent(new Event("qrefs"));}catch(e){}};})();
