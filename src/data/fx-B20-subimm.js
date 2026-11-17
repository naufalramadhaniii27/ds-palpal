DataEnv.slot.GX=DataEnv.slot.GX||{};GX.sub=GX.sub||{};
/* fx data batch B20: immunities of subclass features, always on or while a form or aura is on (a switch on the sheet). */
(function(){
var P=function(k,e){GX.sub[k]=(GX.sub[k]||[]).concat([e])};
var T=function(id,label){return {id:id,label:label}};
var BPS=["Bludgeoning","Piercing","Slashing"];
P("Justice Domain",{l:6,n:"Hand of Justice (immunity)",condImm:["Frightened"]});
P("Pestilence Domain (2014)",{l:3,n:"Carrier (immunity)",condImm:["Poisoned"],defs:[["Immunity","Disease"]]});
P("Circle of Vermin",{l:10,n:"Plague Carrier (immunity)",condImm:["Poisoned"],defs:[["Immunity","Disease"]]});
P("Vermin Lord",{l:7,n:"Filth and Fortitude (immunity)",condImm:["Poisoned"]});
P("Vermin Lord (2014)",{l:7,n:"Filth and Fortitude (immunity)",defs:[["Immunity","Disease"]]});
P("Rimekeeper",{l:17,n:"Hoarfrost Herald (immunity)",toggle:T("b20-hoarfrost","Hoarfrost Herald active"),imm:["Cold"]});
P("Circle of the Forged",{l:14,n:"Iron Mind (immunity)",toggle:T("b20-iron-mind","Construction Perfection: in a Wild Shape form"),imm:["Poison"],condImm:["Charmed","Frightened","Paralyzed","Petrified","Poisoned"]});
P("Oath of Pestilence",{l:20,n:"One with Plague (immunity)",toggle:T("b20-one-with-plague","Plaguebringer active"),imm:["Poison"],condImm:["Poisoned"],res:["Necrotic"]});
P("Oath of Pestilence (2014)",{l:20,n:"Plaguebringer (immunity)",toggle:T("b20-plague-avatar","Avatar of plague active"),imm:["Poison"],condImm:["Poisoned"],res:["Necrotic"]});
P("Oath of Winter",{l:20,n:"Father Winter (immunity)",toggle:T("b20-father-winter","Effigy of Father Winter active"),imm:["Cold"]});
P("Winter Walker",{l:15,n:"Frozen Haunt (immunity)",toggle:T("b20-frozen-haunt","Frozen Haunt: ghostly form"),imm:["Cold"],condImm:["Grappled","Prone","Restrained"]});
P("Boreal Bloodline",{l:14,n:"Winter's Form (Sleet)",toggle:T("b20-sleet","Winter's Form: Sleet"),imm:["Cold"],res:BPS});
P("Faerzress Sorcery",{l:18,n:"Faerzress Form (immunity)",toggle:T("b20-faerzress","Faerzress Form active"),condImm:["Grappled","Paralyzed","Petrified","Poisoned","Prone","Restrained"]});
P("Oath of Justice",{l:20,n:"Avatar of Perfect Order (immunity)",toggle:T("b20-perfect-order","Avatar of Perfect Order active"),imm:BPS});
P("Undead Patron",{l:3,n:"Fearless Form (immunity)",toggle:T("b20-dread-24","Form of Dread active"),condImm:["Frightened"]});
P("The Undead",{l:3,n:"Form of Dread (immunity)",toggle:T("b20-dread-14","Form of Dread active"),condImm:["Frightened"]});
})();
