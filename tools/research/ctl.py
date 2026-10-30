import asyncio
from playwright.async_api import async_playwright
REC="""window.__fr=[];window.__on=false;(function l(t){ if(window.__on) window.__fr.push(t); requestAnimationFrame(l); })(0);"""
def st(fr):
    d=[fr[i+1]-fr[i] for i in range(len(fr)-1)]; s=sorted(d); n=len(d); return "%5.1f fps p95 %.1f worst %d"%(n/((fr[-1]-fr[0])/1000),s[int(n*.95)-1],s[-1])
HTML="<body style='margin:0'><div id=a style='width:2000px;height:300px;background:#ccc'>x</div><button id=b>go</button><script>var n=0;document.getElementById('b').onclick=function(){document.getElementById('a').style.transform='translateX('+(++n%50)+'px)'}</script>"
async def main():
    async with async_playwright() as pw:
        b=await pw.chromium.launch()
        for rate in (1,4):
            ctx=await b.new_context(viewport={"width":390,"height":844}); pg=await ctx.new_page(); await pg.add_init_script(REC)
            await pg.set_content(HTML); await pg.evaluate(REC); cdp=await ctx.new_cdp_session(pg); await cdp.send("Emulation.setCPUThrottlingRate",{"rate":rate})
            await pg.evaluate("()=>{window.__fr=[];window.__on=true}")
            for _ in range(16): await pg.click("#b"); await pg.wait_for_timeout(250)
            await pg.evaluate("()=>{window.__on=false}"); print("blank page, clicks, CPU %dx:"%rate, st(await pg.evaluate("()=>window.__fr")))
            await ctx.close()
        await b.close()
asyncio.run(main())
