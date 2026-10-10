import {createRequire} from 'node:module';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFile,stat,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {securityHeaders} from './security-headers.mjs';
const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE),root=fileURLToPath(new URL('../',import.meta.url)),out=path.join(root,'output/research-work'),dist=path.join(root,'dist');
await mkdir(out,{recursive:true});
const taskTemp=path.join(out,'tmp');await mkdir(taskTemp,{recursive:true});process.env.TEMP=taskTemp;process.env.TMP=taskTemp;
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.mjs':'text/javascript','.json':'application/json','.ttf':'font/ttf','.svg':'image/svg+xml','.png':'image/png','.pdf':'application/pdf','.csv':'text/csv','.zip':'application/zip'};
const server=http.createServer(async(req,res)=>{try{let rel=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/agent-deck-1(?=\/)/,'').replace(/^\/+/,'');if(!rel||rel.endsWith('/'))rel+='index.html';const file=path.resolve(dist,rel);assert.ok(file.startsWith(dist+path.sep));assert.ok((await stat(file)).isFile());res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'text/plain',...securityHeaders});res.end(await readFile(file));}catch{res.writeHead(404);res.end('Not found');}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const origin='http://127.0.0.1:'+server.address().port,base=process.env.RESEARCH_BASE_URL||origin+'/agent-deck-1/';
const profile=path.join(out,'browser-profile-'+process.pid),env={...process.env,USERPROFILE:profile,APPDATA:profile+'/Roaming',LOCALAPPDATA:profile+'/Local',HOME:profile,TEMP:profile+'/Temp',TMP:profile+'/Temp'};for(const p of [profile,env.APPDATA,env.LOCALAPPDATA,env.TEMP])await mkdir(p,{recursive:true});
const context=await chromium.launchPersistentContext(profile,{executablePath:process.env.CHROMIUM_PATH,headless:true,acceptDownloads:true,downloadsPath:out,env,args:['--disable-gpu','--disable-background-networking','--disable-breakpad','--disable-crash-reporter','--no-first-run','--disk-cache-dir='+profile+'/Cache']});
const report={base,checks:[],errors:[],remoteRequests:[],actual_utc:new Date().toISOString()},page=await context.newPage();
page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
await page.route('**/*',route=>{if(route.request().url().startsWith(new URL(base).origin))return route.continue();report.remoteRequests.push(route.request().url());return route.abort();});
try{
 await page.setViewportSize({width:1440,height:1000});await page.goto(base,{waitUntil:'networkidle'});assert.equal(await page.locator('.cartridge').count(),24);
 const link=page.locator('footer a',{hasText:'Research'});assert.equal(await link.count(),1);assert.equal(await page.locator('header nav a',{hasText:'Research'}).count(),0);
 await page.locator('#search').fill('ReAct');assert.equal(await page.locator('.cartridge').count(),6);await page.locator('#search').fill('');await link.scrollIntoViewIfNeeded();await page.screenshot({path:out+'/footer-desktop.png'});await link.click();assert.ok(page.url().endsWith('/research/index.html'));
 report.checks.push('Footer research link, unchanged catalogue search and project-subpath navigation');
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:900});await page.goto(base+'research/index.html',{waitUntil:'networkidle'});assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('.study-metrics>div').count(),8);
  const geometry=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth,broken:[...document.images].filter(x=>x.complete&&x.naturalWidth===0).length}));assert.ok(geometry.width<=geometry.viewport);assert.equal(geometry.broken,0);
  assert.match(await page.locator('.study-status').innerText(),/AI-assisted/);assert.equal(await page.locator('table').first().locator('tbody tr').count(),8);
  assert.deepEqual(await page.evaluate(()=>[document.fonts.check('600 20px "Space Grotesk"'),document.fonts.check('400 12px "IBM Plex Mono"')]),[true,true]);
  await page.screenshot({path:out+'/research-'+width+'-top.png'});await page.locator('#findings').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/research-'+width+'-results.png'});await page.locator('#materials').scrollIntoViewIfNeeded();await page.screenshot({path:out+'/research-'+width+'-materials.png'});
  report.checks.push('Research renders at '+width+'px without page overflow; fonts, metrics and table present');
 }
 const links=await page.locator('main a[href^="./"]').evaluateAll(xs=>xs.map(x=>x.href));const manifest=JSON.parse(await readFile(path.join(root,'research/publication.json'),'utf8'));
 for(const url of [...new Set(links)]){const response=await fetch(url);assert.equal(response.status,200,url);const name=decodeURIComponent(new URL(url).pathname.split('/').pop());if(manifest.files_sha256[name])assert.equal(createHash('sha256').update(Buffer.from(await response.arrayBuffer())).digest('hex'),manifest.files_sha256[name],name);if(name==='paper.pdf')assert.match(response.headers.get('content-type'),/application\/pdf/);}
 report.checks.push('All material links resolve; sealed downloads match their published SHA-256');
 const downloadPromise=page.waitForEvent('download');await page.locator('a[href="./evidence.zip"]').click();const download=await downloadPromise;await download.saveAs(out+'/downloaded-evidence-'+process.pid+'.zip');assert.equal(createHash('sha256').update(await readFile(out+'/downloaded-evidence-'+process.pid+'.zip')).digest('hex'),manifest.archive_sha256);report.checks.push('Actual browser evidence ZIP download has canonical bytes');
 await page.goto(base+'research/paper.html',{waitUntil:'networkidle'});assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('table').count(),12);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);report.checks.push('Full HTML paper loads with 12 tables at narrow width');
 assert.deepEqual(report.errors,[]);assert.deepEqual(report.remoteRequests,[]);report.status='passed';
}finally{await context.close();await new Promise(resolve=>server.close(resolve));await writeFile(out+'/browser-qa.json',JSON.stringify(report,null,2));}
console.log(JSON.stringify(report,null,2));
