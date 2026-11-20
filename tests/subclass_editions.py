#!/usr/bin/env python3
"""Every subclass of a third-party book can be chosen under that book's own rule set (its ed: 2014 or 2024), with only that book on.
Before 0.0.85 a third-party 2014 book (Kobold Press, Tome of Heroes, Dark Matter 2014 ...) had no subclass at all under the 2014 rules, Gadgeteer and
Mechanist had none, and a subclass name in two books (Travel Domain) vanished when one of the two books was off.  python3 tests/subclass_editions.py"""
import os, sys
from playwright.sync_api import sync_playwright
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bad = 0
with sync_playwright() as p:
    br = p.chromium.launch(); pg = br.new_page(); pg.set_default_timeout(1800000)
    pg.goto("file://" + ROOT + "/index.html"); pg.wait_for_timeout(1500); pg.evaluate("()=>window.__bldNeed()")
    for _ in range(600):
        if pg.evaluate("()=>typeof window.__bldFuzz==='function'"): break
        pg.wait_for_timeout(100)
    rows = pg.evaluate("""()=>{const out=[];for(const q of window.WX.src.filter(x=>x.tp&&(x.subs||[]).length)){const rs=q.ed==='2014'?'2014':'2024';
        const base=rs==='2014'?{sp:'Human (2014)',bg:'Soldier (2014)',src:{phb14:true,dmg14:true}}:{sp:'Human',bg:'Soldier',src:{}};base.src[q.id]=true;
        const by={};(window.WXS||[]).filter(x=>x.src===q.id).forEach(x=>{(by[x.cls]=by[x.cls]||[]).push(x.name)});const miss=[];let n=0;
        for(const [c,ss] of Object.entries(by)){window.__bldFuzz(Object.assign({rs,cls:c,sub:'',lv:1,arr:[15,14,13,12,10,8],b2:0,b1:0},base));ss.forEach(s=>{n++;if(!(CLASSES[c]&&(CLASSES[c].subs||{})[s]))miss.push(c+'/'+s)})}
        out.push([q.id,rs,n,miss])}return out}""")
    for book, rs, n, miss in rows:
        ok = not miss; bad += len(miss)
        print("%s %s (%s rules): %d subclasses%s" % ("ok  " if ok else "FAIL", book, rs, n, "" if ok else ", missing %d: %s" % (len(miss), ", ".join(miss[:8]))))
    br.close()
print("%d missing" % bad); sys.exit(1 if bad else 0)
