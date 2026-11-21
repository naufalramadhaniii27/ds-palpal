DataEnv.slot.GX=DataEnv.slot.GX||{};GX.feat=GX.feat||{};GX.species=GX.species||{};
/* fx data batch B62 (hand written): disease immunity from tests/mech_baseline.json "by_design". Same form as Plague Doctor Breathe It In
   (fx-B61-situational-cls.js): def ["Immunity","Disease"], one Defenses row on the sheet. */
(function(){
var D=function(n){return {n:n,def:["Immunity","Disease"]}};
var F=function(k,n){GX.feat[k]=(GX.feat[k]||[]).concat([D(n)])},S=function(k,n){GX.species[k]=(GX.species[k]||[]).concat([D(n)])};
F("Android (2014)","Android (2014)");
S("Marionette Geppettin","Construct Anatomy");
S("Vect (DM14)","Construct Anatomy");
})();
