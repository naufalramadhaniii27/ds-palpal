/* Fase 2.2: QREFS.monster (4.7 MB of rows, part q7) loads on its first read. The first read runs q7, which adds the rows. Rows added before this point are kept. */
(function(){var R=window.QREFS=window.QREFS||{},pre=R.monster;
  if(!window.__lazyRun||!document.querySelector('script[data-lazy][data-defer="q7"]')){return;}
  Object.defineProperty(R,"monster",{configurable:true,enumerable:true,
    get:function(){delete R.monster;if(pre)R.monster=pre;window.__lazyRun("q7");if(!R.monster)R.monster=pre||[];return R.monster;},
    set:function(v){delete R.monster;R.monster=v;}});})();
