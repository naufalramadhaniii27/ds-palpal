// Actual Export PDF click at phone and desktop widths, including a second offline export.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const PDFLib=require('../vendor/pdf/pdf-lib-1.17.1.min.js');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'out/pdf-template');
fs.mkdirSync(out,{recursive:true});
const fixture=fs.readFileSync(path.join(__dirname,'fixtures/yudhi-v3.json'),'utf8');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.pdf':'application/pdf','.woff2':'font/woff2','.ttf':'font/ttf'};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname), file=path.join(root,pathname==='/'?'index.html':pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(e,buf)=>{if(e){res.writeHead(404);res.end();return;}res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.end(buf);});
});
async function run(){
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url='http://127.0.0.1:'+server.address().port;
  const browser=await chromium.launch({headless:true,...(process.env.PDF_TEST_BROWSER?{executablePath:process.env.PDF_TEST_BROWSER}:{})});
  try{
    for(const width of [390,1250]){
      const context=await browser.newContext({viewport:{width,height:850},acceptDownloads:true});
      const page=await context.newPage(),errors=[],outside=[];
      page.on('pageerror',e=>errors.push(String(e)));
      page.on('request',r=>{if(!r.url().startsWith(url)&&!r.url().startsWith('data:')&&!r.url().startsWith('blob:'))outside.push(r.url());});
      await page.addInitScript(fix=>{if(!sessionStorage.getItem('__s')){localStorage.clear();localStorage.setItem('yudhi-kelapa-build-v3',fix);sessionStorage.setItem('__s','1');}},fixture);
      await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForSelector('[data-hview]',{state:'attached',timeout:60000});
      await page.locator('[data-hview]').first().click();
      await page.waitForSelector('#dmgBtn',{timeout:30000});
      const expected=await page.evaluate(()=>({name:window.__sheetName(),d:window.__D()}));
      const [download]=await Promise.all([page.waitForEvent('download',{timeout:120000}),page.evaluate(()=>document.getElementById('pdfBtn').click())]);
      const output=path.join(out,width+'-app.pdf');await download.saveAs(output);
      const pdf=await PDFLib.PDFDocument.load(fs.readFileSync(output)),form=pdf.getForm();
      assert.equal(form.getTextField('CharacterName').getText(),expected.name);
      assert.equal(form.getTextField('STR').getText(),String(expected.d.score.STR));
      assert.equal(form.getTextField('HPMax').getText(),String(expected.d.hpmax));
      assert.equal(form.getTextField('AC').getText(),String(expected.d.ac));
      assert.equal(form.getTextField('ProfBonus').getText(),'+'+expected.d.pb);
      assert(pdf.getPageCount()>=3);assert.deepEqual(errors,[]);assert.deepEqual(outside,[]);
      console.log(width+': online export passed');
      // Reopen in the same context offline: service worker must supply both shell and template assets.
      await page.waitForFunction(async()=>{const r=await navigator.serviceWorker.getRegistration();return !!(r&&r.active);},{},{timeout:30000});await page.waitForTimeout(1500);
      await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded',timeout:60000});
      await page.waitForSelector('[data-hview]',{state:'attached',timeout:30000});await page.locator('[data-hview]').first().click();
      const [offline]=await Promise.all([page.waitForEvent('download',{timeout:120000}),page.evaluate(()=>document.getElementById('pdfBtn').click())]);
      await offline.saveAs(path.join(out,width+'-offline.pdf'));
      console.log(width+': app export and offline reload/export passed ('+pdf.getPageCount()+' pages)');
      await context.close();
    }
  }finally{await browser.close();server.close();}
}
run().catch(error=>{console.error(error.message);server.close();process.exit(1);});
